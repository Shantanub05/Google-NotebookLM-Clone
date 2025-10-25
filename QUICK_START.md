# 🚀 Quick Start Guide - NotebookLM Clone

Get up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (need >= 18)
node --version

# Check Yarn
yarn --version

# Check Docker
docker --version
```

## Installation (2 minutes)

```bash
# 1. Install dependencies
yarn install

# 2. Set up backend environment
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key
nano .env  # or use your favorite editor

# 3. Set up frontend environment (optional - defaults work)
cd ../frontend
cp .env.example .env.local
cd ..
```

## Running (3 commands)

### Terminal 1 - ChromaDB
```bash
docker-compose up -d
# Wait 10 seconds for ChromaDB to start
```

### Terminal 2 - Backend
```bash
yarn workspace backend dev
# Wait for "Application is running on: http://localhost:3001"
```

### Terminal 3 - Frontend
```bash
yarn workspace frontend dev
# Open http://localhost:3000
```

## First Use

1. **Open Browser**: Navigate to `http://localhost:3000`
2. **Upload PDF**: Drag & drop a PDF file
3. **Wait**: Processing takes 10-30 seconds depending on PDF size
4. **Chat**: Ask questions about your document!

## Example Questions

Try asking:
- "What is the main topic of this document?"
- "Summarize the key points"
- "What are the conclusions?"
- "List the main sections"

## Troubleshooting

### ChromaDB Connection Error
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Restart if needed
docker-compose restart
```

### Backend Won't Start
```bash
# Check if you added OpenAI API key
cat backend/.env | grep OPENAI_API_KEY

# Check port 3001 isn't in use
lsof -i :3001
```

### Frontend Won't Build
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
yarn install
yarn dev
```

### Upload Fails
- Check file is PDF (not image)
- Check file size < 50MB
- Check backend logs for errors
- Ensure ChromaDB is running

## Stopping

```bash
# Stop frontend (Ctrl+C in terminal)
# Stop backend (Ctrl+C in terminal)

# Stop ChromaDB
docker-compose down
```

## Development Tips

### Hot Reload
Both frontend and backend support hot reload - just save files!

### API Testing
Backend API docs: `http://localhost:3001/api`

### Debug Mode
```bash
# Frontend with debug
cd frontend
yarn dev

# Backend with verbose logging
cd backend
NODE_ENV=development yarn dev
```

### Database Reset
```bash
# Clear all uploaded PDFs and vectors
docker-compose down -v
docker-compose up -d
```

## Next Steps

- Read full [README.md](./README.md)
- Check [CLAUDE.md](./CLAUDE.md) for architecture
- Review API documentation
- Explore the codebase

## Need Help?

1. Check console logs (browser F12)
2. Check backend terminal output
3. Check ChromaDB logs: `docker-compose logs`
4. Verify environment variables

## Common Issues

### "OpenAI API key is not configured"
**Fix**: Add your API key to `backend/.env`

### "Failed to load PDF"
**Fix**: File might be corrupted, try another PDF

### "ChromaDB not available"
**Fix**: Run `docker-compose up -d` and wait 10 seconds

### Port already in use
```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

---

**Happy Coding! 🎉**
