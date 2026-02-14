/**
 * useTimelineMarkers - Hook for managing timeline hour markers and label filtering
 */

import { useMemo, useState, useEffect } from 'react';
import { formatDateAsTime } from '../utils/timeUtils';

interface UseTimelineMarkersProps {
  sessionStartTime: Date;
  sessionEndTime: Date;
  totalProcessMins: number;
  scrollOffset: number;
}

export const useTimelineMarkers = ({
  sessionStartTime,
  sessionEndTime,
  totalProcessMins,
  scrollOffset,
}: UseTimelineMarkersProps) => {
  const [maxLabels, setMaxLabels] = useState<number>(() => {
    if (typeof window === 'undefined') return 12;
    const w = window.innerWidth;
    if (w < 640) return 8;
    if (w < 1024) return 12;
    return 16;
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setMaxLabels(8);
      else if (w < 1024) setMaxLabels(12);
      else setMaxLabels(16);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Calculate extended markers including buffer for scrolling
  const extendedMarkers = useMemo<Array<{ label: string; position: number }>>(() => {
    if (!sessionStartTime || !sessionEndTime || totalProcessMins <= 0) return [];
    
    const bufferHours = Math.ceil(Math.abs(scrollOffset) / 60) + 2;
    const bufferMins = bufferHours * 60;
    const start = new Date(sessionStartTime.getTime() - bufferMins * 60000);
    start.setMinutes(0, 0, 0);
    const end = new Date(sessionEndTime.getTime() + bufferMins * 60000);
    
    const markers: Array<{ label: string; position: number }> = [];
    let current = new Date(start);
    
    while (current <= end) {
      const offsetMins = (current.getTime() - sessionStartTime.getTime()) / 60000;
      const position = (offsetMins / totalProcessMins) * 100;
      markers.push({ label: formatDateAsTime(current), position });
      current = new Date(current.getTime() + 3600000);
    }
    
    return markers;
  }, [sessionStartTime, sessionEndTime, totalProcessMins, scrollOffset]);

  // Calculate label filtering based on available space
  const labelFilter = useMemo(() => {
    const parseHour = (label: string) => {
      const parts = label.split(':');
      const h = parseInt(parts[0], 10);
      return Number.isFinite(h) ? h : null;
    };

    const allowedSteps = [1, 2, 3, 4, 6, 8, 12];
    let chosenStep = 1;

    // Find optimal step size to fit labels
    for (const step of allowedSteps) {
      let count = 0;
      for (let i = 0; i < extendedMarkers.length; i++) {
        const hour = parseHour(extendedMarkers[i].label);
        if (hour === null) continue;
        if (hour % step === 0) count++;
      }
      const includeExtras = count === 0 ? 2 : 0;
      if (count + includeExtras <= maxLabels) {
        chosenStep = step;
        break;
      }
    }

    // Create a function to check if a label should be shown
    const shouldShowLabel = (label: string): boolean => {
      const hour = parseHour(label);
      return hour !== null && hour % chosenStep === 0;
    };

    return { chosenStep, shouldShowLabel };
  }, [extendedMarkers, maxLabels]);

  return {
    extendedMarkers,
    maxLabels,
    shouldShowLabel: labelFilter.shouldShowLabel,
  };
};
