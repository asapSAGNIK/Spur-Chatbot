import { supabase } from '../config/supabase';
import { Conversation, Message } from '../types';
import { randomUUID } from 'crypto';

export class ConversationService {
    /**
     * Creates a new conversation session
     */
    async createConversation(): Promise<Conversation> {
        const id = randomUUID();
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                id,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating conversation:', error);
            throw new Error('Failed to create conversation');
        }

        return data;
    }

    /**
     * Gets a conversation by ID
     */
    async getConversation(id: string): Promise<Conversation | null> {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            console.error('Error fetching conversation:', error);
            throw new Error('Failed to fetch conversation');
        }

        return data;
    }

    /**
     * Updates the conversation's updated_at timestamp
     */
    async touchConversation(id: string): Promise<void> {
        const { error } = await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Error updating conversation:', error);
        }
    }

    /**
     * Adds a message to a conversation
     */
    async addMessage(
        conversationId: string,
        sender: 'user' | 'ai',
        text: string
    ): Promise<Message> {
        const id = randomUUID();

        const { data, error } = await supabase
            .from('messages')
            .insert({
                id,
                conversation_id: conversationId,
                sender,
                text,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding message:', error);
            throw new Error('Failed to save message');
        }

        // Update conversation timestamp
        await this.touchConversation(conversationId);

        return data;
    }

    /**
     * Gets all messages for a conversation, ordered by timestamp
     */
    async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            throw new Error('Failed to fetch messages');
        }

        return data || [];
    }

    /**
     * Gets or creates a conversation by session ID
     */
    async getOrCreateConversation(sessionId?: string): Promise<Conversation> {
        if (sessionId) {
            const existing = await this.getConversation(sessionId);
            if (existing) {
                return existing;
            }
        }

        return this.createConversation();
    }
}

export const conversationService = new ConversationService();
