"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { assessmentQuestions, TIER_CONFIG, AssessmentTier } from "@/data/assessment";
import { summarizeGrades, gradeQuestion, AssessmentGradeResult, GradedAnswer, GRADING_VERSION } from "@/lib/gradeAssessment";
import { saveQuizAttempt } from "@/lib/tracking";
import { useActivityTracker } from "@/lib/useActivityTracker";

function References({ urls }: { urls?: string[] }) {
  if (!urls?.length) return null;
  return <p className="mt-2 text-xs text-gray-600">Reference: {urls.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="underline mr-3">Official source {i+1}</a>)}</p>;
}

type Mode = "select" | "assessment" | "review";

export default function AssessmentPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");
  const [selectedTier, setSelectedTier] = useState<AssessmentTier | "all" | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [questionGrades, setQuestionGrades] = useState<Record<string, GradedAnswer>>({});
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [saveStatus, setSaveStatus] = useState("Results stay in this browser unless saved to a signed-in account. Download a copy to share.");
  const saveStarted = useRef(false);
  const attemptSequence = useRef(0);
  const [gradeResult, setGradeResult] = useState<AssessmentGradeResult | null>(null);


  function speakText(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.lang = "en-US";
    window.speechSynthesis.speak(utt);
  }

  // Activity tracking — "quiz" during assessment, "quiz-review" during review
  useActivityTracker(mode === "review" ? "quiz-review" : "quiz");

  const tiers: AssessmentTier[] = ["fundamentals", "operations", "expert", "scenarios"];

  const questions = selectedTier === "all"
    ? assessmentQuestions
    : assessmentQuestions.filter((q) => q.tier === selectedTier);

  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const grade = gradeResult;

  function handleStartAssessment(tier: AssessmentTier | "all") {
    attemptSequence.current += 1;
    saveStarted.current = false;
    setSelectedTier(tier);
    setCurrentIndex(0);
    setAnswers({});
    setRevealed({});
    setQuestionGrades({});
    setAcknowledged({});
    setGradeResult(null);
    setTimeSpent(0);
    // This is called only by the start button, not during render.
    // eslint-disable-next-line react-hooks/purity
    setStartTime(Date.now());
    setSaveStatus("Results stay in this browser unless saved to a signed-in account. Download a copy to share.");
    setMode("assessment");
  }

  function handleCompleteAssessment() {
    // Reuse the exact grades shown after submission; do not grade again in render.
    const grades = questions.map(q => questionGrades[q.id]);
    if (grades.some(g => !g) || saveStarted.current) return;
    saveStarted.current = true;
    const sequence = attemptSequence.current;
    const result = summarizeGrades(grades);
    // This is called only by the completion button; freeze the displayed time.
    // eslint-disable-next-line react-hooks/purity
    const elapsed = startTime === null ? 0 : Math.max(0, Math.round((Date.now() - startTime) / 1000));
    setTimeSpent(elapsed);
    setGradeResult(result);
    setMode("review");
    setSaveStatus("Checking whether this attempt can be saved…");
    void saveQuizAttempt(result.overallScore, result.totalQuestions, result.totalCorrect, elapsed,
      result.gradedAnswers.map(a => ({ questionId: a.questionId, category: a.tier,
        correct: !a.reviewRequired && a.score >= 70, userAnswer: a.userAnswer, score: a.score,
        reviewRequired: a.reviewRequired, gradingVersion: GRADING_VERSION })), selectedTier || "all")
      .then(status => { if (sequence !== attemptSequence.current) return; setSaveStatus(status === "saved" ? "Saved to your signed-in account."
        : status === "guest" ? "Guest attempt — not sent to a manager. Download your results to share them."
        : "Could not save this attempt. Download your results before leaving this page."); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function downloadResults() {
    if (!grade) return;
    const lines = ["DHL practice quiz — concept review", `Grading: ${GRADING_VERSION}`,
      `Recognized ideas: ${grade.overallScore}%`, `Answers needing review: ${grade.reviewCount}`,
      `Time: ${timeSpent} seconds`, "Automated practice feedback, not certification.", "",
      ...questions.flatMap((q, i) => {
        const a = grade.gradedAnswers[i];
        return [`${i+1}. ${q.question}`, `Answer: ${a.userAnswer}`,
          `Recognized: ${a.score}% — ${a.reviewRequired ? "needs review" : "all core ideas recognized"}`,
          ...a.feedback.map(point => `Review: ${point}`), ""];
      })];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "dhl-quiz-results.txt"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

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
                <h2 className="font-bold text-[#1a1a1a] text-lg">DHL Express Quiz</h2>
                <p className="text-xs text-[#555] mt-0.5">37 Questions | 4 Tiers | Practice and review</p>
              </div>
              <div className="px-6 py-6 space-y-3">
                <p className="text-sm text-gray-600">Answer in your own words. The free automatic check recognizes common ways of expressing the core ideas. Unrecognized or conflicting answers need review; wording alone is not proof of a wrong answer.</p>
                {tiers.map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  const count = assessmentQuestions.filter((q) => q.tier === tier).length;
                  return (
                    <button
                      key={tier}
                      onClick={() => handleStartAssessment(tier)}
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
                  onClick={() => handleStartAssessment("all")}
                  className="w-full text-left px-5 py-4 rounded-[3px] border-2 border-[#D40511] bg-red-50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-base text-[#D40511]">Full Quiz — All Tiers</span>
                    <span className="text-xs text-gray-500 font-medium">{assessmentQuestions.length} questions</span>
                  </div>
                  <p className="text-sm text-gray-600">Every question across all tiers.</p>
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
    const totalTime = timeSpent;
    const mins = Math.floor(totalTime / 60);
    const secs = totalTime % 60;
    const passed = grade.overallScore >= 70 && grade.reviewCount === 0;

    return (
      <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
        <DHLHeader />
        <div className="flex-1 bg-[#f5f5f5] px-4 py-8">
          <div className="w-full max-w-3xl mx-auto">
            {/* Scored Summary */}
            <div className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-4">
              <div className="bg-[#FFCC00] px-6 py-3 border-b border-[#e6b800]">
                <h2 className="font-bold text-[#1a1a1a] text-lg">Quiz Results</h2>
              </div>
              <div className="px-6 py-5">
                {/* Overall score + pass/fail */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
                  <div className={`text-center border-2 rounded-[3px] px-6 py-4 ${scoreBgColor(grade.overallScore)}`}>
                    <div className={`text-4xl font-bold ${scoreColor(grade.overallScore)}`}>{grade.overallScore}%</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Recognized Ideas</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold px-4 py-2 rounded-[3px] border-2 ${passed ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-[#D40511] text-[#D40511]"}`}>
                      {passed ? "CORE IDEAS RECOGNIZED" : "REVIEW NEEDED"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Automated practice feedback</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">Each question has equal weight. The percentage shows recognized core ideas, including partial credit. {grade.reviewCount} answer(s) need review before drawing a conclusion about readiness.</p>
                <p role="status" className="text-sm text-gray-600 mb-3">{saveStatus}</p>
                <button onClick={downloadResults} className="border rounded px-4 py-2 mb-4 font-bold text-sm cursor-pointer">Download results</button>
                {/* Stats row */}
                <div className="flex gap-4 text-center mb-5">
                  <div className="flex-1 bg-[#f5f5f5] rounded-[3px] px-3 py-3">
                    <div className="text-xl font-bold text-[#1a1a1a]">{grade.totalCorrect}/{grade.totalQuestions}</div>
                    <div className="text-xs text-gray-500">Answers Fully Recognized</div>
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
                          <span className="text-xs text-gray-500">{data.passed}/{data.total} fully recognized</span>
                          <span className={`text-sm font-bold ${scoreColor(data.score)}`}>{data.score}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Personalized Training Focus */}
            {(() => {
              const failedQuestions = grade.gradedAnswers.filter((a) => a.reviewRequired);
              if (failedQuestions.length === 0) return null;

              // Group failed questions by topic area
              const topicMap: Record<string, { count: number; questions: string[]; tips: string[] }> = {};
              for (const fq of failedQuestions) {
                const q = questions.find((qq) => qq.id === fq.questionId);
                if (!q) continue;

                // Determine topic from question content
                const qText = q.question.toLowerCase();
                let topic = "General Knowledge";
                let tip = "";

                if (qText.includes("doc") && qText.includes("non-doc") || qText.includes("service type") || qText.includes("wpx") || qText.includes("dox")) {
                  topic = "Shipment Classification";
                  tip = "Know the difference between DOC (documents, no value) and NON-DOC (goods with value). Verify DOX, WPX and ECX against the current product guide.";
                } else if (qText.includes("customs") || qText.includes("hs code") || qText.includes("harmonized") || qText.includes("country of origin")) {
                  topic = "Customs & Compliance";
                  tip = "Check the documents required for the goods and destination. Origin follows applicable production/manufacturing rules, not just the dispatch address.";
                } else if (qText.includes("value") || qText.includes("declared") || qText.includes("undervalue") || qText.includes("$")) {
                  topic = "Declared Value & Pricing";
                  tip = "Use supportable customs values. Never invent token amounts or knowingly submit a false declaration.";
                } else if (qText.includes("phone") || qText.includes("address") || qText.includes("po box") || qText.includes("contact")) {
                  topic = "Contact Info & Addresses";
                  tip = "Verify a reachable receiver number and deliverable physical address. Missing contact details can cause delays or returns.";
                } else if (qText.includes("dangerous") || qText.includes("lithium") || qText.includes("perfume") || qText.includes("battery")) {
                  topic = "Dangerous Goods";
                  tip = "Check actual contents and dangerous-goods acceptance rules. Perfume, batteries and aerosols may need special handling or may not be accepted.";
                } else if (qText.includes("invoice") || qText.includes("commercial") || qText.includes("multi-piece") || qText.includes("item")) {
                  topic = "Commercial Invoice";
                  tip = "Describe distinct commodities on separate lines with accurate quantities, values, origin and tariff classification. Validate supplied invoices and follow the approved local workflow.";
                } else if (qText.includes("weight") || qText.includes("dimensional") || qText.includes("volumetric")) {
                  topic = "Weight & Dimensions";
                  tip = "DHL charges the higher of actual weight vs dimensional weight. Formula: (L × W × H in cm) ÷ 5000.";
                } else if (qText.includes("duties") || qText.includes("taxes") || qText.includes("gift") || qText.includes("brazil") || qText.includes("saudi")) {
                  topic = "Duties, Taxes & Country Rules";
                  tip = "Each country has its own rules. Brazil needs CPF/CNPJ tax ID. Gift exemptions vary by country. Receiver may owe duties at delivery.";
                } else if (qText.includes("customer") || qText.includes("respond") || qText.includes("angry") || qText.includes("insist") || qText.includes("says")) {
                  topic = "Customer Handling";
                  tip = "Stay professional but firm. Never undervalue at a customer's request. When a shipment is stuck, check invoice, value, and contact details before escalating.";
                }

                if (!topicMap[topic]) {
                  topicMap[topic] = { count: 0, questions: [], tips: [] };
                }
                topicMap[topic].count++;
                topicMap[topic].questions.push(q.question);
                if (tip && !topicMap[topic].tips.includes(tip)) {
                  topicMap[topic].tips.push(tip);
                }
              }

              // Sort by most missed
              const sortedTopics = Object.entries(topicMap).sort((a, b) => b[1].count - a[1].count);

              return (
                <div className="bg-white border-2 border-[#D40511] rounded-sm shadow-sm mb-4">
                  <div className="bg-[#D40511] px-6 py-3">
                    <h2 className="font-bold text-white text-lg">Review Together</h2>
                    <p className="text-red-100 text-xs mt-0.5">These topics contain ideas the automatic check could not confirm.</p>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    {sortedTopics.map(([topic, data]) => (
                      <div key={topic} className="border border-gray-200 rounded-[3px] overflow-hidden">
                        <div className="bg-red-50 px-4 py-2.5 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#D40511]">{topic}</span>
                          <span className="text-xs bg-[#D40511] text-white px-2 py-0.5 rounded-full font-bold">
                            {data.count} to review
                          </span>
                        </div>
                        {data.tips.map((tip, i) => (
                          <div key={i} className="px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-[#1a1a1a]">{tip}</p>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="bg-[#FFF8E0] border border-[#FFCC00] rounded-[3px] px-4 py-3 mt-2">
                      <p className="text-sm text-[#1a1a1a] font-medium">
                        Compare your wording with the core ideas below. An unrecognized idea may need clarification rather than correction.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* All questions with answers + grading */}
            {questions.map((q, idx) => {
              const cfg = TIER_CONFIG[q.tier];
              const userAnswer = answers[q.id] || "";
              const ga = gradedMap[q.id];
              const qPassed = ga && !ga.reviewRequired;

              return (
                <div key={q.id} className="bg-white border border-[#ddd] rounded-sm shadow-sm mb-3">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Question {idx + 1}</span>
                      {ga && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${qPassed ? "bg-green-50 text-green-800 border-green-400" : "bg-red-50 text-[#D40511] border-[#D40511]"}`}>
                          {qPassed ? "RECOGNIZED" : "NEEDS REVIEW"} — {ga.score}%
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
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Answer Key</div>
                        <button
                          onClick={() => speakText(q.answerKey.join(". "))}
                          title="Read answer key aloud"
                          className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 border border-green-300 rounded px-2 py-0.5 cursor-pointer transition"
                        >
                          <span>🔊</span>
                          <span>Listen</span>
                        </button>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-[3px] px-3 py-2">
                        <ul className="space-y-1">
                          {q.answerKey.map((point, i) => {
                            const wasMissed = ga?.feedback.includes(point);
                            return (
                              <li key={i} className={`text-sm flex gap-2 ${wasMissed ? "text-orange-700" : "text-green-900"}`}>
                                <span className={`flex-shrink-0 ${wasMissed ? "text-orange-500" : "text-green-600"}`}>
                                  {wasMissed ? "?" : "\u2713"}
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

                    <References urls={current.sources} />
                    {/* Missed points callout */}
                    {ga && ga.feedback.length > 0 && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-[3px] px-3 py-2">
                        <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">
                          Ideas to Review ({ga.feedback.length})
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
                onClick={() => { setMode("select"); setSelectedTier(null); }}
                className="flex-1 bg-[#FFCC00] hover:bg-[#e6b800] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-4 py-3 text-sm font-bold cursor-pointer transition"
              >
                TRY ANOTHER TIER
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
                aria-label="Your answer"
                maxLength={4000}
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                disabled={isRevealed}
              />

              {/* Answer key + instant grade (revealed) */}
              {isRevealed && (() => {
                const qg = questionGrades[current.id];
                const qPassed = qg && !qg.reviewRequired;
                return (
                  <>
                    {/* Grade badge */}
                    {qg && (
                      <div className={`mt-4 flex items-center gap-3 px-4 py-2.5 rounded-[3px] border-2 ${qPassed ? "bg-green-50 border-green-400" : "bg-red-50 border-[#D40511]"}`}>
                        <span className={`text-2xl font-bold ${qPassed ? "text-green-700" : "text-[#D40511]"}`}>{qg.score}%</span>
                        <div>
                          <span className={`text-sm font-bold ${qPassed ? "text-green-800" : "text-[#D40511]"}`}>
                            {qPassed ? "RECOGNIZED" : "NEEDS REVIEW"}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {qg.matchedPoints}/{qg.totalPoints} core ideas recognized
                          </span>
                        </div>
                      </div>
                    )}

                    {qg?.reviewRequired && <p role="status" className="mt-3 text-sm text-amber-800">{qg.reviewReason}</p>}
                    {/* Answer key with per-bullet checkmarks */}
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-[3px] px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Answer Key</div>
                        <button
                          onClick={() => speakText(current.answerKey.join(". "))}
                          title="Read answer key aloud"
                          className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 bg-green-100 hover:bg-green-200 border border-green-300 rounded px-2 py-0.5 cursor-pointer transition"
                        >
                          <span>🔊</span>
                          <span>Listen</span>
                        </button>
                      </div>
                      <ul className="space-y-1.5">
                        {current.answerKey.map((point, i) => {
                          const wasMissed = qg?.feedback.includes(point);
                          return (
                            <li key={i} className={`text-sm flex gap-2 ${wasMissed ? "text-orange-700" : "text-green-900"}`}>
                              <span className={`flex-shrink-0 ${wasMissed ? "text-orange-500" : "text-green-600"}`}>
                                {wasMissed ? "?" : "\u2713"}
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

                    <References urls={current.sources} />
                    {/* Missed points callout */}
                    {qg && qg.feedback.length > 0 && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-[3px] px-3 py-2">
                        <div className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">
                          Ideas to Review ({qg.feedback.length})
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

              {/* Acknowledgment checkbox (shown after answer is revealed) */}
              {isRevealed && (
                <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acknowledged[current.id] || false}
                    onChange={(e) => setAcknowledged({ ...acknowledged, [current.id]: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#D40511] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-[#1a1a1a]">
                    I’ve compared my answer with the core ideas and noted anything to clarify.
                  </span>
                </label>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-3" id="quiz-actions">
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
                      if (isLast) { handleCompleteAssessment(); return; }
                      setCurrentIndex(currentIndex + 1);
                      // Scroll to top for next question
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={!acknowledged[current.id]}
                    className={`flex-1 rounded-[3px] px-4 py-3 text-sm font-bold border transition ${
                      acknowledged[current.id]
                        ? "bg-[#D40511] hover:bg-[#b8040f] text-white border-[#a3030e] cursor-pointer"
                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isLast ? "Complete Quiz \u2713" : "Next \u2192"}
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
