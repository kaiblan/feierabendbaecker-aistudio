/**
 * useDragToAdjust - Hook for managing drag-to-adjust timeline functionality
 */

import React, { useRef, useState, useCallback } from 'react';

interface UseDragToAdjustProps {
  totalProcessMins: number;
  sessionStartTime: Date;
  onShiftMinutes?: (minutes: number, baseStart: Date) => void;
}

export const useDragToAdjust = ({
  totalProcessMins,
  sessionStartTime,
  onShiftMinutes,
}: UseDragToAdjustProps) => {
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const draggingRef = useRef<{
    active: boolean;
    startX: number;
    width: number;
    initialOffset: number;
  }>({ active: false, startX: 0, width: 0, initialOffset: 0 });

  const endDrag = useCallback(() => {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    
    const finalOffset = scrollOffset;
    if (finalOffset !== 0 && onShiftMinutes) {
      onShiftMinutes(-finalOffset, sessionStartTime);
      setScrollOffset(0);
    }
    
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onDocMouseMove);
    window.removeEventListener('mouseup', onDocMouseUp);
    window.removeEventListener('touchmove', onDocTouchMove);
    window.removeEventListener('touchend', onDocTouchEnd);
  }, [scrollOffset, onShiftMinutes, sessionStartTime]);

  const onDocMouseMove = useCallback((ev: MouseEvent) => {
    if (!draggingRef.current.active) return;
    const { startX, width, initialOffset } = draggingRef.current;
    const deltaX = ev.clientX - startX;
    const percent = deltaX / Math.max(1, width);
    const deltaMinutes = percent * totalProcessMins;
    const rawOffset = initialOffset + deltaMinutes;
    setScrollOffset(rawOffset);
  }, [totalProcessMins]);

  const onDocMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const onDocTouchMove = useCallback((ev: TouchEvent) => {
    if (!draggingRef.current.active) return;
    const t = ev.touches[0];
    const { startX, width, initialOffset } = draggingRef.current;
    const deltaX = t.clientX - startX;
    const percent = deltaX / Math.max(1, width);
    const deltaMinutes = percent * totalProcessMins;
    const rawOffset = initialOffset + deltaMinutes;
    setScrollOffset(rawOffset);
  }, [totalProcessMins]);

  const onDocTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const startDrag = useCallback((clientX: number, containerWidth: number) => {
    draggingRef.current = {
      active: true,
      startX: clientX,
      width: containerWidth,
      initialOffset: scrollOffset,
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onDocMouseMove);
    window.addEventListener('mouseup', onDocMouseUp);
    window.addEventListener('touchmove', onDocTouchMove, { passive: true });
    window.addEventListener('touchend', onDocTouchEnd);
  }, [scrollOffset, onDocMouseMove, onDocMouseUp, onDocTouchMove, onDocTouchEnd]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    const rect = el.getBoundingClientRect();
    startDrag(e.clientX, rect.width);
  }, [startDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Placeholder - functionality handled by document listeners
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
    endDrag();
  }, [endDrag]);

  return {
    scrollOffset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
