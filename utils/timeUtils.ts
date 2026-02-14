/**
 * Time utility functions for formatting and parsing time values
 */

/**
 * Format seconds into MM:SS display format
 */
export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Parse time string (HH:MM) into hours and minutes
 */
export const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
};

/**
 * Create a date with specified hours and minutes
 */
export const createDateWithTime = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Format a date as HH:MM string
 */
export const formatDateAsTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Add minutes to a date and return new date
 */
export const addMinutesToDate = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Get minutes between two dates
 */
export const getMinutesBetweenDates = (start: Date, end: Date): number => {
  return (end.getTime() - start.getTime()) / 60000;
};

/**
 * Round a date to the nearest 5 minutes
 */
export const roundDateTo5Minutes = (date: Date): Date => {
  const stepMs = 5 * 60 * 1000;
  return new Date(Math.round(date.getTime() / stepMs) * stepMs);
};

/**
 * Format a date as HH:MM input string (24-hour format, zero-padded)
 */
export const formatDateToInput = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Calculate shifted time based on planning mode
 * In forward mode: shifts the start time directly
 * In backward mode: shifts the start time and returns the new end time
 */
export const calculateShiftedTime = (
  baseStart: Date,
  shiftMinutes: number,
  totalProcessMinutes: number,
  planningMode: 'forward' | 'backward'
): Date => {
  const newStart = addMinutesToDate(baseStart, shiftMinutes);
  
  if (planningMode === 'backward') {
    // In backward mode, calculate the new end time
    const newEnd = addMinutesToDate(newStart, totalProcessMinutes);
    return roundDateTo5Minutes(newEnd);
  } else {
    // In forward mode, return the new start time
    return roundDateTo5Minutes(newStart);
  }
};
