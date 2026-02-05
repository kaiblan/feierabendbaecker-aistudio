/**
 * PlanningTimeline - renamed from ProductionTimeline
 */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import { formatDateAsTime } from '../utils/timeUtils';
import PlanningDetailsModal from './PlanningDetailsModal';
import { useLanguage } from './LanguageContext';
import Headline from './Headline';
import { Button } from './Button';

interface PlanningTimelineProps {
  scheduleWithTimes: ScheduleStep[];
  sessionStartTime: Date;
  sessionEndTime: Date;
  hourlyMarkers: Array<{ label: string; position: number }>;
  totalProcessMins: number;
  workLabel: string;
  coldLabel: string;
  productionWorkflowLabel: string;
  planningMode: 'forward' | 'backward';
  translateFn?: (key: string) => string;
  onShiftMinutes?: (minutes: number, baseStart: Date) => void;
}

export const PlanningTimeline: React.FC<PlanningTimelineProps> = ({
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
  const { t } = (() => {
    try { return useLanguage(); } catch { return { t: translateFn ?? ((k: string) => k) }; }
  })();
  const [scrollOffset, setScrollOffset] = useState<number>(0);
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

  // ... rest of the original ProductionTimeline logic kept unchanged ...
  const labelsToShow = new Set<number>();
  const allowedSteps = [1,2,3,4,6,8,12];
  const parseHour = (label: string) => { const parts = label.split(':'); const h = parseInt(parts[0],10); return Number.isFinite(h) ? h : null; };
  let chosenStep = 1;
  for (const step of allowedSteps) {
    let count = 0;
    for (let i = 0; i < hourlyMarkers.length; i++) {
      const hour = parseHour(hourlyMarkers[i].label);
      if (hour === null) continue;
      if (hour % step === 0) count++;
    }
    const includeExtras = (count === 0 ? 2 : 0);
    if (count + includeExtras <= maxLabels) { chosenStep = step; break; }
  }
  for (let i = 0; i < hourlyMarkers.length; i++) {
    const hour = parseHour(hourlyMarkers[i].label);
    if (hour !== null && hour % chosenStep === 0) labelsToShow.add(i);
  }
  labelsToShow.add(0);
  labelsToShow.add(hourlyMarkers.length - 1);
  const shouldShowLabel = (label: string) => { const hour = parseHour(label); return hour !== null && hour % chosenStep === 0; };

  const extendedMarkers = useMemo<Array<{ label: string; position: number }>>(() => {
    if (!sessionStartTime || !sessionEndTime || totalProcessMins <= 0) return [];
    const bufferHours = Math.ceil(Math.abs(scrollOffset) / 60) + 2;
    const bufferMins = bufferHours * 60;
    const start = new Date(sessionStartTime.getTime() - bufferMins * 60000);
    start.setMinutes(0,0,0);
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

  const draggingRef = useRef<{ active: boolean; startX: number; width: number; initialOffset: number }>({ active: false, startX: 0, width: 0, initialOffset: 0 });

  const _endDrag = () => {
    if (!draggingRef.current.active) return;
    draggingRef.current.active = false;
    const finalOffset = scrollOffset;
    if (finalOffset !== 0 && onShiftMinutes) { onShiftMinutes(-finalOffset, sessionStartTime); setScrollOffset(0); }
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
    draggingRef.current = { active: true, startX: clientX, width: containerWidth, initialOffset: scrollOffset };
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onDocMouseMove);
    window.addEventListener('mouseup', onDocMouseUp);
    window.addEventListener('touchmove', onDocTouchMove, { passive: true });
    window.addEventListener('touchend', onDocTouchEnd);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => { const el = e.currentTarget as HTMLDivElement; try { el.setPointerCapture(e.pointerId); } catch {} const rect = el.getBoundingClientRect(); startDrag(e.clientX, rect.width); };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {};
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => { try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {} _endDrag(); };

  return (
    <div className="sticky top-0 bg-slate-900 backdrop-blur-xl border-b border-slate-800 shadow-lg z-40 px-4 md:px-8 pt-6 pb-4">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <Headline color="text-slate-400">{productionWorkflowLabel}</Headline>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-cyan-500 rounded-sm"></div>
              <span className="text-sm mono text-slate-400">{workLabel}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-800/70 rounded-sm"></div>
              <span className="text-sm mono text-slate-400">{coldLabel}</span>
            </div>
            <span className="text-sm mono text-slate-400 border-l border-slate-700 pl-4 ml-2">
              <span className="text-slate-100">{sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {' — '}
              <span className="text-slate-100">{sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
        </div>

        <div className="relative p-1">
          <div className="relative h-14 flex w-full bg-slate-950/60 rounded-lg border border-slate-700/50 overflow-hidden shadow-inner">
            {scheduleWithTimes.map((step) => {
              const width = (step.min / totalProcessMins) * 100;
              return (
                <div key={step.type} style={{ width: `${width}%` }} onClick={() => setIsPopupOpen(true)} className={`h-full first:rounded-l last:rounded-r relative flex flex-col justify-center items-center px-0.5 transition-colors duration-700 border-r border-slate-950/20 cursor-pointer hover:brightness-110 ${step.active ? 'bg-cyan-600/80 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]' : step.cold ? 'bg-blue-900/50 shadow-[inset_0_0_15px_rgba(30,58,138,0.2)]' : 'bg-slate-800/60'}`}>
                  <span className={`text-xs md:text-sm mono font-bold truncate max-w-full tracking-tighter ${step.active ? 'text-white' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {isPopupOpen && (
            <PlanningDetailsModal
              isOpen={isPopupOpen}
              onClose={() => setIsPopupOpen(false)}
              scheduleWithTimes={scheduleWithTimes}
              totalProcessMins={totalProcessMins}
            />
          )}

          <div className="relative h-10 mt-2 w-full cursor-ew-resize overflow-hidden" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={{ touchAction: 'pan-y', cursor: 'ew-resize' }}>
            {extendedMarkers.map((marker, i) => {
              const offsetPercent = (scrollOffset / totalProcessMins) * 100;
              const adjustedLeft = marker.position + offsetPercent;
              return (
                <div key={i} className="absolute top-0 flex flex-col items-center -translate-x-1/2" style={{ left: `${adjustedLeft}%` }}>
                  <div className="w-[1px] h-2 bg-slate-700 transition-colors" />
                  {shouldShowLabel(marker.label) && (
                    <span className="mt-1 text-sm md:text-sm mono text-slate-400 font-medium transition-colors">{marker.label}</span>
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
