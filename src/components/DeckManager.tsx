import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ChevronLeft, Save, X, BookOpen, 
  Smartphone, Globe, Orbit, GraduationCap, Heart, Cpu, Sparkles 
} from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { DynamicIcon } from './DeckSelector';
import { ConfirmDialog } from './ConfirmDialog';

interface DeckManagerProps {
  decks: Deck[];
  onAddDeck: (title: string, description: string, iconName: string, color: string, cards?: Flashcard[]) => void;
  onDeleteDeck: (deckId: string) => void;
  onAddCard: (deckId: string, question: string, answer: string) => void;
  onAddCards: (deckId: string, cards: { question: string; answer: string }[]) => void;
  onEditCard: (deckId: string, cardId: string, updatedFields: Partial<Flashcard>) => void;
  onDeleteCard: (deckId: string, cardId: string) => void;
  onClose: () => void;
  activeDeckId: string;
  onResetEntireApp?: () => void;
}

const AVAILABLE_ICONS = [
  'BookOpen', 'Smartphone', 'Globe', 'Orbit', 'GraduationCap', 'Heart', 'Cpu'
];

const AVAILABLE_COLORS = [
  { name: 'Sky Blue', value: 'from-blue-500 to-cyan-500' },
  { name: 'Royal Indigo', value: 'from-indigo-500 to-purple-500' },
  { name: 'Neon Violet', value: 'from-fuchsia-500 to-pink-500' },
  { name: 'Amber Sunset', value: 'from-amber-500 to-rose-500' },
  { name: 'Emerald Forest', value: 'from-emerald-500 to-teal-500' },
  { name: 'Slate Cosmic', value: 'from-slate-700 to-slate-900' }
];

