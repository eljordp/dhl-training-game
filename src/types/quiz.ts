export interface QuizQuestion {
  id: string;
  category: "document_vs_package" | "country_codes" | "service_types" | "customs" | "general" | "scenarios";
  question: string;
  options: string[];
  correct: number; // index of correct option
  explanation: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  answers: (number | null)[]; // index of selected answer, null if not answered
  currentIndex: number;
  completed: boolean;
  startTime: number;
  timePerQuestion: number[]; // seconds per question
}
