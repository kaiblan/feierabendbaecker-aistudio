import React, { useState, useCallback } from 'react';
import { ICONS, TRANSLATIONS, Language } from './constants';
import { BakerConfig } from './types';
import Timeline from './components/Timeline';
import { ProductionTimeline } from './components/ProductionTimeline';
import StageDetail from './components/StageDetail';
import PlanningView from './components/PlanningView';
import { LanguageSelector } from './components/LanguageSelector';
import { LanguageContext, createTranslator } from './components/LanguageContext';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { useSession } from './hooks/useSession';
import { useTimer } from './hooks/useTimer';
import { useBakeSchedule } from './hooks/useBakeSchedule';
import { formatTime, formatDateAsTime, addMinutesToDate } from './utils/timeUtils';

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

  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'history' | 'starter' | 'knowledge'>('planning');
  const [secondaryTab, setSecondaryTab] = useState<'timing'|'amounts'>('timing');
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



  // handleNextStage removed — recipe flow button now opens Amounts tab instead

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: createTranslator(language) }}>
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
          <LanguageSelector />
        </div>
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Secondary tabs (fixed at top when in planning) */}
        {activeTab === 'planning' && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-slate-950/95 border-b border-slate-800 h-14">
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

        <div className={`flex-1 overflow-y-auto pb-24 ${activeTab === 'planning' ? 'pt-[192px]' : ''}`}>
          {activeTab === 'planning' && (
            <> 
              {/* Fixed timeline so it never scrolls out of view */}
              <div className="fixed top-14 left-0 right-0 z-30 transition-transform duration-300 ease-in-out" style={{ transform: secondaryTab === 'timing' ? 'translateX(0%)' : 'translateX(-100%)' }}>
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
                  onShiftMinutes={handleShiftMinutes}
                />
              </div>

              <div className="relative overflow-hidden">
                <div className="flex w-[200%] transition-transform duration-300 ease-in-out" style={{ transform: secondaryTab === 'timing' ? 'translateX(0%)' : 'translateX(-50%)' }}>
                  <div className="w-1/2">
                    {/* Planning View Content */}
                    <div className="max-w-7xl mx-auto px-4 py-8">
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
                  <div className="w-1/2">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
                        <Card variant="default" className="lg:col-span-3 w-full">
                          <h3 className="text-[12px] font-bold text-slate-400 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('doughSettings')}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[12px] text-slate-400 mono uppercase block mb-1">{t('totalFlour')}</label>
                              <input type="number" value={session.config.totalFlour} onChange={e => updateConfig({ totalFlour: +e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                            </div>
                            <div>
                              <label className="text-[12px] text-slate-400 mono uppercase block mb-1">{t('hydration')}</label>
                              <input type="number" value={session.config.hydration} onChange={e => updateConfig({ hydration: +e.target.value })} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xl font-bold w-full outline-none focus:border-cyan-500 mono" />
                            </div>
                          </div>
                        </Card>

                        <Card variant="default" className="lg:col-span-7 w-full">
                          <h3 className="text-[12px] font-bold text-emerald-500 mono uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">{t('recipeComponents')}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                              <span className="text-[12px] text-slate-400 mono block uppercase">{t('flour')}</span>
                              <span className="text-2xl font-black text-white mono">{session.config.totalFlour}g</span>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                              <span className="text-[12px] text-slate-400 mono block uppercase">{t('water')}</span>
                              <span className="text-2xl font-black text-cyan-400 mono">{Math.round(session.config.totalFlour * session.config.hydration / 100)}g</span>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                              <span className="text-[12px] text-slate-400 mono block uppercase">{t('yeast')} ({session.config.yeast.toFixed(2)}%)</span>
                              <span className="text-2xl font-black text-emerald-400 mono">{(session.config.totalFlour * session.config.yeast / 100).toFixed(2)}g</span>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                              <span className="text-[12px] text-slate-400 mono block uppercase">{t('salt')} ({session.config.salt}%)</span>
                              <span className="text-2xl font-black text-amber-400 mono">{(session.config.totalFlour * session.config.salt / 100).toFixed(1)}g</span>
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
          )}

          {activeTab === 'active' && session.status === 'active' && (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="highlight" className="md:col-span-2 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                  <div className="text-[12px] mono text-cyan-500 mb-2 uppercase tracking-[0.3em] font-bold">
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
                </Card>

                <Card variant="subtle" className="flex flex-col justify-between">
                  <div>
                    <div className="text-[12px] mono text-slate-500 mb-4 uppercase tracking-widest">UPCOMING</div>
                    <div className="text-lg font-bold text-slate-200">{session.stages[session.activeStageIndex + 1]?.label || 'SESSION END'}</div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        const nextIdx = session.activeStageIndex + 1;
                        if (nextIdx < session.stages.length) {
                          setSession({ ...session, activeStageIndex: nextIdx });
                          setTimeLeft(session.stages[nextIdx].durationMinutes * 60);
                        }
                      }}
                      variant="primary"
                      size="lg"
                      className="w-full uppercase tracking-widest text-xs"
                    >
                      COMPLETE & ADVANCE
                    </Button>
                  </div>
                </Card>
              </div>

              <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[12px] font-bold text-slate-500 mono uppercase tracking-[0.3em]">Session Progress</h3>
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

          {activeTab === 'starter' && (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-24">
              <Card variant="default" className="p-6">
                <h2 className="text-xl font-bold text-white mb-2">{t('settings')}</h2>
                <p className="text-sm text-slate-400 mb-4">{t('appSettingsDescription') || 'Application settings'}</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">{t('language')}</label>
                    <LanguageSelector />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900 shadow-2xl z-[60] transform transition-transform duration-500 ease-out border-l border-slate-800 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <header className="p-6 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[12px] font-bold text-slate-500 mono uppercase tracking-[0.2em]">Parameter Log</span>
              <Button onClick={() => setIsPanelOpen(false)} variant="ghost" size="sm" className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
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
      {/* Bottom navigation for small screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => setActiveTab('planning')} className={`py-2 flex flex-col items-center justify-center text-xs ${activeTab === 'planning' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span>{t('planning')}</span>
            </button>

            <button onClick={() => setActiveTab('active')} className={`py-2 flex flex-col items-center justify-center text-xs ${activeTab === 'active' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.Active className="w-6 h-6 mb-1" />
              <span>{t('baking')}</span>
            </button>

            <button onClick={() => setActiveTab('history')} className={`py-2 flex flex-col items-center justify-center text-xs ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.History className="w-6 h-6 mb-1" />
              <span>{t('history')}</span>
            </button>

            <button onClick={() => setActiveTab('starter')} className={`py-2 flex flex-col items-center justify-center text-xs ${activeTab === 'starter' ? 'text-cyan-400' : 'text-slate-400'}`}>
              <ICONS.Knowledge className="w-6 h-6 mb-1" />
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
