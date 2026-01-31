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
}

export const Slider: React.FC<SliderProps> = ({ min = 0, max = 100, step = 1, value, onChange, className = '', accent = '', ariaLabel }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-700 ${accent} ${className}`}
    />
  );
};

export default Slider;
