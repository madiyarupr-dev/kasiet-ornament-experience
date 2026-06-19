import { ResultKey } from "./types";

export interface Option {
  value: string;
  label: string;
  icon: string;
  weights: Partial<Record<ResultKey, number>>;
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Что сегодня для вас наиболее важно?",
    subtitle: "Выберите один из вариантов, который наиболее точно отражает ваше текущее состояние.",
    options: [
      { value: "family", label: "Семья", icon: "family", weights: { keeper: 2 } },
      { value: "wealth", label: "Достаток", icon: "wealth", weights: { creator: 2 } },
      { value: "growth", label: "Развитие", icon: "growth", weights: { explorer: 2 } },
      { value: "art", label: "Творчество", icon: "art", weights: { creator: 2 } },
      { value: "heritage", label: "Наследие", icon: "heritage", weights: { keeper: 2 } },
      ],
  },
  {
    id: "q2",
    title: "Что вам ближе?",
    subtitle: "Выберите путь, который резонирует с вашим духом сегодня.",
    options: [
      { value: "teach", label: "Обучать других", icon: "teach", weights: { mentor: 2 } },
      { value: "make", label: "Создавать изделия", icon: "make", weights: { creator: 2 } },
      { value: "study", label: "Изучать историю", icon: "study", weights: { explorer: 2 } },
      { value: "project", label: "Развивать свой проект", icon: "project", weights: { creator: 1, mentor: 1 } },
      { value: "pass", label: "Передавать знания детям", icon: "pass", weights: { keeper: 2 } },
      ],
  },
  {
    id: "q3",
    title: "Где вы хотели бы применять знания об орнаментах?",
    subtitle: "Представьте, где эти знания раскроются для вас полнее всего.",
    options: [
      { value: "education", label: "В образовании", icon: "teach", weights: { mentor: 2 } },
      { value: "creativity", label: "В творчестве", icon: "art", weights: { creator: 2 } },
      { value: "business", label: "В бизнесе", icon: "wealth", weights: { creator: 1, mentor: 1 } },
      { value: "family", label: "В семье", icon: "family", weights: { keeper: 2 } },
      { value: "self", label: "Для собственного развития", icon: "growth", weights: { explorer: 2 } },
      ],
  },
  {
    id: "q4",
    title: "Что вас привлекает больше всего?",
    subtitle: "То, что отзывается в сердце прежде ума.",
    options: [
      { value: "symbolism", label: "Символика", icon: "symbol", weights: { explorer: 2 } },
      { value: "culture", label: "Культура", icon: "culture", weights: { keeper: 1, explorer: 1 } },
      { value: "history", label: "История", icon: "study", weights: { explorer: 2 } },
      { value: "traditions", label: "Национальные традиции", icon: "heritage", weights: { keeper: 2 } },
      { value: "making", label: "Создание изделий", icon: "make", weights: { creator: 2 } },
      ],
  },
  ];
export interface ResultContent {
  key: ResultKey;
  title: string;
  pathLabel: string;
  description: string;
  motif: string;
}

export const RESULTS: Record<ResultKey, ResultContent> = {
  keeper: {
    key: "keeper",
    title: "Хранитель традиций",
    pathLabel: "Ваш путь — Хранитель традиций",
    description: "Вы стремитесь сохранять культурное наследие, видеть глубокие смыслы в символах и передавать знания следующим поколениям. В орнаменте вы слышите голос рода.",
    motif: "keeper",
  },
  mentor: {
    key: "mentor",
    title: "Наставник",
    pathLabel: "Ваш путь — Наставник",
    description: "Вы умеете объяснять сложное простыми словами и зажигать интерес в других. Через орнамент вы открываете людям дверь в мир символов и смыслов.",
    motif: "mentor",
  },
  creator: {
    key: "creator",
  title: "Создатель",
    pathLabel: "Ваш путь — Создатель",
    description: "Ваши руки и воображение превращают древние узоры в живые изделия. Вы продолжаете язык предков, создавая новое из вечного.",
    motif: "creator",
  },
  explorer: {
    key: "explorer",
    title: "Исследователь",
    pathLabel: "Ваш путь — Исследователь",
    description: "Вами движет любопытство и жажда смысла. Вы хотите понять, что стоит за каждой линией орнамента, и раскрыть код культуры предков.",
    motif: "explorer",
  },
};
export function computeResult(
  selections: { questionId: string; value: string }[]
  ): ResultKey {
  const score: Record<ResultKey, number> = { keeper: 0, mentor: 0, creator: 0, explorer: 0 };
  for (const sel of selections) {
    const question = QUESTIONS.find((q) => q.id === sel.questionId);
    const option = question?.options.find((o) => o.value === sel.value);
    if (!option) continue;
    for (const [k, v] of Object.entries(option.weights)) {
      score[k as ResultKey] += v ?? 0;
    }
  }
  const order: ResultKey[] = ["keeper", "mentor", "creator", "explorer"];
  let best: ResultKey = "keeper";
  let bestScore = -1;
  for (const key of order) {
    if (score[key] > bestScore) {
      bestScore = score[key];
      best = key;
    }
  }
  return best;
}
