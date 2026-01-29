import React, { useState, useCallback, useMemo } from 'react';
import { ICONS, COLORS, TRANSLATIONS, Language } from './constants';
import { BakerConfig } from './types';
import Timeline from './components/Timeline';
import StageDetail from './components/StageDetail';
import PlanningView from './components/PlanningView';
import { useSession } from './hooks/useSession';
import { useTimer } from './hooks/useTimer';
import { useBakeSchedule } from './hooks/useBakeSchedule';
import { formatTime } from './utils/timeUtils';

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
  fermentationBalance: 50,
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('de');
  const t = useCallback(
    (key: string) => TRANSLATIONS[language][key as keyof typeof TRANSLATIONS.en] || key,
    [language]
  );

  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'history' | 'starter' | 'knowledge'>('planning');
  const [startTimeStr, setStartTimeStr] = useState('08:00');
  const [planningMode, setPlanningMode] = useState<'forward' | 'backward'>('backward');
  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { session, updateConfig, transitionToRecipe, transitionToActive, advanceStage, setSession } = useSession({
    initialConfig: DEFAULT_CONFIG,
    translateFn: t,
  });

  const isActiveSessionRunning = session.status === 'active' && activeTab === 'active';
  const { timeLeft, setTimeLeft } = useTimer({
    isActive: isActiveSessionRunning && !session.stages[session.activeStageIndex]?.completed,
    durationMinutes: session.stages[session.activeStageIndex]?.durationMinutes || 0,
  });

  const { scheduleWithTimes, sessionStartTime, sessionEndTime, hourlyMarkers, totalProcessMins } = useBakeSchedule({
    config: session.config,
    startTimeStr,
    planningMode,
    translateFn: t,
  });

  const handleNextStage = useCallback(() => {
    if (session.status === 'planning') {
      transitionToRecipe();
    } else if (session.status === 'recipe') {
      transitionToActive();
      setActiveTab('active');
      setTimeLeft(session.stages[0]?.durationMinutes * 60 || 0);
    }
  }, [session.status, session.stages, transitionToRecipe, transitionToActive, setTimeLeft]);

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans">
      <nav className="hidden lg:flex flex-col w-20 border-r border-slate-800 bg-slate-950/50 py-8 items-center space-y-12">
        <div className="w-10 h-10 bg-cyan-600 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-900/50">F</div>
        <div className="flex flex-col space-y-8">
          {(['planning', 'active', 'history', 'starter', 'knowledge'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              title={t(tab)}
              className={`p-3 rounded-xl transition-all ${activeTab === tab ? 'text-cyan-400 bg-cyan-400/10 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'planning' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
              {tab === 'active' && <ICONS.Active />}
              {tab === 'history' && <ICONS.History />}
              {tab === 'starter' && <ICONS.Starter />}
              {tab === 'knowledge' && <ICONS.Knowledge />}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-8 border-t border-slate-700 w-full flex justify-center">
          <div className="bg-slate-950 p-1 rounded-lg flex border border-slate-800">
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>EN</button>
            <button onClick={() => setLanguage('de')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'de' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>DE</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 backdrop-blur-xl z-10">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{session.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-[11px] mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 uppercase tracking-tighter">
                {session.config.hydration}% Hydration
              </span>
              <span className={`text-[11px] mono px-2 py-0.5 rounded border uppercase tracking-tighter ${session.status === 'active' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border-amber-900/50'}`}>
                {session.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] mono text-slate-400 uppercase tracking-widest">Phase</div>
            <div className="text-sm font-bold text-slate-300 mono">{session.status.toUpperCase()}</div>
          </div>
        </header>

        {/* This div is the scrollable container. 
            The PlanningView inside it now handles its own sticky footer logic. */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'planning' && (
            <>
              {/* Production Timeline */}
              <div className="sticky top-0 z-40 lg:static bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.5)] px-4 md:px-8 py-6">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 mono uppercase tracking-[0.3em]">{t('productionWorkflow')}</h3>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-cyan-600 rounded-sm"></div><span className="text-[11px] mono text-slate-400 uppercase">{t('work')}</span></div>
                        <div className="flex items-center space-x-1.5"><div className="w-2.5 h-2.5 bg-blue-900/60 rounded-sm"></div><span className="text-[11px] mono text-slate-400 uppercase">{t('cold')}</span></div>
                        <span className="text-[11px] mono text-slate-400 border-l border-slate-800 pl-4 ml-2">
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
                            <span className={`text-[9px] md:text-[11px] mono font-bold uppercase truncate max-w-full tracking-tighter ${step.active ? 'text-white' : 'text-slate-400'}`}>
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
                            <span className="mt-1 text-[10px] md:text-[11px] mono text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                              {marker.label}
                            </span>
                         </div>
                       ))}
                       
                       {/* Start/End explicit markers if they aren't on top of hourly ones */}
                       <div className="absolute top-0 left-0 flex flex-col items-center -translate-x-1/2">
                         <div className="w-[1px] h-3 bg-cyan-500" />
                         <span className="mt-1 text-[11px] mono text-cyan-400 font-bold">START</span>
                       </div>
                       <div className="absolute top-0 left-[100%] flex flex-col items-center -translate-x-1/2">
                         <div className="w-[1px] h-3 bg-emerald-500" />
                         <span className="mt-1 text-[11px] mono text-emerald-400 font-bold">END</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Planning View Content */}
            <PlanningView 
              config={session.config}
              status={session.status}
              startTimeStr={startTimeStr}
              planningMode={planningMode}
              onUpdateConfig={updateConfig}
              onUpdateStartTime={setStartTimeStr}
              onUpdatePlanningMode={setPlanningMode}
              onStartProcess={handleNextStage}
              language={language}
              t={t}
            />
            </>
          )}

          {activeTab === 'active' && session.status === 'active' && (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                  <div className="text-[11px] mono text-cyan-500 mb-2 uppercase tracking-[0.3em] font-bold">
                    {session.stages[session.activeStageIndex]?.isActive ? 'ACTIVE WORK PHASE' : 'PASSIVE FERMENTATION'}
                  </div>
                  <h2 className="text-4xl font-black mb-6 tracking-tight">{session.stages[session.activeStageIndex]?.label}</h2>
                  <div className="text-7xl mono font-bold text-white tracking-tighter mb-4 tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mt-4">
                    <div 
                      className={`h-full transition-all duration-1000 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-400 opacity-50'}`} 
                      style={{ width: `${(1 - timeLeft / ((session.stages[session.activeStageIndex]?.durationMinutes || 1) * 60)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] mono text-slate-500 mb-4 uppercase tracking-widest">UPCOMING</div>
                    <div className="text-lg font-bold text-slate-200">{session.stages[session.activeStageIndex + 1]?.label || 'SESSION END'}</div>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        const nextIdx = session.activeStageIndex + 1;
                        if (nextIdx < session.stages.length) {
                            setSession({ ...session, activeStageIndex: nextIdx });
                            setTimeLeft(session.stages[nextIdx].durationMinutes * 60);
                        }
                      }}
                      className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
                    >
                      COMPLETE & ADVANCE
                    </button>
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[11px] font-bold text-slate-500 mono uppercase tracking-[0.3em]">Session Progress</h3>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
                  <Timeline 
                    stages={session.stages} 
                    activeIndex={session.activeStageIndex}
                    orientation="horizontal"
                    onSelectStage={(idx) => {
                      setSelectedStageIdx(idx);
                      setIsPanelOpen(true);
                    }}
                  />
                </div>
              </section>
            </div>
          )}
        </div>

        <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900 shadow-2xl z-[60] transform transition-transform duration-500 ease-out border-l border-slate-800 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-500 mono uppercase tracking-[0.2em]">Parameter Log</span>
              <button onClick={() => setIsPanelOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">
              {session.stages[selectedStageIdx] && (
                <StageDetail 
                  stage={session.stages[selectedStageIdx]} 
                  onUpdate={(updates) => {
                    const newStages = [...session.stages];
                    newStages[selectedStageIdx] = { ...newStages[selectedStageIdx], ...updates };
                    setSession({ ...session, stages: newStages });
                  }} 
                />
              )}
            </div>
          </div>
        </div>
        {isPanelOpen && <div onClick={() => setIsPanelOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[55]" />}
      </main>
    </div>
  );
};

export default App;