/**
 * Baker mathematics and calculations for fermentation timing
 */

import { BakerConfig } from '../types';

/**
 * Calculate fermentation durations based on config parameters
 * Uses scientific approximation: 0.5% yeast at 24°C is baseline (300m bulk, 60m proof)
 * Proof time is fixed at 60 minutes unless cold proof is enabled (960m)
 */
export const calculateFermentationTimes = (config: BakerConfig): { bulkMins: number; proofMins: number } => {
  const yeastFactor = 0.5 / (config.yeast || 0.05);
  const tempEffect = Math.pow(0.85, (config.targetTemp - 24) / 2);

  const bulkMins = config.coldBulkEnabled 
    ? Math.round(config.coldBulkDurationHours * 60)
    : Math.round(300 * yeastFactor * tempEffect);
    
  const proofMins = config.coldProofEnabled 
    ? Math.round(config.coldProofDurationHours * 60)
    : 60;

  return { bulkMins, proofMins };
};

/**
 * Calculate total process time in minutes
 */
export const calculateTotalProcessTime = (
  config: BakerConfig,
  bulkMins: number,
  proofMins: number
): number => {
  let total = bulkMins + proofMins + 130; // 15 (mix) + 45 (folds) + 20 (shape) + 50 (bake)
  if (config.autolyseEnabled) total += 60;
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
