# MindfulTech Deployment Guide - Step by Step

## Overview
Your app has **two parts** that deploy separately:
- **Backend** (Node/Express) → Deploy to Render or Railway
- **Frontend** (React/Vite) → Deploy to Vercel

---

## PHASE 1: Pre-Deployment Preparation (Local)

### Step 1: Verify Environment Files
**Checklist:**
- [ ] Create `backend/.env` with real credentials (copy from `backend/.env.example`)
- [ ] Create `.env` in root with real credentials (copy from `.env.example`)
- [ ] **NEVER commit `.env` files** - they contain secrets

**Sample structure:**
```
backend/.env (DO NOT COMMIT)
├─ MONGODB_URI=your_mongodb_connection
├─ JWT_SECRET=your_random_secret
├─ GROQ_API_KEY=your_groq_key
├─ GMAIL_USER=your-email@gmail.com
├─ GMAIL_PASS=your-app-password
├─ APP_URL=https://your-frontend-url (set later)
└─ NODE_ENV=production

.env (DO NOT COMMIT)
├─ VITE_API_BASE_URL=http://localhost:5000/api (dev) or production URL
└─ APP_URL=https://your-frontend-url
```

### Step 2: Create Secure Credentials
**Gmail Setup (for email verification):**
1. Enable 2-Factor Authentication on your Gmail account
2. Create an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google generates a 16-character password
   - Use this as `GMAIL_PASS` in `.env`

**MongoDB Setup:**
- Already configured: `mongodb+srv://shadracnyamweya_db_user:UAc8tejpBilF2WsX@...`
- Keep this as your `MONGODB_URI`

**JWT Secret:**
- Generate random string: `openssl rand -base64 32` (or use any random hash)
- Store as `JWT_SECRET`

**Groq API Key:**
- Get from https://console.groq.com/keys
- Store as `GROQ_API_KEY`

### Step 3: Test Backend Locally
```bash
cd mindfultech-app
npm start
# Should see: 🚀 Server running on port 5000
# And: ✅ MongoDB Connected Successfully
```

### Step 4: Test Frontend Locally
```bash
npm run build
npm run preview
# Navigate to http://localhost:4173
# Login and test basic features
```

---

## PHASE 2: Deploy Backend

### Option A: Deploy to Render (Recommended for Beginners)

**Step 1: Push Code to GitHub**
```bash
# In your project root
git add .
git commit -m "Deployment ready"
git push origin main
```

**Step 2: Create Render Account**
- Go to https://render.com
- Sign up with GitHub
- Click "New +" → "Web Service"

**Step 3: Connect Repository**
- Authorize GitHub
- Select `mindfultech-app` repository
- Leave root directory empty (already configured in render.yaml)

**Step 4: Configure Service**
- **Name:** `mindfultech-backend`
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (or Starter)

**Step 5: Add Environment Variables**
In Render dashboard, click "Environment" and add:
```
MONGODB_URI = your_mongodb_uri (from MongoDB Atlas)
JWT_SECRET = your_random_secret
GROQ_API_KEY = your_groq_api_key
GMAIL_USER = your-email@gmail.com
GMAIL_PASS = your_gmail_app_password
APP_URL = https://your-frontend-url (add later after frontend deploys)
NODE_ENV = production
```

**Step 6: Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- **Copy your backend URL:** `https://mindfultech-backend.onrender.com`

**Verify Backend:**
```bash
curl https://mindfultech-backend.onrender.com/
# Should return: {"message":"MindfulTech API Server Running!"}
```

---

### Option B: Deploy to Railway

**Step 1: Create Railway Account**
- Go to https://railway.app
- Sign up with GitHub

**Step 2: Create New Project**
- Click "Create New Project"
- Select "Deploy from GitHub"
- Choose `mindfultech-app` repository

**Step 3: Configure**
- Railway reads `railway.json` automatically
- Add environment variables same as Render (see Step 5 above)

**Step 4: Deploy**
- Click "Deploy"
- Your backend URL appears in dashboard
- Example: `https://mindfultech-app-production.up.railway.app`

---

## PHASE 3: Deploy Frontend

### Step 1: Update Environment File
Edit `.env` in your project root:
```
VITE_API_BASE_URL=https://your-backend-url/api
APP_URL=https://your-frontend-url
```
Replace `your-backend-url` with the URL from Phase 2 (Render or Railway)

### Step 2: Push Updated Code
```bash
git add .env.example .
git commit -m "Update API URL for deployment"
git push origin main
```

