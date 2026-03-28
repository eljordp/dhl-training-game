"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { assessmentQuestions, TIER_CONFIG, AssessmentTier } from "@/data/assessment";
import { gradeAssessment, gradeQuestion, AssessmentGradeResult, GradedAnswer } from "@/lib/gradeAssessment";
import { saveQuizAttempt } from "@/lib/tracking";
import { useActivityTracker } from "@/lib/useActivityTracker";

type Mode = "select" | "assessment" | "review";

export default function AssessmentPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");
  const [selectedTier, setSelectedTier] = useState<AssessmentTier | "all" | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [questionGrades, setQuestionGrades] = useState<Record<string, GradedAnswer>>({});
  const [startTime] = useState(Date.now());
  const [gradeResult, setGradeResult] = useState<AssessmentGradeResult | null>(null);
  const savedRef = useRef(false);

  // Activity tracking — "quiz" during assessment, "quiz-review" during review
  useActivityTracker(mode === "review" ? "quiz-review" : "quiz");

  const tiers: AssessmentTier[] = ["fundamentals", "operations", "expert", "scenarios"];

  const questions = selectedTier === "all"
    ? assessmentQuestions
    : assessmentQuestions.filter((q) => q.tier === selectedTier);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Compute grade when entering review mode
  const grade = useMemo(() => {
    if (mode !== "review") return null;
    if (gradeResult) return gradeResult;
    const result = gradeAssessment(questions, answers);
    setGradeResult(result);

    // Save to DB (once)
    if (!savedRef.current) {
      savedRef.current = true;
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      saveQuizAttempt(
        result.overallScore,
        result.totalQuestions,
        result.totalCorrect,
        timeSpent,
        result.gradedAnswers.map((a) => ({
          questionId: a.questionId,
          category: a.tier,
          correct: a.score >= 70,
          userAnswer: 0,
        })),
        selectedTier === "all" ? "all" : selectedTier || "unknown"
      );
    }

    return result;
  }, [mode, gradeResult, questions, answers, startTime, selectedTier]);

  // Build a lookup for graded answers
  const gradedMap = useMemo(() => {
    if (!grade) return {};
    const map: Record<string, (typeof grade.gradedAnswers)[number]> = {};
    for (const ga of grade.gradedAnswers) {
      map[ga.questionId] = ga;
    }
    return map;
  }, [grade]);

  function scoreColor(score: number): string {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-yellow-700";
    return "text-[#D40511]";
  }

  function scoreBgColor(score: number): string {
    if (score >= 80) return "bg-green-50 border-green-300";
    if (score >= 60) return "bg-yellow-50 border-yellow-300";
    return "bg-red-50 border-[#D40511]";
  }

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

  // Review mode — show all answers with grading
  if (mode === "review" && grade) {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const passed = grade.overallScore >= 70;

    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Scored Summary */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Assessment Results</h2>
              </div>
              <div className="px-6 py-5">
                {/* Overall score + pass/fail */}
                <div className="flex items-center justify-center gap-6 mb-5">
                  <div className={`text-center border-2 rounded-[3px] px-6 py-4 ${scoreBgColor(grade.overallScore)}`}>
                    <div className={`text-4xl font-bold ${scoreColor(grade.overallScore)}`}>{grade.overallScore}%</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold px-4 py-2 rounded-[3px] border-2 ${passed ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-[#D40511] text-[#D40511]"}`}>
                      {passed ? "PASSED" : "NEEDS WORK"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">70% required to pass</div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-4 text-center mb-5">
                  <div className="flex-1 bg-[#f5f5f5] rounded-[3px] px-3 py-3">
                    <div className="text-xl font-bold text-[#1a1a1a]">{grade.totalCorrect}/{grade.totalQuestions}</div>
                    <div className="text-xs text-gray-500">Questions Passed</div>
                  </div>
                  <div className="flex-1 bg-[#f5f5f5] rounded-[3px] px-3 py-3">
                    <div className="text-xl font-bold text-[#1a1a1a]">{mins}m {secs}s</div>
                    <div className="text-xs text-gray-500">Time Taken</div>
                  </div>
                </div>

                {/* Tier breakdown */}
                <div className="border border-gray-200 rounded-[3px] overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Score by Tier
                  </div>
                  {Object.entries(grade.tierScores).map(([tier, data]) => {
                    const cfg = TIER_CONFIG[tier as AssessmentTier];
                    if (!cfg) return null;
                    return (
                      <div key={tier} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
                        <span className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">{data.passed}/{data.total} passed</span>
                          <span className={`text-sm font-bold ${scoreColor(data.score)}`}>{data.score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* All questions with answers + grading */}
            {questions.map((q, idx) => {
              const cfg = TIER_CONFIG[q.tier];
              const userAnswer = answers[q.id] || "";
              const ga = gradedMap[q.id];
              const qPassed = ga && ga.score >= 70;

              return (
                <div key={q.id} className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-3">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Question {idx + 1}</span>
                      {ga && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${qPassed ? "bg-green-50 text-green-800 border-green-400" : "bg-red-50 text-[#D40511] border-[#D40511]"}`}>
                          {qPassed ? "PASS" : "NEEDS REVIEW"} — {ga.score}%
                        </span>
                      )}
                    </div>
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
                          {q.answerKey.map((point, i) => {
                            const wasMissed = ga?.feedback.includes(point);
                            return (
                              <li key={i} className={`text-sm flex gap-2 ${wasMissed ? "text-orange-700" : "text-green-900"}`}>
                                <span className={`flex-shrink-0 ${wasMissed ? "text-orange-500" : "text-green-600"}`}>
                                  {wasMissed ? "\u2717" : "\u2713"}
                                </span>
                                <span>{point}</span>
                              </li>
                            );
                          })}
                        </ul>
                        {q.warningNote && (
                          <div className="mt-2 pt-2 border-t border-green-200 text-xs text-amber-700 font-medium">
                            {q.warningNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Missed points callout */}
                    {ga && ga.feedback.length > 0 && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-[3px] px-3 py-2">
                        <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">
                          Missed Points ({ga.feedback.length})
                        </div>
                        <ul className="space-y-0.5">
                          {ga.feedback.map((point, i) => (
                            <li key={i} className="text-xs text-orange-800 flex gap-1.5">
                              <span className="text-orange-500 flex-shrink-0">&bull;</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => { setMode("select"); setSelectedTier(null); setCurrentIndex(0); setAnswers({}); setRevealed({}); setQuestionGrades({}); setGradeResult(null); savedRef.current = false; }}
                className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                TAKE ANOTHER TIER
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

              {/* Answer key + instant grade (revealed) */}
              {isRevealed && (() => {
                const qg = questionGrades[current.id];
                const qPassed = qg && qg.score >= 70;
                return (
                  <>
                    {/* Grade badge */}
                    {qg && (
                      <div className={`mt-4 flex items-center gap-3 px-4 py-2.5 rounded-[3px] border-2 ${qPassed ? "bg-green-50 border-green-400" : "bg-red-50 border-[#D40511]"}`}>
                        <span className={`text-2xl font-bold ${qPassed ? "text-green-700" : "text-[#D40511]"}`}>{qg.score}%</span>
                        <div>
                          <span className={`text-sm font-bold ${qPassed ? "text-green-800" : "text-[#D40511]"}`}>
                            {qPassed ? "PASS" : "NEEDS REVIEW"}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {qg.matchedPoints}/{qg.totalPoints} key points matched
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Answer key with per-bullet checkmarks */}
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-[3px] px-4 py-3">
                      <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Answer Key</div>
                      <ul className="space-y-1.5">
                        {current.answerKey.map((point, i) => {
                          const wasMissed = qg?.feedback.includes(point);
                          return (
                            <li key={i} className={`text-sm flex gap-2 ${wasMissed ? "text-orange-700" : "text-green-900"}`}>
                              <span className={`flex-shrink-0 ${wasMissed ? "text-orange-500" : "text-green-600"}`}>
                                {wasMissed ? "\u2717" : "\u2713"}
                              </span>
                              <span>{point}</span>
                            </li>
                          );
                        })}
                      </ul>
                      {current.warningNote && (
                        <div className="mt-2 pt-2 border-t border-green-200 text-xs text-amber-700 font-medium">
                          {current.warningNote}
                        </div>
                      )}
                    </div>

                    {/* Missed points callout */}
                    {qg && qg.feedback.length > 0 && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-[3px] px-3 py-2">
                        <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">
                          Missed Points ({qg.feedback.length})
                        </div>
                        <ul className="space-y-0.5">
                          {qg.feedback.map((point, i) => (
                            <li key={i} className="text-xs text-orange-800 flex gap-1.5">
                              <span className="text-orange-500 flex-shrink-0">&bull;</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-3 mt-4" id="quiz-actions">
                {!isRevealed ? (
                  <button
                    onClick={() => {
                      if (!userAnswer.trim()) return;
                      setRevealed({ ...revealed, [current.id]: true });
                      // Grade the question instantly
                      const qGrade = gradeQuestion(current, userAnswer);
                      setQuestionGrades({ ...questionGrades, [current.id]: qGrade });
                      // Scroll to make the next/complete button visible after answer key reveals
                      setTimeout(() => {
                        document.getElementById("quiz-actions")?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }, 100);
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
                      // Scroll to top for next question
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex-1 bg-[#D40511] hover:bg-[#b8040f] text-white border border-[#a3030e] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
                  >
                    {isLast ? "Complete Assessment \u2713" : "Next \u2192"}
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
