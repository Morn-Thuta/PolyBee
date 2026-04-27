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
      modules: {
        Row: {
          id: string
          user_id: string
          code: string
          name: string
          colour: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          name: string
          colour?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code?: string
          name?: string
          colour?: string
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          module_id: string
          title: string
          content: string
          style: 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'
          source_file_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          title: string
          content: string
          style: 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'
          source_file_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          title?: string
          content?: string
          style?: 'notion-friendly' | 'deep-dive' | 'quick-summary' | 'custom'
          source_file_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          module_id: string
          title: string
          description: string | null
          event_date: string
          event_type: 'ca' | 'submission' | 'quiz' | 'exam' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          title: string
          description?: string | null
          event_date: string
          event_type: 'ca' | 'submission' | 'quiz' | 'exam' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          title?: string
          description?: string | null
          event_date?: string
          event_type?: 'ca' | 'submission' | 'quiz' | 'exam' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      module_files: {
        Row: {
          id: string
          user_id: string
          module_id: string | null
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id?: string | null
          filename: string
          storage_path: string
          mime_type: string
          size_bytes: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string | null
          filename?: string
          storage_path?: string
          mime_type?: string
          size_bytes?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Module = Database['public']['Tables']['modules']['Row']
export type StudyNote = Database['public']['Tables']['notes']['Row']
export type ModuleFile = Database['public']['Tables']['module_files']['Row']

export type NoteStyle = StudyNote['style']
