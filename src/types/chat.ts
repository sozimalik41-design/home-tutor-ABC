export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  thinking?: string;
  suggestedActions?: {
    label: string;
    href: string;
    external?: boolean;
    tutorId?: string;
  }[];
}

export interface ChatRequestPayload {
  message: string;
  history?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export interface ChatResponsePayload {
  reply: string;
  thinking?: string;
  suggestedActions?: {
    label: string;
    href: string;
    external?: boolean;
    tutorId?: string;
  }[];
  modelUsed?: string;
  error?: string;
}
