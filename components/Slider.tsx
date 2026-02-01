import React from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  accent?: string; // tailwind accent class like 'accent-cyan-500'
  ariaLabel?: string;
  readOnly?: boolean;
}

export const Slider: React.FC<SliderProps> = ({ min = 0, max = 100, step = 1, value, onChange, className = '', accent = '', ariaLabel, readOnly = false }) => {
  const base = `w-full h-1.5 rounded-lg appearance-none bg-slate-700 ${readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`;
  const accentClass = readOnly ? 'accent-slate-500' : accent;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      disabled={readOnly}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`${base} ${accentClass} ${className}`}
    />
  );
};

export default Slider;
