import { Request, Response } from 'express';
import { fetchUnreadEmails } from '../services/emailService';
import { classifyEmail, generateResponse } from '../services/openAiService';

export const classifyEmails = async (req: Request, res: Response) => {
    const token = req.session.token;
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No access token' });
    }

    console.log('Session Token:', token); // Debugging line
    const emails = await fetchUnreadEmails(token);
    console.log('Fetched Emails:', emails); // Debugging line
    const classifiedEmails = await Promise.all(
        emails.map(async (email) => {
            const snippet = email.snippet || '';
            const classification = await classifyEmail(snippet);
            const responseEmail = await generateResponse(classification, snippet);

            return {
                id: email.id,
                classification,
                snippet,
                responseEmail,
            };
        })
    );

    // Here you can also send the email response via Gmail API (not included for brevity)

    res.json(classifiedEmails);
};
