/**
 * useTimer - Custom hook for managing bake session timer
 */

import { useEffect, useState } from 'react';

interface UseTimerProps {
  isActive: boolean;
  durationMinutes: number;
}

export const useTimer = ({ isActive, durationMinutes }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const reset = () => setTimeLeft(durationMinutes * 60);

  return { timeLeft, setTimeLeft, reset };
};
