
import React from 'react';
import { Stage } from '../types';
import { formatDateAsTime, addMinutesToDate } from '../utils/timeUtils';
import { useLanguage } from './LanguageContext';

interface TimelineProps {
  stages: Stage[];
  activeIndex: number;
  orientation: 'horizontal' | 'vertical';
  onSelectStage?: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ stages, activeIndex, orientation, onSelectStage }) => {
  const { t } = useLanguage();
  return (
    <div className={`flex ${orientation === 'horizontal' ? 'flex-row overflow-x-auto h-24 items-center px-4 space-x-2' : 'flex-col space-y-4 px-2'} border-slate-700 bg-slate-950/50 backdrop-blur-sm`}>
      {stages.map((stage, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = stage.completed;
        const isPast = idx < activeIndex;

        return (
          <button
            key={stage.id}
            onClick={() => onSelectStage?.(idx)}
            className={`flex-shrink-0 transition-all duration-300 relative rounded-md border p-3 flex flex-col justify-center
              cursor-default
              ${isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'}
              ${orientation === 'horizontal' ? 'w-48 h-20' : 'w-full'}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              {isCompleted && <span className="text-emerald-500 text-[12px] mono">DONE</span>}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>{stage.label}</span>
            </div>

            <div className="flex justify-between items-end mt-2 text-[12px] mono text-slate-400">
              <div className="text-left">
                {stage.durationMinutes} MINS
              </div>
              <div className="text-right">
                {(() => {
                  // Prefer explicit stageEndTime, otherwise derive from startTime + duration
                  const end = stage.stageEndTime ?? (stage.startTime ? addMinutesToDate(new Date(stage.startTime), stage.durationMinutes) : null);
                  return end ? `${t('until')} ${formatDateAsTime(new Date(end))}` : '';
                })()}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default Timeline;
