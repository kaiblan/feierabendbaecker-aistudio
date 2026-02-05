import React from 'react';
import Slider from './Slider';

interface RangeFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: string;
  readOnly?: boolean;
  className?: string;
  valueFormatter?: (v: number) => string;
  valueClassName?: string;
  ariaLabel?: string;
}

const RangeField: React.FC<RangeFieldProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  accent = '',
  readOnly = false,
  className = '',
  valueFormatter,
  valueClassName = 'text-emerald-400',
  ariaLabel,
}) => {
  const formatted = valueFormatter ? valueFormatter(value) : Number.isInteger(value) ? `${value}` : `${value}`;

  return (
    <div className={className}>
      <div className="flex justify-between items-end">
        <label className="text-sm text-slate-400 mono">{label}</label>
        <span className={`text-xl font-bold mono tracking-tighter ${valueClassName}`}>{formatted}</span>
      </div>
      <div className="mt-2">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          accent={accent}
          ariaLabel={ariaLabel ?? label}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default RangeField;
