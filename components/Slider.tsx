import React from 'react';
import LockIcon from './icons/LockIcon';
import './Slider.css';

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

  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div className={`relative flex items-center py-2 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel}
        disabled={readOnly}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`custom-range ${base} ${accentClass} block`}
      />

      {/* Custom thumb rendered via HTML/CSS. pointer-events-none so input receives clicks. */}
      <div
        className="pointer-events-none absolute top-1/2"
        style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
      >
        {readOnly ? (
          <LockIcon className="w-5 h-5 text-slate-300" aria-hidden />
        ) : (
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow" />
        )}
      </div>
    </div>
  );
};

export default Slider;
