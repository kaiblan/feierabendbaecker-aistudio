import { Stage } from '../types';

/**
 * Computes sequential start/end times for stages from a given index and base time
 */
export const computeSequentialStages = (
  stages: Stage[],
  startIdx: number,
  baseTime: Date
): Stage[] => {
  const updatedStages = stages.map((s) => ({ ...s }));
  let cursor = new Date(baseTime);
  
  for (let i = startIdx; i < updatedStages.length; i++) {
    const dur = updatedStages[i].durationMinutes || 0;
    updatedStages[i].startTime = new Date(cursor);
    updatedStages[i].stageEndTime = new Date(cursor.getTime() + dur * 60000);
    // Reset completion state for stages that are recomputed and set active flag
    updatedStages[i].completed = false;
    updatedStages[i].isActive = i === startIdx;
    cursor = new Date(updatedStages[i].stageEndTime as Date);
  }
  
  return updatedStages;
};

/**
 * Resets all stages to their initial state
 */
export const resetStages = (stages: Stage[]): Stage[] => {
  return stages.map((stage) => ({
    ...stage,
    completed: false,
    isActive: false,
    startTime: undefined,
    stageEndTime: undefined,
  }));
};
