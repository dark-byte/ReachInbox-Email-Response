import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { redisConnection } from '../redis/connection'; // Import Redis connection
import { enableAutoReply } from '../controllers/emailController'; // Import enableAutoReply

dotenv.config();

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Extend the session interface
declare module 'express-session' {
    interface SessionData {
        token?: string | undefined;
        refreshToken?: string | undefined;
    }
}

// Redirect user to Google's OAuth 2.0 server
export const googleLogin = (req: Request, res: Response) => {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify'];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Request refresh token
        prompt: 'consent',      // Force consent screen
        scope: scopes,
    });

    res.redirect(url);
};

// Handle OAuth2 callback
export const googleCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Save tokens in session
        if (req.session) {
            req.session.token = tokens.access_token ?? undefined;
            if (tokens.refresh_token) {
                req.session.refreshToken = tokens.refresh_token;
            }
            console.log('Session saved:', req.session);
        }

        // Store tokens in Redis with a unique key (e.g., session ID)
        const sessionId = req.sessionID;
        await redisConnection.set(`tokens:${sessionId}`, JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        }));

        // Automatically enable auto-reply after login
        await enableAutoReply(req, res, () => {});

        res.redirect('/'); // Redirect to frontend
    } catch (error) {
        console.error('Error retrieving tokens:', error);
        res.status(500).send('Authentication failed');
    }
};
