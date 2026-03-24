"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { assessmentQuestions, TIER_CONFIG, AssessmentTier } from "@/data/assessment";

type Mode = "select" | "assessment" | "review";

export default function AssessmentPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");
  const [selectedTier, setSelectedTier] = useState<AssessmentTier | "all" | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [startTime] = useState(Date.now());

  const tiers: AssessmentTier[] = ["fundamentals", "operations", "expert", "scenarios"];

  const questions = selectedTier === "all"
    ? assessmentQuestions
    : assessmentQuestions.filter((q) => q.tier === selectedTier);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Tier selection screen
  if (mode === "select") {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 flex items-start justify-center bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">DHL Express Advanced Assessment</h2>
                <p className="text-xs text-[#555] mt-0.5">37 Questions | 4 Tiers | Built for Real Operators</p>
              </div>
              <div className="px-6 py-6 space-y-3">
                {tiers.map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  const count = assessmentQuestions.filter((q) => q.tier === tier).length;
                  return (
                    <button
                      key={tier}
                      onClick={() => { setSelectedTier(tier); setMode("assessment"); }}
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
                  onClick={() => { setSelectedTier("all"); setMode("assessment"); }}
                  className="w-full text-left px-5 py-4 rounded-[3px] border-2 border-[#D40511] bg-red-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-base text-[#D40511]">Full Assessment — All Tiers</span>
                    <span className="text-xs text-gray-500 font-medium">{assessmentQuestions.length} questions</span>
                  </div>
                  <p className="text-sm text-gray-600">Complete evaluation across all tiers. For serious operators only.</p>
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

  // Review mode — show all answers
  if (mode === "review") {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const answeredCount = questions.filter((q) => answers[q.id]?.trim()).length;

    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Summary */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Assessment Complete</h2>
              </div>
              <div className="px-6 py-4 flex gap-6 text-center">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-[#1a1a1a]">{answeredCount}/{questions.length}</div>
                  <div className="text-xs text-gray-500">Questions Answered</div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-[#1a1a1a]">{mins}m {secs}s</div>
                  <div className="text-xs text-gray-500">Time Taken</div>
                </div>
              </div>
            </div>

            {/* All questions with answers */}
            {questions.map((q, idx) => {
              const cfg = TIER_CONFIG[q.tier];
              const userAnswer = answers[q.id] || "";
              return (
                <div key={q.id} className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-3">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Question {idx + 1}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide border px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color} ${cfg.borderColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="px-5 py-3">
                    <p className="font-bold text-sm text-[#1a1a1a] mb-3">{q.question}</p>

                    {/* Their answer */}
                    <div className="mb-3">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Your Answer</div>
                      <div className={`text-sm px-3 py-2 rounded-[3px] border ${userAnswer.trim() ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-gray-50 border-gray-200 text-gray-400 italic"}`}>
                        {userAnswer.trim() || "No answer provided"}
                      </div>
                    </div>

                    {/* Answer key */}
                    <div>
                      <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Answer Key</div>
                      <div className="bg-green-50 border border-green-200 rounded-[3px] px-3 py-2">
                        <ul className="space-y-1">
                          {q.answerKey.map((point, i) => (
                            <li key={i} className="text-sm text-green-900 flex gap-2">
                              <span className="text-green-600 flex-shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                        {q.warningNote && (
                          <div className="mt-2 pt-2 border-t border-green-200 text-xs text-amber-700 font-medium">
                            ⚠️ {q.warningNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => { setMode("select"); setSelectedTier(null); setCurrentIndex(0); setAnswers({}); setRevealed({}); }}
                className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                RETAKE
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

  // Assessment mode — one question at a time
  if (!current) return null;

  const cfg = TIER_CONFIG[current.tier];
  const isRevealed = revealed[current.id] || false;
  const userAnswer = answers[current.id] || "";

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

              {/* Text input */}
              <textarea
                className="w-full border border-[#ccc] rounded-[3px] px-3 py-2.5 text-sm focus:outline-none focus:border-[#D40511] resize-none"
                style={{ fontFamily: "Arial, sans-serif", minHeight: "120px" }}
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                disabled={isRevealed}
              />

              {/* Answer key (revealed) */}
              {isRevealed && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-[3px] px-4 py-3">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Answer Key</div>
                  <ul className="space-y-1.5">
                    {current.answerKey.map((point, i) => (
                      <li key={i} className="text-sm text-green-900 flex gap-2">
                        <span className="text-green-600 flex-shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {current.warningNote && (
                    <div className="mt-2 pt-2 border-t border-green-200 text-xs text-amber-700 font-medium">
                      ⚠️ {current.warningNote}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                {!isRevealed ? (
                  <button
                    onClick={() => {
                      if (!userAnswer.trim()) return;
                      setRevealed({ ...revealed, [current.id]: true });
                    }}
                    disabled={!userAnswer.trim()}
                    className={`flex-1 rounded-[3px] px-4 py-3 text-sm font-bold border transition ${
                      userAnswer.trim()
                        ? "bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border-[#cca300] cursor-pointer"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (isLast) { setMode("review"); return; }
                      setCurrentIndex(currentIndex + 1);
                    }}
                    className="flex-1 bg-[#D40511] hover:bg-[#b8040f] text-white border border-[#a3030e] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
                  >
                    {isLast ? "Complete Assessment" : "Next \u2192"}
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
