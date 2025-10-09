// ✅ worker.js
import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    try {
      console.log('Processing Job:', job.data);
      const { path: filePath, fileId } = job.data;

      // 1️⃣ Load PDF
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();
      console.log(`Loaded ${docs.length} document(s) from PDF: ${filePath}`);

      if (!docs.length) {
        console.log('No documents found in PDF.');
        return;
      }

      // 2️⃣ Split into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitDocuments(docs);
      console.log(`Split PDF into ${chunks.length} chunks`);

      // 3️⃣ Add metadata
      const chunksWithMetadata = chunks.map((chunk, idx) => ({
        ...chunk,
        metadata: { ...chunk.metadata, fileId, chunkId: idx },
      }));

      // 4️⃣ Create embeddings (Hugging Face)
      const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HF_API_KEY,
        model: 'sentence-transformers/all-MiniLM-L6-v2',
      });

      // Test embedding on first chunk to catch errors early
      const testVec = await embeddings.embedDocuments([chunksWithMetadata[0].pageContent]);
      console.log('Sample embedding length:', testVec[0].length);

      // 5️⃣ Store chunks in Qdrant
      const vectorStore = await QdrantVectorStore.fromDocuments(
        chunksWithMetadata,
        embeddings,
        {
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          collectionName: 'ai-pdf-chat',
        }
      );

      console.log(`✅ All chunks added to Qdrant for fileId: ${fileId}`);

    } catch (err) {
      console.error('Error processing job:', err);
    }
  },
  {
    concurrency: 5,
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  }
);

console.log('Worker is listening for jobs...');
