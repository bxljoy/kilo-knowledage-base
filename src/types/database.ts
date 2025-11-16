/**
 * Database TypeScript Types
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      knowledge_bases: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          gemini_store_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          gemini_store_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          gemini_store_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          knowledge_base_id: string
          file_name: string
          file_size: number
          page_count: number | null
          gemini_file_id: string
          status: 'uploading' | 'processing' | 'ready' | 'failed'
          error_message: string | null
          uploaded_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          knowledge_base_id: string
          file_name: string
          file_size: number
          page_count?: number | null
          gemini_file_id: string
          status?: 'uploading' | 'processing' | 'ready' | 'failed'
          error_message?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          knowledge_base_id?: string
          file_name?: string
          file_size?: number
          page_count?: number | null
          gemini_file_id?: string
          status?: 'uploading' | 'processing' | 'ready' | 'failed'
          error_message?: string | null
          uploaded_at?: string
          processed_at?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          knowledge_base_id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          knowledge_base_id: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          knowledge_base_id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          rating?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      user_usage_stats: {
        Row: {
          user_id: string
          email: string
          knowledge_base_count: number
          total_files: number
          total_storage_bytes: number
          total_chat_sessions: number
          total_messages: number
          messages_today: number
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
