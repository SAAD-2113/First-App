import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Star, Info } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardItemProps {
  card: Flashcard;
  index: number;
  total: number;
  isFlipped: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleMastered: () => void;
}

export default function FlashcardItem({
  card,
  index,
  total,
  isFlipped,
  onFlip,
  onNext,
  onPrevious,
  onToggleMastered
}: FlashcardItemProps) {
  
  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked buttons or checkbox, don't flip
    const target = e.target as HTMLElement;
    if (target.closest('.interactive-btn') || target.closest('.master-checkbox')) {
      return;
    }
    onFlip();
  };

  return (
    <div className="w-full flex flex-col items-center px-4" id={`flashcard-wrapper-${card.id}`}>
      {/* Cards Counter Indicator */}
      <div className="flex justify-between items-center w-full max-w-sm mb-3.5 px-1 text-xs text-white/80 font-semibold">
        <span className="backdrop-blur-md bg-white/10 px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
          Card <strong className="text-white font-extrabold">{index + 1}</strong> of <strong className="text-white font-extrabold">{total}</strong>
        </span>
        <button 
          onClick={onToggleMastered}
          className="master-checkbox flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 shadow-sm transition-all text-white"
          title={card.isMastered ? "Mark as Still Learning" : "Mark as Mastered"}
          id={`btn-master-${card.id}`}
        >
          {card.isMastered ? (
            <>
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-300">Mastered</span>
            </>
          ) : (
            <>
              <Star size={12} className="text-white/60" />
              <span className="text-[11px] font-semibold text-white/90">Tap to Master</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Flashcard Stage */}
      <div 
        className="w-full max-w-sm h-80 cursor-pointer perspective-1000 mb-6"
        onClick={handleCardClick}
      >
        <motion.div
          className="relative w-full h-full duration-500 transform-style-3d shadow-2xl rounded-3xl border border-white/20"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* CARD FRONT (Question) */}
          <div 
            className="absolute inset-0 w-full h-full backdrop-blur-xl bg-white/15 border border-white/35 rounded-3xl p-6 flex flex-col backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Header decoration */}
            <div className="flex justify-between items-start text-[10px] text-white/60 mb-2 font-bold uppercase tracking-wider">
              <span>Question</span>
              <span className="flex items-center gap-1 text-[9px] text-white/90 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full lowercase font-medium">
                <Info size={10} className="text-white/70" /> tap card to flip
              </span>
            </div>

            {/* Question Text */}
            <div className="flex-1 flex items-center justify-center text-center px-2">
              <p className="text-lg font-bold text-white leading-relaxed md:text-xl drop-shadow-sm italic">
                "{card.question}"
              </p>
            </div>

            {/* Tap to Flip Hint or "Show Answer" prompt */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="interactive-btn flex items-center gap-1.5 px-5 py-2.5 bg-white text-[#a855f7] hover:bg-opacity-95 rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip();
                }}
                id={`btn-show-answer-${card.id}`}
              >
                <RefreshCw size={13} className="animate-spin-slow text-[#a855f7]" />
                Show Answer
              </button>
            </div>
          </div>

          {/* CARD BACK (Answer) */}
          <div 
            className="absolute inset-0 w-full h-full backdrop-blur-2xl bg-black/35 border border-white/25 rounded-3xl p-6 flex flex-col backface-hidden text-white"
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)' 
            }}
          >
            {/* Header decoration */}
            <div className="flex justify-between items-start text-[10px] text-emerald-300 mb-2 font-bold uppercase tracking-wider">
              <span>Answer Key</span>
              {card.isMastered && (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Mastered
                </span>
              )}
            </div>

            {/* Answer Text */}
            <div className="flex-1 flex items-center justify-center text-center overflow-y-auto px-1 py-2 my-1 max-h-[180px] scrollbar-thin scrollbar-thumb-white/25">
              <p className="text-sm md:text-base font-semibold text-white/95 leading-relaxed">
                {card.answer}
              </p>
            </div>

            {/* Control Actions / Show Question Button */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                className="interactive-btn flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold border border-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip();
                }}
                id={`btn-show-question-${card.id}`}
              >
                <RefreshCw size={12} />
                Show Question
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Buttons (Previous, Next) */}
      <div className="flex items-center justify-between w-full max-w-sm px-1 mb-2">
        <button
          onClick={onPrevious}
          disabled={index === 0}
          className="interactive-btn flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border border-white/10 backdrop-blur-md bg-white/10 text-white shadow-md transition-all hover:bg-white/20 active:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          id="btn-prev-card"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="interactive-btn flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold backdrop-blur-md bg-white/30 hover:bg-white/40 text-white border border-white/25 shadow-md transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          id="btn-next-card"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
