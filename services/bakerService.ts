/**
 * Baker service - orchestrates baker-related calculations and stage generation
 */

import { BakerConfig, Stage, StageType } from '../types';
import { calculateFermentationTimes, calculateTotalProcessTime } from '../utils/bakerMath';

/**
 * Base stage definition (common structure for both Stage and ScheduleStep)
 */
export interface BaseStageDefinition {
  type: string;
  stageType?: StageType;
  label: string;
  durationMinutes: number;
  isActive: boolean;
  isCold: boolean;
}

/**
 * Get the core stage definitions for a baking session
 * This is the single source of truth for the stage sequence
 */
export const getStageDefinitions = (
  config: BakerConfig,
  translateFn: (key: string) => string
): BaseStageDefinition[] => {
  const { bulkMins, proofMins, coldBulkMins, coldProofMins } = calculateFermentationTimes(config);
  
  const stages: BaseStageDefinition[] = [];

  if (config.autolyseEnabled) {
    stages.push({
      type: 'autolyse',
      stageType: StageType.AUTOLYSE,
      label: translateFn('autolyse'),
      durationMinutes: config.autolyseDurationMinutes || 0,
      isActive: false,
      isCold: false,
    });
  }

  stages.push({
    type: 'kneading',
    stageType: StageType.KNEADING,
    label: translateFn('kneading'),
    durationMinutes: 15,
    isActive: true,
    isCold: false,
  });

  // Split bulkMins into folds and remaining bulk fermentation
  const FOLDS_MINS = 45;
  const warmFoldMins = Math.min(FOLDS_MINS, bulkMins);
  const warmBulkRestMins = Math.max(0, bulkMins - warmFoldMins);

  stages.push({
    type: 'folds',
    stageType: StageType.STRETCH_AND_FOLD,
    label: translateFn('folds'),
    durationMinutes: warmFoldMins,
    isActive: true,
    isCold: false,
  });

  stages.push({
    type: 'bulkFerment',
    stageType: StageType.BULK_FERMENTATION,
    label: translateFn('bulkFerment'),
    durationMinutes: warmBulkRestMins,
    isActive: false,
    isCold: false,
  });

  if (coldBulkMins > 0) {
    stages.push({
      type: 'coldBulk',
      stageType: StageType.BULK_FERMENTATION,
      label: translateFn('coldBulk'),
      durationMinutes: coldBulkMins,
      isActive: false,
      isCold: true,
    });
  }

  stages.push({
    type: 'shaping',
    stageType: StageType.SHAPING,
    label: translateFn('shaping'),
    durationMinutes: 15,
    isActive: true,
    isCold: false,
  });

  stages.push({
    type: 'finalProof',
    stageType: StageType.PROVING,
    label: translateFn('finalProof'),
    durationMinutes: proofMins,
    isActive: false,
    isCold: false,
  });

  if (coldProofMins > 0) {
    stages.push({
      type: 'coldProof',
      stageType: StageType.PROVING,
      label: translateFn('coldProof'),
      durationMinutes: coldProofMins,
      isActive: false,
      isCold: true,
    });
  }

  stages.push({
    type: 'baking',
    stageType: StageType.BAKING,
    label: translateFn('baking'),
    durationMinutes: 50,
    isActive: true,
    isCold: false,
  });

  return stages;
};

/**
 * Generate stages for a baking session based on config
 */
export const generateBakingStages = (
  config: BakerConfig,
  translateFn: (key: string) => string
): Stage[] => {
  const baseStages = getStageDefinitions(config, translateFn);
  
  return baseStages.map((baseDef, index) => ({
    id: `${baseDef.type}-${index}`,
    type: baseDef.stageType!,
    label: baseDef.label,
    durationMinutes: baseDef.durationMinutes,
    completed: false,
    isActive: baseDef.isActive,
  }));
};

/**
 * Calculate total minutes for a baking session
 */
export const calculateSessionDuration = (config: BakerConfig): number => {
  const { bulkMins, proofMins, coldBulkMins, coldProofMins } = calculateFermentationTimes(config);
  return calculateTotalProcessTime(config, bulkMins, proofMins, coldBulkMins, coldProofMins);
};
