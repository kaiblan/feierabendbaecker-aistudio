import React, { useRef } from 'react';
import { BakerConfig } from '../types';
import { ICONS, Language } from '../constants';
import { useBakeSchedule } from '../hooks/useBakeSchedule';
import { sliderValueToDuration, durationToSliderValue, formatDurationDisplay, formatMinutesDisplay, roundDuration } from '../utils/coldFermentationUtils';

interface PlanningViewProps {
  config: BakerConfig;
  status: 'planning' | 'recipe' | 'active' | 'completed';
  startTimeStr: string;
  planningMode: 'forward' | 'backward';
  onUpdateConfig: (updates: Partial<BakerConfig>) => void;
  onUpdateStartTime: (time: string) => void;
  onUpdatePlanningMode: (mode: 'forward' | 'backward') => void;
  onStartProcess: () => void;
  language: Language;
  t: (key: string) => string;
}

const PlanningView: React.FC<PlanningViewProps> = ({
  config,
  status,
  startTimeStr,
  planningMode,
  onUpdateConfig,
  onUpdateStartTime,
  onUpdatePlanningMode,
  onStartProcess,
  language,
  t
}) => {

  const {
    scheduleWithTimes,
    sessionStartTime,
    sessionEndTime,
    hourlyMarkers,
    totalProcessMins,
  } = useBakeSchedule({
    config,
    startTimeStr,
    planningMode,
    translateFn: t,
  });

  const isRecipeStage = status === 'recipe';

  const bulkPercent = Math.round(60 + (config.fermentationBalance / 100) * 30);
  const proofPercent = 100 - bulkPercent;

  const startInputRef = useRef<HTMLInputElement | null>(null);
  const readyInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectForward = () => {
    // Preserve the calculated session start time when switching to forward
    try {
      const formatted = formatDateToInput(sessionStartTime);
      onUpdateStartTime(formatted);
    } catch (e) {
      // ignore
    }
    onUpdatePlanningMode('forward');
    setTimeout(() => {
      const el = startInputRef.current;
      if (el) {
        try {
          el.focus();
          if ((el as any).showPicker) (el as any).showPicker();
        } catch (e) {
          // ignore
        }
      }
    }, 0);
  };

  const handleSelectBackward = () => {
    // Preserve the calculated session end time when switching to backward
    try {
      const formatted = formatDateToInput(sessionEndTime);
      onUpdateStartTime(formatted);
    } catch (e) {
      // ignore
    }
    onUpdatePlanningMode('backward');
    setTimeout(() => {
      const el = readyInputRef.current;
      if (el) {
        try {
          el.focus();
          if ((el as any).showPicker) (el as any).showPicker();
        } catch (e) {
          // ignore
        }
      }
    }, 0);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDateToInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const startInputValue = planningMode === 'forward' ? startTimeStr : formatDateToInput(sessionStartTime);
  const readyInputValue = planningMode === 'backward' ? startTimeStr : formatDateToInput(sessionEndTime);

  return (
    <div className="flex flex-col min-h-full">
      {/* Scrollable Content Area */}
      <div className="flex-1 px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
        <header className="max-w-7xl mx-auto w-full">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isRecipeStage ? t('recipeDetails') : t('bakingSchedule')}
            </h2>
            <p className="text-slate-400 text-sm">
              {isRecipeStage ? t('adjustWeights') : t('planYourBake')}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-10 gap-6 items-start">
          {!isRecipeStage ? (
            <>
              <section className="order-1 lg:order-3 lg:col-span-2 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-[12px] font-bold text-emerald-500 mono uppercase tracking-widest">{t('sessionTiming')}</h3>
                  <span className="text-[12px] font-bold text-cyan-400 mono">{formatMinutesDisplay(totalProcessMins)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSelectForward} className={`rounded-lg border transition-all text-left ${planningMode === 'forward' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 cursor-pointer'}`}>
                    <div className={`w-full text-[12px] py-1.5 mono uppercase text-center transition-all ${planningMode === 'forward' ? 'text-white' : 'text-slate-400'}`}>{t('forward')}</div>
                    <div className="px-2 pb-2">
                      <div className="text-[10px] text-slate-400 mono uppercase mb-1 text-center">{t('startTime')}</div>
                      <div className="relative">
                        <input
                          ref={startInputRef}
                          type="time"
                          value={startInputValue}
                          onChange={e => { if (planningMode === 'forward') onUpdateStartTime(e.target.value); }}
                          onClick={e => { if (planningMode === 'forward') e.stopPropagation(); }}
                          readOnly={planningMode !== 'forward'}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-full opacity-0 z-10"
                        />
                        <div className={`w-full p-1.5 text-[20px] font-bold text-center mono rounded ${planningMode === 'forward' ? 'bg-slate-950 border border-slate-700 text-white' : 'bg-slate-900/50 border border-slate-800/50 text-slate-400'}`}>
                          {startInputValue}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button onClick={handleSelectBackward} className={`rounded-lg border transition-all text-left ${planningMode === 'backward' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 cursor-pointer'}`}>
                    <div className={`w-full text-[12px] py-1.5 mono uppercase text-center transition-all ${planningMode === 'backward' ? 'text-white' : 'text-slate-400'}`}>{t('backward')}</div>
                    <div className="px-2 pb-2">
                      <div className="text-[10px] text-slate-400 mono uppercase mb-1 text-center">{t('readyTime')}</div>
                      <div className="relative">
                        <input
                          ref={readyInputRef}
                          type="time"
                          value={readyInputValue}
                          onChange={e => { if (planningMode === 'backward') onUpdateStartTime(e.target.value); }}
                          onClick={e => { if (planningMode === 'backward') e.stopPropagation(); }}
                          readOnly={planningMode !== 'backward'}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-full opacity-0 z-10"
                        />
                        <div className={`w-full p-1.5 text-[20px] font-bold text-center mono rounded ${planningMode === 'backward' ? 'bg-slate-950 border border-slate-700 text-white' : 'bg-slate-900/50 border border-slate-800/50 text-slate-400'}`}>
                          {readyInputValue}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </section>

              <section className="order-2 lg:order-1 lg:col-span-4 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-[12px] font-bold text-cyan-500 mono uppercase tracking-widest border-b border-slate-800 pb-3">{t('basicFactors')}</h3>
                <div className="grid grid-cols-1 gap-8 items-start">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-[12px] text-slate-400 mono uppercase">{t('yeastPercentage')}</label>
                      <span className="text-xl font-bold text-emerald-400 mono tracking-tighter">{config.yeast.toFixed(2)}%</span>
                    </div>
                    <input type="range" min="0.01" max="2.00" step="0.01" value={config.yeast} onChange={e => onUpdateConfig({ yeast: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />

                    <div className="flex justify-between items-end">
                      <label className="text-[12px] text-slate-400 mono uppercase">{t('doughTemperature')}</label>
                      <span className="text-xl font-bold text-amber-400 mono tracking-tighter">{config.targetTemp.toFixed(1)}°C</span>
                    </div>
                    <input type="range" min="18" max="32" step="0.5" value={config.targetTemp} onChange={e => onUpdateConfig({ targetTemp: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                  </div>
                </div>
              </section>

              <section className="order-3 lg:order-2 lg:col-span-4 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-[12px] font-bold text-blue-500 mono uppercase tracking-widest border-b border-slate-800 pb-3">{t('additionalSteps')}</h3>
                <div className="space-y-3">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-slate-300">{t('autolyse')}</label>
                      <input
                        type="checkbox"
                        checked={config.autolyseEnabled}
                        onChange={e => onUpdateConfig(e.target.checked ? { autolyseEnabled: true, autolyseDurationMinutes: config.autolyseDurationMinutes || 5 } : { autolyseEnabled: false })}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer"
                      />
                    </div>
                    {config.autolyseEnabled && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/50">
                        <div className="flex justify-between items-end">
                          <label className="text-[12px] text-slate-400 mono uppercase">{t('autolyse')}</label>
                          <span className="text-lg font-bold text-cyan-400 mono tracking-tighter">{formatMinutesDisplay(config.autolyseDurationMinutes || 0)}</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={120}
                          step={5}
                          value={config.autolyseDurationMinutes || 5}
                          onChange={e => onUpdateConfig({ autolyseDurationMinutes: parseInt(e.target.value) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-slate-300">{t('coldBulk')}</label>
                      <input type="checkbox" checked={config.coldBulkEnabled} onChange={e => onUpdateConfig({ coldBulkEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer" />
                    </div>
                    {config.coldBulkEnabled && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/50">
                        <div className="flex justify-between items-end">
                          <label className="text-[12px] text-slate-400 mono uppercase">Cold Bulk Duration</label>
                          <span className="text-lg font-bold text-cyan-400 mono tracking-tighter">{formatDurationDisplay(config.coldBulkDurationHours)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={durationToSliderValue(config.coldBulkDurationHours)}
                          onChange={e => onUpdateConfig({ coldBulkDurationHours: roundDuration(sliderValueToDuration(parseFloat(e.target.value))) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-slate-300">{t('coldProof')}</label>
                      <input type="checkbox" checked={config.coldProofEnabled} onChange={e => onUpdateConfig({ coldProofEnabled: e.target.checked })} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer" />
                    </div>
                    {config.coldProofEnabled && (
                      <div className="space-y-3 pt-2 border-t border-slate-800/50">
                        <div className="flex justify-between items-end">
                          <label className="text-[12px] text-slate-400 mono uppercase">Cold Proof Duration</label>
                          <span className="text-lg font-bold text-cyan-400 mono tracking-tighter">{formatDurationDisplay(config.coldProofDurationHours)}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={durationToSliderValue(config.coldProofDurationHours)}
                          onChange={e => onUpdateConfig({ coldProofDurationHours: roundDuration(sliderValueToDuration(parseFloat(e.target.value))) })}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[12px] text-slate-400 mono uppercase">Fermentation Balance</label>
                        <span className="text-sm font-bold text-cyan-400 mono">{bulkPercent}% / {proofPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={config.fermentationBalance}
                        onChange={e => onUpdateConfig({ fermentationBalance: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 mono">
                        <span>60% Bulk</span>
                        <span>90% Bulk</span>
                      </div>
                    </div>
                    <div className="space-y-4 mt-4">
                      <div className="flex justify-between items-end">
                        <label className="text-[12px] text-slate-400 mono uppercase">{t('fridgeTemperature')}</label>
                        <span className="text-xl font-bold text-cyan-400 mono tracking-tighter">{config.fridgeTemp.toFixed(1)}°C</span>
                      </div>
                      <input type="range" min="0" max="10" step="0.5" value={config.fridgeTemp} onChange={e => onUpdateConfig({ fridgeTemp: parseFloat(e.target.value) })} className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="lg:col-span-3 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-[12px] font-bold text-slate-400 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('doughSettings')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[12px] text-slate-400 mono uppercase block mb-1">{t('totalFlour')}</label>
                    <input type="number" value={config.totalFlour} onChange={e => onUpdateConfig({ totalFlour: +e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                  </div>
                  <div>
                    <label className="text-[12px] text-slate-400 mono uppercase block mb-1">{t('hydration')}</label>
                    <input type="number" value={config.hydration} onChange={e => onUpdateConfig({ hydration: +e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                  </div>
                </div>
              </section>
              <section className="lg:col-span-7 w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-[12px] font-bold text-emerald-500 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('recipeComponents')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-[12px] text-slate-400 mono block uppercase">{t('flour')}</span>
                    <span className="text-2xl font-black text-white mono">{config.totalFlour}g</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-[12px] text-slate-400 mono block uppercase">{t('water')}</span>
                    <span className="text-2xl font-black text-cyan-400 mono">{(config.totalFlour * config.hydration / 100).toFixed(0)}g</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-[12px] text-slate-400 mono block uppercase">{t('yeast')} ({config.yeast.toFixed(2)}%)</span>
                    <span className="text-2xl font-black text-emerald-400 mono">{(config.totalFlour * config.yeast / 100).toFixed(2)}g</span>
                  </div>
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <span className="text-[12px] text-slate-400 mono block uppercase">{t('salt')} ({config.salt}%)</span>
                    <span className="text-2xl font-black text-amber-400 mono">{(config.totalFlour * config.salt / 100).toFixed(1)}g</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs mono text-slate-400">
                  <span className="uppercase tracking-widest">{t('totalBatchWeight')}</span>
                  <span className="text-slate-300 text-lg">{(config.totalFlour * (1 + (config.hydration + config.yeast + config.salt) / 100)).toFixed(0)}g</span>
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
              {isRecipeStage ? t('commenceTracking') : t('confirmTimeline')}
            </span>
            <svg className="w-5 h-5 md:w-6 md:h-6 relative group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
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
