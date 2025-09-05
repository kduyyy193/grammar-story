export interface GrammarError {
  id: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  type: string;
}

export interface Challenge {
  id: string;
  title: string;
  storyWithBlanks: string;
  solution: string[];
  level: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface CompletedChallenge {
  challengeId: string;
  completedAt: string; // ISO timestamp
  userAnswers: string[];
  isCorrect: boolean;
  level: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  storiesAnalyzed: number;
  mistakesFound: number;
  challengesCompleted: number;
  challengesAttempted: number;
  correctAnswers: number;
  totalAnswers: number;
}


export interface TenseFormula {
  affirmative: string;
  negative: string;
  yesNoQuestion: string;
  whQuestion: string;
}

export interface TenseDetail {
  name: string;
  definition: string;
  tobeFormula?: TenseFormula;
  regularFormula: TenseFormula;
  usage: string[];
  signals: string[];
}


export interface TheorySection {
  title: string; // e.g., "I. The Present Tenses"
  tenses: TenseDetail[];
}

export interface DailyTheme {
  title: string;
  category: string;
  theory: {
    introduction: string;
    sections: TheorySection[];
  };
}
