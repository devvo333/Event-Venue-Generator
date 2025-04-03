import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

// Define the shape of user preferences
export interface UserPreferences {
  // Canvas preferences
  defaultGridSize: number;
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  rulerUnit: 'cm' | 'inches' | 'pixels';
  
  // Theme preferences
  darkMode: boolean;
  primaryColor: string;
  
  // Tool preferences
  defaultStrokeWidth: number;
  defaultStrokeColor: string;
  defaultFillColor: string;
  defaultFontFamily: string;
  defaultFontSize: number;
  
  // UI preferences
  sidebarCollapsed: boolean;
  showWelcomeTips: boolean;
  showLayerThumbnails: boolean;
  autoSaveInterval: number; // in seconds, 0 means disabled
  
  // Notification preferences
  emailNotifications: boolean;
  collaborationAlerts: boolean;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  // Canvas preferences
  defaultGridSize: 20,
  showRulers: true,
  showGrid: true,
  snapToGrid: true,
  rulerUnit: 'cm',
  
  // Theme preferences
  darkMode: false,
  primaryColor: '#3b82f6',
  
  // Tool preferences
  defaultStrokeWidth: 2,
  defaultStrokeColor: '#000000',
  defaultFillColor: 'transparent',
  defaultFontFamily: 'Arial',
  defaultFontSize: 16,
  
  // UI preferences
  sidebarCollapsed: false,
  showWelcomeTips: true,
  showLayerThumbnails: true,
  autoSaveInterval: 60, // Auto-save every 60 seconds
  
  // Notification preferences
  emailNotifications: true,
  collaborationAlerts: true,
};

// Create context type
interface UserPreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  error: Error | null;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  resetPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

// Create the context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Provider props
interface UserPreferencesProviderProps {
  children: ReactNode;
}

// Create the provider component
export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  // Load preferences from Supabase when profile changes
  useEffect(() => {
    const loadPreferences = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', profile.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found, create default preferences
            await saveDefaultPreferences();
          } else {
            throw error;
          }
        } else if (data) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
        }
      } catch (err) {
        console.error('Error loading user preferences:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    const saveDefaultPreferences = async () => {
      try {
        if (!profile) return;

        const { error } = await supabase
          .from('user_preferences')
          .insert({
            user_id: profile.id,
            preferences: defaultPreferences,
          });

        if (error) throw error;
        
        setPreferences(defaultPreferences);
      } catch (err) {
        console.error('Error saving default preferences:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    loadPreferences();
  }, [profile]);

  // Update a single preference
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<void> => {
    try {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      setUnsavedChanges(true);
      
      // Auto-save after a short delay
      setTimeout(() => {
        savePreferences();
      }, 1000);
    } catch (err) {
      console.error(`Error updating preference ${String(key)}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  // Reset all preferences to default
  const resetPreferences = async () => {
    try {
      setPreferences(defaultPreferences);
      setUnsavedChanges(true);
      await savePreferences();
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  // Save preferences to Supabase
  const savePreferences = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: profile.id,
          preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      setUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-save preferences when user leaves the page
  useEffect(() => {
    if (unsavedChanges) {
      const handleBeforeUnload = () => {
        savePreferences();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [unsavedChanges]);

  // Create the context value
  const value = {
    preferences,
    loading,
    error,
    updatePreference,
    resetPreferences,
    savePreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Create a hook for using the user preferences context
export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}; 