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
      transactions: {
        Row: {
          id: string
          user_id: string
          date: string
          amount: number
          description: string
          category: string | null
          sub_category: string | null
          source: string
          notes: string | null
          type: 'income' | 'expense'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          date: string
          amount: number
          description: string
          category?: string | null
          sub_category?: string | null
          source: string
          notes?: string | null
          type: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount?: number
          description?: string
          category?: string | null
          sub_category?: string | null
          source?: string
          notes?: string | null
          type?: 'income' | 'expense'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          sub_categories: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          sub_categories?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sub_categories?: string[]
          created_at?: string
        }
      }
      sources: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
    }
  }
}