"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { quizQuestions } from "@/data/quizQuestions";
import { QuizDifficulty } from "@/types/quiz";
import { saveQuizAttempt } from "@/lib/tracking";
import { useActivityTracker } from "@/lib/useActivityTracker";

type Mode = "select" | "quiz" | "results";

const DIFFICULTY_CONFIG: Record<QuizDifficulty, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  beginner: { label: "Beginner", color: "text-green-800", bgColor: "bg-green-50", borderColor: "border-green-300", description: "Core CRA knowledge every employee needs day 1" },
  intermediate: { label: "Intermediate", color: "text-yellow-800", bgColor: "bg-yellow-50", borderColor: "border-yellow-300", description: "Requires understanding how CRA fields interact" },
  advanced: { label: "Advanced", color: "text-red-800", bgColor: "bg-red-50", borderColor: "border-red-300", description: "Edge cases, gotchas, and real-world traps" },
};

export default function MCQuizPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty | "all" | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [startTime] = useState(Date.now());

  useActivityTracker(mode === "results" ? "quiz-review" : "quiz");

  const questions = useMemo(() => {
    if (selectedDifficulty === "all") return quizQuestions;
    return quizQuestions.filter((q) => q.difficulty === selectedDifficulty);
  }, [selectedDifficulty]);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const results = useMemo(() => {
    if (mode !== "results") return null;
    let correct = 0;
    const details = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) correct++;
      return { question: q, userAnswer, isCorrect };
    });
    const score = Math.round((correct / questions.length) * 100);

    // Save to DB
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    saveQuizAttempt(
      score,
      questions.length,
      correct,
      timeSpent,
      details.map((d) => ({
        questionId: d.question.id,
        category: d.question.category,
        correct: d.isCorrect,
        userAnswer: d.userAnswer ?? -1,
      })),
      selectedDifficulty === "all" ? "all" : selectedDifficulty || "unknown"
    );

    return { correct, total: questions.length, score, details };
  }, [mode, questions, answers, startTime, selectedDifficulty]);

  // Difficulty selection
  if (mode === "select") {
    const difficulties: QuizDifficulty[] = ["beginner", "intermediate", "advanced"];
    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 flex items-start justify-center bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Multiple Choice Quiz</h2>
                <p className="text-xs text-[#555] mt-0.5">{quizQuestions.length} Questions | 3 Difficulty Levels | Instant Feedback</p>
              </div>
              <div className="px-6 py-6 space-y-3">
                {difficulties.map((diff) => {
                  const cfg = DIFFICULTY_CONFIG[diff];
                  const count = quizQuestions.filter((q) => q.difficulty === diff).length;
                  return (
                    <button
                      key={diff}
                      onClick={() => { setSelectedDifficulty(diff); setMode("quiz"); }}
                      className={`w-full text-left px-5 py-4 rounded-[3px] border-2 ${cfg.borderColor} ${cfg.bgColor} hover:shadow-md transition cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-base ${cfg.color}`}>{cfg.label}</span>
                        <span className="text-xs text-gray-500 font-medium">{count} questions</span>
                      </div>
                      <p className="text-sm text-gray-600">{cfg.description}</p>
                    </button>
                  );
                })}
                <button
                  onClick={() => { setSelectedDifficulty("all"); setMode("quiz"); }}
                  className="w-full text-left px-5 py-4 rounded-[3px] border-2 border-[#D40511] bg-red-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-base text-[#D40511]">All Questions</span>
                    <span className="text-xs text-gray-500 font-medium">{quizQuestions.length} questions</span>
                  </div>
                  <p className="text-sm text-gray-600">Every question across all difficulty levels.</p>
                </button>
              </div>
              <div className="px-6 pb-5">
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-white hover:bg-gray-50 text-[#1a1a1a] border border-[#ccc] rounded-[3px] px-4 py-2.5 text-sm font-bold cursor-pointer transition"
                >
                  BACK TO HOME
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results
  if (mode === "results" && results) {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const passed = results.score >= 70;

    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Score Summary */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Quiz Results</h2>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center justify-center gap-6 mb-5">
                  <div className={`text-center border-2 rounded-[3px] px-6 py-4 ${results.score >= 80 ? "bg-green-50 border-green-300" : results.score >= 60 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-[#D40511]"}`}>
                    <div className={`text-4xl font-bold ${results.score >= 80 ? "text-green-700" : results.score >= 60 ? "text-yellow-700" : "text-[#D40511]"}`}>{results.score}%</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold px-4 py-2 rounded-[3px] border-2 ${passed ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-[#D40511] text-[#D40511]"}`}>
                      {passed ? "PASSED" : "NEEDS WORK"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">70% required</div>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div className="flex-1 bg-[#f5f5f5] rounded-[3px] px-3 py-3">
                    <div className="text-xl font-bold text-[#1a1a1a]">{results.correct}/{results.total}</div>
                    <div className="text-xs text-gray-500">Correct</div>
                  </div>
                  <div className="flex-1 bg-[#f5f5f5] rounded-[3px] px-3 py-3">
                    <div className="text-xl font-bold text-[#1a1a1a]">{mins}m {secs}s</div>
                    <div className="text-xs text-gray-500">Time</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Review */}
            {results.details.map((d, idx) => {
              const cfg = DIFFICULTY_CONFIG[d.question.difficulty];
              return (
                <div key={d.question.id} className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-3">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Q{idx + 1}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${d.isCorrect ? "bg-green-50 text-green-800 border-green-400" : "bg-red-50 text-[#D40511] border-[#D40511]"}`}>
                        {d.isCorrect ? "CORRECT" : "WRONG"}
                      </span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="px-5 py-3">
                    <p className="font-bold text-sm text-[#1a1a1a] mb-3">{d.question.question}</p>
                    <div className="space-y-1.5">
                      {d.question.options.map((opt, optIdx) => {
                        const isCorrectOption = optIdx === d.question.correct;
                        const isUserPick = optIdx === d.userAnswer;
                        let optClass = "bg-white border-gray-200 text-gray-600";
                        if (isCorrectOption) optClass = "bg-green-50 border-green-400 text-green-900 font-medium";
                        else if (isUserPick && !isCorrectOption) optClass = "bg-red-50 border-[#D40511] text-[#D40511]";
                        return (
                          <div key={optIdx} className={`text-sm px-3 py-2 rounded-[3px] border ${optClass} flex items-center gap-2`}>
                            {isCorrectOption && <span className="text-green-600 flex-shrink-0">{"\u2713"}</span>}
                            {isUserPick && !isCorrectOption && <span className="text-[#D40511] flex-shrink-0">{"\u2717"}</span>}
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded-[3px] px-3 py-2 text-xs text-blue-900">
                      {d.question.explanation}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => { setMode("select"); setSelectedDifficulty(null); setCurrentIndex(0); setAnswers({}); setRevealed({}); }}
                className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                TRY ANOTHER LEVEL
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

  // Quiz mode — one question at a time
  if (!current) return null;

  const cfg = DIFFICULTY_CONFIG[current.difficulty];
  const isRevealed = revealed[current.id] || false;
  const userAnswer = answers[current.id] ?? null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <DHLHeader />
      <div className="flex-1 flex items-start justify-center bg-[#f5f5f5] px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white border border-[#ddd] rounded-sm shadow-sm">
            {/* Progress */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500 font-medium">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}>
                  {cfg.label}
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
            <div className="px-6 pb-5">
              <p className="text-[#1a1a1a] font-bold text-base md:text-lg leading-snug mb-4">
                {current.question}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {current.options.map((opt, idx) => {
                  const isSelected = userAnswer === idx;
                  const isCorrectOption = idx === current.correct;

                  let optClass: string;
                  if (isRevealed) {
                    if (isCorrectOption) {
                      optClass = "bg-green-50 border-green-400 text-green-900 font-medium";
                    } else if (isSelected && !isCorrectOption) {
                      optClass = "bg-red-50 border-[#D40511] text-[#D40511]";
                    } else {
                      optClass = "bg-gray-50 border-gray-200 text-gray-400";
                    }
                  } else {
                    optClass = isSelected
                      ? "bg-[#FFF8E0] border-[#FFCC00] text-[#1a1a1a] font-medium"
                      : "bg-white border-gray-200 text-[#1a1a1a] hover:border-[#FFCC00] hover:bg-[#FFFDF0] cursor-pointer";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isRevealed}
                      onClick={() => setAnswers({ ...answers, [current.id]: idx })}
                      className={`w-full text-left text-sm px-4 py-3 rounded-[3px] border-2 transition flex items-center gap-2 ${optClass}`}
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (after reveal) */}
              {isRevealed && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-[3px] px-4 py-3 text-sm text-blue-900">
                  {current.explanation}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4" id="quiz-actions">
                {!isRevealed ? (
                  <button
                    onClick={() => {
                      if (userAnswer === null) return;
                      setRevealed({ ...revealed, [current.id]: true });
                    }}
                    disabled={userAnswer === null}
                    className={`flex-1 rounded-[3px] px-4 py-3 text-sm font-bold border transition ${
                      userAnswer !== null
                        ? "bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border-[#cca300] cursor-pointer"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (isLast) { setMode("results"); return; }
                      setCurrentIndex(currentIndex + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex-1 bg-[#D40511] hover:bg-[#b8040f] text-white border border-[#a3030e] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
                  >
                    {isLast ? "See Results \u2713" : "Next \u2192"}
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
