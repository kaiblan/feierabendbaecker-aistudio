import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:brightness-110 shadow-lg',
  secondary: 'bg-surface text-white hover:bg-slate-600',
  ghost: 'text-muted hover:text-white hover:bg-slate-800',
  outline: 'border border-surface text-muted hover:border-slate-600 hover:bg-slate-900'
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
  const disabledStyles = disabled ? 'bg-surface text-muted hover:bg-surface shadow-none' : '';
  
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
