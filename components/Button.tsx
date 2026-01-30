import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  ghost: 'text-slate-400 hover:text-white hover:bg-slate-800',
  outline: 'border border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-4 text-base'
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  disabled,
  ...props 
}) => {
  const baseStyles = 'font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  const disabledStyles = disabled ? 'bg-slate-800 text-slate-400 hover:bg-slate-800 shadow-none' : '';
  
  return (
    <button
      className={`${baseStyles} ${disabledStyles || variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
