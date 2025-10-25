# Deployment Guide

This guide will help you deploy the NotebookLM Clone to free cloud services.

## Prerequisites

1. **GitHub Account** (for code repository)
2. **Render Account** ([Sign up free](https://render.com/))
3. **Vercel Account** ([Sign up free](https://vercel.com/))
4. **API Keys**:
   - OpenAI API Key
   - Pinecone API Key

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - NotebookLM Clone"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/notebooklm-clone.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Blueprint"**

3. **Connect your GitHub repository**

4. **Render will detect `render.yaml` automatically**

5. **Add Secret Environment Variables**:
   - Click on the service after it's created
   - Go to "Environment" tab
   - Add these secrets:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     PINECONE_API_KEY=your_pinecone_api_key_here
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)
   - Copy your backend URL: `https://notebooklm-backend.onrender.com`

### Option B: Manual Setup

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure Service**:
   - **Name**: `notebooklm-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start:prod`
   - **Instance Type**: Free

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX=notebooklm-clone
   VECTOR_DB=pinecone
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MAX_FILE_SIZE=52428800
   CHUNK_SIZE=500
   CHUNK_OVERLAP=50
   TOP_K_RESULTS=5
   EMBEDDING_MODEL=text-embedding-3-small
   CHAT_MODEL=gpt-4o
   MAX_TOKENS=4096
   TEMPERATURE=0.7
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (first deploy takes 5-10 minutes)

8. **Copy your backend URL** (e.g., `https://notebooklm-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**:
   ```bash
   cd frontend
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - What's your project's name? `notebooklm-clone`
   - In which directory is your code located? `./`
   - Want to override settings? **Y**
   - Build Command: `yarn build`
   - Output Directory: `.next`
   - Development Command: `yarn dev`

5. **Add Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter: https://notebooklm-backend.onrender.com

   vercel env add NEXT_PUBLIC_APP_URL production
   # Enter: https://notebooklm-clone.vercel.app
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository**

4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `.next`
   - **Install Command**: `yarn install`

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL=https://notebooklm-backend.onrender.com
     NEXT_PUBLIC_APP_URL=https://notebooklm-clone.vercel.app
     NEXT_PUBLIC_MAX_FILE_SIZE=52428800
     ```

6. **Click "Deploy"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your frontend URL** (e.g., `https://notebooklm-clone.vercel.app`)

---

## Step 4: Update Backend CORS

After deploying frontend, update the backend's `FRONTEND_URL`:

1. Go to **Render Dashboard** → Your Backend Service
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your Vercel URL
4. Click **Save Changes**
5. Service will automatically redeploy

---

## Step 5: Test Deployed Application

1. **Visit your frontend URL**: `https://notebooklm-clone.vercel.app`

2. **Test PDF Upload**:
   - Upload a PDF file
   - Wait for processing
   - Should see success message

3. **Test Chat**:
   - Ask a question about your PDF
   - Should receive AI-generated response with citations

4. **Test Citations**:
   - Click on page badges in responses
   - PDF should jump to referenced page

---

## Troubleshooting

### Backend Issues

**Build Fails**:
- Check logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

**Service Crashes**:
- Check "Logs" tab in Render
- Verify all environment variables are set
- Check Pinecone and OpenAI API keys are valid

**CORS Errors**:
- Ensure `FRONTEND_URL` matches your Vercel URL exactly
- No trailing slash in URLs

### Frontend Issues

**Build Fails**:
- Check build logs in Vercel
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Ensure frontend code has no TypeScript errors

**API Connection Fails**:
- Verify backend URL is correct in environment variables
- Check backend is running (visit backend URL)
- Check network tab in browser DevTools

**PDF Upload Fails**:
- Check file size (max 50MB)
- Verify backend API is accessible
- Check backend logs for errors

---

## Monitoring & Logs

### Render (Backend)
- Dashboard → Your Service → "Logs" tab
- Real-time logs of backend activity
- Check for errors and API calls

### Vercel (Frontend)
- Dashboard → Your Project → "Deployments"
- Click on deployment → "Functions" tab for serverless logs
- Check for build and runtime errors

---

## Cost Optimization

Both services offer free tiers:

**Render Free Tier**:
- 750 hours/month
- Services spin down after 15 min of inactivity
- First request may take 30-60 seconds (cold start)

**Vercel Free Tier**:
- Unlimited deployments
- 100 GB bandwidth/month
- Instant cold starts

**Pinecone Free Tier**:
- 2GB storage
- 2M write units/month
- 1M read units/month

---

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Vercel automatically provisions SSL

### For Backend (Render)
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records
4. Render automatically provisions SSL

---

## Environment Variables Reference

### Backend (Render)
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=notebooklm-clone
VECTOR_DB=pinecone
FRONTEND_URL=https://your-app.vercel.app
MAX_FILE_SIZE=52428800
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K_RESULTS=5
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o
MAX_TOKENS=4096
TEMPERATURE=0.7
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

---

## Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push
   ```

2. **Auto-deploy**:
   - Vercel: Deploys immediately
   - Render: Deploys within 1-2 minutes

3. **Monitor deployments** in respective dashboards

---

## Support

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **Pinecone Support**: https://docs.pinecone.io/

---

**Deployment Complete! 🎉**

Your NotebookLM Clone should now be accessible at:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
