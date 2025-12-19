import { Router, Request, Response, NextFunction } from 'express';
import { conversationService } from '../services/conversationService';
import { llmService } from '../services/llmService';
import { ChatRequest, ChatResponse } from '../types';
import { createError } from '../middleware/errorHandler';

export const chatRouter = Router();

// Maximum message length (characters)
const MAX_MESSAGE_LENGTH = 2000;

/**
 * POST /chat/message
 * Accepts a user message, generates AI response, and persists both
 */
chatRouter.post('/message', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { message, sessionId } = req.body as ChatRequest;

        // Validate message
        if (!message || typeof message !== 'string') {
            throw createError('Message is required and must be a string', 400, 'INVALID_MESSAGE');
        }

        const trimmedMessage = message.trim();

        if (trimmedMessage.length === 0) {
            throw createError('Message cannot be empty', 400, 'EMPTY_MESSAGE');
        }

        // Truncate very long messages
        let finalMessage = trimmedMessage;
        let wasTruncated = false;
        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            finalMessage = trimmedMessage.substring(0, MAX_MESSAGE_LENGTH);
            wasTruncated = true;
            console.warn(`Message truncated from ${trimmedMessage.length} to ${MAX_MESSAGE_LENGTH} characters`);
        }

        // Get or create conversation
        const conversation = await conversationService.getOrCreateConversation(sessionId);

        // Save user message
        await conversationService.addMessage(conversation.id, 'user', finalMessage);

        // Get conversation history for context
        const history = await conversationService.getMessages(conversation.id);

        // Generate AI reply
        let reply: string;
        try {
            reply = await llmService.generateReply(history, finalMessage);
        } catch (llmError) {
            // If LLM fails, provide a fallback response
            console.error('LLM Error:', llmError);
            reply = llmError instanceof Error
                ? llmError.message
                : "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
        }

        // Save AI response
        await conversationService.addMessage(conversation.id, 'ai', reply);

        // Build response
        const response: ChatResponse & { wasTruncated?: boolean } = {
            reply,
            sessionId: conversation.id
        };

        if (wasTruncated) {
            response.wasTruncated = true;
        }

        res.json(response);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /chat/history/:sessionId
 * Retrieves conversation history for a session
 */
chatRouter.get('/history/:sessionId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            throw createError('Session ID is required', 400, 'MISSING_SESSION_ID');
        }

        // Check if conversation exists
        const conversation = await conversationService.getConversation(sessionId);

        if (!conversation) {
            throw createError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }

        // Get messages
        const messages = await conversationService.getMessages(sessionId);

        res.json({
            sessionId,
            messages
        });
    } catch (error) {
        next(error);
    }
});
