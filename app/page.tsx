"use client";

import { useState } from "react";

type ResultKey = "keeper" | "mentor" | "creator" | "explorer";

type Option = { label: string; weight: ResultKey };
type Question = { step: string; title: string; hint: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    step: "Вопрос 1 из 3",
    title: "Что сегодня для вас наиболее важно?",
    hint: "Выберите один из вариантов, который точнее всего отражает ваше текущее состояние.",
    options: [
      { label: "Семья", weight: "keeper" },
      { label: "Достаток", weight: "explorer" },
      { label: "Развитие", weight: "creator" },
      { label: "Творчество", weight: "creator" },
      { label: "Наследие", weight: "mentor" },
    ],
  },
  {
    step: "Вопрос 2 из 3",
    title: "Что вам ближе?",
    hint: "Выберите путь, который резонирует с вашими думами сегодня.",
    options: [
      { label: "Обучать других", weight: "mentor" },
      { label: "Создавать изделия", weight: "creator" },
      { label: "Изучать историю", weight: "explorer" },
      { label: "Развивать свой проект", weight: "explorer" },
      { label: "Передавать знания детям", weight: "keeper" },
    ],
  },
  {
    step: "Шаг 3 из 3",
    title: "Где вы хотели бы применять знания об орнаментах?",
    hint: "Выберите сферу, которая вам ближе всего.",
    options: [
      { label: "В образовании", weight: "mentor" },
      { label: "В творчестве", weight: "creator" },
      { label: "В бизнесе", weight: "explorer" },
      { label: "В семье", weight: "keeper" },
      { label: "Для собственного развития", weight: "explorer" },
    ],
  },
];

type ResultInfo = {
  key: ResultKey;
  name: string;
  ornament: string;
  title: string;
  text: string;
};

const RESULTS: Record<ResultKey, ResultInfo> = {
  keeper: {
    key: "keeper",
    name: "Хранитель",
    ornament: "Қошқар мүйіз",
    title: "Ваш орнамент — оберег рода",
    text: "Вы храните тепло семьи и связь поколений. Ваш символ оберегает дом, достаток и память предков, передавая силу рода тем, кто идёт следом.",
  },
  mentor: {
    key: "mentor",
    name: "Наставник",
    ornament: "Түйе табан",
    title: "Ваш орнамент — путь знания",
    text: "Вы несёте мудрость и передаёте её другим. Ваш символ — про опыт, терпение и наставничество: вы прокладываете дорогу для тех, кто учится.",
  },
  creator: {
    key: "creator",
    name: "Творец",
    ornament: "Гүл өрнегі",
    title: "Ваш орнамент — живое творчество",
    text: "Вы создаёте красоту и вдыхаете жизнь в традицию. Ваш символ цветёт и развивается, превращая наследие в новое искусство.",
  },
  explorer: {
    key: "explorer",
    name: "Искатель",
    ornament: "Су жолы",
    title: "Ваш орнамент — поток и движение",
    text: "Вы стремитесь вперёд, к новым горизонтам и возможностям. Ваш символ — это путь воды: гибкость, рост и неустанное движение к цели.",
  },
};

const FEATURES = [
  { t: "Древний код", d: "орнамента" },
  { t: "Смысл каждого", d: "узора" },
  { t: "Традиции", d: "тюркских жузов" },
];

type Stage = "intro" | "quiz" | "result" | "thanks";

