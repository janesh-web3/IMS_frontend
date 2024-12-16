export interface Quiz {
  _id: string;
  title: string;
  description: string;
  topic: string;
  category: string;
  timer: number;
  questions: Question[];
  isAIGenerated?: boolean;
}

export interface Question {
  _id: string;
  text: string;
  options: Option[];
  explanation?: string;
}

export interface Option {
  _id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuizResponse {
  quiz: Quiz;
  score: number;
  timeSpent: number;
  submittedAt: string;
  answers: { [key: string]: string };
}
