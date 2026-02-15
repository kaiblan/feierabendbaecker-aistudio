import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import Headline from './Headline';
import { useLanguage } from './LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  isDangerous?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isDangerous = false
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Headline color="text-slate-200" className="text-lg tracking-wider">
              {title}
            </Headline>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-2xl leading-none w-8 h-8 rounded transition-colors"
              aria-label={t('close')}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-700 px-6 py-4 flex justify-end space-x-4">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={handleConfirm}
            className={isDangerous ? 'bg-red-600 hover:bg-red-500 shadow-red-900/40' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
