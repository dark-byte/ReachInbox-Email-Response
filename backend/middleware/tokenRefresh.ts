import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { redisConnection } from '../redis/connection';

dotenv.config();

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
);

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.token && req.session.refreshToken) {
        oauth2Client.setCredentials({
            access_token: req.session.token,
            refresh_token: req.session.refreshToken,
        });

        try {
            const newTokens = await oauth2Client.getAccessToken();
            req.session.token = newTokens.token || req.session.token;

            // Update tokens in Redis
            const sessionId = req.sessionID;
            await redisConnection.set(`tokens:${sessionId}`, JSON.stringify({
                access_token: newTokens.token || req.session.token,
                refresh_token: req.session.refreshToken,
            }));

            next();
        } catch (error) {
            console.error('Error refreshing access token:', error);
            res.status(401).json({ error: 'Unauthorized' });
        }
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
