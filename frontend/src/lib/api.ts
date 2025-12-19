const API_BASE_URL = 'http://localhost:3001';

export interface Message {
    id: string;
    conversation_id: string;
    sender: 'user' | 'ai';
    text: string;
    created_at: string;
}

export interface ChatResponse {
    reply: string;
    sessionId: string;
    wasTruncated?: boolean;
}

export interface HistoryResponse {
    sessionId: string;
    messages: Message[];
}

export interface ApiError {
    error: string;
    code: string;
}

/**
 * Sends a message to the chat API
 */
export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', code: 'UNKNOWN' }));
        throw new Error(errorData.error || 'Failed to send message');
    }

    return response.json();
}

/**
 * Fetches conversation history
 */
export async function getHistory(sessionId: string): Promise<HistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Conversation not found');
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch history');
    }

    return response.json();
}

/**
 * Health check for the API
 */
export async function healthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
