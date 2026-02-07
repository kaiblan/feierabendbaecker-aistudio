import React, { useRef } from 'react';
import { BakerConfig } from '../types';
// imports
import { useBakeSchedule } from '../hooks/useBakeSchedule';
import { sliderValueToDuration, durationToSliderValue, formatDurationDisplay, formatMinutesDisplay, roundDuration } from '../utils/coldFermentationUtils';
import { Card } from './Card';
import Slider from './Slider';
import RangeField from './RangeField';
import ToggleSwitch from './ToggleSwitch';

interface PlanningViewProps {
  config: BakerConfig;
  status: 'planning' | 'recipe' | 'active' | 'completed';
  startTimeStr: string;
  planningMode: 'forward' | 'backward';
  onUpdateConfig: (updates: Partial<BakerConfig>) => void;
  onUpdateStartTime: (time: string) => void;
  onUpdatePlanningMode: (mode: 'forward' | 'backward') => void;
  onOpenAmounts?: () => void;
  onStartNow?: () => void;
}

import { useLanguage } from './LanguageContext';
import Headline from './Headline';

const PlanningView: React.FC<PlanningViewProps> = ({
  config,
  status,
  startTimeStr,
  planningMode,
  onUpdateConfig,
  onUpdateStartTime,
  onUpdatePlanningMode,
  onOpenAmounts,
  onStartNow,
}) => {
  const { t } = useLanguage();

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

  const finalProofMinutes = Math.round(config.finalProofDurationMinutes ?? 90);
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
      <div className="flex-1 lg:px-8 space-y-6 animate-fade-in">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-10 gap-6 items-start">
          {/* Main planning UI */}
              <Card variant="default" className="order-1 lg:order-3 lg:col-span-2 w-full p-4 flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                  <Headline color="text-primary">{t('sessionTiming')}</Headline>
                </div>
                <p className="text-muted text-sm whitespace-pre-wrap">{t('planYourBake')}</p>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSelectForward} className={`rounded-lg border transition-all text-left ${planningMode === 'forward' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 cursor-pointer'}`}>
                      <div className={`w-full text-sm py-1.5 mono text-center transition-all ${planningMode === 'forward' ? 'text-white' : 'text-muted'}`}>{t('forward')}</div>
                    <div className="px-2 pb-2">
                      <div className="text-sm text-muted mono mb-1 text-center">{t('startTime')}</div>
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
                        <div className={`w-full p-1.5 text-[20px] font-bold text-center mono rounded ${planningMode === 'forward' ? 'bg-surface border border-surface text-white' : 'bg-slate-900/50 border border-slate-800/50 text-muted'}`}>
                          {startInputValue}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button onClick={handleSelectBackward} className={`rounded-lg border transition-all text-left ${planningMode === 'backward' ? 'border-emerald-500 bg-slate-900' : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 cursor-pointer'}`}>
                    <div className={`w-full text-sm py-1.5 mono text-center transition-all ${planningMode === 'backward' ? 'text-white' : 'text-muted'}`}>{t('backward')}</div>
                    <div className="px-2 pb-2">
                      <div className="text-sm text-muted mono mb-1 text-center">{t('readyTime')}</div>
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
                        <div className={`w-full p-1.5 text-[20px] font-bold text-center mono rounded ${planningMode === 'backward' ? 'bg-surface border border-surface text-white' : 'bg-slate-900/50 border border-slate-800/50 text-muted'}`}>
                          {readyInputValue}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </Card>

              <Card variant="default" className="order-2 lg:order-1 lg:col-span-4 w-full space-y-6">
                <Headline color="text-accent" className="border-b border-slate-800 pb-3">{t('basicFactors')}</Headline>
                <div className="grid grid-cols-1 gap-8 items-start">
                  <div className="space-y-4">
                    <RangeField
                      label={t('yeastPercentage')}
                      value={config.yeast}
                      min={0.01}
                      max={2}
                      step={0.01}
                      onChange={(v) => onUpdateConfig({ yeast: v })}
                      accent="accent-cyan-500"
                      valueFormatter={(v) => v.toFixed(2) + '%'}
                      valueClassName="text-emerald-400"
                    />

                    <RangeField
                      label={t('doughTemperature')}
                        value={config.targetTemp}
                        min={18}
                        max={27}
                      step={0.5}
                      onChange={(v) => onUpdateConfig({ targetTemp: v })}
                      accent="accent-amber-500"
                      valueFormatter={(v) => v.toFixed(1) + '°C'}
                      valueClassName="text-amber-400"
                    />
                    <RangeField
                      label={t('finalProof')}
                      value={finalProofMinutes}
                      min={0}
                      max={180}
                      step={5}
                      onChange={(value) => onUpdateConfig({ finalProofDurationMinutes: Math.round(value) })}
                      accent="accent-cyan-400"
                      valueFormatter={(value) => formatMinutesDisplay(value)}
                      valueClassName="text-cyan-400"
                    />
                  </div>
                </div>
              </Card>

              <Card variant="default" className="order-3 lg:order-2 lg:col-span-4 w-full space-y-4">
                <Headline color="text-blue-500" className="border-b border-slate-800 pb-3">{t('additionalSteps')}</Headline>
                <div className="space-y-3">
                  <div className="bg-slate-950/60 px-3 pt-4 pb-2 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-base text-slate-300">{t('autolyse')}</label>
                      <ToggleSwitch
                        checked={config.autolyseEnabled}
                        onChange={(value) => onUpdateConfig(value ? { autolyseEnabled: true, autolyseDurationMinutes: config.autolyseDurationMinutes || 5 } : { autolyseEnabled: false })}
                      />
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${config.autolyseEnabled ? 'max-h-96 pt-2 border-t border-slate-800/50 opacity-100' : 'max-h-0 border-t border-transparent opacity-0'}`}>
                      <div className="space-y-3">
                        <RangeField
                          label={t('duration')}
                          value={config.autolyseDurationMinutes ?? 5}
                          min={5}
                          max={120}
                          step={5}
                          onChange={(value) => onUpdateConfig({ autolyseDurationMinutes: Math.round(value) })}
                          accent="accent-cyan-400"
                          valueFormatter={(value) => formatMinutesDisplay(value)}
                          valueClassName="text-accent"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 px-3 pt-4 pb-2 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-base text-slate-300">{t('coldBulk')}</label>
                      <ToggleSwitch
                        checked={config.coldBulkEnabled}
                        onChange={(value) => onUpdateConfig({ coldBulkEnabled: value })}
                      />
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${config.coldBulkEnabled ? 'max-h-96 pt-2 border-t border-slate-800/50 opacity-100' : 'max-h-0 border-t border-transparent opacity-0'}`}>
                      <div className="space-y-3">
                        <RangeField
                          label={t('duration')}
                          value={durationToSliderValue(config.coldBulkDurationHours)}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(v) => onUpdateConfig({ coldBulkDurationHours: roundDuration(sliderValueToDuration(v)) })}
                          accent="accent-cyan-400"
                          valueFormatter={(sliderVal) => formatDurationDisplay(sliderValueToDuration(sliderVal))}
                          valueClassName="text-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 px-3 pt-4 pb-2 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-base text-slate-300">{t('coldProof')}</label>
                      <ToggleSwitch
                        checked={config.coldProofEnabled}
                        onChange={(value) => onUpdateConfig({ coldProofEnabled: value })}
                      />
                    </div>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${config.coldProofEnabled ? 'max-h-96 pt-2 border-t border-slate-800/50 opacity-100' : 'max-h-0 border-t border-transparent opacity-0'}`}>
                      <div className="space-y-3">
                        <RangeField
                          label={t('duration')}
                          value={durationToSliderValue(config.coldProofDurationHours)}
                          min={0}
                          max={100}
                          step={1}
                          onChange={(v) => onUpdateConfig({ coldProofDurationHours: roundDuration(sliderValueToDuration(v)) })}
                          accent="accent-cyan-400"
                          valueFormatter={(sliderVal) => formatDurationDisplay(sliderValueToDuration(sliderVal))}
                          valueClassName="text-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${config.coldBulkEnabled || config.coldProofEnabled ? 'max-h-48 pt-3 border-t border-slate-700/50 opacity-100' : 'max-h-0 border-t border-transparent opacity-0'}`}>
                    <div className="space-y-4 mt-4">
                      <RangeField
                        label={t('fridgeTemperature')}
                        value={config.fridgeTemp}
                        min={0}
                        max={10}
                        step={0.5}
                        onChange={v => onUpdateConfig({ fridgeTemp: v })}
                        accent="accent-cyan-400"
                        valueFormatter={(v) => v.toFixed(1) + '°C'}
                        valueClassName="text-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-7xl mx-auto w-full pt-4">
          <button
            onClick={() => onOpenAmounts?.()}
            className={`group relative px-10 md:px-16 py-4 text-white font-bold rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center space-x-6 overflow-hidden z-10 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <span className="relative tracking-[0.2em] text-base md:text-sm">
              {t('confirmTimeline')}
            </span>
            <svg className="w-5 h-5 md:w-6 md:h-6 relative group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => onStartNow?.()}
            className="px-8 md:px-12 py-4 text-slate-300 font-bold rounded-3xl transition-all active:scale-95 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 tracking-[0.2em] text-base md:text-base"
          >
            {t('startNow')}
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
