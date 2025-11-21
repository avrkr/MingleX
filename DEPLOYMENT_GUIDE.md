# Vercel Deployment Guide for Chat Application

## 📋 Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- MongoDB Atlas account (for production database)

## 🚀 Deployment Order

**IMPORTANT: Deploy the BACKEND first, then the FRONTEND!**

This is because the frontend needs the backend URL to connect to the API.

---

## Part 1: Deploy Backend (Server) First

### Step 1: Prepare Backend for Deployment

1. **Create `vercel.json` in the `server` folder:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

2. **Update `server/package.json`** - Add engines:

```json
{
  "engines": {
    "node": "18.x"
  }
}
```

### Step 2: Push Backend to GitHub

```bash
cd server
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chat-app-backend.git
git push -u origin main
```

### Step 3: Deploy Backend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your backend GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (or leave blank if server is root)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

5. **Add Environment Variables** (click "Environment Variables"):
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_ACCESS_TOKEN_SECRET=your_secret_key_here
   JWT_REFRESH_TOKEN_SECRET=your_refresh_secret_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   PORT=5000
   ```

6. Click "Deploy"
7. **Copy your backend URL** (e.g., `https://chat-app-backend-xyz.vercel.app`)

### Step 4: Update CORS After Frontend Deployment

After deploying the frontend, you'll need to update the `CORS_ALLOWED_ORIGINS` environment variable in Vercel:

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update `CORS_ALLOWED_ORIGINS` with your frontend URL
4. Redeploy

---

## Part 2: Deploy Frontend (Client)

### Step 1: Update Frontend Environment Variables

1. **Update `client/.env.production`:**

```env
VITE_API_URL=https://your-backend-url.vercel.app
VITE_SOCKET_URL=https://your-backend-url.vercel.app
```

Replace `your-backend-url` with the actual URL from Step 3.7 above.

### Step 2: Create `vercel.json` in the `client` folder

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 3: Push Frontend to GitHub

```bash
cd client
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chat-app-frontend.git
git push -u origin main
```

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your frontend GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave blank if client is root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_SOCKET_URL=https://your-backend-url.vercel.app
   ```

6. Click "Deploy"
7. **Copy your frontend URL** (e.g., `https://chat-app-xyz.vercel.app`)

### Step 5: Update Backend CORS

1. Go back to your backend project in Vercel
2. Settings → Environment Variables
3. Edit `CORS_ALLOWED_ORIGINS` and set it to your frontend URL:
   ```
   CORS_ALLOWED_ORIGINS=https://chat-app-xyz.vercel.app
   ```
4. Go to Deployments tab
5. Click the three dots on the latest deployment
6. Click "Redeploy"

---

## 🔧 MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
   ```
6. Use this as your `MONGODB_URI` in backend environment variables

---

## 📝 Important Notes

### Socket.IO on Vercel
⚠️ **Vercel has limitations with WebSockets!** Socket.IO may not work reliably on Vercel's free tier because:
- Vercel uses serverless functions
- WebSocket connections require persistent connections
- Vercel functions have a 10-second timeout

### Alternative Hosting for Backend (Recommended)

For better Socket.IO support, consider deploying the backend to:

1. **Railway.app** (Recommended - Free tier available)
   - Supports WebSockets
   - Easy deployment
   - Persistent connections

2. **Render.com** (Free tier available)
   - Supports WebSockets
   - Good for Node.js apps

3. **Heroku** (Paid)
   - Reliable WebSocket support

### If Using Railway for Backend:

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your backend repository
5. Add environment variables (same as Vercel)
6. Deploy
7. Copy the Railway URL and use it in your frontend `.env.production`

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Vercel/Railway
- [ ] Backend environment variables configured
- [ ] Backend URL copied
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL copied
- [ ] Backend CORS updated with frontend URL
- [ ] Backend redeployed
- [ ] Test the application!

---

## 🧪 Testing Your Deployment

1. Open your frontend URL
2. Try to sign up a new user
3. Check if you receive the verification email
4. Verify your email
5. Log in
6. Try sending messages
7. Test real-time features (friend requests, online status)
8. Test file uploads

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure `CORS_ALLOWED_ORIGINS` in backend matches your frontend URL exactly
- No trailing slash in URLs
- Redeploy backend after changing environment variables

### Socket.IO Not Working
- Consider using Railway/Render for backend instead of Vercel
- Check browser console for WebSocket connection errors

### File Uploads Not Working
- Vercel has a 4.5MB limit for serverless functions
- Consider using Cloudinary or AWS S3 for file storage in production

### Database Connection Errors
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify connection string is correct
- Check database user permissions

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Socket.IO Deployment Guide](https://socket.io/docs/v4/deployment/)

---

## 🎉 You're Done!

Your chat application should now be live and accessible from anywhere!

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-backend.vercel.app` or `https://your-backend.up.railway.app`
