# 🚀 LearnHub — Free Deployment Guide (Step by Step)

Deploy LearnHub for **$0/month** using:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **MongoDB Atlas** | Database | 512 MB storage |
| **Render** | Backend API | 750 hrs/month |
| **Vercel** | Frontend | Unlimited static |

> Total time: **~20 minutes**

---

## Prerequisites

- A **GitHub account** with the LearnHub repo pushed
- A web browser (no CLI tools needed)

---

## STEP 1 — Set Up MongoDB Atlas (Free Database)

### 1.1 Create an Account

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register)
2. Click **Try Free** → sign up with Google or email
3. Choose the **M0 Free** tier when prompted

### 1.2 Create a Cluster

1. Click **Build a Database**
2. Select **M0 FREE** (Shared)
3. Choose **AWS** as provider, pick the region closest to you (e.g., `us-east-1`)
4. Cluster name: `LearnHub` (or keep the default)
5. Click **Create Deployment**

### 1.3 Create a Database User

1. In the popup, set:
   - **Username**: `learnhub_user`
   - **Password**: Click **Autogenerate Secure Password**
2. **⚠️ COPY THIS PASSWORD** — you will need it in Step 2
3. Click **Create Database User**

### 1.4 Set Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
4. Click **Confirm**

> This allows Render servers to connect. You can restrict this later.

### 1.5 Get the Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Drivers** (Node.js)
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://learnhub_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password from Step 1.3
6. Add the database name `learnhub` before the `?`:
   ```
   mongodb+srv://learnhub_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/learnhub?retryWrites=true&w=majority
   ```
7. **Save this full string** — this is your `MONGODB_URI`

---

## STEP 2 — Deploy Backend on Render (Free)

### 2.1 Create a Render Account

