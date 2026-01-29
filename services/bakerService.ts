/**
 * Baker service - orchestrates baker-related calculations and stage generation
 */

import { BakerConfig, Stage, StageType } from '../types';
import { calculateFermentationTimes, calculateTotalProcessTime } from '../utils/bakerMath';

/**
 * Generate stages for a baking session based on config
 */
export const generateBakingStages = (
  config: BakerConfig,
  translateFn: (key: string) => string
): Stage[] => {
  const { bulkMins, proofMins } = calculateFermentationTimes(config);

  const stages: Stage[] = [];

  if (config.autolyseEnabled) {
    stages.push({
      id: 'a1',
      type: StageType.AUTOLYSE,
      label: translateFn('autolyse'),
      durationMinutes: 60,
      completed: false,
      isActive: false,
    });
  }

  stages.push({
    id: 'm1',
    type: StageType.MIXING,
    label: translateFn('mixing'),
    durationMinutes: 15,
    completed: false,
    isActive: true,
  });

  stages.push({
    id: 'f1',
    type: StageType.STRETCH_AND_FOLD,
    label: translateFn('folds'),
    durationMinutes: 45,
    completed: false,
    isActive: true,
  });

  stages.push({
    id: 'b1',
    type: StageType.BULK_FERMENTATION,
    label: config.coldBulkEnabled ? translateFn('coldBulk') : translateFn('bulkFerment'),
    durationMinutes: bulkMins,
    completed: false,
    isActive: false,
  });

  stages.push({
    id: 's1',
    type: StageType.SHAPING,
    label: translateFn('shaping'),
    durationMinutes: 20,
    completed: false,
    isActive: true,
  });

  stages.push({
    id: 'pr1',
    type: StageType.PROVING,
    label: config.coldProofEnabled ? translateFn('coldProof') : translateFn('finalProof'),
    durationMinutes: proofMins,
    completed: false,
    isActive: false,
  });

  stages.push({
    id: 'bk1',
    type: StageType.BAKING,
    label: translateFn('baking'),
    durationMinutes: 50,
    completed: false,
    isActive: true,
  });

  return stages;
};

/**
 * Calculate total minutes for a baking session
 */
export const calculateSessionDuration = (config: BakerConfig): number => {
  const { bulkMins, proofMins } = calculateFermentationTimes(config);
  return calculateTotalProcessTime(config, bulkMins, proofMins);
};
