
import React from 'react';
import { Stage } from '../types';

interface StageDetailProps {
  stage: Stage;
  onUpdate: (updates: Partial<Stage>) => void;
}

const StageDetail: React.FC<StageDetailProps> = ({ stage, onUpdate }) => {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-xl font-bold text-slate-100">{stage.label}</h2>
        <p className="text-sm text-slate-400 mono uppercase tracking-tight">{stage.type}</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <label className="text-[11px] text-slate-400 mono block mb-1">TARGET DURATION</label>
          <div className="flex items-center">
            <input 
              type="number" 
              value={stage.durationMinutes}
              onChange={(e) => onUpdate({ durationMinutes: parseInt(e.target.value) || 0 })}
              className="bg-transparent text-xl font-bold text-cyan-400 w-full outline-none"
            />
            <span className="text-xs text-slate-400 ml-1">MIN</span>
          </div>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <label className="text-[11px] text-slate-400 mono block mb-1">TEMPERATURE (°C)</label>
          <input 
            type="number" 
            placeholder="--"
            className="bg-transparent text-xl font-bold text-emerald-400 w-full outline-none"
          />
        </div>
      </section>

      <section>
        <label className="text-[11px] text-slate-400 mono block mb-2">OBSERVATIONS & PARAMETERS</label>
        <textarea
          placeholder="Enter dough elasticity, extensibility, gas retention..."
          className="w-full h-32 bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-cyan-500 outline-none resize-none"
          value={stage.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
        />
      </section>

      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={() => onUpdate({ completed: !stage.completed })}
          className={`w-full py-4 rounded-lg font-bold transition-all ${stage.completed ? 'bg-slate-800 text-slate-400' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-900/20'}`}
        >
          {stage.completed ? 'RE-OPEN STAGE' : 'COMPLETE STAGE'}
        </button>
      </div>
    </div>
  );
};

export default StageDetail;
