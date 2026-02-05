import React, { useRef, useEffect } from 'react';
import { BakerConfig, BakerSession } from '../types';
import { PlanningTimeline } from './PlanningTimeline';
import PlanningView from './PlanningView';
import { Card } from './Card';
import RangeField from './RangeField';
import { useLanguage } from './LanguageContext';
import Headline from './Headline';
import { useBakeSchedule } from '../hooks/useBakeSchedule';

interface PlanningTabProps {
  session: BakerSession;
  startTimeStr: string;
  planningMode: 'forward' | 'backward';
  secondaryTab: 'timing' | 'amounts';
  updateConfig: (updates: Partial<BakerConfig>) => void;
  setStartTimeStr: (time: string) => void;
  setPlanningMode: (mode: 'forward' | 'backward') => void;
  setSecondaryTab: (tab: 'timing' | 'amounts') => void;
  onShiftMinutes: (minutes: number) => void;
  onStartNow: () => void;
  headerRef: React.RefObject<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement>;
}

const PlanningTab: React.FC<PlanningTabProps> = ({
  session,
  startTimeStr,
  planningMode,
  secondaryTab,
  updateConfig,
  setStartTimeStr,
  setPlanningMode,
  setSecondaryTab,
  onShiftMinutes,
  onStartNow,
  timelineRef,
}) => {
  const { t } = useLanguage();

  const {
    scheduleWithTimes,
    sessionStartTime,
    sessionEndTime,
    hourlyMarkers,
    totalProcessMins,
  } = useBakeSchedule({
    config: session.config,
    startTimeStr,
    planningMode,
    translateFn: t,
  });

  return (
    <>
      {/* Fixed timeline - only visible on timing tab */}
        <div ref={timelineRef} className="fixed left-0 right-0 z-30 transition-transform duration-300 ease-in-out" style={{ top: 'var(--header-height)', transform: secondaryTab === 'timing' ? 'translateX(0%)' : 'translateX(-100%)' }}>
        <PlanningTimeline
          scheduleWithTimes={scheduleWithTimes}
          sessionStartTime={sessionStartTime}
          sessionEndTime={sessionEndTime}
          hourlyMarkers={hourlyMarkers}
          totalProcessMins={totalProcessMins}
          workLabel={t('work')}
          coldLabel={t('cold')}
          productionWorkflowLabel={t('productionWorkflow')}
          planningMode={planningMode}
          onShiftMinutes={onShiftMinutes}
        />
      </div>

      {/* Container for sliding panels */}
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 flex w-[200%] transition-transform duration-300 ease-in-out" style={{ transform: secondaryTab === 'timing' ? 'translateX(0%)' : 'translateX(-50%)' }}>
          {/* Timing tab content */}
          <div className="w-1/2 h-full">
            <div className="max-w-7xl mx-auto px-4 pb-32 overflow-y-auto h-full" style={{ paddingTop: 'calc(var(--planning-offset) + 2rem)' }}>
              <div className="w-full max-w-3xl mx-auto">
                <PlanningView
                  config={session.config}
                  status={session.status}
                  startTimeStr={startTimeStr}
                  planningMode={planningMode}
                  onUpdateConfig={updateConfig}
                  onUpdateStartTime={setStartTimeStr}
                  onUpdatePlanningMode={setPlanningMode}
                  onOpenAmounts={() => setSecondaryTab('amounts')}
                  onStartNow={onStartNow}
                />
              </div>
            </div>
          </div>

          {/* Amounts tab content */}
          <div className="w-1/2 h-full">
            <div className="max-w-7xl mx-auto px-4 pb-32 overflow-y-auto h-full" style={{ paddingTop: 'var(--header-height)' }}>
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <Card variant="default" className="w-full p-6 mt-4">
                  <Headline color="text-emerald-500" className="border-b border-slate-800 pb-3 mb-4">{t('bakerPercentages')}</Headline>
                  <div className="space-y-6">
                    <div>
                      <RangeField
                        label={t('totalFlour')}
                        value={session.config.totalFlour}
                        min={500}
                        max={3000}
                        step={50}
                        onChange={(v) => updateConfig({ totalFlour: Math.round(v) })}
                        accent="accent-cyan-400"
                        valueFormatter={(v) => Math.round(v) + 'g'}
                      />
                    </div>

                    <div>
                      <RangeField
                        label={t('hydration')}
                        value={session.config.hydration}
                        min={30}
                        max={90}
                        step={1}
                        onChange={(v) => updateConfig({ hydration: Math.round(v) })}
                        accent="accent-cyan-400"
                        valueFormatter={(v) => Math.round(v) + '%'}
                      />
                    </div>

                    <div>
                      <RangeField
                        label={t('yeast')}
                        value={session.config.yeast}
                        min={0}
                        max={2}
                        step={0.01}
                        onChange={(v) => updateConfig({ yeast: Number(v.toFixed(2)) })}
                        accent="accent-emerald-400"
                        readOnly={true}
                        valueFormatter={(v) => `🔒 ${v.toFixed(2)}%`}
                      />
                    </div>

                    <div>
                      <RangeField
                        label={t('salt')}
                        value={session.config.salt}
                        min={0}
                        max={5}
                        step={0.1}
                        onChange={(v) => updateConfig({ salt: Number(v.toFixed(1)) })}
                        accent="accent-amber-400"
                        valueFormatter={(v) => v.toFixed(1) + '%'}
                      />
                    </div>

                  </div>
                </Card>
                <Card variant="subtle" className="w-full p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-400 mono">{t('totalFlour')}</span>
                      <span className="text-lg font-black mono">{Math.round(session.config.totalFlour)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-400 mono">{t('water')}</span>
                      <span className="text-lg font-black mono">{Math.round(session.config.totalFlour * session.config.hydration / 100)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-400 mono">{t('yeast')}</span>
                      <span className="text-lg font-black mono">{(session.config.totalFlour * (session.config.yeast / 100)).toFixed(1)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-base text-slate-400 mono">{t('salt')}</span>
                      <span className="text-lg font-black mono">{(session.config.totalFlour * (session.config.salt / 100)).toFixed(1)}g</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-base mono text-slate-400">
                    <span className="tracking-widest">{t('totalBatchWeight')}</span>
                    <span className="text-lg font-black mono">{(session.config.totalFlour * (1 + (session.config.hydration + session.config.yeast + session.config.salt) / 100)).toFixed(0)}g</span>
                  </div>
                </Card>
                
                {/* Start Now Button */}
                <div className="flex justify-center w-full pt-6">
                  <button
                    onClick={onStartNow}
                    className="group relative px-10 md:px-16 py-4 text-white font-bold rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center space-x-6 overflow-hidden z-10 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    <span className="relative tracking-[0.2em] text-base md:text-base">
                      {t('start')}
                    </span>
                    <svg className="w-5 h-5 md:w-6 md:h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningTab;
