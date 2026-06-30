import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Deck } from '../types';

interface DeckSelectorProps {
  decks: Deck[];
  activeDeckId: string;
  onSelectDeck: (deckId: string) => void;
  onOpenDeckManager: () => void;
}

// Helper to safely render dynamic icons
export function DynamicIcon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.BookOpen;
  return <IconComponent size={size} className={className} />;
}

export default function DeckSelector({
  decks,
  activeDeckId,
  onSelectDeck,
  onOpenDeckManager
}: DeckSelectorProps) {
  return (
    <div className="w-full px-4 py-3" id="deck-selector-section">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-extrabold text-white/60 uppercase tracking-wider">Select Study Deck</h3>
        <button
          onClick={onOpenDeckManager}
          className="text-xs font-bold text-white hover:bg-white/25 flex items-center gap-1 transition-all backdrop-blur-md bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl shadow-sm"
          id="btn-nav-manage-decks"
        >
          <LucideIcons.Settings size={12} className="text-white/80" />
          Manage Decks
        </button>
      </div>

      <div className="space-y-2.5 max-h-[195px] overflow-y-auto scrollbar-thin pr-0.5">
        {decks.map((deck) => {
          const isActive = deck.id === activeDeckId;
          const masteredCount = deck.cards.filter(c => c.isMastered).length;
          const totalCount = deck.cards.length;
          const progressPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

          return (
            <div
              key={deck.id}
              onClick={() => onSelectDeck(deck.id)}
              className={`group relative w-full text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                isActive
                  ? 'backdrop-blur-xl bg-white/30 border-white/30 shadow-lg'
                  : 'backdrop-blur-md bg-white/10 border-white/15 hover:bg-white/15'
              }`}
              id={`deck-card-${deck.id}`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Icon Container with Gradient */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deck.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <DynamicIcon name={deck.iconName} className="text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-white leading-snug truncate">
                    {deck.title}
                  </h4>
                  <p className="text-[11px] text-white/70 truncate mt-0.5 max-w-[180px] font-medium">
                    {deck.description}
                  </p>
                  
                  {/* Progress Mini Bar */}
                  <div className="flex items-center gap-2 mt-1.5 w-full">
                    <div className="h-1 bg-black/20 rounded-full flex-1 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${deck.color} rounded-full transition-all duration-300`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white/85 shrink-0">
                      {masteredCount}/{totalCount} cards
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="ml-3 shrink-0 flex items-center">
                {isActive ? (
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                    <LucideIcons.Check size={11} className="text-white stroke-[3.5]" />
                  </div>
                ) : (
                  <LucideIcons.ChevronRight size={14} className="text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
