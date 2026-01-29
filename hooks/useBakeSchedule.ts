/**
 * useBakeSchedule - Custom hook for managing bake schedule calculations
 */

import { useMemo } from 'react';
import { BakerConfig } from '../types';
import { calculateFermentationTimes, calculateTotalProcessTime } from '../utils/bakerMath';
import { parseTimeString, createDateWithTime, addMinutesToDate, formatDateAsTime } from '../utils/timeUtils';

export interface ScheduleStep {
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
  const { bulkMins, proofMins } = useMemo(
    () => calculateFermentationTimes(config),
    [config]
  );

  const totalProcessMins = useMemo(
    () => calculateTotalProcessTime(config, bulkMins, proofMins),
    [config, bulkMins, proofMins]
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

    const steps: Array<{ label: string; min: number; active: boolean; cold: boolean }> = [];
    
    if (config.autolyseEnabled) {
      steps.push({ label: translateFn('autolyse'), min: config.autolyseDurationMinutes || 0, active: false, cold: false });
    }
    steps.push({ label: translateFn('mixing'), min: 15, active: true, cold: false });
    steps.push({ label: translateFn('folds'), min: 45, active: true, cold: false });
    steps.push({
      label: config.coldBulkEnabled ? translateFn('coldBulk') : translateFn('bulkFerment'),
      min: bulkMins,
      active: false,
      cold: config.coldBulkEnabled,
    });
    steps.push({ label: translateFn('shaping'), min: 20, active: true, cold: false });
    steps.push({
      label: config.coldProofEnabled ? translateFn('coldProof') : translateFn('finalProof'),
      min: proofMins,
      active: false,
      cold: config.coldProofEnabled,
    });
    steps.push({ label: translateFn('baking'), min: 50, active: true, cold: false });

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
