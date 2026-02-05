import React from 'react';

interface HeadlineProps {
  children: React.ReactNode;
  color?: string; // Tailwind text color class, e.g. 'text-primary' or 'text-slate-400'
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const Headline: React.FC<HeadlineProps> = ({ children, color = 'text-slate-400', className = '', as = 'h3' }) => {
  const Tag = as as any;
  return (
    <Tag className={`text-base font-bold mono uppercase tracking-widest ${color} ${className}`.trim()}>
      {children}
    </Tag>
  );
};

export default Headline;
