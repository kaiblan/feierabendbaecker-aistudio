/**
 * useSession - Custom hook for managing baking session state
 * Now acts as a thin wrapper around the centralized sessionManager
 */

import { useState, useEffect, useCallback } from 'react';
import { BakerSession, BakerConfig } from '../types';
import { sessionManager } from '../services/sessionManager';
import { computeSequentialStages } from '../utils/sessionUtils';

interface UseSessionProps {
  initialConfig: BakerConfig;
  translateFn: (key: string) => string;
}

export const useSession = ({ initialConfig, translateFn }: UseSessionProps) => {
  // Initialize the session manager with config and translation function
  useEffect(() => {
    sessionManager.initialize(initialConfig);
    sessionManager.setTranslateFn(translateFn);
  }, [initialConfig, translateFn]);

  // Subscribe to session changes from the centralized manager
  const [session, setSession] = useState<BakerSession>(sessionManager.getSession() as BakerSession);

  useEffect(() => {
    // Regenerate stages when in planning/recipe mode
    sessionManager.regenerateStages();
    
    // Subscribe to session updates
    const unsubscribe = sessionManager.subscribe((updatedSession) => {
      setSession(updatedSession as BakerSession);
    });

    return unsubscribe;
  }, [translateFn]); // Re-subscribe when translate function changes

  // Expose session manager methods
  const updateConfig = useCallback((updates: Partial<BakerConfig>) => {
    sessionManager.updateConfig(updates);
  }, []);

  const advanceToNextStage = useCallback(() => {
    sessionManager.advanceToNextStage();
  }, []);

  const transitionToRecipe = useCallback(() => {
    sessionManager.transitionToRecipe();
  }, []);

  const transitionToActive = useCallback(() => {
    sessionManager.startSession();
  }, []);

  const completeSession = useCallback(() => {
    sessionManager.completeSession();
  }, []);

  const resetSession = useCallback(() => {
    sessionManager.resetSession();
  }, []);

  // Provide updateStages for manual stage adjustments (e.g., timeline drag)
  const updateStages = useCallback((stages: typeof session.stages) => {
    sessionManager.updateStages(stages);
  }, []);

  return {
    session,
    // Deprecated: direct setSession - kept for backward compatibility but discouraged
    setSession: (newSession: BakerSession | ((prev: BakerSession) => BakerSession)) => {
      console.warn('Direct setSession is deprecated. Use specific session manager methods instead.');
      if (typeof newSession === 'function') {
        const updated = newSession(session);
        // Apply updates through session manager for consistency
        if (updated.status !== session.status) {
          if (updated.status === 'planning') {
            sessionManager.resetSession();
          } else if (updated.status === 'active') {
            sessionManager.startSession();
          }
        }
        if (updated.stages !== session.stages) {
          sessionManager.updateStages(updated.stages);
        }
      }
    },
    updateConfig,
    updateStages,
    advanceToNextStage,
    transitionToRecipe,
    transitionToActive,
    completeSession,
    resetSession,
    // New major operations exposed
    startSession: transitionToActive,
  };
};
