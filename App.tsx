import React, { useState, useEffect, useMemo } from 'react';
import { ICONS, COLORS } from './constants';
import { Session, Stage, StageType, BakerConfig } from './types';
import Timeline from './components/Timeline';
import StageDetail from './components/StageDetail';
import PlanningView from './components/PlanningView';

const DEFAULT_CONFIG: BakerConfig = {
  totalFlour: 1000,
  hydration: 75,
  salt: 2,
  yeast: 0.5, // Default 0.5% yeast
  targetTemp: 24,
  fridgeTemp: 4,
  prefermentEnabled: false,
  autolyseEnabled: true,
  coldBulkEnabled: false,
  coldProofEnabled: false,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planning' | 'active' | 'history' | 'starter' | 'knowledge'>('planning');
  const [startTimeStr, setStartTimeStr] = useState("08:00");
  
  const [session, setSession] = useState<Session>({
    id: 'new-bake',
    name: 'Experimental Batch',
    startTime: new Date(),
    targetEndTime: new Date(),
    stages: [],
    activeStageIndex: 0,
    status: 'planning',
    config: DEFAULT_CONFIG
  });

  const [selectedStageIdx, setSelectedStageIdx] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Re-calculate stages based on config drivers
  const calculatedStages = useMemo(() => {
    // Scientific approximation: 0.5% yeast at 24°C is our baseline (300m bulk, 180m proof)
    const yeastFactor = 0.5 / (session.config.yeast || 0.05);
    const tempEffect = Math.pow(0.85, (session.config.targetTemp - 24) / 2);
    
    let bulkMins = session.config.coldBulkEnabled 
      ? 720 
      : Math.round(300 * yeastFactor * tempEffect);
      
    let proofMins = session.config.coldProofEnabled 
      ? 960 
      : Math.round(180 * yeastFactor * tempEffect);

    const stages: Stage[] = [];
    if (session.config.autolyseEnabled) {
      stages.push({ id: 'a1', type: StageType.AUTOLYSE, label: 'Autolyse', durationMinutes: 60, completed: false, isActive: false });
    }
    stages.push({ id: 'm1', type: StageType.MIXING, label: 'Mixing', durationMinutes: 15, completed: false, isActive: true });
    stages.push({ id: 'f1', type: StageType.STRETCH_AND_FOLD, label: 'Folds', durationMinutes: 45, completed: false, isActive: true });
    stages.push({ id: 'b1', type: StageType.BULK_FERMENTATION, label: session.config.coldBulkEnabled ? 'Cold Bulk' : 'Bulk Ferment', durationMinutes: bulkMins, completed: false, isActive: false });
    stages.push({ id: 's1', type: StageType.SHAPING, label: 'Shaping', durationMinutes: 20, completed: false, isActive: true });
    stages.push({ id: 'pr1', type: StageType.PROVING, label: session.config.coldProofEnabled ? 'Cold Proof' : 'Final Proof', durationMinutes: proofMins, completed: false, isActive: false });
    stages.push({ id: 'bk1', type: StageType.BAKING, label: 'Baking', durationMinutes: 50, completed: false, isActive: true });
    
    return stages;
  }, [session.config]);

  useEffect(() => {
    if (session.status === 'planning' || session.status === 'recipe') {
      setSession(prev => ({ ...prev, stages: calculatedStages }));
    }
  }, [calculatedStages, session.status]);

  // Timer logic for active session
  useEffect(() => {
    if (session.status === 'active' && activeTab === 'active' && !session.stages[session.activeStageIndex]?.completed) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session.status, activeTab, session.activeStageIndex]);

  const handleNextStage = () => {
    if (session.status === 'planning') {
      setSession(prev => ({ ...prev, status: 'recipe' }));
    } else if (session.status === 'recipe') {
      setSession(prev => ({
        ...prev,
        status: 'active',
        activeStageIndex: 0
      }));
      setActiveTab('active');
      setTimeLeft(session.stages[0]?.durationMinutes * 60 || 0);
    }
  };

  const handleUpdateConfig = (updates: Partial<BakerConfig>) => {
    setSession(prev => ({
      ...prev,
      config: { ...prev.config, ...updates }
    }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans">
      <nav className="hidden lg:flex flex-col w-20 border-r border-slate-800 bg-slate-950/50 py-8 items-center space-y-12">
        <div className="w-10 h-10 bg-cyan-600 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-900/50">F</div>
        <div className="flex flex-col space-y-8">
          {(['planning', 'active', 'history', 'starter', 'knowledge'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              title={tab.toUpperCase()}
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
      </nav>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-xl z-10">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{session.name}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-[10px] mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 uppercase tracking-tighter">
                {session.config.hydration}% Hydration
              </span>
              <span className={`text-[10px] mono px-2 py-0.5 rounded border uppercase tracking-tighter ${session.status === 'active' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' : 'bg-amber-950/50 text-amber-400 border-amber-900/50'}`}>
                {session.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] mono text-slate-500 uppercase tracking-widest">Phase</div>
            <div className="text-sm font-bold text-slate-300 mono">{session.status.toUpperCase()}</div>
          </div>
        </header>

        {/* This div is the scrollable container. 
            The PlanningView inside it now handles its own sticky footer logic. */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'planning' && (
            <PlanningView 
              config={session.config}
              status={session.status}
              startTimeStr={startTimeStr}
              onUpdateConfig={handleUpdateConfig}
              onUpdateStartTime={setStartTimeStr}
              onStartProcess={handleNextStage}
            />
          )}

          {activeTab === 'active' && session.status === 'active' && (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-32">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500' : 'bg-slate-700'}`} />
                  <div className="text-[10px] mono text-cyan-500 mb-2 uppercase tracking-[0.3em] font-bold">
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
                    <div className="text-[10px] mono text-slate-500 mb-4 uppercase tracking-widest">UPCOMING</div>
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
                  <h3 className="text-[10px] font-bold text-slate-500 mono uppercase tracking-[0.3em]">Session Progress</h3>
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
              <span className="text-[10px] font-bold text-slate-500 mono uppercase tracking-[0.2em]">Parameter Log</span>
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