export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isMastered: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  iconName: string; // Name of Lucide icon
  cards: Flashcard[];
  color: string; // Tailwind bg color class for accents
}

export interface QuizProgress {
  currentIndex: number;
  showAnswer: boolean;
  score: {
    mastered: number;
    learning: number;
  };
  history: string[]; // List of card IDs already studied in this session
}
