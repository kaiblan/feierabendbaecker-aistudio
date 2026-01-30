import React from 'react';
import { Language } from '../constants';
import { useLanguage } from './LanguageContext';

interface LanguageSelectorProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  size?: 'sm' | 'md';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  language: languageProp,
  onLanguageChange: onChangeProp,
  size = 'md'
}) => {
  const ctx = (() => {
    try { return useLanguage(); } catch { return undefined as any; }
  })();

  const language = languageProp ?? ctx?.language ?? 'en';
  const onLanguageChange = onChangeProp ?? ctx?.setLanguage ?? (() => {});

  const sizeStyles = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1';
  
  return (
    <div className="bg-slate-950 p-1 rounded-lg flex border border-slate-800">
      <button 
        onClick={() => onLanguageChange('en')} 
        className={`${sizeStyles} rounded text-xs font-bold transition-all ${
          language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400'
        }`}
      >
        EN
      </button>
      <button 
        onClick={() => onLanguageChange('de')} 
        className={`${sizeStyles} rounded text-xs font-bold transition-all ${
          language === 'de' ? 'bg-slate-700 text-white' : 'text-slate-400'
        }`}
      >
        DE
      </button>
    </div>
  );
};
