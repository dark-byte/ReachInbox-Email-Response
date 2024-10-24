import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { emailRoutes } from './routes';
import session from 'express-session';
import { googleLogin, googleCallback } from './services/googleAuthService';
import cors from 'cors';
import IORedis from 'ioredis';
import connectRedis from 'connect-redis'; // Import connect-redis
import { refreshAccessToken } from './middleware/tokenRefresh';

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000', // Adjust as needed
    credentials: true,
}));

// Initialize Redis client for session store
const redisClient = new IORedis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Initialize RedisStore using the connectRedis function
const RedisStore = connectRedis(session);

// Configure session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }), // Use 'new' with RedisStore
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
}));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Google OAuth Routes
app.get('/auth/google', googleLogin);
app.get('/auth/google/callback', googleCallback);

// Authentication Middleware
function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.session && req.session.token && req.session.refreshToken) {
        refreshAccessToken(req, res, next);
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Protect API Routes
app.use('/api', isAuthenticated, emailRoutes);

// Initialize BullMQ Connection
const connection = new IORedis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null, // Added this line to fix the BullMQ error
});

// Import and initialize the worker
import './workers/emailWorker';

// Global Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Initiate the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
