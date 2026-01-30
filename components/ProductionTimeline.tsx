/**
 * ProductionTimeline - Displays the baking process workflow timeline
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import { formatDateAsTime } from '../utils/timeUtils';
import { Button } from './Button';

interface ProductionTimelineProps {
  scheduleWithTimes: ScheduleStep[];
  sessionStartTime: Date;
  sessionEndTime: Date;
  hourlyMarkers: Array<{ label: string; position: number }>;
  totalProcessMins: number;
  workLabel: string;
  coldLabel: string;
  productionWorkflowLabel: string;
  planningMode: 'forward' | 'backward';
  translateFn: (key: string) => string;
  onShiftMinutes?: (minutes: number, baseStart: Date) => void;
}

export const ProductionTimeline: React.FC<ProductionTimelineProps> = ({
  scheduleWithTimes,
  sessionStartTime,
  sessionEndTime,
  hourlyMarkers,
  totalProcessMins,
  workLabel,
  coldLabel,
  productionWorkflowLabel,
  planningMode,
  translateFn,
  onShiftMinutes,
}) => {
  const [scrollOffset, setScrollOffset] = useState<number>(0); // offset in minutes
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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

  const labelsToShow = new Set<number>();

  // Choose a step from the allowed set so that displayed labels are one of
  // [1,2,3,4,6,8,12] hours. Selection is anchored at 00:00 (midnight) —
  // show markers whose hour % step === 0. Pick the smallest step that
  // yields <= maxLabels labels (including first+last). If none, pick 12.
  const allowedSteps = [1, 2, 3, 4, 6, 8, 12];

  const parseHour = (label: string) => {
    // label expected like "14:00" — fall back to index if parse fails
    const parts = label.split(':');
    const h = parseInt(parts[0], 10);
    return Number.isFinite(h) ? h : null;
  };

  let chosenStep = 1;
  for (const step of allowedSteps) {
    let count = 0;
    for (let i = 0; i < hourlyMarkers.length; i++) {
      const hour = parseHour(hourlyMarkers[i].label);
      if (hour === null) continue;
      if (hour % step === 0) count++;
    }
    // include first and last if not counted
    const includeExtras = (count === 0 ? 2 : 0);
    if (count + includeExtras <= maxLabels) {
      chosenStep = step;
      break;
    }
  }

  for (let i = 0; i < hourlyMarkers.length; i++) {
    const hour = parseHour(hourlyMarkers[i].label);
    if (hour !== null && hour % chosenStep === 0) labelsToShow.add(i);
  }
  // Always ensure first and last markers are visible
  labelsToShow.add(0);
  labelsToShow.add(hourlyMarkers.length - 1);

  const shouldShowLabel = (label: string) => {
    const hour = parseHour(label);
    return hour !== null && hour % chosenStep === 0;
  };

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
      markers.push({
        label: formatDateAsTime(current),
        position,
      });
      current = new Date(current.getTime() + 3600000);
    }

    return markers;
  }, [sessionStartTime, sessionEndTime, totalProcessMins, scrollOffset]);

  // Drag state for viewport scrolling
  const draggingRef = useRef<{ active: boolean; startX: number; width: number; initialOffset: number }>({
    active: false,
    startX: 0,
    width: 0,
    initialOffset: 0
  });

  const _endDrag = () => {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    
    // Apply the final offset to shift the actual times
    const finalOffset = scrollOffset;
    if (finalOffset !== 0 && onShiftMinutes) {
      onShiftMinutes(-finalOffset, sessionStartTime);
      setScrollOffset(0); // Reset offset after applying
    }
    
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onDocMouseMove);
    window.removeEventListener('mouseup', onDocMouseUp);
    window.removeEventListener('touchmove', onDocTouchMove);
    window.removeEventListener('touchend', onDocTouchEnd);
  };

  const onDocMouseMove = (ev: MouseEvent) => {
    if (!draggingRef.current.active) return;
    const { startX, width, initialOffset } = draggingRef.current;
    const deltaX = ev.clientX - startX;
    const percent = deltaX / Math.max(1, width);
    const deltaMinutes = percent * totalProcessMins;
    const rawOffset = initialOffset + deltaMinutes;
    setScrollOffset(rawOffset);
  };

  const onDocMouseUp = () => { _endDrag(); };

  const onDocTouchMove = (ev: TouchEvent) => {
    if (!draggingRef.current.active) return;
    const t = ev.touches[0];
    const { startX, width, initialOffset } = draggingRef.current;
    const deltaX = t.clientX - startX;
    const percent = deltaX / Math.max(1, width);
    const deltaMinutes = percent * totalProcessMins;
    const rawOffset = initialOffset + deltaMinutes;
    setScrollOffset(rawOffset);
  };

  const onDocTouchEnd = () => { _endDrag(); };

  const startDrag = (clientX: number, containerWidth: number) => {
    draggingRef.current = { 
      active: true, 
      startX: clientX, 
      width: containerWidth,
      initialOffset: scrollOffset
    };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onDocMouseMove);
    window.addEventListener('mouseup', onDocMouseUp);
    window.addEventListener('touchmove', onDocTouchMove, { passive: true });
    window.addEventListener('touchend', onDocTouchEnd);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLDivElement;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const rect = el.getBoundingClientRect();
    startDrag(e.clientX, rect.width);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // leave empty; we use document-level listeners for robustness
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {}
    _endDrag();
  };
  return (
    <div className="sticky top-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[12px] font-bold text-slate-400 mono uppercase tracking-[0.3em]">
            {productionWorkflowLabel}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-cyan-600 rounded-sm"></div>
              <span className="text-[12px] mono text-slate-400 uppercase">{workLabel}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-900/60 rounded-sm"></div>
              <span className="text-[12px] mono text-slate-400 uppercase">{coldLabel}</span>
            </div>
            <span className="text-[12px] mono text-slate-400 border-l border-slate-800 pl-4 ml-2">
              <span className="text-slate-200">
                {sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {' — '}
              <span className="text-slate-200">
                {sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </span>
          </div>
        </div>

        <div className="relative p-1">
          {/* Main Process Blocks */}
          <div className="relative h-14 flex w-full bg-slate-950/50 rounded-lg border border-slate-800/50 overflow-hidden shadow-inner">
            {scheduleWithTimes.map((step) => {
              const width = (step.min / totalProcessMins) * 100;
              return (
                <div
                  key={step.type}
                  style={{ width: `${width}%` }}
                  onClick={() => setIsPopupOpen(true)}
                  className={`h-full first:rounded-l last:rounded-r relative flex flex-col justify-center items-center px-0.5 transition-colors duration-700 border-r border-slate-950/20 cursor-pointer hover:brightness-110
                    ${step.active
                      ? 'bg-cyan-600/80 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]'
                      : step.cold
                        ? 'bg-blue-900/50 shadow-[inset_0_0_15px_rgba(30,58,138,0.2)]'
                        : 'bg-slate-800/60'
                    }
                  `}
                >
                  <span
                    className={`text-[9px] md:text-[12px] mono font-bold uppercase truncate max-w-full tracking-tighter ${step.active ? 'text-white' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Step Times Popup - rendered via portal to escape sticky container */}
          {isPopupOpen && createPortal(
            <div 
              className="fixed inset-0 bg-slate-950 z-50 flex flex-col"
            >
              <div 
                className="flex-1 overflow-auto"
              >
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-200 mono uppercase tracking-wider">
                    {translateFn('scheduleDetails')}
                  </h3>
                  <Button
                    onClick={() => setIsPopupOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-2xl leading-none w-8 h-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="p-6 space-y-3">
                  {scheduleWithTimes.map((step) => (
                    <div 
                      key={step.type}
                      className={`p-4 rounded-lg border ${
                        step.active 
                          ? 'bg-cyan-600/10 border-cyan-600/30' 
                          : step.cold 
                          ? 'bg-blue-900/10 border-blue-900/30' 
                          : 'bg-slate-800/30 border-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-bold uppercase text-sm tracking-wider ${
                          step.active ? 'text-cyan-400' : step.cold ? 'text-blue-400' : 'text-slate-300'
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-slate-400 text-xs mono">
                          {step.min} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mono">
                        <span className="text-slate-200">{step.startStr}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-200">{step.endStr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Hourly Scale */}
          <div
            className="relative h-8 mt-2 w-full cursor-ew-resize overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ touchAction: 'pan-y', cursor: 'ew-resize' }}
          >
            {extendedMarkers.map((marker, i) => {
              // Apply scroll offset: dragging right should shift markers right
              const offsetPercent = (scrollOffset / totalProcessMins) * 100;
              const adjustedLeft = marker.position + offsetPercent;
              
              return (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${adjustedLeft}%` }}
                >
                  <div className="w-[1px] h-2 bg-slate-700 transition-colors" />
                  {shouldShowLabel(marker.label) && (
                    <span className="mt-1 text-[12px] md:text-[12px] mono text-slate-400 font-medium transition-colors">
                      {marker.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
