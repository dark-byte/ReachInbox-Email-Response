import OpenAI from 'openai';
// Ensure dotenv is imported and configured if not already
import dotenv from 'dotenv';
dotenv.config();


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const classifyEmail = async (emailText: string): Promise<string> => {
    const response = await openai.completions.create({
        model: 'text-davinci-003',
        prompt: `Classify this email into one of three categories: Interested, Not Interested, More Details. Email: ${emailText}`,
        max_tokens: 50,
    });

    return response.choices[0].text.trim();
};

export const generateResponse = async (classification: string, emailText: string): Promise<string> => {
    const prompt = `
    Based on the following classification: "${classification}", generate a professional response email.

    Email context: "${emailText}"

    The response should:
    - For "Interested": Ask to schedule a demo call and suggest some times.
    - For "Not Interested": Thank them and politely close off communication.
    - For "More Details": Ask for more clarification or details about their request.

    Provide a well-structured response.
    `;

    const response = await openai.completions.create({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 150,
    });

    return response.choices[0].text.trim();
};
