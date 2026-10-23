import { ChatMessage, ChatRequestPayload, ChatResponsePayload } from '../types/chat';

const CHAT_STORAGE_KEY = 'home_tutor_chat_history_v1';

export const chatService = {
  /**
   * Send a chat message to the server-side /api/chat endpoint
   */
  async sendMessage(
    message: string, 
    history: ChatMessage[]
  ): Promise<ChatResponsePayload> {
    // Format previous turns for context
    const formattedHistory = history
      .filter(m => m.status !== 'error')
      .slice(-6)
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

    const payload: ChatRequestPayload = {
      message: message.trim(),
      history: formattedHistory
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Aapne thori der mein bohot zyada messages bheje hain. Baraye meherbani 1 minute intezar karein (Rate Limit).');
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server error (${response.status})`);
    }

    const data: ChatResponsePayload = await response.json();
    return data;
  },

  /**
   * Load chat history from localStorage
   */
  loadStoredMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history from localStorage', e);
    }
    return [];
  },

  /**
   * Save chat history to localStorage
   */
  saveStoredMessages(messages: ChatMessage[]): void {
    try {
      // Save last 20 messages
      const toSave = messages.slice(-20);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save chat history to localStorage', e);
    }
  },

  /**
   * Clear chat history
   */
  clearStoredMessages(): void {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear chat history', e);
    }
  }
};
