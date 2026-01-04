export interface Paste {
  id: string;
  content: string;
  created_at: number;
  expires_at?: number | null;
  max_views?: number | null;
  views_count: number;
}
