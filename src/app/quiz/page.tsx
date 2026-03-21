"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { quizQuestions } from "@/data/quizQuestions";
import { QuizSession } from "@/types/quiz";
import { saveQuizAttempt } from "@/lib/tracking";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORY_LABELS: Record<string, string> = {
  document_vs_package: "Document vs Package",
  country_codes: "Country Codes",
  service_types: "Service Types",
  customs: "Customs & HS Codes",
  general: "General Knowledge",
  scenarios: "Real Scenarios",
};

const CATEGORY_PILL_COLORS: Record<string, string> = {
  document_vs_package: "bg-blue-100 text-blue-800 border-blue-200",
  country_codes: "bg-purple-100 text-purple-800 border-purple-200",
  service_types: "bg-orange-100 text-orange-800 border-orange-200",
  customs: "bg-green-100 text-green-800 border-green-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
  scenarios: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

function getGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function makeSession(): QuizSession {
  return {
    questions: shuffleArray([...quizQuestions]).slice(0, 10),
    answers: new Array(10).fill(null),
    currentIndex: 0,
    completed: false,
    startTime: Date.now(),
    timePerQuestion: [],
  };
}

export default function QuizPage() {
  const router = useRouter();
  const [session, setSession] = useState<QuizSession>(makeSession);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [questionStart, setQuestionStart] = useState(Date.now());

  const current = session.questions[session.currentIndex];
  const isLast = session.currentIndex === session.questions.length - 1;
  const progressPct = ((session.currentIndex + 1) / session.questions.length) * 100;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleCheckAnswer() {
    if (selected === null || revealed) return;
    const elapsed = Math.round((Date.now() - questionStart) / 1000);
    setRevealed(true);
    setSession((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentIndex] = selected;
      return {
        ...prev,
        answers: newAnswers,
        timePerQuestion: [...prev.timePerQuestion, elapsed],
      };
    });
  }

  function handleNext() {
    if (!revealed) return;

    if (isLast) {
      const timeSpent = Math.round((Date.now() - session.startTime) / 1000);
      const questionResults = session.questions.map((q, i) => ({
        questionId: q.id,
        category: q.category,
        correct: session.answers[i] === q.correct,
        userAnswer: session.answers[i] ?? -1,
      }));
      const correctCount = questionResults.filter(r => r.correct).length;
      const scorePercent = Math.round((correctCount / session.questions.length) * 100);

      saveQuizAttempt(
        scorePercent,
        session.questions.length,
        correctCount,
        timeSpent,
        questionResults
      ).catch(() => {}); // fail silently if not logged in

      setSession((prev) => ({ ...prev, completed: true }));
      return;
    }

    setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    setSelected(null);
    setRevealed(false);
    setQuestionStart(Date.now());
  }

  function handleRetry() {
    setSession(makeSession());
    setSelected(null);
    setRevealed(false);
    setQuestionStart(Date.now());
  }

  // Results screen
  if (session.completed) {
    const correctCount = session.answers.filter(
      (ans, i) => ans === session.questions[i].correct
    ).length;
    const scorePct = Math.round((correctCount / session.questions.length) * 100);
    const grade = getGrade(scorePct);
    const totalTime = Math.round(
      session.timePerQuestion.reduce((a, b) => a + b, 0)
    );

    // Category breakdown
    const categories = Array.from(
      new Set(session.questions.map((q) => q.category))
    );
    const catBreakdown = categories.map((cat) => {
      const qs = session.questions.filter((q) => q.category === cat);
      const correct = qs.filter(
        (q, _) => session.answers[session.questions.indexOf(q)] === q.correct
      ).length;
      return { cat, correct, total: qs.length };
    });

    const gradeColor =
      scorePct >= 80
        ? "text-green-600"
        : scorePct >= 60
        ? "text-yellow-600"
        : "text-red-600";

    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 flex items-start justify-center bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-2xl">
            {/* Score card */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Quiz Complete</h2>
              </div>
              <div className="px-6 py-6 text-center">
                <div className={`text-6xl font-black mb-1 ${gradeColor}`}>{grade}</div>
                <div className="text-3xl font-bold text-[#1a1a1a] mb-1">
                  {correctCount} / {session.questions.length}
                </div>
                <div className="text-sm text-gray-500 mb-4">{scorePct}% correct</div>
                <div className="text-sm text-gray-500">
                  Time: {formatTime(totalTime)}
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="px-6 py-3 border-b border-[#eee]">
                <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide">Category Breakdown</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {catBreakdown.map(({ cat, correct, total }) => {
                  const pct = Math.round((correct / total) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-[#333]">{CATEGORY_LABELS[cat] ?? cat}</span>
                        <span className="text-sm font-bold text-[#1a1a1a]">
                          {correct}/{total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 80 ? "#16a34a" : pct >= 60 ? "#FFCC00" : "#D40511",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Wrong Answers */}
            {session.questions.some((q, i) => session.answers[i] !== q.correct) && (
              <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
                <div className="px-6 py-3 border-b border-[#eee]">
                  <h3 className="font-bold text-[#1a1a1a] text-sm uppercase tracking-wide">Review Wrong Answers</h3>
                </div>
                <div className="px-6 py-4 space-y-5">
                  {session.questions.map((q, i) => {
                    if (session.answers[i] === q.correct) return null;
                    const userAnswer = session.answers[i];
                    return (
                      <div key={q.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <p className="text-sm font-bold text-[#1a1a1a] mb-2">{q.question}</p>
                        <div className="space-y-1.5 mb-2">
                          {q.options.map((opt, optIdx) => {
                            let style = "text-sm px-3 py-1.5 rounded-[3px] border";
                            if (optIdx === userAnswer) {
                              style += " bg-red-50 border-red-300 text-red-800";
                            } else if (optIdx === q.correct) {
                              style += " bg-green-50 border-green-300 text-green-800";
                            } else {
                              style += " bg-white border-transparent text-gray-400";
                            }
                            return (
                              <div key={optIdx} className={style}>
                                <span className="flex items-center gap-2">
                                  <span className="font-bold text-xs w-4">{String.fromCharCode(65 + optIdx)}.</span>
                                  <span>{opt}</span>
                                  {optIdx === userAnswer && <span className="ml-auto text-xs font-bold text-red-600">Your answer</span>}
                                  {optIdx === q.correct && <span className="ml-auto text-xs font-bold text-green-700">Correct</span>}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-[3px] px-3 py-2">
                          <p className="text-xs text-blue-900 italic">{q.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                RETRY QUIZ
              </button>
              <button
                onClick={() => router.push("/game")}
                className="flex-1 bg-white hover:bg-gray-50 text-[#1a1a1a] border border-[#ccc] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                PRACTICE MODE
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 bg-[#D40511] hover:bg-[#b8040f] text-white border border-[#a3030e] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  function getOptionStyle(idx: number): string {
    const base =
      "w-full text-left px-4 py-3 rounded-[3px] border text-sm font-medium transition cursor-pointer";
    if (!revealed) {
      if (selected === idx) {
        return `${base} bg-[#FFCC00] border-[#cca300] text-[#1a1a1a]`;
      }
      return `${base} bg-white border-[#ccc] text-[#1a1a1a] hover:bg-gray-50`;
    }
    // Revealed
    if (idx === current.correct) {
      return `${base} bg-green-100 border-green-500 text-green-800`;
    }
    if (idx === selected && selected !== current.correct) {
      return `${base} bg-red-100 border-red-500 text-red-800`;
    }
    return `${base} bg-white border-[#ddd] text-gray-400`;
  }

  function getOptionIcon(idx: number): string | null {
    if (!revealed) return null;
    if (idx === current.correct) return "✓";
    if (idx === selected && selected !== current.correct) return "✗";
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <DHLHeader />
      <div className="flex-1 flex items-start justify-center bg-[#f5f5f5] px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white border border-[#ddd] rounded-sm shadow-sm">
            {/* Progress bar */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500 font-medium">
                  Question {session.currentIndex + 1} of {session.questions.length}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${
                    CATEGORY_PILL_COLORS[current.category] ?? "bg-gray-100 text-gray-700 border-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[current.category] ?? current.category}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${progressPct}%`, backgroundColor: "#FFCC00" }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="px-6 pb-4">
              <p className="text-[#1a1a1a] font-bold text-base md:text-lg leading-snug mb-5">
                {current.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {current.options.map((opt, idx) => {
                  const icon = getOptionIcon(idx);
                  return (
                    <button
                      key={idx}
                      className={getOptionStyle(idx)}
                      onClick={() => handleSelect(idx)}
                      disabled={revealed}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-xs font-bold flex-shrink-0">
                          {icon ?? String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {revealed && (
                <div className="bg-blue-50 border border-blue-200 rounded-[3px] px-4 py-3 mb-5">
                  <p className="text-sm text-blue-900 italic">{current.explanation}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!revealed ? (
                  <button
                    onClick={handleCheckAnswer}
                    disabled={selected === null}
                    className={`flex-1 rounded-[3px] px-4 py-3 text-sm font-bold border transition ${
                      selected !== null
                        ? "bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border-[#cca300] cursor-pointer"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-[#D40511] hover:bg-[#b8040f] active:bg-[#a3030e] text-white border border-[#a3030e] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
                  >
                    {isLast ? "See Results" : "Next \u2192"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
