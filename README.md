# Chat + Video App

A production-ready full-stack Chat + Video Chat application.

## Features
- Real-time messaging (Socket.IO)
- Video calls (WebRTC)
- Authentication (JWT + Refresh Token)
- Group chats
- File uploads

## Setup

### Prerequisites
- Node.js
- MongoDB
- Gmail Account (for SMTP)

### Environment Variables
Create a `.env` file in `server/` and `client/` (if needed).

**Server .env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_ACCESS_TOKEN_SECRET=secret
JWT_REFRESH_TOKEN_SECRET=refreshsecret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app_password
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Installation

1. **Client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. **Server:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

## Deployment
This project is configured for Vercel.
1. Push to GitHub.
2. Import project in Vercel.
3. Set Environment Variables in Vercel Dashboard.
4. Deploy.

**Note:** For persistent Socket.IO connections, it is recommended to deploy the `server` separately on Render/Railway/Heroku, as Vercel Serverless functions have execution time limits and don't support sticky sessions well.
