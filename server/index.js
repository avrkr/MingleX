require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const socketHandler = require('./socket');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const friendRoutes = require('./routes/friends');
const uploadRoutes = require('./routes/upload');

// CORS middleware (must be first)
const corsMiddleware = require('./middleware/corsMiddleware');

const app = express();
const server = http.createServer(app);

// ---------- Middleware ----------
app.use(corsMiddleware);                     // CORS must be first
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(cookieParser());


// ---------- Database ----------
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/upload', uploadRoutes);

// Simple health endpoint
app.get('/', (req, res) => {
    res.send('Chat API is running');
});

// ---------- Serve static React build (client-side routing fallback) ----------
// Place after API routes so `/api/*` routes are not overridden.
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
// Fallback for SPA client-side routing. Serve index.html for non-API GET requests only.
app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    // Don't intercept API or socket routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket') || req.path.startsWith('/_next')) return next();
    // If the request accepts HTML, serve the SPA entrypoint
    if (req.accepts && req.accepts('html')) {
        return res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    }
    next();
});
// ---------- Socket.io ----------
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ALLOWED_ORIGINS
            ? process.env.CORS_ALLOWED_ORIGINS.split(',')
            : 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.set('io', io);
socketHandler(io);

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
