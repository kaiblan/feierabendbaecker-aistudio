import React from 'react';
import { ICONS } from '../constants';
import { useLanguage } from './LanguageContext';

type PrimaryTab = 'planning' | 'active' | 'history' | 'settings';

interface NavigationProps {
  activeTab: PrimaryTab;
  setActiveTab: (tab: PrimaryTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  return (
    <nav className="hidden lg:flex flex-col w-20 border-r border-slate-800 bg-slate-950/50 py-8 items-center space-y-12">
      <div className="w-10 h-10 bg-cyan-600 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-900/50">F</div>
      <div className="flex flex-col space-y-8">
        {(['planning', 'active', 'history', 'settings'] as PrimaryTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            title={t(tab)}
            className={`p-3 rounded-xl transition-all ${activeTab === tab ? 'text-cyan-400 bg-cyan-400/10 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab === 'planning' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
            {tab === 'active' && <ICONS.Active />}
            {tab === 'history' && <ICONS.History />}
            {tab === 'settings' && <ICONS.Settings />}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
