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
      songs: {
        Row: {
          id: string
          user_id: string
          title: string
          lyrics: string | null
          mp3_url: string | null
          video_url: string | null
          cover_art_url: string | null
          status: string
          album_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          lyrics?: string | null
          mp3_url?: string | null
          video_url?: string | null
          cover_art_url?: string | null
          status?: string
          album_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          lyrics?: string | null
          mp3_url?: string | null
          video_url?: string | null
          cover_art_url?: string | null
          status?: string
          album_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_album_id_fkey"
            columns: ["album_id"]
            referencedRelation: "albums"
            referencedColumns: ["id"]
          }
        ]
      }
      albums: {
        Row: {
          id: string
          user_id: string
          title: string
          cover_art_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          cover_art_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          cover_art_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      album_songs: {
        Row: {
          id: string
          album_id: string
          song_id: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          song_id: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          song_id?: string
          position?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_songs_album_id_fkey"
            columns: ["album_id"]
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_songs_song_id_fkey"
            columns: ["song_id"]
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}