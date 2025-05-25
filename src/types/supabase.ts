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
      vehicles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          make: string
          model: string
          year: number
          daily_rate: number
          category: string
          description: string
          image_url: string
          available: boolean
          owner_id: string
          location: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          make: string
          model: string
          year: number
          daily_rate: number
          category: string
          description: string
          image_url: string
          available?: boolean
          owner_id: string
          location: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          make?: string
          model?: string
          year?: number
          daily_rate?: number
          category?: string
          description?: string
          image_url?: string
          available?: boolean
          owner_id?: string
          location?: string
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          vehicle_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status: string
          pickup_address: string
          dropoff_address: string
          payment_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          vehicle_id: string
          user_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: string
          pickup_address: string
          dropoff_address: string
          payment_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          vehicle_id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: string
          pickup_address?: string
          dropoff_address?: string
          payment_id?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          booking_id: string
          amount: number
          status: string
          payment_method: string
          transaction_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id: string
          amount: number
          status?: string
          payment_method: string
          transaction_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          booking_id?: string
          amount?: number
          status?: string
          payment_method?: string
          transaction_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          email: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          email?: string
        }
      }
    }
  }
}