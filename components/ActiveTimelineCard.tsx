import React from 'react';
import { Stage } from '../types';
import { formatDateAsTime, addMinutesToDate } from '../utils/timeUtils';
import { useLanguage } from './LanguageContext';

interface ActiveTimelineCardProps {
  stage: Stage;
  isActive: boolean;
  isCompleted: boolean;
  orientation: 'horizontal' | 'vertical';
}

const ActiveTimelineCard: React.FC<ActiveTimelineCardProps> = ({ stage, isActive, isCompleted, orientation }) => {
  const { t } = useLanguage();

  const end = stage.stageEndTime ?? (stage.startTime ? addMinutesToDate(new Date(stage.startTime), stage.durationMinutes) : null);

  return (
    <div className={`flex-shrink-0 transition-all duration-300 relative rounded-md border p-3 flex flex-col justify-center
              ${isActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/60'}
              ${orientation === 'horizontal' ? 'w-48 h-20' : 'w-full'}`}>
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
          {end ? `${t('until')} ${formatDateAsTime(new Date(end))}` : ''}
        </div>
      </div>
    </div>
  );
};

export default ActiveTimelineCard;
