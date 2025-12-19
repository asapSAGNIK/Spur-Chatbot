import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.warn('⚠️  GROQ_API_KEY not set. LLM features will not work.');
}

// Groq uses the OpenAI SDK but with a different base URL
export const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
}) : null;

export default openai;
