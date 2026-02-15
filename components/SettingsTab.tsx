import React from 'react';
import { Card } from './Card';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from './LanguageContext';
import Headline from './Headline';

const SettingsTab: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-24">
      <Card variant="default" className="p-6">
        <Headline as="h2" color="text-white" className="text-xl mb-2" helpKey="help_settings">{t('settings')}</Headline>
        <p className="text-sm text-slate-400 mb-4">{t('appSettingsDescription') || 'Application settings'}</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-2">{t('language')}</label>
            <LanguageSelector />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsTab;
