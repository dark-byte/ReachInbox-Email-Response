import { Job } from 'bullmq';
import { fetchUnreadEmails, sendEmailResponse } from '../services/emailService';
import { classifyEmail, generateResponse } from '../services/openAiService';
import { addLog } from '../controllers/emailController';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

export const processEmail = async (job: Job) => {
    const { token, refreshToken } = job.data;
    console.log('Processing Job:', job.id, { token, refreshToken }); // Debug log

    if (!token || !refreshToken) {
        throw new Error('No access token or refresh token provided');
    }

    // Initialize OAuth2Client with credentials
    const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials including refresh token
    oauth2Client.setCredentials({
        access_token: token,
        refresh_token: refreshToken,
    });

    try {
        // Automatically refresh the access token if needed
        const { token: refreshedToken } = await oauth2Client.getAccessToken();
        if (refreshedToken) {
            // Optionally, update the session with the new access token
            // This requires additional implementation if you wish to persist it
            console.log('Access token refreshed');
        }
    } catch (error) {
        throw new Error('Failed to refresh access token');
    }

    // Fetch unread emails using the authenticated client
    const emails = await fetchUnreadEmails(oauth2Client);

    for (const email of emails) {
        const emailId = email.id!;
        const snippet = email.snippet || '';

        // Parse the full email content
        const parts = email.payload?.parts;
        let emailText = '';

        if (parts) {
            for (const part of parts) {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    emailText += Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
                // Handle 'text/html' if necessary
            }
        } else if (email.payload?.body?.data) {
            emailText = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
        }

        if (!emailText) {
            emailText = 'No content available.';
        }

        // Classify the email
        const classification = await classifyEmail(emailText);

        // Generate response based on classification
        const responseEmail = await generateResponse(classification, emailText);

        // Send the response email
        await sendEmailResponse(oauth2Client, emailId, responseEmail);

        // Add log entry
        addLog({
            emailId,
            classification,
            snippet,
            responseEmail,
        });
    }
};
