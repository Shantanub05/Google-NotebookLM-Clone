# Google NotebookLM Clone

A modern web application that enables users to upload PDF documents and interact with them through an AI-powered chat interface using Retrieval-Augmented Generation (RAG).

## 🚀 Features

- **PDF Upload & Processing**: Drag-and-drop interface for uploading PDF files (up to 50MB)
- **Smart Text Extraction**: Advanced PDF parsing with page-level tracking
- **AI-Powered Chat**: Ask questions about your documents using GPT-4
- **Citation System**: Get answers with specific page references
- **Vector Search**: Pinecone-powered similarity search for relevant context retrieval
- **Modern UI**: Beautiful glass-morphism design with smooth animations
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 📚 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **React Query** - Server state management
- **Zustand** - Client state management
- **react-pdf** - PDF viewing
- **Axios** - HTTP client

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type-safe backend
- **OpenAI API** - GPT-4 & text-embedding-3-small
- **Pinecone** - Cloud vector database with free tier
- **pdf-parse** - PDF text extraction
- **class-validator** - Request validation

## 🏗️ Project Structure

```
notebooklm-clone/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   │   ├── layout/   # Layout components
│   │   │   ├── pdf/      # PDF-related components
│   │   │   ├── chat/     # Chat components
│   │   │   └── ui/       # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions & API client
│   │   └── store/        # Zustand stores
│   └── package.json
├── backend/              # NestJS backend API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── pdf/      # PDF processing
│   │   │   ├── chat/     # Chat & RAG
│   │   │   ├── vector/   # Vector store (Pinecone)
│   │   │   └── openai/   # OpenAI integration
│   │   ├── common/       # Shared utilities
│   │   └── main.ts       # Entry point
│   └── package.json
├── shared/               # Shared TypeScript types
└── CLAUDE.md            # Development progress tracker
```

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Pinecone API Key** ([Get free tier here](https://www.pinecone.io/))

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Navigate to project directory
cd notebooklm-clone

# Install all dependencies
yarn install
```

### 2. Set Up Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add your API keys:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vector Database Configuration (use Pinecone)
VECTOR_DB=pinecone

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=notebooklm-clone
```

**Note**: The Pinecone index will be created automatically on first run if it doesn't exist.

**Frontend (.env.local)**
```bash
cd frontend
cp .env.example .env.local
```

The frontend environment variables should work with defaults:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Backend

```bash
# From project root
yarn workspace backend dev

# Or from backend directory
cd backend
yarn dev
```

Backend will start on: `http://localhost:3001`

### 4. Start Frontend

```bash
# From project root (in a new terminal)
yarn workspace frontend dev

# Or from frontend directory
cd frontend
yarn dev
```

Frontend will start on: `http://localhost:3000`

### 5. Open Application

Navigate to `http://localhost:3000` in your browser.

## 📖 How to Use

1. **Upload a PDF**
   - Drag and drop a PDF file or click to browse
   - Wait for processing (text extraction + embedding generation)

2. **Ask Questions**
   - Type your question in the chat input
   - Press Enter or click Send
   - Get AI-generated answers with page citations

3. **Navigate with Citations**
   - Click on page badges in responses
   - PDF viewer automatically jumps to the referenced page

4. **Explore Features**
   - Toggle dark/light theme
   - Zoom in/out on PDF
   - Navigate pages with arrow buttons
   - Delete document when done

## 🔧 Development Scripts

### Root Level
```bash
yarn dev           # Start both frontend and backend
yarn build         # Build both projects
yarn lint          # Lint both projects
```

### Backend
```bash
yarn workspace backend dev      # Development mode
yarn workspace backend build    # Production build
yarn workspace backend start    # Start production server
yarn workspace backend test     # Run tests
```

### Frontend
```bash
yarn workspace frontend dev     # Development mode with turbopack
yarn workspace frontend build   # Production build
yarn workspace frontend start   # Start production server
yarn workspace frontend lint    # Lint code
```

## 🌐 Deployment

### Backend (Render / Railway)

1. Create a new Web Service
2. Connect your repository
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX`
   - `VECTOR_DB=pinecone`
4. Deploy command: `yarn workspace backend build && yarn workspace backend start`
5. Start command: `yarn workspace backend start`

### Frontend (Vercel / Netlify)

1. Connect your repository
2. Set build command: `yarn workspace frontend build`
3. Set output directory: `frontend/.next`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (your backend URL)
   - `NEXT_PUBLIC_APP_URL` (your frontend URL)
5. Deploy

**Note**: Pinecone runs as a managed cloud service - no additional deployment needed!

## 🧪 Testing

```bash
# Backend tests
yarn workspace backend test

# Frontend tests (to be added)
yarn workspace frontend test
```

## 📊 API Endpoints

### PDF Operations
- `POST /api/pdf/upload` - Upload & process PDF
- `GET /api/pdf/:id` - Get PDF metadata
- `GET /api/pdf/:id/content` - Stream PDF file
- `DELETE /api/pdf/:id` - Delete PDF & vectors

### Chat Operations
- `POST /api/chat/session` - Create chat session
- `POST /api/chat` - Send message & get AI response
- `GET /api/chat/:sessionId/history` - Get chat history
- `DELETE /api/chat/:sessionId/history` - Clear history
- `DELETE /api/chat/:sessionId` - Delete session

## 🎨 UI Components

Built with shadcn/ui components:
- Button, Card, Dialog, Input, Textarea
- Progress, Badge, Dropdown Menu, Scroll Area
- Skeleton, Separator, Toast (Sonner)

## 🔐 Environment Variables

### Backend
- `OPENAI_API_KEY` - OpenAI API key (required)
- `PINECONE_API_KEY` - Pinecone API key (required)
- `PINECONE_INDEX` - Pinecone index name (default: notebooklm-clone)
- `VECTOR_DB` - Vector database type: 'pinecone' or 'chroma' (default: pinecone)
- `PORT` - Server port (default: 3001)
- `MAX_FILE_SIZE` - Max PDF size in bytes (default: 52428800 = 50MB)
- `CHUNK_SIZE` - Text chunk size (default: 500 tokens)
- `TOP_K_RESULTS` - Number of vector search results (default: 5)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL
- `NEXT_PUBLIC_MAX_FILE_SIZE` - Max upload size

## 🤝 Contributing

This is an assignment project. Contributions are not currently accepted.

## 📄 License

MIT License

## 🙏 Acknowledgments

- Inspired by [Google NotebookLM](https://notebooklm.google/)
- Built with modern web technologies
- Powered by OpenAI GPT-4

## 📞 Support

For issues and questions, please refer to the documentation or create an issue in the repository.

---

**Built with ❤️ using Next.js, NestJS, and OpenAI**
