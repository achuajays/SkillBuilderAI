import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser & {
  name?: string;
};

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}