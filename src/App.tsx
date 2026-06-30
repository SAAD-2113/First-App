import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import FlashcardItem from './components/FlashcardItem';
import DeckSelector from './components/DeckSelector';
import StatsPanel from './components/StatsPanel';
import DeckManager from './components/DeckManager';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DEFAULT_DECKS } from './data/defaultDecks';
import { Deck, Flashcard } from './types';
import { Sparkles, GraduationCap, RotateCcw, CheckCircle2, ListFilter, AlertCircle, Plus } from 'lucide-react';
import flashLogo from './assets/images/flash_logo_1782807814143.jpg';

export default function App() {
  // 1. Core Decks State (Load from localStorage if exists, else defaults to empty)
  const [decks, setDecks] = useState<Deck[]>(() => {
    // Clear initial default decks on startup of the updated version to start with clean slate
    const hasClearedInitial = localStorage.getItem('flashcards_initial_cleared_v4');
    if (!hasClearedInitial) {
      localStorage.setItem('flashcards_initial_cleared_v4', 'true');
      localStorage.setItem('flashcard_decks', JSON.stringify([]));
      localStorage.setItem('active_deck_id', '');
      return [];
    }

    const saved = localStorage.getItem('flashcard_decks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading decks from storage:', e);
      }
    }
    return [];
  });

  // 2. Active Deck State
  const [activeDeckId, setActiveDeckId] = useState<string>(() => {
    const saved = localStorage.getItem('active_deck_id');
    if (saved) return saved;
    return '';
  });

  // 3. Quiz index & flip state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // 4. Mode controllers (Quiz study screen vs Card manager screen)
  const [isManaging, setIsManaging] = useState<boolean>(false);
  
  // 4b. Confirmation Dialog states
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // 5. Streak states (Daily studying reward mechanics)
  const [streak, setStreak] = useState<number>(() => {
    const savedStreak = localStorage.getItem('study_streak');
    return savedStreak ? parseInt(savedStreak, 10) : 1;
  });

  // Save decks & active selection to localStorage on changes
  useEffect(() => {
    localStorage.setItem('flashcard_decks', JSON.stringify(decks));
  }, [decks]);

  // Set high-octane favicon & touch icon dynamically with bundled asset URL
  useEffect(() => {
    const linkFavicon = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
    linkFavicon.type = 'image/jpeg';
    linkFavicon.rel = 'icon';
    linkFavicon.href = flashLogo;
    document.getElementsByTagName('head')[0].appendChild(linkFavicon);

    const appleTouch = (document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement) || document.createElement('link');
    appleTouch.rel = 'apple-touch-icon';
    appleTouch.href = flashLogo;
    document.getElementsByTagName('head')[0].appendChild(appleTouch);
  }, []);

  useEffect(() => {
    localStorage.setItem('active_deck_id', activeDeckId);
    // Reset index when changing decks
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [activeDeckId]);

  // Handle Streak Calculations on launch
  useEffect(() => {
    const lastDateStr = localStorage.getItem('last_study_date');
    const todayStr = new Date().toISOString().split('T')[0];

    if (lastDateStr) {
      if (lastDateStr !== todayStr) {
        const lastDate = new Date(lastDateStr);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Studied yesterday, increment streak!
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('study_streak', newStreak.toString());
        } else if (diffDays > 1) {
          // Streak broken
          setStreak(1);
          localStorage.setItem('study_streak', '1');
        }
        localStorage.setItem('last_study_date', todayStr);
      }
    } else {
      localStorage.setItem('last_study_date', todayStr);
      localStorage.setItem('study_streak', '1');
    }
  }, []);

  const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0] || null;
  const currentCard = activeDeck?.cards[currentIndex] || null;

  // Navigation handlers
  const handleNext = () => {
    if (!activeDeck) return;
    if (currentIndex < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      // Brief delay for card slide visual effect resetting
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
      }, 100);
    }
  };

  // Toggle Mastery status on active card
  const handleToggleMastered = () => {
    if (!activeDeck || !currentCard) return;
    
    // Update decks state
    setDecks(prevDecks => 
      prevDecks.map(deck => {
        if (deck.id === activeDeckId) {
          return {
            ...deck,
            cards: deck.cards.map(card => {
              if (card.id === currentCard.id) {
                return { ...card, isMastered: !card.isMastered };
              }
              return card;
            })
          };
        }
        return deck;
      })
    );
  };

  // Reset progress of all cards in active deck
  const handleResetProgress = () => {
    if (!activeDeck) return;
    setShowResetConfirm(true);
  };

  const executeResetProgress = () => {
    if (!activeDeck) return;
    setDecks(prevDecks =>
      prevDecks.map(deck => {
        if (deck.id === activeDeckId) {
          return {
            ...deck,
            cards: deck.cards.map(card => ({ ...card, isMastered: false }))
          };
        }
        return deck;
      })
    );
    setIsFlipped(false);
    setCurrentIndex(0);
    setShowResetConfirm(false);
  };

  // Deck adding / deleting callbacks
  const handleAddDeck = (title: string, description: string, iconName: string, color: string, cards: Flashcard[] = []) => {
    const newDeckId = `custom-deck-${Date.now()}`;
    const newDeck: Deck = {
      id: newDeckId,
      title,
      description,
      iconName,
      color,
      cards
    };
    setDecks(prev => [...prev, newDeck]);
    setActiveDeckId(newDeckId);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(d => d.id !== deckId));
  };

  // Card adding, editing, deleting callbacks
  const handleAddCards = (deckId: string, cardsToAdd: { question: string; answer: string }[]) => {
    const newCards: Flashcard[] = cardsToAdd.map((c, idx) => ({
      id: `card-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      question: c.question,
      answer: c.answer,
      isMastered: false
    }));

    setDecks(prev =>
      prev.map(d => {
        if (d.id === deckId) {
          return {
            ...d,
            cards: newCards
          };
        }
        return d;
      })
    );
  };

  const handleAddCard = (deckId: string, question: string, answer: string) => {
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      question,
      answer,
      isMastered: false
    };

    setDecks(prev =>
      prev.map(d => {
        if (d.id === deckId) {
          return {
            ...d,
            cards: [...d.cards, newCard]
          };
        }
        return d;
      })
    );
  };

  const handleEditCard = (deckId: string, cardId: string, updatedFields: Partial<Flashcard>) => {
    setDecks(prev =>
      prev.map(d => {
        if (d.id === deckId) {
          return {
            ...d,
            cards: d.cards.map(c => (c.id === cardId ? { ...c, ...updatedFields } : c))
          };
        }
        return d;
      })
    );
  };

  const handleDeleteCard = (deckId: string, cardId: string) => {
    setDecks(prev =>
      prev.map(d => {
        if (d.id === deckId) {
          const filtered = d.cards.filter(c => c.id !== cardId);
          return {
            ...d,
            cards: filtered
          };
        }
        return d;
      })
    );
    
    // Reset index if we just deleted the active card or went out of bounds
    if (activeDeckId === deckId) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  // Calculate if deck is fully completed/mastered
  const isDeckMastered = activeDeck && activeDeck.cards.length > 0 && activeDeck.cards.every(c => c.isMastered);

  return (
    <MobileFrame>
      {isManaging ? (
        <DeckManager
          decks={decks}
          onAddDeck={handleAddDeck}
          onDeleteDeck={handleDeleteDeck}
          onAddCard={handleAddCard}
          onAddCards={handleAddCards}
          onEditCard={handleEditCard}
          onDeleteCard={handleDeleteCard}
          onClose={() => setIsManaging(false)}
          activeDeckId={activeDeckId}
        />
      ) : (
        /* STUDY WORKSPACE SCREEN */
        <div className="flex flex-col flex-1 bg-transparent relative pb-6" id="study-workspace">
          
          {/* Header Row */}
          <div className="backdrop-blur-xl bg-black/40 border-b border-amber-500/25 px-5 py-4 flex justify-between items-center shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <img 
                src={flashLogo} 
                alt="The Flash Logo" 
                className="w-10 h-10 rounded-full border-2 border-amber-400 shadow-md object-cover flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-lg font-black text-white tracking-wider uppercase flex items-center gap-1 leading-none">
                  The <span className="text-amber-400">Flash</span>
                </h1>
                <p className="text-[9px] text-amber-300 font-black tracking-widest uppercase mt-1 leading-none">STUDY ENGINE</p>
              </div>
            </div>

            <button
              onClick={() => setIsManaging(true)}
              className="px-3.5 py-2 backdrop-blur-md bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/30 active:scale-95 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-black shadow-md flex items-center gap-1 transition-all"
              id="btn-goto-manager"
            >
              <Plus size={13} />
              Customize
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pt-4 pb-2">
            
            {/* Gamification Celebration Overlay if Deck Mastered */}
            {isDeckMastered ? (
              <div className="mx-4 backdrop-blur-xl bg-emerald-500/20 border border-emerald-500/30 text-white rounded-3xl p-6 text-center shadow-lg relative overflow-hidden" id="deck-completed-banner">
                {/* Decorative sparkles circles */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -left-6 -top-6 w-20 h-20 bg-white/10 rounded-full" />
                
                <CheckCircle2 size={36} className="mx-auto text-emerald-300 mb-2.5 animate-bounce" />
                <h2 className="text-base font-extrabold mb-1">Deck Mastered!</h2>
                <p className="text-xs text-emerald-100/90 text-center leading-relaxed mb-4 font-medium">
                  Amazing work! You successfully memorized all {activeDeck?.cards.length} cards in this study deck.
                </p>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleResetProgress}
                    className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm"
                    id="btn-reset-mastered-deck"
                  >
                    <RotateCcw size={12} />
                    Reset Progress
                  </button>
                  <button
                    onClick={() => {
                      // Switch to another deck
                      const other = decks.find(d => d.id !== activeDeckId);
                      if (other) setActiveDeckId(other.id);
                    }}
                    className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 border border-white/15 text-white font-bold text-xs rounded-xl transition-all"
                    id="btn-switch-mastered-deck"
                  >
                    Study Another
                  </button>
                </div>
              </div>
            ) : null}

            {/* Empty Deck Alert State */}
            {decks.length === 0 ? (
              <div className="mx-4 backdrop-blur-md bg-white/10 border border-dashed border-white/20 p-8 rounded-3xl text-center flex flex-col items-center justify-center text-white animate-fadeIn" id="no-decks-onboarding">
                <GraduationCap size={44} className="text-amber-400 mb-3 animate-bounce" />
                <h3 className="text-sm font-extrabold text-white">Welcome to Flash Study Station!</h3>
                <p className="text-xs text-white/70 max-w-[280px] leading-relaxed mt-1 mb-5 font-medium">
                  Your workspace is currently clear with no decks or cards. Create your first flashcard deck to begin!
                </p>
                <button
                  onClick={() => setIsManaging(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-red-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                  id="btn-create-first-deck"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Create Your First Deck
                </button>
              </div>
            ) : !currentCard ? (
              <div className="mx-4 backdrop-blur-md bg-white/10 border border-dashed border-white/20 p-8 rounded-3xl text-center flex flex-col items-center justify-center text-white" id="empty-deck-alert">
                <AlertCircle size={32} className="text-white/40 mb-2.5" />
                <h3 className="text-sm font-extrabold text-white">Empty Deck Selected</h3>
                <p className="text-xs text-white/70 max-w-[240px] leading-relaxed mt-1 mb-4 font-medium">
                  This deck doesn't have any flashcards yet. Customize this deck to add card questions and answers!
                </p>
                <button
                  onClick={() => setIsManaging(true)}
                  className="px-4 py-2.5 bg-white hover:bg-opacity-95 text-[#a855f7] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  id="btn-add-card-now"
                >
                  <Plus size={13} />
                  Add Cards Now
                </button>
              </div>
            ) : (
              /* ACTIVE FLASHCARD CARD & NAVIGATION ROW */
              <FlashcardItem
                card={currentCard}
                index={currentIndex}
                total={activeDeck?.cards.length || 0}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onToggleMastered={handleToggleMastered}
              />
            )}

            {/* ANALYTICS SECTION */}
            {activeDeck && activeDeck.cards.length > 0 && (
              <StatsPanel 
                activeDeck={activeDeck} 
                onResetProgress={handleResetProgress}
                streak={streak}
              />
            )}

            {/* SELECTION DECKS DROPDOWN/LIST */}
            {decks.length > 0 && (
              <DeckSelector
                decks={decks}
                activeDeckId={activeDeckId}
                onSelectDeck={setActiveDeckId}
                onOpenDeckManager={() => setIsManaging(true)}
              />
            )}

          </div>

          {/* Minimalist Visual footer label */}
          <div className="text-center text-[10px] text-white/30 font-bold tracking-wider uppercase select-none pointer-events-none pb-1 mt-auto">
            Self-Guided Study Engine
          </div>

          <ConfirmDialog
            isOpen={showResetConfirm}
            title="Reset Study Progress?"
            message={`Are you sure you want to reset all mastery tags in "${activeDeck?.title || ''}"? This action cannot be undone.`}
            confirmText="Reset Progress"
            cancelText="Keep Tags"
            onConfirm={executeResetProgress}
            onCancel={() => setShowResetConfirm(false)}
            variant="warning"
          />

        </div>
      )}
    </MobileFrame>
  );
}