export default function DeckManager({
  decks,
  onAddDeck,
  onDeleteDeck,
  onAddCard,
  onAddCards,
  onEditCard,
  onDeleteCard,
  onClose,
  activeDeckId,
  onResetEntireApp
}: DeckManagerProps) {
  
  const [selectedDeckId, setSelectedDeckId] = useState<string>(activeDeckId);
  const [showAddDeck, setShowAddDeck] = useState(false);

  // Sync selectedDeckId when activeDeckId changes or when a deck is created
  useEffect(() => {
    if (activeDeckId) {
      setSelectedDeckId(activeDeckId);
    } else if (decks.length > 0 && (!selectedDeckId || !decks.some(d => d.id === selectedDeckId))) {
      setSelectedDeckId(decks[0].id);
    }
  }, [activeDeckId, decks, selectedDeckId]);

  // AI Deck and Card Generation states
  const [showAIDeck, setShowAIDeck] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingDeck, setIsGeneratingDeck] = useState(false);

  const [showAICards, setShowAICards] = useState(false);
  const [aiCardsTopic, setAiCardsTopic] = useState('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);

  const [aiError, setAiError] = useState<string | null>(null);

  const handleAIDeckGenerate = async () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingDeck(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate deck.");
      }

      const data = await response.json();
      if (!data.title || !Array.isArray(data.cards)) {
        throw new Error("Invalid response format from server.");
      }

      // Generate deck with cards!
      const formattedCards: Flashcard[] = data.cards.map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        question: c.question,
        answer: c.answer,
        isMastered: false
      }));

      onAddDeck(
        data.title,
        data.description || `AI generated study deck for ${aiTopic.trim()}`,
        data.iconName || 'BookOpen',
        data.color || 'from-indigo-500 to-purple-500',
        formattedCards
      );

      // Reset states
      setAiTopic('');
      setShowAIDeck(false);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during generation. Please try again.");
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const handleAICardsGenerate = async () => {
    if (!aiCardsTopic.trim() || !selectedDeckId) return;
    setIsGeneratingCards(true);
    setAiError(null);

    try {
      // We pass the deck title + specific focus to make it contextually relevant!
      const contextTopic = `${currentDeck?.title} - Focus: ${aiCardsTopic.trim()}`;
      const response = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: contextTopic }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate cards.");
      }

      const data = await response.json();
      if (!Array.isArray(data.cards)) {
        throw new Error("Invalid response format from server.");
      }

      // Bulk add cards to existing deck!
      onAddCards(selectedDeckId, data.cards);

      // Reset states
      setAiCardsTopic('');
      setShowAICards(false);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Something went wrong during card generation. Please try again.");
    } finally {
      setIsGeneratingCards(false);
    }
  };
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckIcon, setNewDeckIcon] = useState('BookOpen');
  const [newDeckColor, setNewDeckColor] = useState('from-indigo-500 to-purple-500');

  // Flashcard addition states
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');

  // Flashcard editing states
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Custom confirmation modal states
  const [deckToDeleteId, setDeckToDeleteId] = useState<string | null>(null);
  const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null);
  const [showResetAppConfirm, setShowResetAppConfirm] = useState(false);

  const currentDeck = decks.find(d => d.id === selectedDeckId) || decks[0] || null;

  const handleCreateDeckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    
    onAddDeck(
      newDeckTitle.trim(),
      newDeckDesc.trim() || 'Custom flashcard study collection.',
      newDeckIcon,
      newDeckColor
    );
    
    // Reset form
    setNewDeckTitle('');
    setNewDeckDesc('');
    setShowAddDeck(false);
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) return;

    onAddCard(selectedDeckId, newCardQuestion.trim(), newCardAnswer.trim());
    
    // Reset form
    setNewCardQuestion('');
    setNewCardAnswer('');
    setShowAddCard(false);
  };

  const handleStartEdit = (card: Flashcard) => {
    setEditingCardId(card.id);
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
  };

  const handleSaveEdit = (cardId: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    onEditCard(selectedDeckId, cardId, {
      question: editQuestion.trim(),
      answer: editAnswer.trim()
    });
    setEditingCardId(null);
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative" id="deck-manager-container">
      
      {/* Top Header Row */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/15 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-white/80 hover:text-white font-bold text-xs transition-colors"
          id="btn-back-to-quiz"
        >
          <ChevronLeft size={16} />
          Back to Study
        </button>
        <span className="text-sm font-extrabold text-white">Card Custodian</span>
        <div className="w-16" /> {/* Balance spacer */}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-5">
        
        {/* ==================== 1. DECK SELECTION & ADD DECK SECTION ==================== */}
        <div className="backdrop-blur-xl bg-white/10 p-4 rounded-3xl shadow-lg border border-white/15 text-white">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-white">Select Active Deck</h3>
              <p className="text-[11px] text-white/60 font-semibold">Choose deck to edit cards</p>
            </div>
            {!showAddDeck && !showAIDeck && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAIDeck(true);
                    setShowAddDeck(false);
                    setAiError(null);
                  }}
                  className="flex items-center gap-1 backdrop-blur-md bg-gradient-to-r from-amber-500/25 to-red-500/25 hover:from-amber-500/35 hover:to-red-500/35 text-amber-200 border border-amber-500/25 font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all shadow-sm"
                  id="btn-show-ai-deck"
                >
                  <Sparkles size={11} className="fill-amber-300/25 animate-pulse" />
                  AI Deck Maker
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeck(true);
                    setShowAIDeck(false);
                  }}
                  className="flex items-center gap-1 backdrop-blur-md bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all"
                  id="btn-show-add-deck"
                >
                  <Plus size={12} />
                  New Deck
                </button>
              </div>
            )}
          </div>

          {/* AI Deck Maker Form Drawer */}
          {showAIDeck && (
            <div className="backdrop-blur-md bg-black/30 p-4 rounded-2xl border border-amber-500/25 space-y-3.5 mb-3 animate-fadeIn relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

              <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-300 fill-amber-300/20" /> 
                  AI Flashcard Deck Architect
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowAIDeck(false)}
                  className="text-white/60 hover:text-white"
                  disabled={isGeneratingDeck}
                >
                  <X size={14} />
                </button>
              </div>

              {aiError && (
                <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl flex items-start gap-1.5 leading-normal">
                  <span className="font-extrabold text-rose-400 mt-0.5 shrink-0">⚠️</span>
                  <span>{aiError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs text-white">
                <div>
                  <label className="block text-white/80 font-bold mb-1">What topic do you want to master?</label>
                  <input
                    type="text"
                    required
                    disabled={isGeneratingDeck}
                    placeholder="e.g. Photosynthesis, French Greetings, CSS Grid..."
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 font-semibold text-white placeholder-white/30 focus:ring-1 focus:ring-amber-400 focus:bg-white/15 focus:outline-none"
                    maxLength={50}
                    id="input-ai-topic"
                  />
                  <p className="text-[10px] text-white/50 font-medium mt-1 leading-normal">
                    Gemini AI will outline curriculum, write cards, and pick icons & colors.
                  </p>
                </div>
              </div>

              {isGeneratingDeck ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2 text-center bg-white/5 rounded-xl border border-white/5">
                  <Sparkles size={24} className="text-amber-300 fill-amber-300/20 animate-spin" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-amber-200">Architecting Study Deck...</p>
                    <p className="text-[10px] text-white/60 font-medium animate-pulse">Drafting questions, curating color themes...</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAIDeck(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAIDeckGenerate}
                    className="px-4 py-2 text-xs font-extrabold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 rounded-xl shadow-md transition-all flex items-center gap-1"
                    id="btn-ai-generate-deck"
                  >
                    <Sparkles size={12} className="fill-amber-950/20" />
                    Generate Deck
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Add Deck Form Drawer */}
          {showAddDeck && (
            <form onSubmit={handleCreateDeckSubmit} className="backdrop-blur-md bg-black/25 p-3.5 rounded-2xl border border-white/15 space-y-3 mb-3 animate-fadeIn">
              <div className="flex justify-between items-center pb-1 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-300" /> Design Custom Deck
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowAddDeck(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-white/80 font-bold mb-1">Deck Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Biology Vocabulary"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-white placeholder-white/40 focus:ring-1 focus:ring-white/40 focus:bg-white/20 focus:outline-none"
                    maxLength={30}
                    id="input-deck-title"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-bold mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Short description of your deck"
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-white placeholder-white/40 focus:ring-1 focus:ring-white/40 focus:bg-white/20 focus:outline-none"
                    maxLength={100}
                    id="input-deck-desc"
                  />
                </div>

                {/* Choose Icon */}
                <div>
                  <label className="block text-white/80 font-bold mb-1.5">Choose Icon</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setNewDeckIcon(iconName)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                          newDeckIcon === iconName 
                            ? 'bg-white/30 text-white border-white/40 shadow-sm' 
                            : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/15'
                        }`}
                      >
                        <DynamicIcon name={iconName} size={15} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Choose Color Gradient Theme */}
                <div>
                  <label className="block text-white/80 font-bold mb-1.5">Color Theme</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {AVAILABLE_COLORS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setNewDeckColor(col.value)}
                        className={`p-1.5 rounded-xl border text-[10px] font-bold text-left flex items-center gap-1.5 transition-all ${
                          newDeckColor === col.value 
                            ? 'bg-white/30 text-white border-white/35 shadow-sm' 
                            : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded bg-gradient-to-br ${col.value} shrink-0`} />
                        <span className="truncate">{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddDeck(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-[#a855f7] bg-white hover:bg-opacity-90 rounded-lg shadow-sm"
                  id="btn-save-deck"
                >
                  Create Deck
                </button>
              </div>
            </form>
          )}

          {/* Quick Horizontal Scroll of Decks */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {decks.map((deck) => {
              const isSelected = deck.id === selectedDeckId;
              const isDefault = ['flutter-basics', 'web-development', 'space-trivia'].includes(deck.id);
              return (
                <div key={deck.id} className="relative shrink-0 flex items-center">
                  <button
                    onClick={() => setSelectedDeckId(deck.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-white/30 text-white border-white/30 shadow-md'
                        : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    <DynamicIcon name={deck.iconName} size={13} />
                    <span>{deck.title}</span>
                    <span className="text-[10px] opacity-60 font-medium">({deck.cards.length})</span>
                  </button>

                  {/* Delete deck if custom */}
                  {!isDefault && isSelected && (
                    <button
                      type="button"
                      onClick={() => setDeckToDeleteId(deck.id)}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600 transition-colors"
                      title="Delete deck"
                      id={`btn-delete-deck-${deck.id}`}
                    >
                      <X size={8} className="stroke-[3]" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================== 2. FLASHCARDS LIST & MANAGE CARDS ==================== */}
        {currentDeck ? (
          <div className="backdrop-blur-xl bg-white/10 p-4 rounded-3xl shadow-lg border border-white/15 flex-1 flex flex-col text-white">
            <div className="flex justify-between items-center mb-3">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm font-extrabold text-white truncate">
                  Cards in <span className="text-[#f472b6] font-black">{currentDeck.title}</span>
                </h3>
                <p className="text-[11px] text-white/60 font-semibold truncate">Manage individual quiz cards</p>
              </div>
              
              {!showAddCard && !showAICards && (
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAICards(true);
                      setShowAddCard(false);
                      setAiError(null);
                    }}
                    className="flex items-center gap-1 backdrop-blur-md bg-gradient-to-r from-amber-500/25 to-red-500/25 hover:from-amber-500/35 hover:to-red-500/35 text-amber-200 border border-amber-500/25 font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all shadow-sm"
                    id="btn-show-ai-cards"
                  >
                    <Sparkles size={11} className="fill-amber-300/25 animate-pulse" />
                    AI Regenerate Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCard(true);
                      setShowAICards(false);
                    }}
                    className="flex items-center gap-1 backdrop-blur-md bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-[11px] px-2.5 py-1.5 rounded-xl transition-all"
                    id="btn-show-add-card"
                  >
                    <Plus size={12} />
                    Add Card
                  </button>
                </div>
              )}
            </div>

            {/* AI Add Cards Form Box */}
            {showAICards && (
              <div className="backdrop-blur-md bg-black/30 border border-amber-500/20 p-4 rounded-2xl space-y-3.5 mb-4 animate-fadeIn relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />

                <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-300 fill-amber-300/20" />
                    AI Card Regenerator
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowAICards(false)}
                    className="text-white/60 hover:text-white"
                    disabled={isGeneratingCards}
                  >
                    <X size={14} />
                  </button>
                </div>

                {aiError && (
                  <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl flex items-start gap-1.5 leading-normal">
                    <span className="font-extrabold text-rose-400 mt-0.5 shrink-0">⚠️</span>
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="space-y-3 text-xs text-white">
                  <div>
                    <label className="block text-white/80 font-bold mb-1">Focus or sub-topic for new cards</label>
                    <input
                      type="text"
                      required
                      disabled={isGeneratingCards}
                      placeholder={`e.g. Basic concepts, advanced questions, formulas...`}
                      value={aiCardsTopic}
                      onChange={(e) => setAiCardsTopic(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 font-semibold text-white placeholder-white/30 focus:ring-1 focus:ring-amber-400 focus:bg-white/15 focus:outline-none"
                      maxLength={60}
                      id="input-ai-cards-topic"
                    />
                    <p className="text-[10px] text-amber-200/70 font-semibold mt-1 leading-normal">
                      Note: This will delete all current cards in <span className="text-amber-300 font-black">{currentDeck.title}</span> and replace them with 5 newly generated cards on this specific focus.
                    </p>
                  </div>
                </div>

                {isGeneratingCards ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2 text-center bg-white/5 rounded-xl border border-white/5">
                    <Sparkles size={24} className="text-amber-300 fill-amber-300/20 animate-spin" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-amber-200">Writing Flashcards...</p>
                      <p className="text-[10px] text-white/60 font-medium animate-pulse">Drafting questions & answers...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAICards(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAICardsGenerate}
                      className="px-4 py-2 text-xs font-extrabold text-red-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 rounded-xl shadow-md transition-all flex items-center gap-1"
                      id="btn-ai-generate-cards"
                    >
                      <Sparkles size={12} className="fill-red-950/20" />
                      Regenerate Deck
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Add Card Form Box */}
            {showAddCard && (
              <form onSubmit={handleCreateCardSubmit} className="backdrop-blur-md bg-black/25 border border-white/15 p-3.5 rounded-2xl space-y-3 mb-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-1 border-b border-white/10">
                  <span className="text-xs font-bold text-white">Create New Study Card</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddCard(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-white/80 font-bold mb-1">Front: Question</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. What does API stand for?"
                      value={newCardQuestion}
                      onChange={(e) => setNewCardQuestion(e.target.value)}
                      className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-white placeholder-white/45 focus:ring-1 focus:ring-white/40 focus:bg-white/20 focus:outline-none resize-none"
                      maxLength={180}
                      id="input-card-question"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Back: Answer Key</label>
                    <textarea
                      required
                      rows={2.5}
                      placeholder="e.g. Application Programming Interface. It defines protocols..."
                      value={newCardAnswer}
                      onChange={(e) => setNewCardAnswer(e.target.value)}
                      className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-white placeholder-white/45 focus:ring-1 focus:ring-white/40 focus:bg-white/20 focus:outline-none resize-none"
                      maxLength={280}
                      id="input-card-answer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-[#a855f7] bg-white hover:bg-opacity-90 rounded-lg shadow-sm"
                    id="btn-save-card"
                  >
                    Add to Deck
                  </button>
                </div>
              </form>
            )}

            {/* List of Cards */}
            {currentDeck.cards.length === 0 ? (
              <div className="text-center py-8 px-4 bg-white/5 border border-dashed border-white/20 rounded-2xl">
                <BookOpen size={24} className="mx-auto text-white/40 mb-1.5" />
                <p className="text-xs font-bold text-white/70">No cards in this deck yet</p>
                <p className="text-[10px] text-white/50 mt-0.5">Click "Add Card" above to insert your first quiz card.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/20">
                {currentDeck.cards.map((card, idx) => {
                  const isEditing = editingCardId === card.id;

                  return (
                    <div 
                      key={card.id} 
                      className={`p-3 rounded-2xl border text-xs transition-all ${
                        isEditing 
                          ? 'bg-black/20 border-white/30 shadow-inner' 
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {isEditing ? (
                        /* Card Editing Mode Form */
                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-tight mb-1">Question (Front)</label>
                            <input
                              type="text"
                              value={editQuestion}
                              onChange={(e) => setEditQuestion(e.target.value)}
                              className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-xs text-white focus:ring-1 focus:ring-white/40 focus:outline-none"
                              maxLength={180}
                              id={`edit-input-question-${card.id}`}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-tight mb-1">Answer (Back)</label>
                            <textarea
                              rows={2}
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="w-full bg-white/15 border border-white/20 rounded-xl px-2.5 py-2 font-medium text-xs text-white focus:ring-1 focus:ring-white/40 focus:outline-none resize-none"
                              maxLength={280}
                              id={`edit-input-answer-${card.id}`}
                            />
                          </div>

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingCardId(null)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 font-bold rounded-lg text-[10px] text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(card.id)}
                              className="px-3.5 py-1 bg-white text-[#a855f7] font-bold rounded-lg text-[10px] flex items-center gap-0.5 shadow-sm hover:bg-opacity-95"
                              id={`btn-save-edit-${card.id}`}
                            >
                              <Save size={10} />
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Card Reading Mode row */
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-white bg-white/20 border border-white/15 px-1.5 py-0.5 rounded shrink-0">
                                Card #{idx + 1}
                              </span>
                              {card.isMastered && (
                                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/15 px-1.5 py-0.5 rounded shrink-0">
                                  Mastered
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-white break-words leading-tight">
                                Q: {card.question}
                              </p>
                              <p className="text-white/75 font-medium break-words leading-normal mt-0.5 line-clamp-2">
                                A: {card.answer}
                              </p>
                            </div>
                          </div>

                          {/* Actions: Edit, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEdit(card)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 border border-white/10 transition-all"
                              title="Edit Card"
                              id={`btn-edit-card-${card.id}`}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => setCardToDeleteId(card.id)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-white/80 hover:text-rose-200 border border-white/10 transition-all"
                              title="Delete Card"
                              id={`btn-delete-card-${card.id}`}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 p-6 rounded-3xl border border-white/15 text-center text-white/70 space-y-3 shadow-md animate-fadeIn" id="manager-no-decks-state">
            <BookOpen size={36} className="mx-auto text-amber-400/80 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-white">No Decks Defined Yet</h4>
              <p className="text-xs text-white/60 max-w-[260px] mx-auto leading-relaxed">
                Click <span className="text-amber-300 font-extrabold">"New Deck"</span> or <span className="text-amber-300 font-extrabold">"AI Deck Maker"</span> above to build your first high-octane flashcard deck!
              </p>
            </div>
          </div>
        )}

        {/* ==================== 4. STORAGE RESET / DANGER ZONE ==================== */}
        {onResetEntireApp && (
          <div className="backdrop-blur-xl bg-red-950/20 p-4 rounded-3xl border border-red-500/20 text-red-100 flex flex-col gap-3.5 shadow-md">
            <div className="text-left space-y-0.5">
              <h3 className="text-xs font-black text-red-400 uppercase tracking-wider">System Danger Zone</h3>
              <p className="text-[10px] text-red-200/60 font-semibold leading-normal">
                Completely erase all custom decks, clear learning streaks, and restore original pre-built study decks from scratch.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResetAppConfirm(true)}
              className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all border border-red-500/20"
              id="btn-reset-entire-app-trigger"
            >
              Reset Entire App
            </button>
          </div>
        )}

      </div>

      <ConfirmDialog
        isOpen={!!deckToDeleteId}
        title="Delete Flashcard Deck?"
        message={`Are you sure you want to delete the "${decks.find(d => d.id === deckToDeleteId)?.title || ''}" deck and all its flashcards? This cannot be undone.`}
        confirmText="Delete Deck"
        cancelText="Cancel"
        onConfirm={() => {
          if (deckToDeleteId) {
            onDeleteDeck(deckToDeleteId);
            setSelectedDeckId(decks[0]?.id || '');
            setDeckToDeleteId(null);
          }
        }}
        onCancel={() => setDeckToDeleteId(null)}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!cardToDeleteId}
        title="Delete Flashcard?"
        message="Are you sure you want to delete this study card? This cannot be undone."
        confirmText="Delete Card"
        cancelText="Cancel"
        onConfirm={() => {
          if (cardToDeleteId) {
            onDeleteCard(selectedDeckId, cardToDeleteId);
            setCardToDeleteId(null);
          }
        }}
        onCancel={() => setCardToDeleteId(null)}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showResetAppConfirm}
        title="Reset Entire App & Restore Defaults?"
        message="This will completely clear your browser's local cache. It will erase ALL your custom decks, cards, and daily streak progress, then restore the standard pre-built Flutter and Web study decks. This action is permanent and cannot be undone."
        confirmText="Reset App & Data"
        cancelText="Keep My Data"
        onConfirm={() => {
          if (onResetEntireApp) {
            onResetEntireApp();
          }
          setShowResetAppConfirm(false);
        }}
        onCancel={() => setShowResetAppConfirm(false)}
        variant="danger"
      />

    </div>
  );
}
