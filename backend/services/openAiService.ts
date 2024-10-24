import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const classifyEmail = async (emailText: string): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Updated model
        messages: [
            {
                role: 'system',
                content: 'You are an assistant that categorizes emails into one of three categories: Interested, Not Interested, More Details.',
            },
            {
                role: 'user',
                content: `Classify this email: "${emailText}"`,
            },
        ],
        max_tokens: 50,
    });

    return response.choices[0].message?.content?.trim() || 'Unclassified';
};

export const generateResponse = async (classification: string, emailText: string, senderName: string): Promise<string> => {
    const disclaimer = "\n\n--\nThis reply was generated using AI.";
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Updated model
        messages: [
            {
                role: 'system',
                content: 'You are an assistant that generates brief and professional email responses based on classification.',
            },
            {
                role: 'user',
                content: `
                Based on the following classification: "${classification}", generate a brief and professional response email.

                Email context: "${emailText}"

                Replace any placeholders like [sender's name] with the actual sender's name: "${senderName}".
                Don't use any salutations or signatures. Simple regards or best regards is fine.

                The response should:
                - For "Interested": Ask to schedule a demo call and suggest some times.
                - For "Not Interested": Thank them and politely close off communication.
                - For "More Details": Ask for more clarification or details about their request.

                Provide a well-structured response and append the following disclaimer:
                "${disclaimer}"
                `,
            },
        ],
        max_tokens: 100,
    });

    return response.choices[0].message?.content?.trim() || 'No response generated.';
};
