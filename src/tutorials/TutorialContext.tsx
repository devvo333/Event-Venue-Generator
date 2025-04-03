import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import { useUserPreferences } from '../preferences/UserPreferencesContext';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string; // CSS selector for the element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left';
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
}

export interface Tutorial {
  id: string;
  name: string;
  steps: TutorialStep[];
  requiredFeature?: string; // Feature flag that must be enabled for this tutorial
  requiredRole?: string; // User role that can see this tutorial
  onComplete?: () => void;
  completionCriteria?: () => boolean; // Function that returns true if tutorial should be marked as completed
}

interface TutorialContextType {
  availableTutorials: Tutorial[];
  completedTutorials: string[]; // Array of tutorial IDs
  activeTutorial: Tutorial | null;
  activeStep: number;
  isPlaying: boolean;
  startTutorial: (tutorialId: string) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  markTutorialAsCompleted: (tutorialId: string) => Promise<void>;
  resetAllTutorials: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
  tutorials: Tutorial[];
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({
  children,
  tutorials = [],
}) => {
  const { profile } = useAuth();
  const { preferences } = useUserPreferences();
  const [availableTutorials, setAvailableTutorials] = useState<Tutorial[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Filter tutorials based on roles and preferences
  useEffect(() => {
    if (!profile) return;

    // Filter tutorials based on user role and preferences
    const filteredTutorials = tutorials.filter((tutorial) => {
      // Skip if tutorial requires a specific role and user doesn't have it
      if (tutorial.requiredRole && profile.role !== tutorial.requiredRole) {
        return false;
      }

      return true;
    });

    setAvailableTutorials(filteredTutorials);
  }, [tutorials, profile, preferences]);

  // Load completed tutorials from Supabase
  useEffect(() => {
    const loadCompletedTutorials = async () => {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from('user_tutorial_progress')
          .select('tutorial_id, completed_at')
          .eq('user_id', profile.id)
          .is('completed_at', 'not.null');

        if (error) throw error;

        if (data) {
          setCompletedTutorials(data.map((item) => item.tutorial_id));
        }
      } catch (err) {
        console.error('Error loading completed tutorials:', err);
      }
    };

    loadCompletedTutorials();
  }, [profile]);

  // Start a tutorial by ID
  const startTutorial = (tutorialId: string) => {
    const tutorial = availableTutorials.find((t) => t.id === tutorialId);
    if (!tutorial) return;

    setActiveTutorial(tutorial);
    setActiveStep(0);
    setIsPlaying(true);

    // Execute the onNext function of the first step if it exists
    const firstStep = tutorial.steps[0];
    if (firstStep && firstStep.onNext) {
      firstStep.onNext();
    }
  };

  // Stop the current tutorial
  const stopTutorial = () => {
    setIsPlaying(false);
    setActiveTutorial(null);
    setActiveStep(0);
  };

  // Move to the next step
  const nextStep = () => {
    if (!activeTutorial) return;

    // Execute the onNext function of the current step if it exists
    const currentStep = activeTutorial.steps[activeStep];
    if (currentStep && currentStep.onNext) {
      currentStep.onNext();
    }

    if (activeStep < activeTutorial.steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Tutorial completed
      if (activeTutorial.onComplete) {
        activeTutorial.onComplete();
      }
      
      // Automatically mark as completed when reaching the last step
      markTutorialAsCompleted(activeTutorial.id);
      
      stopTutorial();
    }
  };

  // Move to the previous step
  const previousStep = () => {
    if (!activeTutorial || activeStep === 0) return;

    // Execute the onPrevious function of the current step if it exists
    const currentStep = activeTutorial.steps[activeStep];
    if (currentStep && currentStep.onPrevious) {
      currentStep.onPrevious();
    }

    setActiveStep(activeStep - 1);
  };

  // Skip the tutorial
  const skipTutorial = () => {
    if (!activeTutorial) return;

    // Execute the onSkip function of the current step if it exists
    const currentStep = activeTutorial.steps[activeStep];
    if (currentStep && currentStep.onSkip) {
      currentStep.onSkip();
    }

    stopTutorial();
  };

  // Mark a tutorial as completed
  const markTutorialAsCompleted = async (tutorialId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('user_tutorial_progress')
        .upsert({
          user_id: profile.id,
          tutorial_id: tutorialId,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id, tutorial_id' });

      if (error) throw error;

      setCompletedTutorials((prev) => {
        if (prev.includes(tutorialId)) return prev;
        return [...prev, tutorialId];
      });
    } catch (err) {
      console.error('Error marking tutorial as completed:', err);
    }
  };

  // Reset all tutorials (mark them as not completed)
  const resetAllTutorials = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('user_tutorial_progress')
        .delete()
        .eq('user_id', profile.id);

      if (error) throw error;

      setCompletedTutorials([]);
    } catch (err) {
      console.error('Error resetting tutorials:', err);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        availableTutorials,
        completedTutorials,
        activeTutorial,
        activeStep,
        isPlaying,
        startTutorial,
        stopTutorial,
        nextStep,
        previousStep,
        skipTutorial,
        markTutorialAsCompleted,
        resetAllTutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  
  return context;
}; 