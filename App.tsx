import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ICONS, TRANSLATIONS, Language } from './constants';
import { BakerConfig } from './types';
import Navigation from './components/Navigation';
import PlanningTab from './components/PlanningTab';
import ActiveTab from './components/ActiveTab';
import SettingsTab from './components/SettingsTab';
import { LanguageContext, createTranslator } from './components/LanguageContext';
import { Button } from './components/Button';
import { useSession } from './hooks/useSession';
import { useTimer } from './hooks/useTimer';
import { useBakeSchedule } from './hooks/useBakeSchedule';
import { addMinutesToDate, formatDateAsTime } from './utils/timeUtils';

const DEFAULT_CONFIG: BakerConfig = {
  totalFlour: 1000,
  hydration: 75,
  salt: 2,
  yeast: 0.5,
  targetTemp: 22,
  fridgeTemp: 6,
  prefermentEnabled: false,
  autolyseEnabled: false,
  autolyseDurationMinutes: 60,
  coldBulkEnabled: false,
  coldBulkDurationHours: 8,
  coldProofEnabled: false,
  coldProofDurationHours: 8,
  fermentationBalance: 85,
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('de');
  const t = useCallback(
    (key: string) => TRANSLATIONS[language][key as keyof typeof TRANSLATIONS.en] || key,
    [language]
  );

  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'history' | 'settings'>('planning');
  const [secondaryTab, setSecondaryTab] = useState<'timing'|'amounts'>('timing');
  const [startTimeStr, setStartTimeStr] = useState('08:00');
  const [planningMode, setPlanningMode] = useState<'forward' | 'backward'>('backward');

  const headerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateOffsets = () => {
      const headerH = headerRef.current?.offsetHeight ?? 0;
      const timelineH = timelineRef.current?.offsetHeight ?? 0;
      const total = headerH + timelineH;
      document.documentElement.style.setProperty('--planning-offset', `${total}px`);
      document.documentElement.style.setProperty('--header-height', `${headerH}px`);
    };

    updateOffsets();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateOffsets);
      if (headerRef.current) ro.observe(headerRef.current);
      if (timelineRef.current) ro.observe(timelineRef.current);
    }

    window.addEventListener('resize', updateOffsets);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateOffsets);
    };
  }, [secondaryTab, activeTab]);

  const { session, updateConfig, transitionToRecipe, transitionToActive, advanceStage, setSession } = useSession({
    initialConfig: DEFAULT_CONFIG,
    translateFn: t,
  });

  const currentStage = session.stages[session.activeStageIndex];
  const { timeLeft, setTimeLeft } = useTimer({
    isActive: session.status === 'active' && !currentStage?.completed,
    endTime: currentStage?.stageEndTime || null,
  });

  const { totalProcessMins } = useBakeSchedule({
    config: session.config,
    startTimeStr,
    planningMode,
    translateFn: t,
  });

  const roundDateTo5Minutes = (date: Date) => {
    const stepMs = 5 * 60 * 1000;
    return new Date(Math.round(date.getTime() / stepMs) * stepMs);
  };

  const handleShiftMinutes = (minutes: number, baseStart: Date) => {
    // In forward mode: startTimeStr is the start time
    // In backward mode: startTimeStr is the ready/end time
    // We always receive sessionStartTime as baseStart, so we need to convert
    if (planningMode === 'backward') {
      // Calculate what the new end time should be
      const newStart = addMinutesToDate(baseStart, minutes);
      const newEnd = addMinutesToDate(newStart, totalProcessMins);
      const roundedEnd = roundDateTo5Minutes(newEnd);
      const formatted = formatDateAsTime(roundedEnd);
      setStartTimeStr(formatted);
    } else {
      // Forward mode: directly shift the start time
      const newStart = addMinutesToDate(baseStart, minutes);
      const roundedStart = roundDateTo5Minutes(newStart);
      const formatted = formatDateAsTime(roundedStart);
      setStartTimeStr(formatted);
    }
  };

  const handleStartNow = () => {
    // Compute consecutive start/end times for all stages beginning now
    const now = new Date();
    const computeSequential = (stages: typeof session.stages, startIdx: number, base: Date) => {
      const out = stages.map((s) => ({ ...s }));
      let cursor = new Date(base);
      for (let i = startIdx; i < out.length; i++) {
        const dur = out[i].durationMinutes || 0;
        out[i].startTime = new Date(cursor);
        out[i].stageEndTime = new Date(cursor.getTime() + dur * 60000);
        cursor = new Date(out[i].stageEndTime as Date);
      }
      return out;
    };

    if (session.stages.length > 0) {
      const updatedStages = computeSequential(session.stages, 0, now);
      setSession({ ...session, stages: updatedStages });
    }
    transitionToActive();
    setActiveTab('active');
  };



  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: createTranslator(language) }}>
    <div className="flex h-screen flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Secondary tabs (fixed at top when in planning) */}
        {activeTab === 'planning' && (
          <div ref={headerRef} className="fixed top-0 left-0 right-0 z-40 bg-slate-950/95 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-center">
              <div className="inline-flex bg-slate-800/80 rounded-full p-1 gap-1 border border-slate-700/50">
                <button 
                  onClick={() => setSecondaryTab('timing')} 
                  className={`w-32 py-1.5 rounded-full text-sm font-medium transition-all text-center ${
                    secondaryTab === 'timing' 
                      ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-900/50' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {t('timing')}
                </button>
                <button 
                  onClick={() => setSecondaryTab('amounts')} 
                  className={`w-32 py-1.5 rounded-full text-sm font-medium transition-all text-center ${
                    secondaryTab === 'amounts' 
                      ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-900/50' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {t('amounts')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 pb-24" style={activeTab === 'planning' ? { overflow: 'hidden' } : { overflowY: 'auto' }}>
          {activeTab === 'planning' && (
            <PlanningTab
              session={session}
              startTimeStr={startTimeStr}
              planningMode={planningMode}
              secondaryTab={secondaryTab}
              updateConfig={updateConfig}
              setStartTimeStr={setStartTimeStr}
              setPlanningMode={setPlanningMode}
              setSecondaryTab={setSecondaryTab}
              onShiftMinutes={handleShiftMinutes}
              onStartNow={handleStartNow}
              headerRef={headerRef}
              timelineRef={timelineRef}
            />
          )}

          {activeTab === 'active' && (
            <ActiveTab
              session={session}
              timeLeft={timeLeft}
              setSession={setSession}
              setTimeLeft={setTimeLeft}
              onNavigatePlanning={() => setActiveTab('planning')}
            />
          )}

          {activeTab === 'settings' && <SettingsTab />}


        </div>
      </main>
      {/* Bottom navigation for small screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setActiveTab('planning')} className={`py-2 flex flex-col items-center justify-center text-sm ${activeTab === 'planning' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span>{t('planning')}</span>
            </button>

            <button onClick={() => setActiveTab('active')} className={`py-2 flex flex-col items-center justify-center text-sm ${activeTab === 'active' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.Active className="w-6 h-6 mb-1" />
              <span>{t('baking')}</span>
            </button>

            <button onClick={() => setActiveTab('history')} className={`py-2 flex flex-col items-center justify-center text-sm ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.History className="w-6 h-6 mb-1" />
              <span>{t('history')}</span>
            </button>

            <button onClick={() => setActiveTab('settings')} className={`py-2 flex flex-col items-center justify-center text-sm ${activeTab === 'settings' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.Settings className="w-6 h-6 mb-1" />
              <span>{t('settings')}</span>
            </button>


          </div>
        </div>
      </nav>
    </div>
    </LanguageContext.Provider>
  );
};

export default App;
