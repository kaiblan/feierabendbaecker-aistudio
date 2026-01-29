/**
 * Baker mathematics and calculations for fermentation timing
 */

import { BakerConfig } from '../types';

/**
 * Calculate fermentation durations based on config parameters
 * Uses scientific approximation: 0.5% yeast at 24°C is baseline (300m bulk, 60m proof)
 * Proof time is fixed at 60 minutes unless cold proof is enabled (960m)
 */
export const calculateFermentationTimes = (config: BakerConfig): { bulkMins: number; proofMins: number; coldBulkMins: number; coldProofMins: number } => {
  const yeastFactor = 0.5 / (config.yeast || 0.05);
  const tempEffect = Math.pow(0.85, (config.targetTemp - 24) / 2);

  // Base (room-temp) fermentations
  const baseBulkMins = Math.round(300 * yeastFactor * tempEffect);
  const baseProofMins = 60;

  // Cold (refrigerated) additional durations (if enabled)
  const coldBulkMins = config.coldBulkEnabled ? Math.round((config.coldBulkDurationHours || 0) * 60) : 0;
  const coldProofMins = config.coldProofEnabled ? Math.round((config.coldProofDurationHours || 0) * 60) : 0;

  return { bulkMins: baseBulkMins, proofMins: baseProofMins, coldBulkMins, coldProofMins };
};

/**
 * Calculate total process time in minutes
 */
export const calculateTotalProcessTime = (
  config: BakerConfig,
  bulkMins: number,
  proofMins: number,
  coldBulkMins: number = 0,
  coldProofMins: number = 0
): number => {
  let total = bulkMins + proofMins + coldBulkMins + coldProofMins + 130; // 15 (mix) + 45 (folds) + 20 (shape) + 50 (bake)
  if (config.autolyseEnabled) total += (config.autolyseDurationMinutes || 0);
  return total;
};

/**
 * Calculate recipe batch weights based on flour and hydration
 */
export const calculateBatchWeights = (config: BakerConfig) => {
  const flour = config.totalFlour;
  const water = flour * config.hydration / 100;
  const yeast = flour * config.yeast / 100;
  const salt = flour * config.salt / 100;
  const total = flour + water + yeast + salt;

  return { flour, water, yeast, salt, total };
};

/**
 * Calculate hydration percentage from weights
 */
export const calculateHydration = (flourWeight: number, waterWeight: number): number => {
  return (waterWeight / flourWeight) * 100;
};
