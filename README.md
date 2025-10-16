# AI Chat with PDF (Full-Stack RAG Application)



> A full-stack, AI-powered application that allows authenticated users to upload private PDF documents and have secure, interactive conversations about their content. This project solves the data privacy and hallucination problems inherent in public AI tools by using a Retrieval-Augmented Generation (RAG) pipeline.

---

### Key Features

- Secure Authentication: User sign-up and login managed by Clerk for professional-grade security.
- PDF Uploads: Secure file upload functionality handled by Multer on the backend.
- AI-Powered Chat: A real-time chat interface where users can ask questions about their uploaded documents.
- Factual, Source-Based Answers: The AI is constrained to answer questions based only on the content of the PDF, preventing it from making things up.

### Architecture Overview: RAG Pipeline

The core of this project is a Retrieval-Augmented Generation (RAG) pipeline, orchestrated with LangChain. It works like a "super-librarian."

1.  Ingestion Phase: When a user uploads a PDF, a background job is triggered.
    - The document is loaded and split into smaller, semantically meaningful text chunks.
    - The Hugging Face API is used to generate vector embeddings (numerical representations of meaning) for each chunk.
    - These embeddings and their corresponding text are stored in a Pinecone vector database.

2.  Retrieval & Generation Phase: When a user asks a question:
    - The system creates an embedding of the user's question.
    - It performs a semantic similarity search in Pinecone to retrieve the most relevant text chunks from the document.
    - These retrieved chunks are injected as context into a final prompt, which is then sent to the Groq API to generate a factual, source-based answer.

### Tech Stack

- Framework: Next.js
- Language: TypeScript
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js, Multer for uploads
- AI Orchestration: LangChain
- AI Models: Groq API (for chat), Hugging Face API (for embeddings)
- Vector Database: Pinecone
- Authentication: Clerk

### Setup and Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/ai-pdf-chat.git](https://github.com/your-username/ai-pdf-chat.git)
    cd ai-pdf-chat
    ```

2.  Install dependencies:
    - `cd server && npm install`
    - `cd client && npm install`

3.  Set up environment variables:
    - Create a `.env` file in the `server` directory and add your `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT`, `HUGGINGFACE_API_KEY`, `GROQ_API_KEY`, and `CLERK_SECRET_KEY`.
    - Create a `.env.local` file in the `client` directory and add your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

4.  Run the application:
    - In one terminal, start the server:
        ```bash
        cd server && npm run dev
        ```
    - In a second terminal, start the client:
        ```bash
        cd client && npm run dev
        ```
