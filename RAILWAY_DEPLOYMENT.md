# 🚂 Deploy MingleX Backend to Railway

## 🎯 Why Railway?

- ✅ **Supports WebSockets** (Socket.IO works!)
- ✅ **Persistent connections** (not serverless)
- ✅ **Free tier** for hobby projects
- ✅ **Easy deployment** from GitHub
- ✅ **Better for real-time apps**

Vercel is great for frontend, but Railway is better for your backend.

---

## 📋 Step-by-Step Railway Deployment

### **Step 1: Create Railway Account**

1. Go to https://railway.app
2. Click **Login**
3. Choose **Login with GitHub**
4. Authorize Railway to access your GitHub

---

### **Step 2: Create New Project**

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your repository (e.g., `MingleX` or your repo name)
4. Railway will show a list of services it detected
5. Click on the **server** folder (or root if server is in root)

---

### **Step 3: Configure Build Settings**

Railway should auto-detect Node.js. If not:

1. Click on your service
2. Go to **Settings**
3. Under **Build Command**, enter:
   ```
   npm install
   ```
4. Under **Start Command**, enter:
   ```
   npm start
   ```
5. Under **Root Directory**, enter:
   ```
   server
   ```
   (if your server code is in a `server` folder)

---

### **Step 4: Add Environment Variables**

1. In your Railway service, click **Variables**
2. Click **+ New Variable**
3. Add each variable:

#### **Required Variables:**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minglex?retryWrites=true&w=majority

JWT_ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_minimum_32_characters

JWT_REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_minimum_32_characters

ACCESS_TOKEN_EXPIRES_IN=15m

REFRESH_TOKEN_EXPIRES_IN=30d

SMTP_HOST=smtp.gmail.com

SMTP_PORT=587

SMTP_USER=your_email@gmail.com

SMTP_PASS=your_gmail_app_password

SMTP_FROM_NAME=MingleX

SMTP_FROM_EMAIL=your_email@gmail.com

CORS_ALLOWED_ORIGINS=https://minglex.vercel.app

PORT=5000

FRONTEND_URL=https://minglex.vercel.app

NODE_ENV=production
```

**Important:**
- Copy values from your local `server/.env` file
- Make sure `MONGODB_URI` is correct
- Use Gmail App Password for `SMTP_PASS`

---

### **Step 5: Get Your Railway URL**

1. After deployment completes, click on your service
2. Go to **Settings**
3. Scroll to **Domains**
4. Click **Generate Domain**
5. Railway will give you a URL like:
   ```
   https://minglex-backend-production.up.railway.app
   ```
6. **Copy this URL** - you'll need it!

---

### **Step 6: Update Frontend Environment Variables**

Now update your frontend to use Railway backend:

1. Open `client/.env.production`
2. Update with your Railway URL:

```env
# Production environment variables for Vercel deployment
# IMPORTANT: No trailing slash!
VITE_API_URL=https://your-app-name.up.railway.app
VITE_SOCKET_URL=https://your-app-name.up.railway.app
```

Replace `your-app-name.up.railway.app` with your actual Railway URL.

---

### **Step 7: Update CORS in Backend**

Make sure your Railway backend allows your Vercel frontend:

1. In Railway, go to **Variables**
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://minglex.vercel.app
   ```

---

### **Step 8: Redeploy Frontend**

Push the updated `.env.production` to trigger Vercel deployment:

```bash
cd client
git add .env.production
git commit -m "Update backend URL to Railway"
git push
```

Vercel will auto-deploy your frontend with the new backend URL.

---

## 🧪 Testing

### **Test Backend:**

1. Open your Railway URL in browser:
   ```
   https://your-app.up.railway.app
   ```
2. You should see a response (might be "Cannot GET /")

### **Test API:**

Try this in browser:
```
https://your-app.up.railway.app/api/auth/signup
```

Should return an error (because no data sent), but proves API is accessible.

### **Test Full App:**

1. Open https://minglex.vercel.app
2. Sign up with a new email
3. Check console - should see:
   - ✅ No CORS errors
   - ✅ Socket.IO connected!
   - ✅ Real-time features working!

---

## 📊 Railway vs Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| WebSockets | ✅ Yes | ❌ No (free tier) |
| Persistent connections | ✅ Yes | ❌ No |
| Real-time chat | ✅ Works | ❌ Doesn't work |
| File uploads | ✅ Better | ⚠️ Limited |
| Best for | Backend | Frontend |

---

## 🔧 Troubleshooting

### **Issue: Deployment Failed**

**Check:**
1. Railway logs (click on deployment)
2. Make sure `package.json` has `start` script:
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js"
   }
   ```

### **Issue: MongoDB Connection Error**

**Check:**
1. `MONGODB_URI` is correct in Railway variables
2. MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Password in connection string is URL-encoded

### **Issue: CORS Error**

**Check:**
1. `CORS_ALLOWED_ORIGINS` includes your Vercel frontend URL
2. Frontend `.env.production` has correct Railway URL
3. Frontend has been redeployed after updating `.env.production`

### **Issue: Socket.IO Not Connecting**

**Check:**
1. `VITE_SOCKET_URL` in frontend matches Railway URL
2. Railway backend is running (check logs)
3. No firewall blocking WebSocket connections

---

## 💰 Railway Free Tier

**Free tier includes:**
- ✅ 500 hours/month (enough for 24/7 with one service)
- ✅ Unlimited deployments
- ✅ Custom domains
- ✅ Environment variables
- ✅ GitHub integration

**Perfect for your MingleX app!**

---

## 🎯 Final Architecture

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://minglex.vercel.app         │
│  - React app                        │
│  - Static files                     │
│  - Fast CDN delivery                │
└──────────────┬──────────────────────┘
               │
               │ API Requests
               │ WebSocket Connection
               ▼
┌─────────────────────────────────────┐
│  Backend (Railway)                  │
│  https://your-app.up.railway.app    │
│  - Express server                   │
│  - Socket.IO                        │
│  - API endpoints                    │
│  - Real-time features               │
└──────────────┬──────────────────────┘
               │
               │ Database Queries
               ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas                      │
│  - User data                        │
│  - Messages                         │
│  - Conversations                    │
└─────────────────────────────────────┘
```

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] Backend deployed to Railway
- [ ] All environment variables added to Railway
- [ ] Railway domain generated
- [ ] Frontend `.env.production` updated with Railway URL
- [ ] Frontend redeployed to Vercel
- [ ] Tested signup
- [ ] Tested login
- [ ] Tested real-time chat
- [ ] Socket.IO working

---

## 🚀 Quick Start Commands

```bash
# 1. Update frontend .env.production
# (manually edit the file with Railway URL)

# 2. Commit and push
cd client
git add .env.production
git commit -m "Update to Railway backend"
git push

# 3. Wait for Vercel to deploy

# 4. Test at https://minglex.vercel.app
```

---

## 🎉 After Deployment

Your MingleX app will have:
- ✅ Beautiful branding
- ✅ Professional email templates
- ✅ Real-time chat (Socket.IO working!)
- ✅ File uploads
- ✅ Friend requests
- ✅ Online status
- ✅ Typing indicators
- ✅ Voice messages
- ✅ Emoji support

**All features working perfectly!** 🎊

---

## 📞 Need Help?

**Railway Documentation:**
- https://docs.railway.app

**Railway Discord:**
- https://discord.gg/railway

**Common Issues:**
- Check Railway logs for errors
- Verify environment variables
- Test backend URL directly in browser

---

**Let's deploy to Railway now!** 🚂

Go to: https://railway.app
