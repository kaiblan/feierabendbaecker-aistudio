import React from 'react';
import { BakerConfig, BakerSession } from '../types';
import { Card } from './Card';
import RangeField from './RangeField';
import LockIcon from './icons/LockIcon';
import Headline from './Headline';
import { useLanguage } from './LanguageContext';
import { calculateBatchWeights } from '../utils/bakerMath';

interface AmountsTabProps {
  session: BakerSession;
  updateConfig: (updates: Partial<BakerConfig>) => void;
  onStartNow: () => void;
}

const AmountsTab: React.FC<AmountsTabProps> = ({ session, updateConfig, onStartNow }) => {
  const { t } = useLanguage();
  const { flour, water, yeast, salt, total } = calculateBatchWeights(session.config);

  return (
    <div className="w-1/2 h-full">
      <div className="max-w-7xl mx-auto px-4 pb-32 overflow-y-auto h-full" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="w-full max-w-3xl mx-auto space-y-6">
          <Card variant="default" className="w-full p-6 mt-4">
            <Headline color="text-white" className="text-xl border-b border-slate-800 pb-3 mb-4">{t('bakerPercentages')}</Headline>
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
                  valueClassName="text-white"
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
                  valueClassName="text-white"
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
                  valueFormatter={(v) => `${v.toFixed(2)}%`}
                  valueClassName="text-white"
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
                  accent="accent-cyan-400"
                  valueFormatter={(v) => v.toFixed(1) + '%'}
                  valueClassName="text-white"
                />
              </div>

            </div>
          </Card>

          <Card variant="subtle" className="w-full p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base text-slate-400">{t('totalFlour')}</span>
                <span className="text-lg font-black mono text-white">{Math.round(flour)}g</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base text-slate-400">{t('water')}</span>
                <span className="text-lg font-black mono text-white">{Math.round(water)}g</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base text-slate-400">{t('yeast')}</span>
                <span className="text-lg font-black mono text-white">{yeast.toFixed(1)}g</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-base text-slate-400">{t('salt')}</span>
                <span className="text-lg font-black mono text-white">{salt.toFixed(1)}g</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-base text-slate-400">
              <span className="tracking-widest">{t('totalBatchWeight')}</span>
              <span className="text-lg font-black mono text-white">{total.toFixed(0)}g</span>
            </div>
          </Card>

          <div className="flex justify-center w-full pt-6">
            <button
              onClick={onStartNow}
              className="group relative px-10 md:px-16 py-4 text-white font-bold rounded-3xl transition-all shadow-2xl active:scale-95 flex items-center space-x-6 overflow-hidden z-10 bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              <span className="relative tracking-[0.2em] text-base md:text-base">{t('start')}</span>
              <svg className="w-5 h-5 md:w-6 md:h-6 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmountsTab;
