import React, { useRef, useEffect } from 'react';
import { BakerConfig, BakerSession } from '../types';
import { PlanningTimeline } from './PlanningTimeline';
import PlanningView from './PlanningView';
import { useLanguage } from './LanguageContext';
import { useBakeSchedule } from '../hooks/useBakeSchedule';
import AmountsTab from './AmountsTab';

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

          {/* Amounts tab (extracted) */}
          <AmountsTab session={session} updateConfig={updateConfig} onStartNow={onStartNow} />
        </div>
      </div>
    </>
  );
};

export default PlanningTab;
