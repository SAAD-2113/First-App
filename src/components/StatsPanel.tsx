import React from 'react';
import { Award, BookOpen, Flame, RotateCcw, TrendingUp } from 'lucide-react';
import { Deck } from '../types';

interface StatsPanelProps {
  activeDeck: Deck;
  onResetProgress: () => void;
  streak: number;
}

export default function StatsPanel({ activeDeck, onResetProgress, streak }: StatsPanelProps) {
  const cards = activeDeck.cards;
  const totalCards = cards.length;
  const masteredCount = cards.filter(c => c.isMastered).length;
  const learningCount = totalCards - masteredCount;
  const progressPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return (
    <div className="w-full px-4 py-2" id="stats-panel-section">
      <h3 className="text-xs font-extrabold text-white/60 uppercase tracking-wider mb-2.5 px-1">Study Analytics</h3>
      
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        
        {/* Streak Counter */}
        <div className="backdrop-blur-md bg-white/10 border border-white/15 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-amber-300">
            <Flame size={14} className="fill-amber-300/20 text-amber-300" />
            <span className="text-[9px] font-bold text-amber-200 bg-amber-500/20 border border-amber-500/15 px-1.5 py-0.5 rounded">Streak</span>
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-white leading-none">{streak}d</div>
            <p className="text-[9px] text-white/70 font-semibold mt-1">Daily Study</p>
          </div>
        </div>

        {/* Mastered Card Stat */}
        <div className="backdrop-blur-md bg-white/10 border border-white/15 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-emerald-300">
            <Award size={14} className="fill-emerald-300/10 text-emerald-300" />
            <span className="text-[9px] font-bold text-emerald-200 bg-emerald-500/20 border border-emerald-500/15 px-1.5 py-0.5 rounded">{progressPercent}%</span>
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-white leading-none">{masteredCount}</div>
            <p className="text-[9px] text-white/70 font-semibold mt-1">Mastered</p>
          </div>
        </div>

        {/* Learning Card Stat */}
        <div className="backdrop-blur-md bg-white/10 border border-white/15 p-2.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start text-amber-300">
            <BookOpen size={14} className="text-amber-300" />
            <span className="text-[9px] font-bold text-amber-100 bg-amber-500/20 border border-amber-500/15 px-1.5 py-0.5 rounded">Learn</span>
          </div>
          <div className="mt-2">
            <div className="text-base font-extrabold text-white leading-none">{learningCount}</div>
            <p className="text-[9px] text-white/70 font-semibold mt-1">Remaining</p>
          </div>
        </div>

      </div>

      {/* Progress & Reset Control */}
      <div className="backdrop-blur-md bg-white/10 border border-white/15 p-3 rounded-2xl flex items-center justify-between shadow-sm text-white">
        <div className="flex-1 mr-4">
          <div className="flex justify-between text-[11px] font-semibold text-white/80 mb-1">
            <span>Deck Progress</span>
            <span className="text-white font-bold">{masteredCount} of {totalCards} Mastered</span>
          </div>
          <div className="h-2 bg-black/25 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${activeDeck.color} rounded-full transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={onResetProgress}
          disabled={masteredCount === 0}
          className="text-[10px] font-bold text-rose-200 hover:text-white border border-rose-500/20 bg-rose-500/15 hover:bg-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-all"
          title="Reset deck progress to unlearned"
          id="btn-reset-deck-progress"
        >
          <RotateCcw size={10} />
          Reset
        </button>
      </div>
    </div>
  );
}
