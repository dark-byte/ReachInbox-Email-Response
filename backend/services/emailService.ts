import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

export const fetchUnreadEmails = async (auth: OAuth2Client): Promise<gmail_v1.Schema$Message[]> => {
    const gmailClient = google.gmail({ version: 'v1', auth });
    const res = await gmailClient.users.messages.list({
        userId: 'me',
        q: 'is:unread',
    });

    const messages = res.data.messages || [];
    const emails = await Promise.all(
        messages.map(async message => {
            const email = await gmailClient.users.messages.get({
                userId: 'me',
                id: message.id!,
                format: 'full',
            });
            return email.data;
        })
    );

    return emails;
};

export const sendEmailResponse = async (auth: OAuth2Client, messageId: string, responseText: string) => {
    const gmailClient = google.gmail({ version: 'v1', auth });

    // Get the original email to find the sender
    const message = await gmailClient.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
    });
    const headers = message.data.payload?.headers;
    const fromHeader = headers?.find(header => header.name === 'From');
    const to = fromHeader?.value;

    if (!to) {
        throw new Error('Unable to find the sender\'s email address');
    }

    const raw = Buffer.from(
        `From: me
To: ${to}
Subject: Re: ${extractSubject(headers)}
Content-Type: text/plain; charset="UTF-8"

${responseText}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmailClient.users.messages.send({
        userId: 'me',
        requestBody: {
            raw,
        },
    });

    // Optionally mark the original email as read
    await gmailClient.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
            removeLabelIds: ['UNREAD'],
        },
    });
};

// Helper function to extract subject
const extractSubject = (headers: any[] | undefined): string => {
    const subjectHeader = headers?.find(header => header.name === 'Subject');
    return subjectHeader ? subjectHeader.value : 'No Subject';
};
