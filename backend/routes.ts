import { Router } from 'express';
import { enqueueEmailJob, getLogs } from './controllers/emailController';

// Extend the SessionData interface
declare module 'express-session' {
    interface SessionData {
        token?: string;
        refreshToken?: string;
    }
}

const router = Router();

// Check authentication status
router.get('/check-auth', (req, res) => {
    res.json({ isAuthenticated: !!req.session.token });
});

// Enqueue email classification job
router.get('/classify-emails', async (req, res, next) => {
    try {
        await enqueueEmailJob({
            token: req.session.token,
            refreshToken: req.session.refreshToken
        });
        res.json({ message: 'Email classification job enqueued' });
    } catch (error) {
        next(error);
    }
});

// Fetch logs
router.get('/logs', async (req, res, next) => {
    try {
        const logs = await getLogs();
        res.json(logs);
    } catch (error) {
        next(error);
    }
});

export const emailRoutes = router;
