import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shimmer?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'group relative px-10 md:px-16 py-4 text-white font-bold bg-cyan-600 hover:bg-cyan-500 shadow-2xl active:scale-95 flex items-center space-x-6 overflow-hidden z-10 shadow-cyan-900/40 tracking-[0.2em]',
  secondary: 'px-8 md:px-12 py-4 text-slate-300 font-bold border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 active:scale-95 active:bg-slate-800/60 active:border-slate-600 tracking-[0.2em]',
  ghost: 'text-muted hover:text-white hover:bg-slate-800',
  outline: 'border border-surface text-muted hover:border-slate-600 hover:bg-slate-900'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-s',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-4 text-base'
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  disabled,
  shimmer = false,
  ...props 
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const disabledStyles = disabled ? 'bg-surface text-muted hover:bg-surface shadow-none' : '';
  
  return (
    <button
      className={`${baseStyles} ${disabledStyles || variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
      )}
      {children}
    </button>
  );
};
