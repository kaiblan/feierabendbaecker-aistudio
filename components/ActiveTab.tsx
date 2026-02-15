import React, { useEffect, useRef, useState } from 'react';
import { BakerSession } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import ActiveTimeline from './ActiveTimeline';
import { formatTime, formatDateAsTime } from '../utils/timeUtils';
import { useLanguage } from './LanguageContext';
import Headline from './Headline';
import ConfirmationModal from './ConfirmationModal';

interface ActiveTabProps {
  session: BakerSession;
  timeLeft: number;
  resetSession: () => void;
  setTimeLeft: (time: number) => void;
  advanceToNextStage: () => void;
  onNavigatePlanning: () => void;
}

const ActiveTab: React.FC<ActiveTabProps> = ({
  session,
  timeLeft,
  resetSession,
  setTimeLeft,
  advanceToNextStage,
  onNavigatePlanning,
}) => {
  const { t } = useLanguage();
  const prevTimeLeft = useRef<number>(timeLeft);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

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
          <Button
            onClick={onNavigatePlanning}
            variant="primary"
            size="lg"
            shimmer
            className="mx-auto rounded-3xl flex items-center justify-center space-x-6"
          >
            <span className="relative tracking-[0.2em] text-base md:text-base">
              {t('planning')}
            </span>
            <svg className="w-5 h-5 md:w-6 md:h-6 relative group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8 animate-fade-in pb-32">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="highlight" className="md:col-span-2 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500' : 'bg-slate-700'}`} />
          <Headline className="mb-2">
            {t('workingStep')}
          </Headline>
          <h2 className="text-4xl font-medium mb-6 tracking-tight">{session.stages[session.activeStageIndex]?.label}</h2>
          <div className="text-7xl mono font-bold text-white tracking-tighter mb-4 tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full transition-all duration-1000 ${session.stages[session.activeStageIndex]?.isActive ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-400 opacity-50'}`}
              style={{ width: `${(1 - timeLeft / ((session.stages[session.activeStageIndex]?.durationMinutes || 1) * 60)) * 100}%` }}
            />
          </div>
          <div className="mt-6 w-full">
            <Button
              onClick={advanceToNextStage}
              variant="primary"
              size="lg"
              className="mx-auto w-auto px-6 tracking-widest text-base"
            >
              {t('completeAndAdvance')}
            </Button>
          </div>
        </Card>

        <Card variant="subtle" className="flex flex-col justify-center items-center text-center px-8 py-6">
          <div>
            <Headline color="text-muted" className="mb-4">{t('upcoming')}</Headline>
              <div className="text-lg font-bold text-white">
                {(() => {
                  const next = session.stages[session.activeStageIndex + 1];
                  if (!next) return t('sessionEnd');
                  // determine start time if available
                  let start: Date | null = null;
                  if (next.startTime) start = new Date(next.startTime);
                  else if (next.stageEndTime) start = new Date(new Date(next.stageEndTime).getTime() - next.durationMinutes * 60000);
                  if (start) return `${next.label} · ${formatDateAsTime(start)}`;
                  return next.label;
                })()}
              </div>
          </div>
          
        </Card>
      </div>

      <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
          <Headline color="text-muted">{t('sessionProgress')}</Headline>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
          <ActiveTimeline
            stages={session.stages}
            activeIndex={session.activeStageIndex}
            orientation="horizontal"
          />
        </div>
      </section>
      <div className="flex justify-center mt-6">
        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsCancelOpen(true)}
          className="w-64"
        >
          {t('cancelSession')}
        </Button>
      </div>

      <ConfirmationModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={() => {
          resetSession();
          setTimeLeft(0);
        }}
        title={t('cancelSession')}
        message={t('cancelSessionConfirm')}
        confirmText={t('cancelSession')}
        cancelText={t('resumeSession')}
        isDangerous={true}
      />
    </div>
  );
};

export default ActiveTab;
