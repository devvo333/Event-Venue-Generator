import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // In a real app, you would check for a valid session token
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate authentication - in a real app this would be an API call
      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email
      };
      
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (err) {
      setError('Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate registration - in a real app this would be an API call
      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        email,
        name
      };
      
      setUser(newUser);
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (err) {
      setError('Failed to sign up');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      localStorage.removeItem('auth_user');
      setUser(null);
    } catch (err) {
      setError('Failed to sign out');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };
} 