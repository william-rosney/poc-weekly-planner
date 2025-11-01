/**
 * Types TypeScript globaux pour l'application
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "admin" | "member";
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  user_id: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  event_id: string;
  user_id: string;
  status: "yes" | "no" | "maybe";
  created_at: string;
  updated_at: string;
}
