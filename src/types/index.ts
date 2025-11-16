// Core TypeScript type definitions

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface KnowledgeBase {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  knowledge_base_id: string;
  file_name: string;
  file_size: number;
  page_count: number;
  gemini_file_id: string;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  uploaded_at: string;
}

export interface ChatSession {
  id: string;
  knowledge_base_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}
