/**
 * Baker mathematics and calculations for fermentation timing
 */

import { BakerConfig } from '../types';

/**
 * Balance bulk and proof fermentation times based on slider (0-100)
 * 0   = 90% bulk / 10% proof
 * 100 = 60% bulk / 40% proof
 */
const balanceBulkProof = (totalMins: number, balance: number): { bulkMins: number; proofMins: number } => {
  // Linear interpolation: at balance=0, bulk% = 90; at balance=100, bulk% = 60
  const bulkPercent = 90 - (balance / 100) * 30;
  const proofPercent = 100 - bulkPercent;

  return {
    bulkMins: Math.round(totalMins * bulkPercent / 100),
    proofMins: Math.round(totalMins * proofPercent / 100),
  };
};

/**
 * Temperature-dependent cold equivalence factor
 * 
 * A(T) computes how much 1 minute of cold fermentation at temperature T°C
 * is equivalent to in warm fermentation minutes.
 *
 * Algorithm:
 * - T <= 2°C:   A(T) = 0 (essentially no fermentation)
 * - 2 < T < 5°C: A(T) = 0.05 × (T - 2) / 3 (linear interpolation)
 * - T >= 5°C:   A(T) = k × 2^((T - 20) / 10), where k = 0.05 / 2^((5 - 20) / 10)
 */
const coldEquivalenceFactor = (tempC: number): number => {
  if (tempC <= 2) {
    return 0;
  } else if (tempC < 5) {
    return 0.05 * (tempC - 2) / 3;
  } else {
    const Araw5 = Math.pow(2, (5 - 20) / 10);
    const k = 0.05 / Araw5;
    return k * Math.pow(2, (tempC - 20) / 10);
  }
};

/**
 * Deterministic fermentation time model
 *
 * Baseline (0.5% yeast @ 24°C):
 * - Bulk target = 300 min
 * - Proof target = 180 min
 *
 * Yeast effect: time ∝ 1 / yeastPercent (yeastFactor = 0.5 / yeastPercent)
 *
 * Temperature effect (exponential):
 * - Bulk:  bulkTempEffect  = 0.85 ^ ((tempC - 24) / 2)
 * - Proof: proofTempEffect = 0.80 ^ ((tempC - 24) / 2)
 *
 * Warm fermentation targets:
 * - bulkWarmTarget  = 300 × yeastFactor × bulkTempEffect
 * - proofWarmTarget = 180 × yeastFactor × proofTempEffect
 *
 * Cold fermentation:
 * - Cold does not stop fermentation, it slows it (1 min cold ≈ 0.07 min warm)
 * - Warm remaining = max(0, warmTarget - coldMins × 0.07)
 */
export const calculateFermentationTimes = (config: BakerConfig): { bulkMins: number; proofMins: number; coldBulkMins: number; coldProofMins: number } => {
  const BASE_YEAST = 0.5;

  const yeastFactor = BASE_YEAST / (config.yeast || BASE_YEAST);

  // Temperature effects (exponential, different for bulk and proof)
  const bulkTempEffect = Math.pow(0.85, (config.targetTemp - 24) / 2);
  const proofTempEffect = Math.pow(0.80, (config.targetTemp - 24) / 2);

  // Warm fermentation targets
  const bulkWarmTarget = 300 * yeastFactor * bulkTempEffect;
  const proofWarmTarget = 180 * yeastFactor * proofTempEffect;

  // Cold durations (user-specified in hours)
  const coldBulkMins = config.coldBulkEnabled ? Math.round((config.coldBulkDurationHours || 0) * 60) : 0;
  const coldProofMins = config.coldProofEnabled ? Math.round((config.coldProofDurationHours || 0) * 60) : 0;

  // Temperature-dependent cold equivalence factor
  const coldFactor = coldEquivalenceFactor(config.fridgeTemp);

  // Warm remaining time after cold fermentation accounts for slowdown
  const bulkWarmRemaining = Math.max(0, bulkWarmTarget - coldBulkMins * coldFactor);
  const proofWarmRemaining = Math.max(0, proofWarmTarget - coldProofMins * coldFactor);

  // Total warm fermentation time
  const totalWarmMins = bulkWarmRemaining + proofWarmRemaining;

  // Balance bulk and proof based on slider
  const { bulkMins: balancedBulk, proofMins: balancedProof } = balanceBulkProof(totalWarmMins, config.fermentationBalance);

  return {
    bulkMins: balancedBulk,
    proofMins: balancedProof,
    coldBulkMins,
    coldProofMins,
  };
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
  let total = bulkMins + proofMins + coldBulkMins + coldProofMins + 125; // 15 (mix) + 45 (folds) + 15 (shape) + 50 (bake)
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
