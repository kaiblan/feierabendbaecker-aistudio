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
  const { bulkMins, proofMins, coldBulkMins, coldProofMins } = calculateFermentationTimes(config);

  const stages: Stage[] = [];

  if (config.autolyseEnabled) {
    stages.push({
      id: 'a1',
      type: StageType.AUTOLYSE,
      label: translateFn('autolyse'),
      durationMinutes: config.autolyseDurationMinutes || 0,
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

  // Split bulkMins into folds and remaining bulk fermentation
  const FOLDS_MINS = 45;
  const warmFoldMins = Math.min(FOLDS_MINS, bulkMins);
  const warmBulkRestMins = Math.max(0, bulkMins - warmFoldMins);

  stages.push({
    id: 'f1',
    type: StageType.STRETCH_AND_FOLD,
    label: translateFn('folds'),
    durationMinutes: warmFoldMins,
    completed: false,
    isActive: true,
  });

  // Base bulk fermentation (room temp) - remaining after folds
  stages.push({
    id: 'b1',
    type: StageType.BULK_FERMENTATION,
    label: translateFn('bulkFerment'),
    durationMinutes: warmBulkRestMins,
    completed: false,
    isActive: false,
  });
  // Append cold bulk after normal bulk when configured
  if (coldBulkMins > 0) {
    stages.push({
      id: 'cb1',
      type: StageType.BULK_FERMENTATION,
      label: translateFn('coldBulk'),
      durationMinutes: coldBulkMins,
      completed: false,
      isActive: false,
    });
  }

  stages.push({
    id: 's1',
    type: StageType.SHAPING,
    label: translateFn('shaping'),
    durationMinutes: 15,
    completed: false,
    isActive: true,
  });

  // Base final proof (room temp)
  stages.push({
    id: 'pr1',
    type: StageType.PROVING,
    label: translateFn('finalProof'),
    durationMinutes: proofMins,
    completed: false,
    isActive: false,
  });
  // Append cold proof after normal proof when configured
  if (coldProofMins > 0) {
    stages.push({
      id: 'cp1',
      type: StageType.PROVING,
      label: translateFn('coldProof'),
      durationMinutes: coldProofMins,
      completed: false,
      isActive: false,
    });
  }

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
  const { bulkMins, proofMins, coldBulkMins, coldProofMins } = calculateFermentationTimes(config);
  return calculateTotalProcessTime(config, bulkMins, proofMins, coldBulkMins, coldProofMins);
};
