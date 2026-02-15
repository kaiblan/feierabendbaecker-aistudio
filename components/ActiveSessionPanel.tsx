import React from 'react';
import { BakerSession } from '../types';
import { useLanguage } from './LanguageContext';
import LockIcon from './icons/LockIcon';

interface Props {
  session: BakerSession;
  activeTab: 'planning' | 'active' | 'history' | 'settings';
  setActiveTab?: (tab: 'planning' | 'active' | 'history' | 'settings') => void;
  secondaryTab?: 'timing' | 'amounts';
}
const ActiveSessionPanel: React.FC<Props> = ({ session, activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  if (session.status !== 'active') return null;

  // Only show on the planning screens (timing + amounts)
  if (activeTab !== 'planning') return null;

  const handleClick = () => {
    if (setActiveTab) setActiveTab('active');
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="lg:hidden fixed left-0 right-0 bottom-16 z-60 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          role={setActiveTab ? 'button' : undefined}
          tabIndex={setActiveTab ? 0 : undefined}
          onClick={setActiveTab ? handleClick : undefined}
          onKeyDown={setActiveTab ? handleKeyDown : undefined}
          className={`rounded-lg bg-slate-700 border border-slate-600 text-amber-300 px-3 py-2 text-md flex items-center justify-center ${setActiveTab ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center">
            <LockIcon className="w-5 h-5 text-amber-300 flex-shrink-0" aria-hidden />
            <span className="ml-2">{t('parametersLocked')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionPanel;