1. Go to [render.com](https://render.com)
2. Click **Get Started for Free**
3. **Sign up with GitHub** (recommended — auto-links your repos)

### 2.2 Create a New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: select `LearnHub-Your-Center-for-Skill-Enhancement`
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `learnhub-api` |
| **Region** | Oregon (US West) or closest to your Atlas cluster |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | **Free** |

### 2.3 Add Environment Variables

Scroll to **Environment Variables** and add these **one by one**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | *(paste the full Atlas connection string from Step 1.5)* |
| `JWT_SECRET` | *(generate one — see below)* |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | *(leave blank for now — you'll update this after Step 3)* |

**To generate a JWT_SECRET**, open any terminal and run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Or use any random string generator (64+ characters recommended).

### 2.4 Deploy

1. Click **Create Web Service**
2. Wait 2–5 minutes for the build and deploy
3. Once live, you'll see a URL like:
   ```
   https://learnhub-api-xxxx.onrender.com
   ```
4. **Copy this URL** — this is your backend URL

### 2.5 Verify the Backend

Open your backend URL in a browser and add `/health`:
```
https://learnhub-api-xxxx.onrender.com/health
```

You should see:
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

> **⚠️ Note**: Free tier sleeps after 15 minutes of inactivity. The first request after sleep takes 30–60 seconds. This is normal.

---

## STEP 3 — Deploy Frontend on Vercel (Free)

### 3.1 Create a Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. **Sign up with GitHub** (recommended)

### 3.2 Import Your Project

1. Click **Add New...** → **Project**
2. Find and select your `LearnHub-Your-Center-for-Skill-Enhancement` repo
3. Click **Import**

### 3.3 Configure the Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` (click **Edit** to change) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.4 Add Environment Variable

Click **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://learnhub-api-xxxx.onrender.com` *(your Render URL from Step 2.4, NO trailing slash)* |

### 3.5 Deploy

1. Click **Deploy**
2. Wait 1–2 minutes for the build
3. Once live, you'll see a URL like:
   ```
   https://learnhub-xxxx.vercel.app
   ```
4. **Copy this URL** — this is your frontend URL

---

## STEP 4 — Connect Frontend ↔ Backend (CORS)

Now go **back to Render** and update the `FRONTEND_URL`:

1. Go to your Render dashboard → `learnhub-api` service
2. Click **Environment** in the left sidebar
3. Find `FRONTEND_URL` and set it to your Vercel URL:
   ```
   https://learnhub-xxxx.vercel.app
   ```
4. Click **Save Changes**
5. Render will automatically redeploy

---

## STEP 5 — Create Your First Admin Account

1. Open your deployed app: `https://learnhub-xxxx.vercel.app`
2. Click **Register**
3. Create a user account (it will be a Student by default)
4. To make this user an **Admin**, go to MongoDB Atlas:
   1. Go to **Database** → Click **Browse Collections**
   2. Select the `learnhub` database → `users` collection
   3. Find your user document
   4. Click **Edit** (pencil icon)
   5. Change `"type": "Student"` to `"type": "Admin"`
   6. Click **Update**
5. Log out and log back in — you now have admin access!

---

## STEP 6 — Verify Everything Works

Test each feature:

| Test | Action |
|------|--------|
| ✅ Register | Create a student and teacher account |
| ✅ Login | Log in with each account |
| ✅ Create Course | Login as teacher → Add a course |
| ✅ Browse Courses | View courses on the public page |
| ✅ Enroll | Login as student → Enroll in a course |
| ✅ Track Progress | Mark sections as complete |
| ✅ Admin Panel | Login as admin → View dashboard |

---

## Architecture Diagram

```
┌─────────────────────────┐     ┌──────────────────────────┐
│    Vercel (Frontend)    │────▶│    Render (Backend API)   │
│                         │     │                          │
│  React + Vite           │     │  Express.js + Node.js    │
│  Static SPA             │     │  REST API                │
│  vercel.app             │     │  onrender.com            │
└─────────────────────────┘     └──────────┬───────────────┘
                                           │
                                           ▼
                                ┌──────────────────────────┐
                                │  MongoDB Atlas (Database) │
                                │                          │
                                │  M0 Free Tier            │
                                │  512 MB Storage          │
                                │  mongodb.net             │
                                └──────────────────────────┘
```

---

## Free Tier Limits to Know

| Service | Limit | What Happens |
|---------|-------|--------------|
| **Render Free** | 750 hrs/month, sleeps after 15 min idle | First request takes 30–60s to wake up |
| **Vercel Free** | 100 GB bandwidth/month | More than enough for most apps |
| **Atlas M0** | 512 MB storage, 100 max connections | Sufficient for ~10,000+ courses |

---

## Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Vercel → Your project → **Settings** → **Domains**
2. Add your domain (e.g., `learnhub.yourdomain.com`)
3. Update your DNS records as instructed
4. Update `FRONTEND_URL` on Render to match

### Render (Backend)
1. Go to Render → Your service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.learnhub.yourdomain.com`)
3. Update DNS records
4. Update `VITE_API_URL` on Vercel to match

---

## Troubleshooting

### "Network Error" or CORS errors
- Verify `FRONTEND_URL` on Render matches your Vercel URL exactly (no trailing slash)
- Verify `VITE_API_URL` on Vercel matches your Render URL exactly (no trailing slash)
- Redeploy both services after changing env vars

### Backend won't start on Render
- Check the **Logs** tab in Render dashboard
- Verify `MONGODB_URI` is correct and the password has no special characters that need URL encoding
- Make sure Atlas Network Access allows `0.0.0.0/0`

### "Cannot connect to MongoDB"
- Go to Atlas → Network Access → ensure `0.0.0.0/0` is listed
- Verify the connection string has the correct password
- Check that the database user has `readWriteAnyDatabase` role

### Images/Videos not showing in production
- Render's free tier has **ephemeral storage** — uploaded files are lost on redeploy
- For production file hosting, consider [Cloudinary](https://cloudinary.com) (free: 25 GB) or [AWS S3](https://aws.amazon.com/s3/) (free tier: 5 GB for 12 months)
- The app still works — only previously uploaded course images/videos are affected

### Vercel build fails
- Check that Root Directory is set to `frontend`
- Make sure `VITE_API_URL` doesn't have a trailing slash
- Check the build logs for specific errors

---

## Environment Variables Summary

### Render (Backend)
| Variable | Example | Required |
|----------|---------|----------|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `10000` | ✅ |
| `MONGODB_URI` | `mongodb+srv://...` | ✅ |
| `JWT_SECRET` | `a1b2c3...` (64 chars) | ✅ |
| `JWT_EXPIRES_IN` | `7d` | Optional |
| `FRONTEND_URL` | `https://app.vercel.app` | ✅ |

### Vercel (Frontend)
| Variable | Example | Required |
|----------|---------|----------|
| `VITE_API_URL` | `https://api.onrender.com` | ✅ |

---

## What's Next?

After successful deployment, consider:

1. **File Storage** — Move to Cloudinary/S3 for persistent media uploads
2. **Monitoring** — Add [UptimeRobot](https://uptimerobot.com) (free) to keep Render awake
3. **Analytics** — Add [Vercel Analytics](https://vercel.com/analytics) (free tier available)
4. **Error Tracking** — Add [Sentry](https://sentry.io) free tier for production error monitoring
5. **Custom Domain** — Add a professional domain name (~$10/year)

---

*Last updated: February 2026*
