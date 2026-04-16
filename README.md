# AI Chat with PDF — RAG-based LLM System

An AI-powered application that allows users to interact with private PDF documents using natural language.
Built using a Retrieval-Augmented Generation (RAG) pipeline to improve factual accuracy and reduce hallucinations in LLM responses.

--- 

## 🚀 Key Highlights

* Built a full RAG pipeline using LangChain + Pinecone
* Ensures factual answers by retrieving document context before generation
* Secure authentication using Clerk
* PDF upload and backend processing
* Real-time chat interface for document-based Q&A

---

## 🧠 How It Works

### 1. Ingestion Phase

* User uploads a PDF
* Document is split into smaller semantic chunks
* Embeddings are generated using Hugging Face
* Stored in Pinecone vector database

### 2. Retrieval + Generation Phase

* User asks a question
* Query is converted into an embedding
* Relevant document chunks retrieved via similarity search
* Context is injected into LLM prompt (Groq)
* LLM generates a grounded, factual response

---

## 💡 Problem Solved

LLMs often hallucinate when answering from documents.
This system improves reliability by retrieving relevant document context before generating responses.

---

## 🛠 Tech Stack

* Frontend: Next.js, React
* Backend: Node.js, Express
* AI: LangChain, Hugging Face (embeddings), Groq (LLM)
* Vector Database: Pinecone
* Authentication: Clerk
* File Handling: Multer

---

## 📁 Project Structure

ai-pdf-chat/
│── client/        # Frontend (Next.js)
│── server/        # Backend (Node.js + Express)
│── README.md

---

## ⚙️ Setup & Installation

### 1. Clone the repository

git clone https://github.com/harika1903/ai-pdf-chat.git
cd ai-pdf-chat

---

### 2. Install dependencies

Backend:
cd server
npm install

Frontend:
cd ../client
npm install

---

### 3. Configure environment variables

Backend (server/.env):

PINECONE_API_KEY=your_key
PINECONE_ENVIRONMENT=your_env
HUGGINGFACE_API_KEY=your_key
GROQ_API_KEY=your_key
CLERK_SECRET_KEY=your_key

Frontend (client/.env.local):

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key

---

### 4. Run the application

Start backend:

cd server
npm run dev

Start frontend:

cd client
npm run dev

---

## 📌 Notes

* Designed to improve LLM reliability using retrieval-based grounding
* Focused on backend + AI system design

---

## 👩‍💻 Author

Harika Kodepaka

GitHub: https://github.com/harika1903

LinkedIn: https://www.linkedin.com/in/harika-kodepaka-95333225a/
