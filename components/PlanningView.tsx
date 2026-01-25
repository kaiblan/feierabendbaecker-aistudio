import React, { useMemo, useState } from 'react';
import { BakerConfig, Stage, StageType } from '../types';
import { ICONS } from '../constants';

interface PlanningViewProps {
  config: BakerConfig;
  status: 'planning' | 'recipe' | 'active' | 'completed';
  startTimeStr: string;
  onUpdateConfig: (updates: Partial<BakerConfig>) => void;
  onUpdateStartTime: (time: string) => void;
  onStartProcess: () => void;
}

const PlanningView: React.FC<PlanningViewProps> = ({ 
  config, 
  status,
  startTimeStr, 
  onUpdateConfig, 
  onUpdateStartTime,
  onStartProcess 
}) => {
  const [planningMode, setPlanningMode] = useState<'forward' | 'backward'>('forward');

  const { totalProcessMins, bulkMins, proofMins } = useMemo(() => {
    // 0.5% yeast at 24°C = 300m bulk, 180m proof baseline
    const yeastFactor = 0.5 / (config.yeast || 0.05);
    const tempEffect = Math.pow(0.85, (config.targetTemp - 24) / 2);
    
    const bulk = config.coldBulkEnabled ? 720 : Math.round(300 * yeastFactor * tempEffect);
    const proof = config.coldProofEnabled ? 960 : Math.round(180 * yeastFactor * tempEffect);
    
    let total = bulk + proof + 130; 
    if (config.autolyseEnabled) total += 60;
    
    return { bulkMins: bulk, proofMins: proof, totalProcessMins: total };
  }, [config]);

  const { scheduleWithTimes, sessionStartTime, sessionEndTime } = useMemo(() => {
    const [h, m] = startTimeStr.split(':').map(Number);
    const anchorDate = new Date();
    anchorDate.setHours(h, m, 0, 0);

    let start: Date;
    if (planningMode === 'forward') {
      start = anchorDate;
    } else {
      start = new Date(anchorDate.getTime() - totalProcessMins * 60000);
    }

    const steps = [];
    if (config.autolyseEnabled) steps.push({ label: 'Autolyse', min: 60, active: false, cold: false });
    steps.push({ label: 'Mix', min: 15, active: true, cold: false });
    steps.push({ label: 'Folds', min: 45, active: true, cold: false });
    steps.push({ label: config.coldBulkEnabled ? 'Cold Bulk' : 'Bulk', min: bulkMins, active: false, cold: config.coldBulkEnabled });
    steps.push({ label: 'Shape', min: 20, active: true, cold: false });
    steps.push({ label: config.coldProofEnabled ? 'Cold Proof' : 'Proof', min: proofMins, active: false, cold: config.coldProofEnabled });
    steps.push({ label: 'Bake', min: 50, active: true, cold: false });

    let currentCursor = start.getTime();
    const resultSteps = steps.map(step => {
      const stepStart = new Date(currentCursor);
      const stepEnd = new Date(currentCursor + step.min * 60000);
      currentCursor = stepEnd.getTime();
      return {
        ...step,
        startStr: stepStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endStr: stepEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    });

    const end = new Date(currentCursor);

    return { 
      scheduleWithTimes: resultSteps, 
      sessionStartTime: start, 
      sessionEndTime: end 
    };
  }, [config, startTimeStr, planningMode, totalProcessMins, bulkMins, proofMins]);

  // Calculate hourly markers for the scale
  const hourlyMarkers = useMemo(() => {
    const markers = [];
    const start = new Date(sessionStartTime);
    start.setMinutes(0, 0, 0);
    
    // Increment hour until we pass the end time
    let current = new Date(start);
    if (current < sessionStartTime) {
      current.setHours(current.getHours() + 1);
    }

    while (current <= sessionEndTime) {
      const offsetMins = (current.getTime() - sessionStartTime.getTime()) / 60000;
      const position = (offsetMins / totalProcessMins) * 100;
      
      if (position >= 0 && position <= 100) {
        markers.push({
          label: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          position
        });
      }
      current = new Date(current.getTime() + 3600000); // Add 1 hour
    }
    return markers;
  }, [sessionStartTime, sessionEndTime, totalProcessMins]);

  const isRecipeStage = status === 'recipe';

  return (
    <div className="flex flex-col min-h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
        <header className="max-w-7xl mx-auto w-full flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isRecipeStage ? 'Recipe Details' : 'Baking Schedule'}
            </h2>
            <p className="text-slate-400 text-sm">
              {isRecipeStage ? 'Adjust weights for your batch size.' : 'Plan your bake based on timing and temperature.'}
            </p>
          </div>
          <div className="text-right">
              <span className="text-[10px] mono text-slate-500 block uppercase tracking-widest">Total Duration</span>
              <span className="text-2xl font-black text-cyan-400 mono italic">{(totalProcessMins / 60).toFixed(1)}h</span>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-10 gap-6 items-start">
          {!isRecipeStage ? (
            <>
              <section className="order-1 lg:order-3 lg:col-span-2 w-full bg-slate-800/40 border border-slate-700 rounded-2xl p-6 flex flex-col space-y-4">
                <h3 className="text-[10px] font-bold text-emerald-500 mono uppercase tracking-widest border-b border-slate-700 pb-3">Session Timing</h3>
                <div className="bg-slate-900/40 p-1 rounded-lg flex border border-slate-700">
                  <button onClick={() => setPlanningMode('forward')} className={`flex-1 text-[9px] py-1.5 rounded mono uppercase transition-all ${planningMode === 'forward' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Forward</button>
                  <button onClick={() => setPlanningMode('backward')} className={`flex-1 text-[9px] py-1.5 rounded mono uppercase transition-all ${planningMode === 'backward' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Backward</button>
                </div>
                <div className="flex flex-col items-center">
                  <label className="text-[9px] text-slate-500 mono uppercase mb-1">{planningMode === 'forward' ? 'Start Time' : 'Ready Time'}</label>
                  <input type="time" value={startTimeStr} onChange={e => onUpdateStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-2xl font-black text-white text-center mono outline-none focus:border-emerald-500" />
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] mono text-slate-600 uppercase">{planningMode === 'forward' ? 'Ready By' : 'Starts At'}</span>
                      <span className="text-sm font-bold text-emerald-400 mono">{planningMode === 'forward' ? sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </div>
              </section>

              <section className="order-2 lg:order-1 lg:col-span-6 w-full bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-6">
                <h3 className="text-[10px] font-bold text-cyan-500 mono uppercase tracking-widest border-b border-slate-700 pb-3">Basic Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] text-slate-500 mono uppercase">Yeast Percentage</label>
                      <span className="text-xl font-bold text-emerald-400 mono tracking-tighter">{config.yeast.toFixed(2)}%</span>
                    </div>
                    <input type="range" min="0.05" max="5.00" step="0.05" value={config.yeast} onChange={e => onUpdateConfig({yeast: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] text-slate-500 mono uppercase">Dough Temperature</label>
                      <span className="text-xl font-bold text-amber-400 mono tracking-tighter">{config.targetTemp}°C</span>
                    </div>
                    <input type="range" min="18" max="32" step="0.5" value={config.targetTemp} onChange={e => onUpdateConfig({targetTemp: parseFloat(e.target.value)})} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                  </div>
                </div>
              </section>

              <section className="order-3 lg:order-2 lg:col-span-2 w-full bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
                <h3 className="text-[10px] font-bold text-blue-500 mono uppercase tracking-widest border-b border-slate-700 pb-3">Fridge Stages</h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                      <label className="text-xs text-slate-300">Cold Bulk</label>
                      <input type="checkbox" checked={config.coldBulkEnabled} onChange={e => onUpdateConfig({coldBulkEnabled: e.target.checked})} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer" />
                   </div>
                   <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                      <label className="text-xs text-slate-300">Cold Proof</label>
                      <input type="checkbox" checked={config.coldProofEnabled} onChange={e => onUpdateConfig({coldProofEnabled: e.target.checked})} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer" />
                   </div>
                   <div className="pt-1">
                      <label className="text-[9px] text-slate-500 mono uppercase block mb-1">Fridge Temp</label>
                      <div className="flex items-center space-x-2">
                        <input type="number" value={config.fridgeTemp} onChange={e => onUpdateConfig({fridgeTemp: +e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm w-full outline-none focus:border-blue-500 mono" />
                        <span className="text-xs mono text-slate-600">°C</span>
                      </div>
                   </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="lg:col-span-3 w-full bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-slate-400 mono uppercase tracking-widest border-b border-slate-700 pb-3 mb-4">Dough Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] text-slate-500 mono uppercase block mb-1">Total Flour (g)</label>
                    <input type="number" value={config.totalFlour} onChange={e => onUpdateConfig({totalFlour: +e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 mono uppercase block mb-1">Hydration (%)</label>
                    <input type="number" value={config.hydration} onChange={e => onUpdateConfig({hydration: +e.target.value})} className="bg-slate-900 border border-slate-700 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                  </div>
                </div>
              </section>
              <section className="lg:col-span-7 w-full bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-[10px] font-bold text-emerald-500 mono uppercase tracking-widest border-b border-slate-700 pb-3 mb-4">Recipe Components</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-500 mono block uppercase">Flour</span>
                      <span className="text-2xl font-black text-white mono">{config.totalFlour}g</span>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-500 mono block uppercase">Water</span>
                      <span className="text-2xl font-black text-cyan-400 mono">{(config.totalFlour * config.hydration / 100).toFixed(0)}g</span>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-500 mono block uppercase">Yeast ({config.yeast.toFixed(2)}%)</span>
                      <span className="text-2xl font-black text-emerald-400 mono">{(config.totalFlour * config.yeast / 100).toFixed(2)}g</span>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                      <span className="text-[9px] text-slate-500 mono block uppercase">Salt ({config.salt}%)</span>
                      <span className="text-2xl font-black text-amber-400 mono">{(config.totalFlour * config.salt / 100).toFixed(1)}g</span>
                   </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/30 flex justify-between items-center text-xs mono text-slate-500">
                  <span className="uppercase tracking-widest">Total Batch Weight:</span>
                  <span className="text-slate-300 text-lg">{(config.totalFlour * (1 + (config.hydration + config.yeast + config.salt)/100)).toFixed(0)}g</span>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center max-w-7xl mx-auto w-full pt-4">
          <button 
              onClick={onStartProcess} 
              className={`group relative px-10 md:px-16 py-5 md:py-6 text-white font-black rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center space-x-6 overflow-hidden z-10
                  ${isRecipeStage ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'}
              `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <span className="relative tracking-[0.2em] uppercase text-xs md:text-sm">
              {isRecipeStage ? 'Commence Real-Time Tracking' : 'Confirm Timeline & Recipe'}
            </span>
            <svg className="w-5 h-5 md:w-6 md:h-6 relative group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Timeline Wrapper */}
      <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 mono uppercase tracking-[0.3em]">Production Workflow</h3>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-cyan-600 rounded-sm"></div><span className="text-[9px] mono text-slate-400 uppercase">Work</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-blue-900/60 rounded-sm"></div><span className="text-[9px] mono text-slate-400 uppercase">Cold</span></div>
                <span className="text-[10px] mono text-slate-400 border-l border-slate-700 pl-4 ml-2">
                  <span className="text-slate-200">{sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> — <span className="text-slate-200">{sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
            </div>
          </div>
          
          <div className="relative">
            {/* Main Process Blocks */}
            <div className="relative h-14 flex w-full bg-slate-950/50 rounded-lg border border-slate-800/50 p-1 overflow-hidden shadow-inner">
              {scheduleWithTimes.map((step, i) => {
                const width = (step.min / totalProcessMins) * 100;
                return (
                  <div 
                    key={i}
                    style={{ width: `${width}%` }}
                    className={`h-full first:rounded-l last:rounded-r relative flex flex-col justify-center items-center px-0.5 transition-all duration-700 border-r border-slate-950/20
                      ${step.active ? 'bg-cyan-600/80 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]' : 
                        step.cold ? 'bg-blue-900/50 shadow-[inset_0_0_15px_rgba(30,58,138,0.2)]' : 
                        'bg-slate-800/60'}
                    `}
                  >
                    <span className={`text-[8px] md:text-[9px] mono font-bold uppercase truncate max-w-full tracking-tighter ${step.active ? 'text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              {/* Finished indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" title="Finished" />
            </div>

            {/* Hourly Scale */}
            <div className="relative h-8 mt-2 w-full">
               {hourlyMarkers.map((marker, i) => (
                 <div 
                   key={i} 
                   className="absolute top-0 flex flex-col items-center -translate-x-1/2 group"
                   style={{ left: `${marker.position}%` }}
                 >
                    <div className="w-[1px] h-2 bg-slate-700 group-hover:bg-slate-400 transition-colors" />
                    <span className="mt-1 text-[9px] md:text-[10px] mono text-slate-500 font-medium group-hover:text-slate-300 transition-colors">
                      {marker.label}
                    </span>
                 </div>
               ))}
               
               {/* Start/End explicit markers if they aren't on top of hourly ones */}
               <div className="absolute top-0 left-0 flex flex-col items-center -translate-x-1/2">
                 <div className="w-[1px] h-3 bg-cyan-500" />
                 <span className="mt-1 text-[9px] mono text-cyan-400 font-bold">START</span>
               </div>
               <div className="absolute top-0 left-[100%] flex flex-col items-center -translate-x-1/2">
                 <div className="w-[1px] h-3 bg-emerald-500" />
                 <span className="mt-1 text-[9px] mono text-emerald-400 font-bold">END</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default PlanningView;