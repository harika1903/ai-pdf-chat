import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import OpenAI from "openai";
import dotenv from "dotenv";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

dotenv.config();
console.log("✅ Loaded key:", process.env.OPENAI_API_KEY ? "Found" : "Missing");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ FIX #1 - use your .env key
});

const queue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ status: "All Good!" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  await queue.add("file-ready", {
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
    fileId: Date.now(), // optional unique ID for this PDF
  });

  return res.json({ message: "uploaded" });
});


app.get("/chat", async (req, res) => {
  const userQuery = req.query.message;

  // Embeddings (Hugging Face)
  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model: "sentence-transformers/all-MiniLM-L6-v2",
  });

  // Retry helper: wait until collection has points
  async function waitForPoints(collectionName, timeout = 10000, interval = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const resp = await fetch(`${process.env.QDRANT_URL}/collections/${collectionName}`);
        const data = await resp.json();
        if (data.result && data.result.points_count > 0) {
          return true;
        }
      } catch (e) {
        console.error("Error fetching collection info:", e);
      }
      await new Promise((r) => setTimeout(r, interval));
    }
    return false; // timeout
  }

  const hasPoints = await waitForPoints("ai-pdf-chat", 15000); // wait up to 15s
  if (!hasPoints) {
    return res.json({
      message: "PDF is still being processed. Try again in a few seconds.",
      docs: [],
    });
  }

  // Load vector store
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: "ai-pdf-chat",
  });

  const retriever = vectorStore.asRetriever({ k: 2 });
  const result = await retriever.invoke(userQuery);

  const SYSTEM_PROMPT = `
  You are a helpful AI Assistant who answers the user query based on the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;

  const chatResult = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userQuery },
    ],
  });

  return res.json({
    message: chatResult.choices[0].message.content,
    docs: result,
  });
});


app.listen(8000, () => console.log(`🚀 Server started on PORT: 8000`));
