import React, { useRef, useEffect } from 'react';
import { BakerConfig, BakerSession } from '../types';
import { ProductionTimeline } from './ProductionTimeline';
import PlanningView from './PlanningView';
import { Card } from './Card';
import RangeField from './RangeField';
import { useLanguage } from './LanguageContext';
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
        <ProductionTimeline
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
            <div className="max-w-7xl mx-auto px-4 pb-24 overflow-y-auto h-full" style={{ paddingTop: 'calc(var(--planning-offset) + 2rem)' }}>
              <PlanningView
                config={session.config}
                status={session.status}
                startTimeStr={startTimeStr}
                planningMode={planningMode}
                onUpdateConfig={updateConfig}
                onUpdateStartTime={setStartTimeStr}
                onUpdatePlanningMode={setPlanningMode}
                onOpenAmounts={() => setSecondaryTab('amounts')}
              />
            </div>
          </div>

          {/* Amounts tab content */}
          <div className="w-1/2 h-full">
            <div className="max-w-7xl mx-auto px-4 pb-24 overflow-y-auto h-full" style={{ paddingTop: 'var(--header-height)' }}>
              <div className="w-full max-w-3xl mx-auto space-y-6">
                <Card variant="default" className="w-full p-6 mt-4">
                  <h3 className="text-[12px] font-bold text-emerald-500 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('bakerPercentages')}</h3>
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
                  <h3 className="text-[12px] font-bold text-slate-400 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('amounts')}</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 mono uppercase">{t('totalFlour')}</span>
                      <span className="text-lg font-black mono">{Math.round(session.config.totalFlour)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 mono uppercase">{t('water')}</span>
                      <span className="text-lg font-black mono">{Math.round(session.config.totalFlour * session.config.hydration / 100)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 mono uppercase">{t('yeast')}</span>
                      <span className="text-lg font-black mono">{(session.config.totalFlour * (session.config.yeast / 100)).toFixed(1)}g</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400 mono uppercase">{t('salt')}</span>
                      <span className="text-lg font-black mono">{(session.config.totalFlour * (session.config.salt / 100)).toFixed(1)}g</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs mono text-slate-400">
                    <span className="uppercase tracking-widest">{t('totalBatchWeight')}</span>
                    <span className="text-slate-300 text-lg">{(session.config.totalFlour * (1 + (session.config.hydration + session.config.yeast + session.config.salt) / 100)).toFixed(0)}g</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanningTab;
