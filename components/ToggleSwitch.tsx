import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
  readOnly?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, className = '', readOnly = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={readOnly}
      onClick={() => { if (!readOnly) onChange(!checked); }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${readOnly ? 'opacity-60 cursor-not-allowed' : 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500'} ${checked ? 'bg-emerald-500' : 'bg-slate-700'} ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
};

export default ToggleSwitch;
