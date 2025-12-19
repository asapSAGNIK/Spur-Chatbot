import { openai } from '../config/openai';
import { Message } from '../types';

// Fictional store knowledge for the AI agent
const STORE_KNOWLEDGE = `
Store Name: ShopEase - Your Friendly E-Commerce Store

=== SHIPPING POLICY ===
- FREE shipping on all orders over $50
- Standard delivery: 5-7 business days
- Express delivery: 2-3 business days ($9.99)
- We ship to all 50 US states
- International shipping available to Canada, UK, and Australia

=== RETURN & REFUND POLICY ===
- 30-day return policy on all items
- Items must be unused and in original packaging
- Free returns on defective items
- Refunds processed within 5-7 business days
- Store credit option available for faster processing

=== SUPPORT HOURS ===
- Monday to Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed
- Email: support@shopease.com
- Response time: Within 24 hours

=== PAYMENT OPTIONS ===
- Credit/Debit Cards (Visa, Mastercard, Amex)
- PayPal
- Apple Pay / Google Pay
- Klarna (Buy now, pay later)

=== POPULAR CATEGORIES ===
- Electronics & Gadgets
- Home & Kitchen
- Fashion & Accessories
- Health & Beauty
`;

const SYSTEM_PROMPT = `You are a friendly and helpful customer support agent for ShopEase, a small e-commerce store.

Your personality:
- Warm and professional
- Concise but thorough
- Always willing to help
- Empathetic to customer concerns

Guidelines:
1. Keep responses concise (2-4 sentences when possible)
2. Be helpful, friendly, and professional
3. Use the store knowledge provided to answer questions accurately
4. If you don't know something, be honest and offer to connect with a human agent
5. Never make up policies or information not in your knowledge base
6. For complex issues, suggest emailing support@shopease.com
7. CRITICAL: If the user asks about anything unrelated to the store (e.g., weather, general knowledge, coding), reply with EXACTLY ONE polite sentence stating you can only assist with ShopEase matters, then immediately ask a relevant shopping question. Do NOT explain why you can't answer.

${STORE_KNOWLEDGE}

Remember: You're here to help customers have a great shopping experience!`;

export class LLMService {
    // Using Llama 3 70B for high quality and speed
    private readonly model = 'llama-3.3-70b-versatile';

    /**
     * Generates a reply using Groq based on conversation history
     */
    async generateReply(
        conversationHistory: Message[],
        userMessage: string
    ): Promise<string> {
        if (!openai) {
            throw new Error('Groq API is not configured. Please set GROQ_API_KEY.');
        }

        try {
            // Build conversation history for OpenAI format
            const historyForLlm = conversationHistory.slice(-10).map(msg => ({
                role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
                content: msg.text
            }));

            // Create completion
            const Completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...historyForLlm,
                    { role: 'user', content: userMessage }
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 500,
            });

            const reply = Completion.choices[0]?.message?.content;

            if (!reply) {
                throw new Error('No response generated from LLM');
            }

            return reply.trim();
        } catch (error: unknown) {
            console.error('LLM Error:', error);

            // Handle specific errors
            if (error instanceof Error) {
                if (error.message.includes('401')) {
                    throw new Error("There's a configuration issue on our end. Please contact support.");
                }
                if (error.message.includes('429')) {
                    throw new Error("I'm experiencing high demand right now. Please wait a moment and try again.");
                }
            }

            throw new Error("I'm sorry, something went wrong. Please try again.");
        }
    }
}

export const llmService = new LLMService();
