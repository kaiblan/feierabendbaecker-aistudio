/**
 * useBakeSchedule - Custom hook for managing bake schedule calculations
 */

import { useMemo } from 'react';
import { BakerConfig } from '../types';
import { calculateFermentationTimes, calculateTotalProcessTime } from '../utils/bakerMath';
import { parseTimeString, createDateWithTime, addMinutesToDate, formatDateAsTime } from '../utils/timeUtils';

export interface ScheduleStep {
  type: string;
  label: string;
  min: number;
  active: boolean;
  cold: boolean;
  startStr: string;
  endStr: string;
}

interface UseBakeScheduleProps {
  config: BakerConfig;
  startTimeStr: string;
  planningMode: 'forward' | 'backward';
  translateFn: (key: string) => string;
}

export const useBakeSchedule = ({
  config,
  startTimeStr,
  planningMode,
  translateFn,
}: UseBakeScheduleProps) => {
  const { bulkMins, proofMins, coldBulkMins, coldProofMins } = useMemo(
    () => calculateFermentationTimes(config),
    [config]
  );

  const totalProcessMins = useMemo(
    () => calculateTotalProcessTime(config, bulkMins, proofMins, coldBulkMins, coldProofMins),
    [config, bulkMins, proofMins, coldBulkMins, coldProofMins]
  );

  const { scheduleWithTimes, sessionStartTime, sessionEndTime } = useMemo(() => {
    const { hours, minutes } = parseTimeString(startTimeStr);
    const anchorDate = createDateWithTime(hours, minutes);

    let start: Date;
    if (planningMode === 'forward') {
      start = anchorDate;
    } else {
      start = new Date(anchorDate.getTime() - totalProcessMins * 60000);
    }

    const steps: Array<{ type: string; label: string; min: number; active: boolean; cold: boolean }> = [];

    if (config.autolyseEnabled) {
      steps.push({ type: 'autolyse', label: translateFn('autolyse'), min: config.autolyseDurationMinutes || 0, active: false, cold: false });
    }
    steps.push({ type: 'mixing', label: translateFn('mixing'), min: 15, active: true, cold: false });

    // Split bulkMins into folds and remaining bulk fermentation
    const FOLDS_MINS = 45;
    const warmFoldMins = Math.min(FOLDS_MINS, bulkMins);
    const warmBulkRestMins = Math.max(0, bulkMins - warmFoldMins);

    steps.push({ type: 'folds', label: translateFn('folds'), min: warmFoldMins, active: true, cold: false });

    // Base bulk fermentation (room temp) - remaining after folds
    steps.push({ type: 'bulkFerment', label: translateFn('bulkFerment'), min: warmBulkRestMins, active: false, cold: false });
    // If cold bulk is enabled, append it after the normal bulk
    if (coldBulkMins > 0) {
      steps.push({ type: 'coldBulk', label: translateFn('coldBulk'), min: coldBulkMins, active: false, cold: true });
    }

    steps.push({ type: 'shaping', label: translateFn('shaping'), min: 15, active: true, cold: false });

    // Base final proof (room temp)
    steps.push({ type: 'finalProof', label: translateFn('finalProof'), min: proofMins, active: false, cold: false });
    // If cold proof is enabled, append it after the normal proof
    if (coldProofMins > 0) {
      steps.push({ type: 'coldProof', label: translateFn('coldProof'), min: coldProofMins, active: false, cold: true });
    }

    steps.push({ type: 'baking', label: translateFn('baking'), min: 50, active: true, cold: false });

    let currentCursor = start.getTime();
    const resultSteps: ScheduleStep[] = steps.map((step) => {
      const stepStart = new Date(currentCursor);
      const stepEnd = addMinutesToDate(stepStart, step.min);
      currentCursor = stepEnd.getTime();

      return {
        ...step,
        startStr: formatDateAsTime(stepStart),
        endStr: formatDateAsTime(stepEnd),
      };
    });

    const end = new Date(currentCursor);

    return {
      scheduleWithTimes: resultSteps,
      sessionStartTime: start,
      sessionEndTime: end,
    };
  }, [config, startTimeStr, planningMode, totalProcessMins, bulkMins, proofMins, translateFn]);

  const hourlyMarkers = useMemo(() => {
    const markers: Array<{ label: string; position: number }> = [];
    const start = new Date(sessionStartTime);
    start.setMinutes(0, 0, 0);

    let current = new Date(start);
    if (current < sessionStartTime) {
      current.setHours(current.getHours() + 1);
    }

    while (current <= sessionEndTime) {
      const offsetMins = (current.getTime() - sessionStartTime.getTime()) / 60000;
      const position = (offsetMins / totalProcessMins) * 100;

      if (position >= 0 && position <= 100) {
        markers.push({
          label: formatDateAsTime(current),
          position,
        });
      }
      current = new Date(current.getTime() + 3600000);
    }

    return markers;
  }, [sessionStartTime, sessionEndTime, totalProcessMins]);

  return {
    scheduleWithTimes,
    sessionStartTime,
    sessionEndTime,
    hourlyMarkers,
    totalProcessMins,
    bulkMins,
    proofMins,
  };
};
