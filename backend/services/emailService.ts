import { google } from 'googleapis';

export const fetchUnreadEmails = async (auth: string) => {
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
            });
            return email.data;
        })
    );

    return emails;
};
