# 🚀 Quick Deployment Reference

## Environment Variables

### Local Development
```env
# client/.env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Production
```env
# client/.env.production
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-backend.vercel.app
```

---

## Deployment Order

### 1️⃣ Backend First
```bash
cd server
# Push to GitHub
# Deploy on Vercel/Railway
# Copy backend URL: https://your-backend.vercel.app
```

### 2️⃣ Update Frontend Config
```bash
cd client
# Edit .env.production with backend URL
```

### 3️⃣ Frontend Second
```bash
# Push to GitHub
# Deploy on Vercel
# Copy frontend URL: https://your-frontend.vercel.app
```

### 4️⃣ Update Backend CORS
```bash
# In Vercel backend project:
# Settings → Environment Variables
# Update CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
# Redeploy
```

---

## Toast Notifications

```javascript
import toast from 'react-hot-toast';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong!');

// Custom duration
toast.success('Saved!', { duration: 5000 });
```

---

## Vercel Environment Variables (Backend)

```
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_TOKEN_SECRET=your_secret
JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=5000
```

---

## Vercel Environment Variables (Frontend)

```
VITE_API_URL=https://your-backend.vercel.app
VITE_SOCKET_URL=https://your-backend.vercel.app
```

---

## ⚠️ Important

- Deploy **BACKEND FIRST**
- Never commit `.env` files
- Update CORS after frontend deployment
- Consider Railway for backend (better WebSocket support)

---

## 📚 Full Guides

- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Environment & Toast**: See `ENV_AND_TOAST_SUMMARY.md`
- **Features**: See `REALTIME_MEDIA_FEATURES.md`
