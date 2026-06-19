export type ResultKey = "keeper" | "mentor" | "creator" | "explorer";

export interface QuizAnswer {
  questionId: string;
  question: string;
  value: string;
  label: string;
}

export interface LeadPayload {
  result: ResultKey;
  resultLabel: string;
  name: string;
  city: string;
  whatsapp: string;
  answers: QuizAnswer[];
  createdAt: string;
  source: string;
}
