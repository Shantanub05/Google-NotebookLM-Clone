# NotebookLM Clone - Backend API

NestJS backend API for PDF processing and RAG-based chat.

## Features

- PDF upload and text extraction
- Vector embeddings with OpenAI
- Vector storage with Pinecone (cloud-based, no Docker required)
- RAG-based question answering
- Citation tracking with page numbers
- RESTful API endpoints

## Prerequisites

- Node.js >= 18
- Yarn
- OpenAI API key
- Pinecone API key (free tier available)

## Installation

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env

# Edit .env and add your OpenAI API key
```

## Running the Application

```bash
# Development mode
yarn dev

# OR

# Production mode
yarn build
yarn start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### PDF Operations

- `POST /api/pdf/upload` - Upload and process PDF
- `GET /api/pdf/:id` - Get PDF metadata
- `GET /api/pdf/:id/content` - Get PDF file
- `DELETE /api/pdf/:id` - Delete PDF

### Chat Operations

- `POST /api/chat/session` - Create chat session
- `POST /api/chat` - Send message
- `GET /api/chat/:sessionId/history` - Get chat history
- `DELETE /api/chat/:sessionId/history` - Clear history
- `DELETE /api/chat/:sessionId` - Delete session

## Environment Variables

See `.env.example` for all configuration options.

## Tech Stack

- NestJS
- OpenAI API (GPT-4 + embeddings)
- Pinecone (cloud vector storage)
- pdf-parse (PDF extraction)
- TypeScript
