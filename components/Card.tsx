import React from 'react';

type CardVariant = 'default' | 'highlight' | 'subtle' | 'glass';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-slate-950/60 border border-slate-800',
  highlight: 'bg-slate-800/50 border border-slate-700 shadow-2xl',
  subtle: 'bg-slate-800/30 border border-slate-700',
  glass: 'bg-slate-950/80 backdrop-blur-sm border border-slate-800'
};

export const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  className = '', 
  children, 
  ...props 
}) => {
  const baseStyles = 'rounded-2xl p-6';
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
