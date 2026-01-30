import React, { createContext, useContext } from 'react';
import { TRANSLATIONS, Language } from '../constants';

type LanguageContextValue = {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
};

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageContext.Provider');
  return ctx;
};

export const createTranslator = (language: Language) => (key: string) => TRANSLATIONS[language][key as keyof typeof TRANSLATIONS.en] || key;

export default LanguageContext;
