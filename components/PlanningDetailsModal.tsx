import React from 'react';
import { createPortal } from 'react-dom';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import { formatMinutesDisplay } from '../utils/coldFermentationUtils';
import { useLanguage } from './LanguageContext';

interface PlanningDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleWithTimes: ScheduleStep[];
  totalProcessMins: number;
}

const PlanningDetailsModal: React.FC<PlanningDetailsModalProps> = ({ isOpen, onClose, scheduleWithTimes, totalProcessMins }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any);
      return () => document.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [isOpen]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <svg 
              className="w-6 h-6 text-blue-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-200 tracking-wide">
              {t('scheduleDetails')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-3xl leading-none w-10 h-10 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center"
            aria-label={t('close')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {scheduleWithTimes.map((step) => (
              <div key={step.type} className={`p-4 rounded-lg border ${step.active ? 'bg-cyan-600/10 border-cyan-600/30' : step.cold ? 'bg-blue-900/10 border-blue-900/30' : 'bg-slate-800/30 border-slate-700/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-base tracking-wider ${step.active ? 'text-cyan-400' : step.cold ? 'text-blue-400' : 'text-slate-300'}`}>{step.label}</span>
                  <span className="text-slate-400 text-base mono">{formatMinutesDisplay(step.min)}</span>
                </div>
                <div className="flex items-center space-x-2 text-base mono">
                  <span className="text-slate-200">{step.startStr}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-200">{step.endStr}</span>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-600/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base tracking-wider text-slate-200">{t('totalDuration')}</span>
                <span className="text-slate-400 text-base mono">{formatMinutesDisplay(totalProcessMins)}</span>
              </div>
              <div className="flex items-center space-x-2 text-base mono">
                <span className="text-slate-200">{scheduleWithTimes[0].startStr}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-200">{scheduleWithTimes[scheduleWithTimes.length - 1].endStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PlanningDetailsModal;