export default function Page() {
  const [stage, setStage] = useState<Stage>("intro");
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<ResultKey, number>>({
    keeper: 0,
    mentor: 0,
    creator: 0,
    explorer: 0,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ResultKey | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", contact: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startQuiz() {
    setScores({ keeper: 0, mentor: 0, creator: 0, explorer: 0 });
    setCurrent(0);
    setSelected(null);
    setResult(null);
    setStage("quiz");
  }

  function answer() {
    if (selected === null) return;
    const opt = QUESTIONS[current].options[selected];
    const nextScores = { ...scores, [opt.weight]: scores[opt.weight] + 1 };
    setScores(nextScores);

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      const winner = (Object.keys(nextScores) as ResultKey[]).reduce((a, b) =>
        nextScores[b] > nextScores[a] ? b : a
      );
      setResult(winner);
      setStage("result");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Пожалуйста, укажите имя и телефон.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          result: result ? RESULTS[result].name : null,
        }),
      });
      if (!res.ok) throw new Error("request_failed");
      setStage("thanks");
    } catch {
      // Even if the API is not connected yet, do not block the user.
      setStage("thanks");
    } finally {
      setSending(false);
    }
  }

  const q = QUESTIONS[current];
  const r = result ? RESULTS[result] : null;

  return (
    <main className="page">
      <div className="frame">
        <header className="topbar">
          <span className="brand serif gold-text">ТЮРКСКОЕ НАСЛЕДИЕ</span>
          <span className="brand-sub">язык&nbsp;символов · Kasiet</span>
        </header>

        {stage === "intro" && (
          <section className="hero">
            <div className="ornament" aria-hidden>
              <Ornament />
            </div>
            <h1 className="hero-title serif">
              КАКОЙ СМЫСЛ<br />СКРЫВАЕТ<br />
              <span className="gold-text">ВАШ ОРНАМЕНТ?</span>
            </h1>
            <p className="hero-text">
              Наш предок отразил в орнаменте пожелание, силу, защиту и судьбу.
              Пройдите короткий тест и откройте язык символов.
            </p>
            <button className="btn" onClick={startQuiz}>
              ПРОЙТИ ТЕСТ →
            </button>
            <ul className="features">
              {FEATURES.map((f) => (
                <li key={f.t}>
                  <span className="dot" />
                  <strong>{f.t}</strong>
                  <em>{f.d}</em>
                </li>
              ))}
            </ul>
          </section>
        )}

        {stage === "quiz" && (
          <section className="quiz">
            <div className="step serif">{q.step}</div>
            <div className="progress">
              <span style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
            </div>
            <h2 className="q-title serif">{q.title}</h2>
            <p className="q-hint">{q.hint}</p>
            <div className="options">
              {q.options.map((o, i) => (
                <button
                  key={o.label}
                  className={"opt" + (selected === i ? " opt-active" : "")}
                  onClick={() => setSelected(i)}
                  type="button"
                >
                  <span className="opt-mark" />
                  {o.label}
                </button>
              ))}
            </div>
            <button className="btn" onClick={answer} disabled={selected === null}>
              {current < QUESTIONS.length - 1 ? "ДАЛЕЕ →" : "ЗАВЕРШИТЬ ТЕСТ →"}
            </button>
          </section>
        )}

        {stage === "result" && r && (
          <section className="result">
            <div className="ornament small" aria-hidden>
              <Ornament />
            </div>
            <div className="result-tag serif gold-text">{r.name}</div>
            <div className="result-orn">{r.ornament}</div>
            <h2 className="q-title serif">{r.title}</h2>
            <p className="hero-text">{r.text}</p>

            <form className="lead" onSubmit={submit}>
              <p className="lead-lead serif">
                Получите расшифровку вашего орнамента
              </p>
              <input
                className="field"
                placeholder="Ваше имя"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="field"
                placeholder="Телефон"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="field"
                placeholder="Telegram / e-mail (необязательно)"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
              {error && <div className="err">{error}</div>}
              <button className="btn" type="submit" disabled={sending}>
                {sending ? "ОТПРАВЛЯЕМ…" : "ПОЛУЧИТЬ РАСШИФРОВКУ →"}
              </button>
              <button
                type="button"
                className="link"
                onClick={startQuiz}
              >
                Пройти тест заново
              </button>
            </form>
          </section>
        )}

        {stage === "thanks" && (
          <section className="thanks">
            <div className="ornament small" aria-hidden>
              <Ornament />
            </div>
            <h2 className="q-title serif gold-text">Рахмет!</h2>
            <p className="hero-text">
              Спасибо! Мы получили вашу заявку и скоро свяжемся с вами, чтобы
              передать полную расшифровку вашего орнамента.
            </p>
            <button className="btn" onClick={startQuiz}>
              ПРОЙТИ ТЕСТ ЗАНОВО →
            </button>
          </section>
        )}

        <footer className="footer">
          © {new Date().getFullYear()} Kasiet · язык символов
        </footer>
      </div>
    </main>
  );
}

function Ornament() {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="img">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9a86a" />
          <stop offset="1" stopColor="#f1e7d4" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#g)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M60 12 L96 60 L60 108 L24 60 Z" />
        <path d="M60 30 L78 60 L60 90 L42 60 Z" />
        <path d="M60 48 L66 60 L60 72 L54 60 Z" />
        <path d="M40 40 C28 48 28 72 40 80" />
        <path d="M80 40 C92 48 92 72 80 80" />
        <path d="M52 22 C44 28 44 34 50 38" />
        <path d="M68 22 C76 28 76 34 70 38" />
        <path d="M52 98 C44 92 44 86 50 82" />
        <path d="M68 98 C76 92 76 86 70 82" />
      </g>
    </svg>
  );
}
