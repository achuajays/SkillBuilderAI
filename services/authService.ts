import { supabase } from './supabaseClient';
import { LoginCredentials, SignupCredentials, User } from '../types/auth';

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return {
    ...user,
    name: user.user_metadata?.name
  } as User;
};

// Login function
export const login = async (credentials: LoginCredentials): Promise<User> => {
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) throw error;
  if (!user) throw new Error('No user returned');

  return {
    ...user,
    name: user.user_metadata?.name
  } as User;
};

// Signup function
export const signup = async (credentials: SignupCredentials): Promise<User> => {
  const { data: { user }, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
      }
    }
  });

  if (error) throw error;
  if (!user) throw new Error('No user returned');

  return {
    ...user,
    name: user.user_metadata?.name
  } as User;
};

// Logout function
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};