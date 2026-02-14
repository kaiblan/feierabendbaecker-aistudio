/**
 * useSession - Custom hook for managing baking session state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BakerSession, BakerConfig, StageType } from '../types';
import { generateBakingStages } from '../services/bakerService';

interface UseSessionProps {
  initialConfig: BakerConfig;
  translateFn: (key: string) => string;
}

const SESSION_STORAGE_KEY = 'bakerSession';

// Helper function to serialize session to localStorage
const serializeSession = (session: BakerSession): string => {
  return JSON.stringify(session, (key, value) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

// Helper function to deserialize session from localStorage
const deserializeSession = (json: string): BakerSession | null => {
  try {
    return JSON.parse(json, (key, value) => {
      // Convert ISO strings back to Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to deserialize session:', error);
    return null;
  }
};

// Helper function to load session from localStorage
const loadSessionFromStorage = (): BakerSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const session = deserializeSession(stored);
      // Only restore if it's an active session
      if (session && session.status === 'active') {
        return session;
      }
    }
  } catch (error) {
    console.error('Failed to load session from storage:', error);
  }
  return null;
};

// Helper function to save session to localStorage
const saveSessionToStorage = (session: BakerSession): void => {
  try {
    // Only persist active sessions
    if (session.status === 'active') {
      localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(session));
    } else {
      // Clear storage if session is not active
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save session to storage:', error);
  }
};

export const useSession = ({ initialConfig, translateFn }: UseSessionProps) => {
  // Try to load session from storage, otherwise use default
  const [session, setSession] = useState<BakerSession>(() => {
    const storedSession = loadSessionFromStorage();
    if (storedSession) {
      return storedSession;
    }
    return {
      id: 'new-bake',
      name: 'Experimental Batch',
      startTime: new Date(),
      targetEndTime: new Date(),
      stages: [],
      activeStageIndex: 0,
      status: 'planning',
      config: initialConfig,
    };
  });

  // Persist session to localStorage whenever it changes
  useEffect(() => {
    saveSessionToStorage(session);
  }, [session]);

  // Generate stages whenever config changes
  const calculatedStages = useMemo(
    () => generateBakingStages(session.config, translateFn),
    [session.config, translateFn]
  );

  useEffect(() => {
    if (session.status === 'planning' || session.status === 'recipe') {
      setSession((prev) => ({ ...prev, stages: calculatedStages }));
    }
  }, [calculatedStages, session.status]);

  const updateConfig = useCallback((updates: Partial<BakerConfig>) => {
    setSession((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const advanceStage = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      activeStageIndex: Math.min(prev.activeStageIndex + 1, prev.stages.length - 1),
    }));
  }, []);

  const transitionToRecipe = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'recipe' }));
  }, []);

  const transitionToActive = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      status: 'active',
      activeStageIndex: 0,
    }));
  }, []);

  const completeSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'completed' }));
  }, []);

  return {
    session,
    setSession,
    updateConfig,
    advanceStage,
    transitionToRecipe,
    transitionToActive,
    completeSession,
  };
};
