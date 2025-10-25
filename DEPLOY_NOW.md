# Quick Deployment Guide - Start Here! 🚀

Follow these steps to deploy your NotebookLM Clone to free cloud services.

## Prerequisites Checklist

- [ ] GitHub account
- [ ] Render account ([Sign up](https://render.com/))
- [ ] Vercel account ([Sign up](https://vercel.com/))
- [ ] OpenAI API Key
- [ ] Pinecone API Key

---

## Step 1: Push to GitHub (5 minutes)

If not already done:

```bash
# In your project root
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/notebooklm-clone.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (10 minutes)

### Quick Deploy with Blueprint

1. **Go to**: https://dashboard.render.com/
2. **Click**: "New +" → "Blueprint"
3. **Connect**: Your GitHub repository
4. **Render will auto-detect** `render.yaml`
5. **Add Environment Secrets**:
   - After service is created, go to "Environment" tab
   - Add these **3 secrets**:
     ```
     OPENAI_API_KEY = (paste your OpenAI key)
     PINECONE_API_KEY = (paste your Pinecone key)
     FRONTEND_URL = https://your-app.vercel.app
     ```
   - Note: You'll update FRONTEND_URL after deploying frontend

6. **Click "Deploy"** and wait 5-10 minutes

7. **Copy your backend URL**: `https://notebooklm-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New..." → "Project"
3. **Import**: Your GitHub repository
4. **Configure**:
   - Framework: Next.js (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `.next`
   - Install Command: `yarn install`

5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://notebooklm-backend.onrender.com
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NEXT_PUBLIC_MAX_FILE_SIZE = 52428800
   ```
   - Note: For `NEXT_PUBLIC_APP_URL`, Vercel will show you the URL after first deploy

6. **Click "Deploy"** and wait 2-3 minutes

7. **Copy your frontend URL**: `https://notebooklm-clone.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel

# Follow prompts, then deploy to production
vercel --prod
```

---

## Step 4: Update Backend CORS (2 minutes)

After frontend is deployed:

1. Go back to **Render Dashboard**
2. Click on your **backend service**
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your actual Vercel URL
5. Click **"Save Changes"**
6. Wait for auto-redeploy (~2 minutes)

---

## Step 5: Test Your Deployed App! 🎉

1. **Visit**: `https://your-app.vercel.app`

2. **Upload a PDF**:
   - Drag and drop or click to upload
   - Wait for processing (30-60 seconds)
   - Should see success message

3. **Ask Questions**:
   - Type a question about your PDF
   - Get AI response with page citations

4. **Test Citations**:
   - Click page badges
   - PDF should jump to referenced page

---

## Common Issues & Fixes

### Backend Not Responding
- Check Render logs: Dashboard → Service → "Logs"
- Verify API keys are set correctly
- First request may take 30-60s (cold start on free tier)

### CORS Errors
- Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash in URLs
- Wait for backend to redeploy after updating

### Frontend Build Fails
- Check Vercel build logs
- Verify `NEXT_PUBLIC_API_URL` is set
- Ensure no TypeScript errors

### PDF Upload Fails
- Check file size (max 50MB)
- Verify backend URL is correct
- Check backend is running (visit API URL directly)

---

## Your Deployed URLs

After deployment, save these:

```
Frontend: https://your-app.vercel.app
Backend:  https://notebooklm-backend.onrender.com
API Docs: https://notebooklm-backend.onrender.com/api
```

---

## What's Next?

- ✅ Share your app URL!
- ✅ Monitor usage in Render/Vercel dashboards
- ✅ Check logs if you encounter issues
- ✅ Consider adding custom domain (optional)

---

## Free Tier Limits

**Render**:
- 750 hours/month free
- Spins down after 15 min inactivity
- Cold starts take 30-60s

**Vercel**:
- 100 GB bandwidth/month
- Unlimited deployments
- Instant cold starts

**Pinecone**:
- 2GB storage
- 2M write units/month
- 1M read units/month

---

## Need Help?

See detailed guide: `DEPLOYMENT.md`

**Support**:
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Pinecone: https://docs.pinecone.io/

---

**Happy Deploying! 🚀**
