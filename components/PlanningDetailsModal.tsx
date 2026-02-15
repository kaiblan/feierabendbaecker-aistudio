import React from 'react';
import { ScheduleStep } from '../hooks/useBakeSchedule';
import { formatMinutesDisplay } from '../utils/coldFermentationUtils';
import { useLanguage } from './LanguageContext';
import Modal from './Modal';

interface PlanningDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleWithTimes: ScheduleStep[];
  totalProcessMins: number;
}

const PlanningDetailsModal: React.FC<PlanningDetailsModalProps> = ({ isOpen, onClose, scheduleWithTimes, totalProcessMins }) => {
  const { t } = useLanguage();

  const icon = (
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
  );

  const footer = (
    <button
      onClick={onClose}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
    >
      {t('close')}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('scheduleDetails')}
      icon={icon}
      footer={footer}
    >
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
    </Modal>
  );
};

export default PlanningDetailsModal;
