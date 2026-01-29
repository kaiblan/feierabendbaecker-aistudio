/**
 * useSession - Custom hook for managing baking session state
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Session, BakerConfig, StageType } from '../types';
import { generateBakingStages } from '../services/bakerService';

interface UseSessionProps {
  initialConfig: BakerConfig;
  translateFn: (key: string) => string;
}

export const useSession = ({ initialConfig, translateFn }: UseSessionProps) => {
  const [session, setSession] = useState<Session>({
    id: 'new-bake',
    name: 'Experimental Batch',
    startTime: new Date(),
    targetEndTime: new Date(),
    stages: [],
    activeStageIndex: 0,
    status: 'planning',
    config: initialConfig,
  });

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
