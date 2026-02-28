# 🚀 LearnHub Free Deployment Guide

Deploy your LearnHub application completely FREE using:
- **MongoDB Atlas** - Free database (512MB)
- **Render.com** - Free backend hosting
- **Vercel** - Free frontend hosting

---

## 📋 Prerequisites

- GitHub account (to host your code)
- Email address (for creating accounts)

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Name it `learnhub` (or any name you prefer)
4. Keep it **Public** (required for free deployment)
5. Click **Create repository**

### 1.2 Push Your Code

Open terminal in your project folder and run:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - LearnHub"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/learnhub.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 2: Setup MongoDB Atlas (Free Database)

### 2.1 Create Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **Try Free** → Sign up with Google or email
3. Verify your email

### 2.2 Create Free Cluster

1. Choose **M0 FREE** tier
2. Select a cloud provider (AWS recommended)
3. Choose a region close to you (e.g., `us-east-1`)
4. Click **Create Deployment**

### 2.3 Setup Database Access

1. In the popup, create a database user:
   - Username: `learnhub_user`
   - Password: Click **Autogenerate Secure Password**
   - **⚠️ COPY THIS PASSWORD - you'll need it!**
2. Click **Create Database User**

### 2.4 Setup Network Access

1. Click **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
4. Click **Confirm**

### 2.5 Get Connection String

1. Click **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Drivers**
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://learnhub_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before `?`:
   ```
   mongodb+srv://learnhub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learnhub?retryWrites=true&w=majority
   ```

**Save this connection string - you'll need it for the backend!**

---

## Step 3: Deploy Backend on Render.com

### 3.1 Create Account

1. Go to [render.com](https://render.com)
2. Click **Get Started for Free**
3. Sign up with GitHub (recommended - easier deployment)

### 3.2 Create Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Select your `learnhub` repository

### 3.3 Configure Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `learnhub-backend` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.4 Add Environment Variables

Scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://learnhub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learnhub?retryWrites=true&w=majority` |
| `JWT_SECRET` | *(generate a strong random string, e.g. via `openssl rand -hex 32`)* |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` (update after Step 4) |

### 3.5 Deploy

1. Click **Create Web Service**
2. Wait for deployment (takes 2-5 minutes)
3. Once deployed, copy your backend URL (e.g., `https://learnhub-backend.onrender.com`)

**⚠️ Note:** Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Create Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Sign up with GitHub (recommended)

### 4.2 Import Project

1. Click **Add New...** → **Project**
2. Find and select your `learnhub` repository
3. Click **Import**

### 4.3 Configure Project

| Setting | Value |
|---------|-------|
| **Project Name** | `learnhub` |
| **Framework Preset** | `Vite` |
| **Root Directory** | Click **Edit** → Select `frontend` |

### 4.4 Add Environment Variables

Click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://learnhub-backend.onrender.com` |

(Use your actual Render backend URL from Step 3.5)

### 4.5 Deploy

1. Click **Deploy**
2. Wait for deployment (takes 1-2 minutes)
3. Your site is live! Copy the URL (e.g., `https://learnhub.vercel.app`)

---

## Step 5: Update Backend CORS

Now that you have your frontend URL, update the backend:

1. Go back to **Render.com** → Your service → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://learnhub.vercel.app
   ```
3. Click **Save Changes**
4. The service will automatically redeploy

---

## Step 6: Create Admin User

1. Visit your deployed frontend URL
2. Click **Get Started** to register
3. Create a user with these details:
   - Email: `admin@learnhub.com`
   - Password: (your choice)
   - Role: Select **Admin** (if available) or manually update in MongoDB

### To manually set admin (if needed):

1. Go to MongoDB Atlas → **Browse Collections**
2. Find `users` collection
3. Find your user and click **Edit**
4. Change `type` to `Admin`
5. Click **Update**

---

## ✅ Deployment Complete!

Your LearnHub app is now live:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-app.vercel.app` |
| **Backend** | `https://your-backend.onrender.com` |
| **Database** | MongoDB Atlas |

---

## 🔧 Troubleshooting

### Backend not responding?
- Free Render services sleep after 15 min. Wait 30-60 sec for first request.
- Check Render logs for errors.

### CORS errors?
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).

### Database connection failed?
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`.
- Verify password in connection string is correct.
- Ensure database name is included in URI.

### Frontend not loading data?
- Check browser DevTools → Network tab for errors.
- Verify `VITE_API_URL` is set correctly in Vercel.

---

## 💡 Tips for Free Tier

1. **Keep backend awake**: Use [cron-job.org](https://cron-job.org) to ping your backend every 14 minutes.

2. **Monitor usage**: 
   - MongoDB Atlas: 512MB storage limit
   - Render: 750 hours/month free
   - Vercel: 100GB bandwidth/month

3. **Custom domain** (optional):
   - Both Vercel and Render allow free custom domains
   - Go to Settings → Domains in each service

---

## 🎉 Congratulations!

Your LearnHub platform is now live and accessible worldwide - completely FREE!

Need help? Check the documentation:
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
