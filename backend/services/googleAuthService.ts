import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import session from 'express-session';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Extend the session interface
declare module 'express-session' {
    interface SessionData {
        token?: string,
        refreshToken: string;
    }
}

export const googleLogin = (req: Request, res: Response) => {
    const url = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
    const { tokens } = await client.getToken(req.query.code as string);
    req.session.token = tokens.access_token ?? '';
    req.session.refreshToken = tokens.refresh_token ?? ''; // Store refresh token if available
    client.setCredentials(tokens); // Set the credentials for the client

    // Log tokens for debugging
    console.log('Access Token:', req.session.token);
    console.log('Refresh Token:', req.session.refreshToken);

    res.redirect('/');
};
