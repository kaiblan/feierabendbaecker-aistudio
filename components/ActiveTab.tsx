import React, { useEffect, useRef } from 'react';
import { BakerSession } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import Timeline from './Timeline';
import { formatTime } from '../utils/timeUtils';
import { useLanguage } from './LanguageContext';

interface ActiveTabProps {
  session: BakerSession;
  timeLeft: number;
  setSession: (session: BakerSession) => void;
  setTimeLeft: (time: number) => void;
  onNavigatePlanning: () => void;
}

const ActiveTab: React.FC<ActiveTabProps> = ({
  session,
  timeLeft,
  setSession,
  setTimeLeft,
  onNavigatePlanning,
}) => {
  const { t } = useLanguage();
  const prevTimeLeft = useRef<number>(timeLeft);

  // Request notification permission on mount
  useEffect(() => {
    if (session.status === 'active' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [session.status]);

  // Detect when timer reaches 0 and show notification
  useEffect(() => {
    if (session.status === 'active' && prevTimeLeft.current > 0 && timeLeft === 0) {
      const currentStage = session.stages[session.activeStageIndex];
      if (currentStage && 'Notification' in window && Notification.permission === 'granted') {
        const nextStage = session.stages[session.activeStageIndex + 1];
        const notificationTitle = `${currentStage.label} ${t('complete') || 'Complete'}!`;
        const notificationBody = nextStage 
          ? `${t('nextStage') || 'Next'}: ${nextStage.label}`
          : t('sessionComplete') || 'Baking session complete!';
        
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'bake-timer',
          requireInteraction: true,
        });
      }
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, session.status, session.activeStageIndex, session.stages, t]);

  if (session.status !== 'active') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-8 px-6 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-200 tracking-tight">
            {t('noActiveProcess')}
          </h2>
          <button
            onClick={onNavigatePlanning}
            className="group relative px-10 md:px-16 py-4 text-white font-black rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center justify-center space-x-6 overflow-hidden z-10 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40 mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <span className="relative tracking-[0.2em] uppercase text-xs md:text-sm">
              {t('planning')}
            </span>
            <svg className="w-5 h-5 md:w-6 md:h-6 relative group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
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
                  const now = new Date();
                  const nextStage = session.stages[nextIdx];
                  const endTime = new Date(now.getTime() + nextStage.durationMinutes * 60 * 1000);
                  const updatedStages = [...session.stages];
                  updatedStages[nextIdx] = { ...nextStage, startTime: now, stageEndTime: endTime };
                  setSession({ ...session, stages: updatedStages, activeStageIndex: nextIdx });
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
          />
        </div>
      </section>
    </div>
  );
};

export default ActiveTab;
