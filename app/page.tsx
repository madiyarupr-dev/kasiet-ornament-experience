"use client";

import { useState } from "react";

type CategoryKey = "rod" | "nasledie" | "razvitie" | "tvorchestvo" | "dostatok";

type Option = { label: string; weight: CategoryKey };
type Question = { step: string; title: string; hint: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    step: "Вопрос 1 из 3",
    title: "Что сегодня для вас наиболее важно?",
    hint: "Выберите один из вариантов, который точнее всего отражает ваше текущее состояние.",
    options: [
      { label: "Семья", weight: "rod" },
      { label: "Достаток", weight: "dostatok" },
      { label: "Развитие", weight: "razvitie" },
      { label: "Творчество", weight: "tvorchestvo" },
      { label: "Наследие", weight: "nasledie" },
    ],
  },
  {
    step: "Вопрос 2 из 3",
    title: "Что вам ближе?",
    hint: "Выберите путь, который резонирует с вашими думами сегодня.",
    options: [
      { label: "Обучать других", weight: "nasledie" },
      { label: "Создавать изделия", weight: "tvorchestvo" },
      { label: "Изучать историю", weight: "nasledie" },
      { label: "Развивать свой проект", weight: "razvitie" },
      { label: "Передавать знания детям", weight: "rod" },
    ],
  },
  {
    step: "Шаг 3 из 3",
    title: "Где вы хотели бы применять знания об орнаментах?",
    hint: "Выберите сферу, которая вам ближе всего.",
    options: [
      { label: "В образовании", weight: "nasledie" },
      { label: "В творчестве", weight: "tvorchestvo" },
      { label: "В бизнесе", weight: "dostatok" },
      { label: "В семье", weight: "rod" },
      { label: "Для собственного развития", weight: "razvitie" },
    ],
  },
];

type ResultInfo = { key: CategoryKey; name: string };

const RESULTS: Record<CategoryKey, ResultInfo> = {
  rod: { key: "rod", name: "Род" },
  nasledie: { key: "nasledie", name: "Наследие" },
  razvitie: { key: "razvitie", name: "Развитие" },
  tvorchestvo: { key: "tvorchestvo", name: "Творчество" },
  dostatok: { key: "dostatok", name: "Достаток" },
};

const CATEGORY_ORDER: CategoryKey[] = [
  "rod",
  "nasledie",
  "razvitie",
  "tvorchestvo",
  "dostatok",
];

const FEATURES = [
  { t: "Древний код", d: "орнамента" },
  { t: "Смысл каждого", d: "узора" },
  { t: "Традиции", d: "тюркских жузов" },
];

type Stage = "intro" | "quiz" | "result" | "thanks";

export default function Page() {
  const [stage, setStage] = useState<Stage>("intro");
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<CategoryKey, number>>({
    rod: 0,
    nasledie: 0,
    razvitie: 0,
    tvorchestvo: 0,
    dostatok: 0,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<CategoryKey | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", contact: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startQuiz() {
    setScores({ rod: 0, nasledie: 0, razvitie: 0, tvorchestvo: 0, dostatok: 0 });
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
      // Deterministic result: pick the category with the highest count.
      // Ties are broken by a fixed priority order (CATEGORY_ORDER).
      let winner: CategoryKey = CATEGORY_ORDER[0];
      let max = -1;
      for (const key of CATEGORY_ORDER) {
        if (nextScores[key] > max) {
          max = nextScores[key];
          winner = key;
        }
      }
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
              Ответьте на несколько вопросов и откройте язык символов.
            </p>
            <button className="btn" onClick={startQuiz}>
              УЗНАТЬ ЗНАЧЕНИЕ СВОЕГО СИМВОЛА →
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
              {current < QUESTIONS.length - 1 ? "ДАЛЕЕ →" : "УЗНАТЬ РЕЗУЛЬТАТ →"}
            </button>
          </section>
        )}

        {stage === "result" && r && (
          <section className="result">
            <div className="ornament small" aria-hidden>
              <Ornament />
            </div>
            <div className="result-tag serif gold-text">{r.name}</div>
            <h2 className="q-title serif">Ваш символ определён</h2>
            <p className="hero-text">
              По вашим ответам мы определили направление, которому соответствует
              одна из ключевых групп тюркских символов.
            </p>
            <p className="hero-text">
              Полную расшифровку вашего результата, значение символа и его связь
              с системой орнаментов Kasiet вы сможете получить на интенсиве Жанар.
            </p>
            <ul className="bullets">
              <li>как читать язык орнаментов</li>
              <li>какие смыслы вкладывали предки в каждый символ</li>
              <li>
                как применять знания об орнаментах в жизни, семье, образовании и
                творчестве
              </li>
            </ul>

            <form className="lead" onSubmit={submit}>
              <p className="lead-lead serif">Забронируйте место на интенсиве</p>
              <input
                className="field"
                placeholder="Имя"
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
                placeholder="Telegram (необязательно)"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
              {error && <div className="err">{error}</div>}
              <button className="btn" type="submit" disabled={sending}>
                {sending ? "ОТПРАВЛЯЕМ…" : "ЗАБРОНИРОВАТЬ МЕСТО →"}
              </button>
            </form>
          </section>
        )}

        {stage === "thanks" && (
          <section className="thanks">
            <div className="ornament small" aria-hidden>
              <Ornament />
            </div>
            <h2 className="q-title serif gold-text">Спасибо за регистрацию</h2>
            <p className="hero-text">
              Мы получили вашу заявку. Перед началом интенсива отправим вам всю
              необходимую информацию и ссылку для участия.
            </p>
            <p className="hero-text">
              На интенсиве вы получите полную расшифровку своего результата и
              познакомитесь с системой тюркских орнаментов Kasiet.
            </p>
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
