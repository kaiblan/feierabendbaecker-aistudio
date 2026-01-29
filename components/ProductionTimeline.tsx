/**
 * ProductionTimeline - Displays the baking process workflow timeline
 */

import React, { useEffect, useState } from 'react';
import { ScheduleStep } from '../hooks/useBakeSchedule';

interface ProductionTimelineProps {
  scheduleWithTimes: ScheduleStep[];
  sessionStartTime: Date;
  sessionEndTime: Date;
  hourlyMarkers: Array<{ label: string; position: number }>;
  totalProcessMins: number;
  workLabel: string;
  coldLabel: string;
  productionWorkflowLabel: string;
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
}) => {
  const [maxLabels, setMaxLabels] = useState<number>(() => {
    if (typeof window === 'undefined') return 8;
    const w = window.innerWidth;
    if (w < 640) return 4;
    if (w < 1024) return 8;
    return 12;
  });

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 640) setMaxLabels(4);
      else if (w < 1024) setMaxLabels(8);
      else setMaxLabels(12);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const labelStep = Math.max(1, Math.ceil(hourlyMarkers.length / maxLabels));
  return (
    <div className="bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20 px-4 md:px-8 py-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[11px] font-bold text-slate-400 mono uppercase tracking-[0.3em]">
            {productionWorkflowLabel}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-cyan-600 rounded-sm"></div>
              <span className="text-[11px] mono text-slate-400 uppercase">{workLabel}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 bg-blue-900/60 rounded-sm"></div>
              <span className="text-[11px] mono text-slate-400 uppercase">{coldLabel}</span>
            </div>
            <span className="text-[11px] mono text-slate-400 border-l border-slate-800 pl-4 ml-2">
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

        <div className="relative">
          {/* Main Process Blocks */}
          <div className="relative h-14 flex w-full bg-slate-950/50 rounded-lg border border-slate-800/50 p-1 overflow-hidden shadow-inner">
            {scheduleWithTimes.map((step, i) => {
              const width = (step.min / totalProcessMins) * 100;
              return (
                <div
                  key={i}
                  style={{ width: `${width}%` }}
                  className={`h-full first:rounded-l last:rounded-r relative flex flex-col justify-center items-center px-0.5 transition-all duration-700 border-r border-slate-950/20
                    ${
                      step.active
                        ? 'bg-cyan-600/80 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]'
                        : step.cold
                          ? 'bg-blue-900/50 shadow-[inset_0_0_15px_rgba(30,58,138,0.2)]'
                          : 'bg-slate-800/60'
                    }
                  `}
                >
                  <span
                    className={`text-[9px] md:text-[11px] mono font-bold uppercase truncate max-w-full tracking-tighter ${step.active ? 'text-white' : 'text-slate-400'}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
            {/* Finished indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" title="Finished" />
          </div>

          {/* Hourly Scale */}
          <div className="relative h-8 mt-2 w-full">
            {hourlyMarkers.map((marker, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2 group"
                style={{ left: `${marker.position}%` }}
              >
                <div className="w-[1px] h-2 bg-slate-700 group-hover:bg-slate-400 transition-colors" />
                {(i % labelStep === 0 || i === hourlyMarkers.length - 1) && (
                  <span className="mt-1 text-[10px] md:text-[11px] mono text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    {marker.label}
                  </span>
                )}
              </div>
            ))}

            {/* Start/End explicit markers if they aren't on top of hourly ones */}
            <div className="absolute top-0 left-0 flex flex-col items-center -translate-x-1/2">
              <div className="w-[1px] h-3 bg-cyan-500" />
              <span className="mt-1 text-[11px] mono text-cyan-400 font-bold">START</span>
            </div>
            <div className="absolute top-0 left-[100%] flex flex-col items-center -translate-x-1/2">
              <div className="w-[1px] h-3 bg-emerald-500" />
              <span className="mt-1 text-[11px] mono text-emerald-400 font-bold">END</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
