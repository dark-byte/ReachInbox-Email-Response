import { Job } from 'bullmq';
import { fetchUnreadEmails, sendEmailResponse } from '../services/emailService';
import { classifyEmail, generateResponse } from '../services/openAiService';
import { addLog } from '../controllers/emailController';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Modify to accept tokens from job data
export const processEmail = async (job: Job) => {
    const { access_token, refresh_token } = job.data;
    console.log('Processing Job:', job.id); // Debug log

    if (!access_token || !refresh_token) {
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
        access_token,
        refresh_token,
    });

    try {
        // Automatically refresh the access token if needed
        const { token: refreshedToken } = await oauth2Client.getAccessToken();
        if (refreshedToken) {
            console.log('Access token refreshed');
            // Update tokens in Redis if necessary
            // This implementation uses session-based tokens stored in Redis
            // Additional logic can be added here to update the tokens in Redis
        }
    } catch (error) {
        throw new Error('Failed to refresh access token');
    }

    // Fetch unread emails in the Primary category
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

        // Extract sender's name
        const headers = email.payload?.headers;
        const fromHeader = headers?.find(header => header.name === 'From');
        const senderNameMatch = fromHeader?.value?.match(/"?(.*?)"?\s*</);
        const senderName = senderNameMatch ? senderNameMatch[1] : 'there';

        // Classify the email
        const classification = await classifyEmail(emailText);

        // Generate response based on classification
        const responseEmail = await generateResponse(classification, emailText, senderName);

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
