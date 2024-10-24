import express from 'express';
import dotenv from 'dotenv';
import { emailRoutes } from './routes';
import session from 'express-session';

dotenv.config();
const app = express();
app.use(express.json());

app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: true }));

// Google OAuth Routes
app.use('/auth/google', require('./services/googleAuthService'));

// Email Classification Routes
app.use('/api', emailRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
