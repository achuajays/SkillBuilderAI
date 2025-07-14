export interface DayPlan {
  day: number;
  title: string;
  lessons: string[];
  practiceTask: string;
  isCompleted: boolean;
  reflection: string;
}

export interface LearningPlan {
  skill: string;
  duration: number;
  days: DayPlan[];
}

// Type for the raw plan received from the AI before being hydrated with app state
export interface RawDayPlan {
  day: number;
  title: string;
  lessons: string[];
  practiceTask: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}