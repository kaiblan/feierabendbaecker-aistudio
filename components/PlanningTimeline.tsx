/**
 * PlanningTimeline - renamed from ProductionTimeline
 */
import React, { useState } from 'react';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import { useTimelineMarkers } from '../hooks/useTimelineMarkers';
import { useDragToAdjust } from '../hooks/useDragToAdjust';
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
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Use drag-to-adjust hook for timeline manipulation
  const { scrollOffset, handlePointerDown, handlePointerMove, handlePointerUp } = useDragToAdjust({
    totalProcessMins,
    sessionStartTime,
    onShiftMinutes,
  });

  // Use timeline markers hook for label filtering and extended markers
  const { extendedMarkers, shouldShowLabel } = useTimelineMarkers({
    sessionStartTime,
    sessionEndTime,
    totalProcessMins,
    scrollOffset,
  });

  return (
    <div className="sticky top-0 bg-slate-900 backdrop-blur-xl border-b border-slate-800 shadow-lg z-40 px-4 md:px-8 pt-6 ">
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
