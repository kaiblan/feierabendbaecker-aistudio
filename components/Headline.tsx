import React, { useState } from 'react';
import { HelpIcon } from './icons/HelpIcon';
import HelpModal from './HelpModal';
import { useLanguage } from './LanguageContext';

interface HeadlineProps {
  children: React.ReactNode;
  color?: string; // Tailwind text color class, e.g. 'text-primary' or 'text-slate-400'
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  helpKey?: string;
}

const Headline: React.FC<HeadlineProps> = ({ children, color = 'text-slate-400', className = '', as = 'h3', helpKey }) => {
  const Tag = as as any;
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { t } = useLanguage();
  
  return (
    <>
      <Tag className={`text-base font-bold tracking-widest ${color} ${className} flex items-center gap-3`.trim()}>
        {children}
        {helpKey && (
          <HelpIcon onClick={() => setIsHelpOpen(true)} />
        )}
      </Tag>
      {helpKey && (
        <HelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title={t(`${helpKey}_title`)}
          content={t(`${helpKey}_content`)}
        />
      )}
    </>
  );
};

export default Headline;
