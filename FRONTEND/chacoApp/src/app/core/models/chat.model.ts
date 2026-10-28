export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  contextHito?: string;
  isError?: boolean;
}

export interface ChatRequest {
  message: string;
  codigo_linea_tiempo?: string;
}

export interface ChatResponse {
  reply: string;
  source?: string;
  hito_relacionado?: string;
}
