import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

// Define the shape of our auth context
type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signInWithGoogle: () => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
type AuthProviderProps = {
  children: ReactNode;
};

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session
    const getSession = async () => {
      const { data: currentSession } = await supabase.auth.getSession();
      setSession(currentSession?.session ?? null);
      setUser(currentSession?.session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // If a user signed in with OAuth, we need to create a profile if one doesn't exist
        if (event === 'SIGNED_IN' && newSession && newSession.user && newSession.user.app_metadata?.provider !== 'email') {
          // Check if profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
            
          // If no profile exists, create one
          if (!profile) {
            await supabase.from('profiles').insert([
              {
                id: newSession.user.id,
                email: newSession.user.email,
                role: 'stager', // Default role for social sign-ins
                full_name: newSession.user.user_metadata?.full_name || '',
                avatar_url: newSession.user.user_metadata?.avatar_url || ''
              },
            ]);
          }
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up a new user
  const signUp = async (email: string, password: string, role: string, fullName: string) => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Create a profile record in the database
      // Note: This would ideally be handled by a database trigger
      // as set up in the SUPABASE-SETUP.md file, but we'll do it manually as well
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            role: role,
            full_name: fullName,
          },
        ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      // Note: The actual redirection and success happens through the onAuthStateChange handler above
      return { error: null, success: true };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { error: null, success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 