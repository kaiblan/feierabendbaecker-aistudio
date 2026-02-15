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

      {/* Icon positioned to the left, title centered across the full card */}
      <div className="relative w-full">
        {/* Icon left-aligned with cosmetic margin */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          {isCompleted ? (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-accent" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-slate-600'}`} />
          )}
        </div>

        {/* Title centered across the full card, vertically aligned with icon */}
        <div className="h-10 flex items-center justify-center px-6">
          <span className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-muted'}`}>{stage.label}</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-2 text-sm text-muted">
        <div className="text-left">
          {Math.round(stage.durationMinutes || 0)} {t('minuteUnit')}
        </div>
        <div className="text-right">
          {end ? `${t('until')} ${formatDateAsTime(new Date(end))}` : ''}
        </div>
      </div>
    </div>
  );
};

export default ActiveTimelineCard;
