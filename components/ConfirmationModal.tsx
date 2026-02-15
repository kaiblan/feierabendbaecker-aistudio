import React from 'react';
import { Button } from './Button';
import { useLanguage } from './LanguageContext';
import Modal from './Modal';

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

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
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
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">
        {message}
      </p>
    </Modal>
  );
};

export default ConfirmationModal;
