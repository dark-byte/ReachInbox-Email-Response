import { Router } from 'express';
import { classifyEmails } from './controllers/emailController';

// Extend the SessionData interface
declare module 'express-session' {
    interface SessionData {
        token?: string;
    }
}

const router = Router();

router.get('/check-auth', (req, res) => {
    res.json({ isAuthenticated: !!req.session.token });
});

router.get('/classify-emails', async (req, res, next) => {
    try {
        await classifyEmails(req, res);
    } catch (error) {
        next(error);
    }
});

export const emailRoutes = router;
