import React from 'react';
import { Card } from './Card';
import { useLanguage } from './LanguageContext';
import { useHistory } from '../hooks/useHistory';
import { ICONS } from '../constants';
import Headline from './Headline';
import HistoryCard from './HistoryCard';

const HistoryTab: React.FC = () => {
  const { t } = useLanguage();
  const { history, updateName, updateNotes, deleteEntry } = useHistory();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <Card variant="default">
        <Headline as="h2" color="text-white" className="text-xl">
          {t('history')}
        </Headline>
      </Card>

      {/* Empty State or History List */}
      {history.length === 0 ? (
        <Card variant="glass" className="text-center py-12">
          <ICONS.History />
          <h3 className="text-xl text-slate-400 mb-2 mt-4">
            {t('noHistoryYet')}
          </h3>
          <p className="text-slate-500">
            {t('noHistoryDescription')}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onUpdateName={updateName}
              onUpdateNotes={updateNotes}
              onDelete={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
