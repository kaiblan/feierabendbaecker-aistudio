import React from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from './LanguageContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown as any);
      return () => document.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [isOpen]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 px-6 py-4 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-3">
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <h2 className="text-xl font-bold text-slate-200 tracking-wide">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-3xl leading-none w-10 h-10 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center"
            aria-label={t('close')}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="text-slate-300 text-base leading-relaxed space-y-4 whitespace-pre-line">
            {content}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HelpModal;
