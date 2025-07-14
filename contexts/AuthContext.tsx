import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginCredentials, SignupCredentials, User } from '../types/auth';
import { getCurrentUser, login, logout, signup } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check for current user and set up auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          ...initialState,
          isLoading: false,
          error: 'Failed to restore authentication state',
        });
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user as User | null,
        isAuthenticated: !!session?.user,
        isLoading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login handler
  const handleLogin = async (credentials: LoginCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const user = await login(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
      throw error;
    }
  };

  // Signup handler
  const handleSignup = async (credentials: SignupCredentials) => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const user = await signup(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      });
      throw error;
    }
  };

  // Logout handler
  const handleLogout = async () => {
    setState({ ...state, isLoading: true, error: null });
    try {
      await logout();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      });
    }
  };

  const value = {
    ...state,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};