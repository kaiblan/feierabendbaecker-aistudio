/**
 * Yeast slider scaling utilities.
 *
 * The fermentation model uses yeast in percent and scales time roughly as 1/yeast.
 * A linear slider on yeast therefore feels “bunched up” at low values.
 *
 * We map the slider (0..100) to yeast% on a log scale so equal slider distances
 * correspond to multiplicative yeast changes (and thus more uniform perceived effect).
 */

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const YEAST_PERCENT_MIN = 0.05;
export const YEAST_PERCENT_MAX = 2;

export const yeastSliderValueToPercent = (
  sliderValue: number,
  minPercent: number = YEAST_PERCENT_MIN,
  maxPercent: number = YEAST_PERCENT_MAX
): number => {
  const s = clamp(sliderValue, 0, 100) / 100;
  const minP = Math.max(1e-6, minPercent);
  const maxP = Math.max(minP, maxPercent);

  // Exponential interpolation: y = min * (max/min)^s
  const ratio = maxP / minP;
  const yeast = minP * Math.pow(ratio, s);
  return clamp(yeast, minP, maxP);
};

export const yeastPercentToSliderValue = (
  yeastPercent: number,
  minPercent: number = YEAST_PERCENT_MIN,
  maxPercent: number = YEAST_PERCENT_MAX
): number => {
  const minP = Math.max(1e-6, minPercent);
  const maxP = Math.max(minP, maxPercent);
  const y = clamp(yeastPercent, minP, maxP);

  // Invert: s = ln(y/min) / ln(max/min)
  const denom = Math.log(maxP / minP);
  if (!Number.isFinite(denom) || denom === 0) return 0;

  const s = Math.log(y / minP) / denom;
  return clamp(s * 100, 0, 100);
};
