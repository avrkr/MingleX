// CORS middleware for Vercel serverless functions
module.exports = (req, res, next) => {
    // Get allowed origins from environment variable
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
        ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:5173', 'https://minglex.vercel.app'];

    const origin = req.headers.origin;

    // Check if origin is allowed
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (allowedOrigins.length > 0) {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '600');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
};
