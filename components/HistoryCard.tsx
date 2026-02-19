import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { Card } from './Card';
import { Button } from './Button';
import { useLanguage } from './LanguageContext';
import ConfirmationModal from './ConfirmationModal';

interface HistoryCardProps {
  entry: HistoryEntry;
  onUpdateName: (id: string, name: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({
  entry,
  onUpdateName,
  onUpdateNotes,
  onDelete,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(entry.name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedNotes, setEditedNotes] = useState(entry.notes);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSaveName = () => {
    onUpdateName(entry.id, editedName);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(entry.name);
    setIsEditing(false);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(entry.id, editedNotes);
  };

  const handleDelete = () => {
    onDelete(entry.id);
    setShowDeleteModal(false);
  };

  // Tag pills for optional steps
  const optionalSteps = [];
  if (entry.autolyseEnabled) optionalSteps.push(t('autolyse'));
  if (entry.coldBulkEnabled) optionalSteps.push(t('coldBulk'));
  if (entry.coldProofEnabled) optionalSteps.push(t('coldProof'));

  return (
    <>
      <Card variant="subtle" className="relative">
        {/* Header Row: Name + Action Buttons */}
        <div className="flex items-start justify-between mb-3">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                onBlur={handleSaveName}
                autoFocus
                className="flex-1 bg-slate-900 border border-cyan-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder={t('unnamed')}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3
                onClick={() => setIsEditing(true)}
                className="text-lg font-semibold text-slate-100 cursor-pointer hover:text-cyan-400 transition-colors"
              >
                {entry.name || t('unnamed')}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-cyan-400 transition-colors"
                title={t('editName')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-slate-500 hover:text-red-400 transition-colors ml-2"
            title={t('deleteEntry')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Date/Time Display */}
        <div className="text-sm text-slate-400 mb-2">
          {entry.endTime ? (
            <span>{formatDate(entry.startTime)} - {formatDate(entry.endTime)}</span>
          ) : (
            <span>{t('started')}: {formatDate(entry.startTime)}</span>
          )}
        </div>

        {/* Duration + Status Badge */}
        <div className="flex items-center gap-3 mb-3">
          {entry.totalDurationMinutes && (
            <span className="text-sm text-slate-300">
              {t('duration')}: {formatDuration(entry.totalDurationMinutes)}
            </span>
          )}

          {entry.status === 'in-progress' && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300">
              {t('inProgress')}
            </span>
          )}
        </div>

        {/* Tag Pills for Optional Steps */}
        {optionalSteps.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {optionalSteps.map((step) => (
              <span
                key={step}
                className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
              >
                {step}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Details Section */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 mb-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t('details')}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
            {/* Recipe Details */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('recipe')}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                <div>{t('flour')}: {entry.flourGrams}g</div>
                <div>{t('water')}: {entry.waterGrams}g</div>
                <div>{t('salt')}: {entry.saltGrams}g</div>
                <div>{t('yeast')}: {entry.starterGrams}g</div>
              </div>
            </div>

            {/* Temperature Details */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('temperature')}</h4>
              <div className="text-sm text-slate-400">
                {t('room')}: {entry.roomTemp}°C
                {entry.fridgeTemp && ` | ${t('fridge')}: ${entry.fridgeTemp}°C`}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">{t('notes')}</h4>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                onBlur={handleSaveNotes}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm min-h-[80px]"
                placeholder={t('addNotes')}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={t('deleteEntry')}
        message={t('deleteEntryConfirm')}
        confirmText={t('deleteEntry')}
        cancelText={t('close')}
        isDangerous={true}
      />
    </>
  );
};

export default HistoryCard;
