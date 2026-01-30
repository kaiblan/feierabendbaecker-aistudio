
import React from 'react';
import { Stage } from '../types';

interface TimelineProps {
  stages: Stage[];
  activeIndex: number;
  orientation: 'horizontal' | 'vertical';
  onSelectStage: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ stages, activeIndex, orientation, onSelectStage }) => {
  return (
    <div className={`flex ${orientation === 'horizontal' ? 'flex-row overflow-x-auto h-24 items-center px-4 space-x-2' : 'flex-col space-y-4 px-2'} border-slate-700 bg-slate-950/50 backdrop-blur-sm`}>
      {stages.map((stage, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = stage.completed;
        const isPast = idx < activeIndex;

        return (
          <button
            key={stage.id}
            onClick={() => onSelectStage(idx)}
            className={`flex-shrink-0 transition-all duration-300 relative rounded-md border p-3 flex flex-col justify-center
              ${isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'}
              ${orientation === 'horizontal' ? 'w-48 h-16' : 'w-full'}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[12px] mono font-bold uppercase tracking-wider ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                {stage.type.replace('_', ' ')}
              </span>
              {isCompleted && <span className="text-emerald-500 text-[12px] mono">DONE</span>}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>{stage.label}</span>
            </div>
            <div className="text-[12px] mono text-slate-400 mt-1">
              {stage.durationMinutes} MINS
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default Timeline;
