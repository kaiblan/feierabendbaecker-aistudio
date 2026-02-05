import React from 'react';
import { createPortal } from 'react-dom';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import Headline from './Headline';
import { Button } from './Button';
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

  return createPortal(
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Headline color="text-slate-200" className="text-lg tracking-wider">{t('scheduleDetails')}</Headline>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-2xl leading-none w-8 h-8 p-0">×</Button>
          </div>
        </div>
        <div className="p-6 space-y-3">
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
        </div>
        <div className={`px-10 rounded-lg border'}`}>
            <div className="flex items-center justify-between mb-2">
            <span className={`font-bold text-base tracking-wider`}>{t('totalDuration')}</span>
            <span className="text-slate-400 text-base mono">{formatMinutesDisplay(totalProcessMins)}</span>
            </div>
            <div className="flex items-center space-x-2 text-base mono">
            <span className="text-slate-200">{scheduleWithTimes[0].startStr}</span>
            <span className="text-slate-500">→</span>
            <span className="text-slate-200">{scheduleWithTimes[scheduleWithTimes.length - 1].endStr}</span>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PlanningDetailsModal;
