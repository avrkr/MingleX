# 🚂 Railway Deployment - Quick Reference

## 🎯 What You're Doing

Moving your backend from **Vercel** to **Railway** because:
- ✅ Railway supports WebSockets (Socket.IO)
- ✅ Railway has persistent connections
- ✅ Better for real-time chat apps

**Frontend stays on Vercel** (it's perfect for React apps)

---

## 📝 Step-by-Step Checklist

### ☐ 1. Create Railway Account
- Go to https://railway.app
- Login with GitHub
- Authorize Railway

### ☐ 2. Deploy Backend
- Click **New Project**
- Choose **Deploy from GitHub repo**
- Select your repository
- Railway auto-detects Node.js

### ☐ 3. Configure Root Directory
- Click on service → **Settings**
- Set **Root Directory** to: `server`
- **Start Command**: `npm start` (should be auto-detected)

### ☐ 4. Add Environment Variables
Click **Variables** tab, add these:

```
MONGODB_URI=<your_mongodb_connection_string>
JWT_ACCESS_TOKEN_SECRET=<your_secret>
JWT_REFRESH_TOKEN_SECRET=<your_secret>
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_email>
SMTP_PASS=<your_gmail_app_password>
SMTP_FROM_NAME=MingleX
SMTP_FROM_EMAIL=<your_email>
CORS_ALLOWED_ORIGINS=https://minglex.vercel.app
PORT=5000
FRONTEND_URL=https://minglex.vercel.app
NODE_ENV=production
```

**Where to get these values?**
- Copy from your local `server/.env` file
- Run: `type server\.env` to view them

### ☐ 5. Generate Railway Domain
- Settings → **Domains**
- Click **Generate Domain**
- Copy the URL (e.g., `https://minglex-backend.up.railway.app`)

### ☐ 6. Update Frontend .env.production
Edit `client/.env.production`:

```env
VITE_API_URL=https://your-railway-url.up.railway.app
VITE_SOCKET_URL=https://your-railway-url.up.railway.app
```

Replace with your actual Railway URL (no trailing slash!)

### ☐ 7. Commit and Push Frontend
```bash
cd client
git add .env.production
git commit -m "Switch to Railway backend"
git push
```

### ☐ 8. Wait for Deployments
- Railway: ~2-3 minutes
- Vercel: ~2-3 minutes

### ☐ 9. Test Your App
- Open https://minglex.vercel.app
- Sign up / Login
- Check console - Socket.IO should connect!
- Test real-time chat

---

## 🔍 How to Know It's Working

### ✅ Success Indicators:
- Railway deployment shows green checkmark
- Vercel deployment shows green checkmark
- Console shows: `Socket.IO connected`
- No 404 errors for `/socket.io/`
- Real-time features work (online status, typing indicators)

### ❌ Common Issues:

| Issue | Solution |
|-------|----------|
| Railway build fails | Check `package.json` has `"start": "node index.js"` |
| MongoDB timeout | Verify `MONGODB_URI` in Railway variables |
| CORS error | Update `CORS_ALLOWED_ORIGINS` to include Vercel URL |
| Socket.IO 404 | Make sure frontend `.env.production` has Railway URL |
| Frontend still uses Vercel backend | Redeploy frontend after updating `.env.production` |

---

## 🎯 Environment Variables Quick Copy

**From your local `server/.env`, copy these to Railway:**

1. `MONGODB_URI` - Your MongoDB connection string
2. `JWT_ACCESS_TOKEN_SECRET` - Random secret (32+ chars)
3. `JWT_REFRESH_TOKEN_SECRET` - Different random secret
4. `SMTP_USER` - Your Gmail address
5. `SMTP_PASS` - Gmail app password (not regular password!)
6. `CORS_ALLOWED_ORIGINS` - `https://minglex.vercel.app`

**To view your local .env:**
```bash
cd server
type .env
```

---

## 📊 Final Architecture

```
Frontend (Vercel)          Backend (Railway)         Database
─────────────────          ─────────────────         ────────
minglex.vercel.app  ────▶  railway.app       ────▶  MongoDB Atlas
   React App                Express + Socket.IO       User Data
   Static Files             WebSockets                Messages
```

---

## ⚡ Quick Commands

```bash
# View local environment variables
cd c:/Users/venkatarahul/Documents/newappchat/server
type .env

# Update and deploy frontend
cd c:/Users/venkatarahul/Documents/newappchat/client
# (edit .env.production with Railway URL)
git add .env.production
git commit -m "Update to Railway backend"
git push
```

---

## 🎉 After Deployment

Your app will have:
- ✅ Real-time chat
- ✅ Online status
- ✅ Typing indicators
- ✅ Friend requests notifications
- ✅ File uploads
- ✅ Voice messages
- ✅ All features working!

---

## 🆘 Need Help?

**Railway Dashboard:** https://railway.app/dashboard
**Railway Docs:** https://docs.railway.app
**Railway Discord:** https://discord.gg/railway

**Check Railway Logs:**
1. Click on your service
2. Click **Deployments**
3. Click latest deployment
4. View logs for errors

---

## ✨ Pro Tips

1. **Railway free tier** gives you 500 hours/month (enough for 24/7)
2. **Custom domain** - You can add your own domain in Railway
3. **Auto-deploy** - Railway auto-deploys when you push to GitHub
4. **Logs** - Always check logs if something doesn't work

---

**Ready to deploy?** Go to https://railway.app 🚂
