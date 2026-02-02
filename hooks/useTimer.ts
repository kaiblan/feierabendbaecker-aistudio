/**
 * useTimer - Custom hook for managing bake session timer
 * Uses timestamps to ensure timers continue running even when browser is closed
 */

import { useEffect, useState } from 'react';

interface UseTimerProps {
  isActive: boolean;
  endTime: Date | null; // Target end timestamp for the current stage
}

export const useTimer = ({ isActive, endTime }: UseTimerProps) => {
  const calculateTimeLeft = () => {
    if (!endTime) return 0;
    const now = new Date().getTime();
    const target = new Date(endTime).getTime();
    const secondsLeft = Math.floor((target - now) / 1000);
    return Math.max(0, secondsLeft);
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!isActive || !endTime) return;

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Then update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, endTime]);

  return { timeLeft, setTimeLeft };
};
