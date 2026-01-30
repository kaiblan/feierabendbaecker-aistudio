/**
 * Cold fermentation duration slider utilities
 * Converts between slider position and duration with variable step sizes
 * 0.5h-12h: 0.5h increments, 12h-72h: 1h increments
 */

/**
 * Convert slider value (0-100) to duration in hours
 * 0.5h-12h: 0.5h steps (23 values), 12h-72h: 1h steps (60 values)
 */
export const sliderValueToDuration = (sliderValue: number): number => {
  const maxSliderValue = 100;
  const normalizedValue = (sliderValue / maxSliderValue) * 83; // 23 + 60 steps

  if (normalizedValue <= 23) {
    // 0.5h to 12h range with 0.5h steps
    return 0.5 + normalizedValue * 0.5;
  } else {
    // 12h to 72h range with 1h steps
    return 12 + (normalizedValue - 23) * 1;
  }
};

/**
 * Convert duration in hours to slider value (0-100)
 */
export const durationToSliderValue = (hours: number): number => {
  let stepValue: number;

  if (hours <= 12) {
    // 0.5h to 12h range with 0.5h steps
    stepValue = (hours - 0.5) / 0.5;
  } else {
    // 12h to 72h range with 1h steps
    stepValue = 23 + (hours - 12) * 1;
  }

  return (stepValue / 83) * 100;
};

/**
 * Round duration to nearest step based on range
 * Below 12h: round to 0.5h, Above 12h: round to 1h
 */
export const roundDuration = (hours: number): number => {
  if (hours <= 12) {
    return Math.round(hours * 2) / 2;
  } else {
    return Math.round(hours);
  }
};

/**
 * Format duration for display as H:MMh
 * Examples: "0:30h", "1:00h", "12:00h", "15:30h"
 */
export const formatDurationDisplay = (hours: number): string => {
  const rounded = roundDuration(hours);
  const wholeHours = Math.floor(rounded);
  const minutes = Math.round((rounded - wholeHours) * 60);

  return `${wholeHours}:${minutes.toString().padStart(2, '0')}h`;
};

/**
 * Format a duration given in minutes as H:MMh without additional rounding.
 * Example: 5 -> "0:05h", 30 -> "0:30h", 90 -> "1:30h"
 */
export const formatMinutesDisplay = (minutesInput: number): string => {
  const mins = Math.max(0, Math.round(minutesInput));
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}h`;
};
