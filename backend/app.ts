import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { emailRoutes } from './routes';
import session from 'express-session';
import { googleLogin, googleCallback } from './services/googleAuthService'; // Import specific functions

dotenv.config();
const app = express();
app.use(express.json());

app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Google OAuth Routes
app.get('/auth/google', googleLogin);
app.get('/auth/google/callback', googleCallback);

// Email Classification Routes
app.use('/api', emailRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
