/**
 * useSession - Custom hook for managing baking session state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BakerSession, BakerConfig, StageType } from '../types';
import { generateBakingStages, calculateSessionDuration } from '../services/bakerService';
import { computeSequentialStages } from '../utils/sessionUtils';

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

  const advanceToNextStage = useCallback(() => {
    setSession((prev) => {
      const currentIdx = prev.activeStageIndex;
      const nextIdx = currentIdx + 1;
      const now = new Date();

      // Mark current stage as completed and set its end time to now
      let updatedStages = prev.stages.map((s, i) => {
        if (i === currentIdx) {
          return { ...s, completed: true, isActive: false, stageEndTime: now };
        }
        return { ...s };
      });

      // If there's a next stage, advance to it
      if (nextIdx < prev.stages.length) {
        updatedStages = computeSequentialStages(updatedStages, nextIdx, now);
        return { ...prev, stages: updatedStages, activeStageIndex: nextIdx };
      } else {
        // No next stage — mark session complete
        return { ...prev, stages: updatedStages, status: 'completed' };
      }
    });
  }, []);

  const transitionToRecipe = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'recipe' }));
  }, []);

  const transitionToActive = useCallback(() => {
    setSession((prev) => {
      const now = new Date();
      // regenerate fresh stages from current config and translateFn
      const freshStages = generateBakingStages(prev.config, translateFn);
      const computed = computeSequentialStages(freshStages, 0, now);
      const totalMins = calculateSessionDuration(prev.config);
      return {
        ...prev,
        status: 'active',
        activeStageIndex: 0,
        startTime: now,
        targetEndTime: new Date(now.getTime() + totalMins * 60000),
        stages: computed,
      };
    });
  }, [translateFn]);

  const completeSession = useCallback(() => {
    setSession((prev) => ({ ...prev, status: 'completed' }));
  }, []);

  return {
    session,
    setSession,
    updateConfig,
    advanceToNextStage,
    transitionToRecipe,
    transitionToActive,
    completeSession,
  };
};
