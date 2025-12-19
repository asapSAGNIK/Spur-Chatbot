export interface Message {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    text: string;
    created_at: string;
}

export interface Conversation {
    id: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, unknown>;
}

export interface ChatRequest {
    message: string;
    sessionId?: string;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
}

export interface ErrorResponse {
    error: string;
    code: string;
}
