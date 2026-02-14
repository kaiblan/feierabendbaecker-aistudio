/**
 * useBakeSchedule - Custom hook for managing bake schedule calculations
 */

import { useMemo } from 'react';
import { BakerConfig } from '../types';
import { calculateFermentationTimes, calculateTotalProcessTime } from '../utils/bakerMath';
import { parseTimeString, createDateWithTime, addMinutesToDate, formatDateAsTime } from '../utils/timeUtils';
import { getStageDefinitions } from '../services/bakerService';

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
    // Normalize start to the nearest minute to avoid fractional-second drift
    start = new Date(Math.round(start.getTime() / 60000) * 60000);

    // Get stage definitions from the single source of truth
    const stageDefinitions = getStageDefinitions(config, translateFn);

    let currentCursor = start.getTime();
    const resultSteps: ScheduleStep[] = stageDefinitions.map((stageDef) => {
      const stepStart = new Date(currentCursor);
      const stepEnd = addMinutesToDate(stepStart, stageDef.durationMinutes);
      currentCursor = stepEnd.getTime();

      // Round step start/end to nearest minute for consistent display
      const roundedStart = new Date(Math.round(stepStart.getTime() / 60000) * 60000);
      const roundedEnd = new Date(Math.round(stepEnd.getTime() / 60000) * 60000);

      return {
        type: stageDef.type,
        label: stageDef.label,
        min: stageDef.durationMinutes,
        active: stageDef.isActive,
        cold: stageDef.isCold,
        startStr: formatDateAsTime(roundedStart),
        endStr: formatDateAsTime(roundedEnd),
      };
    });

    let end = new Date(currentCursor);
    // Normalize end to the nearest minute as well
    end = new Date(Math.round(end.getTime() / 60000) * 60000);

    return {
      scheduleWithTimes: resultSteps,
      sessionStartTime: start,
      sessionEndTime: end,
    };
  }, [config, startTimeStr, planningMode, totalProcessMins, translateFn]);

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