### Step 3: Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### Step 4: Import Project
- Click "Add New..." → "Project"
- Select `mindfultech-app` repository
- Vercel auto-detects it as a Vite project

### Step 5: Configure Build
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- These should auto-detect

### Step 6: Add Environment Variables
In Vercel dashboard → "Environment Variables":
```
VITE_API_BASE_URL = https://your-backend-url/api
APP_URL = https://your-vercel-url.vercel.app
```

### Step 7: Deploy
- Click "Deploy"
- Wait 2-3 minutes for build
- Your frontend URL: `https://your-project.vercel.app`

**Test Frontend:**
- Navigate to https://your-project.vercel.app
- Try to register a new account
- Should receive verification email

---

## PHASE 4: Post-Deployment Setup

### Step 1: Update Backend with Frontend URL
Go back to Render/Railway dashboard and update:
```
APP_URL = https://your-project.vercel.app
```
This allows backend to generate correct email links

### Step 2: Test End-to-End
**Test Register Flow:**
1. Go to frontend URL
2. Register new account
3. Check email for verification link
4. Click link and verify
5. Login and explore dashboard

**Test Core Features:**
- [ ] Mood logging
- [ ] Focus session tracking
- [ ] Content analysis
- [ ] Dashboard statistics
- [ ] Profile settings

### Step 3: Monitor for Errors
Check deployment logs:
- **Render:** Dashboard → Logs
- **Railway:** Dashboard → Logs
- **Vercel:** Deployments → Logs

Watch for MongoDB connection errors, email failures, etc.

### Step 4: Set Custom Domain (Optional)
**For Vercel Frontend:**
- Vercel Dashboard → Project Settings → Domains
- Add custom domain (requires DNS configuration)

**For Render/Railway Backend:**
- Similar process in respective dashboards

---

## PHASE 5: Cleanup & Security

### Step 1: Remove Secrets from Git History
If `.env` was accidentally committed:
```bash
# Remove from history
git filter-branch --index-filter 'git rm --cached --ignore-unmatch .env' -r
git push --force-with-lease origin main
```

### Step 2: Verify `.gitignore`
Make sure these are ignored:
```
.env
backend/.env
.env.local
node_modules/
dist/
build/
*.log
```

### Step 3: Set Up Monitoring (Optional)
- Enable error tracking on Vercel
- Enable logs on Render/Railway
- Set up email alerts for deployment failures

---

## Quick Reference URLs

After deployment, update these bookmarks:

```
Frontend: https://your-project.vercel.app
Backend: https://your-backend-url (Render or Railway)

Database: MongoDB Atlas (https://cloud.mongodb.com)
Gmail: https://myaccount.google.com/apppasswords
Render: https://render.com/dashboard
Railway: https://railway.app/dashboard
Vercel: https://vercel.com/dashboard
```

---

## Troubleshooting

### Email not sending?
- Check `GMAIL_USER` and `GMAIL_PASS` are correct
- Verify app password is 16 characters
- Check Render/Railway logs for errors

### Frontend can't connect to backend?
- Verify `VITE_API_BASE_URL` is correct
- Check CORS is enabled in backend
- Test backend URL directly in browser: `https://backend-url/`

### MongoDB connection fails?
- Verify `MONGODB_URI` includes username and password
- Check IP whitelist in MongoDB Atlas (should allow all IPs for public apps)
- Test connection string locally first

### 502 Bad Gateway error?
- Usually means backend is crashing
- Check Render/Railway logs
- Verify all env variables are set
- Check PORT is 5000 in environment

---

## Success Checklist

- [ ] Backend deployed and responding to API calls
- [ ] Frontend deployed and loads without errors
- [ ] Registration works and email is sent
- [ ] Email verification link works
- [ ] Login functionality works
- [ ] Dashboard displays correctly
- [ ] Can log mood entries
- [ ] Can track focus sessions
- [ ] Content analysis generates responses
- [ ] No errors in browser console
- [ ] No errors in Render/Railway logs
- [ ] Secrets not exposed in repository

---

## Next Steps (After Deployment)

1. **Monitor performance** - Watch logs for errors
2. **Gather user feedback** - Test with real users
3. **Add custom domain** - Professional branding
4. **Set up backups** - MongoDB Atlas automated backups
5. **Enable HTTPS** - Automatic on Vercel/Render
6. **Implement analytics** - Track user behavior
7. **Schedule maintenance** - Updates and patches

---

**You're ready to deploy! Start with Phase 1 and work through each phase systematically.** 🚀
