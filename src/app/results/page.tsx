"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { ScenarioResult } from "@/types/game";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("gameResults");
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  const overallScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const totalXP = results.reduce((sum, r) => sum + (r.xpEarned || 0), 0);

  function getLevel(xp: number): { name: string; icon: string; next: number } {
    if (xp >= 600) return { name: "Expert", icon: "🏆", next: 0 };
    if (xp >= 350) return { name: "Senior Agent", icon: "⭐", next: 600 };
    if (xp >= 150) return { name: "Agent", icon: "🏅", next: 350 };
    return { name: "Trainee", icon: "🎓", next: 150 };
  }

  function getBadges(rs: ScenarioResult[]): { icon: string; label: string }[] {
    const badges: { icon: string; label: string }[] = [];
    if (rs.length > 0) badges.push({ icon: "🚀", label: "First Shipment" });
    if (rs.some(r => r.score === 100)) badges.push({ icon: "💎", label: "Perfect Run" });
    if (rs.some(r => r.timeSpent < 60)) badges.push({ icon: "⚡", label: "Speed Demon" });
    if (rs.every(r => r.score === 100)) badges.push({ icon: "🔥", label: "Flawless" });
    let maxStreak = 0, cur = 0;
    for (const r of rs) { if (r.score >= 80) { cur++; maxStreak = Math.max(maxStreak, cur); } else cur = 0; }
    if (maxStreak >= 3) badges.push({ icon: "🎯", label: "Hot Streak" });
    return badges;
  }

  const level = getLevel(totalXP);
  const badges = getBadges(results);

  const totalCorrect = results.reduce((sum, r) => sum + r.correctFields, 0);
  const totalFields = results.reduce((sum, r) => sum + r.totalFields, 0);
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function getGrade(score: number): { letter: string; color: string; bg: string } {
    if (score >= 95) return { letter: "A+", color: "text-green-700", bg: "bg-green-100" };
    if (score >= 90) return { letter: "A", color: "text-green-700", bg: "bg-green-100" };
    if (score >= 80) return { letter: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (score >= 70) return { letter: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (score >= 60) return { letter: "D", color: "text-orange-700", bg: "bg-orange-100" };
    return { letter: "F", color: "text-red-700", bg: "bg-red-100" };
  }

  const grade = getGrade(overallScore);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      <DHLHeader />

      <div className="flex-1 max-w-4xl mx-auto w-full px-3 md:px-4 py-4 md:py-8">
        {/* Overall Score Card */}
        <div className="bg-white border border-dhl-border rounded-lg shadow-sm mb-4 md:mb-8 overflow-hidden">
          <div className="bg-dhl-dark text-white px-4 md:px-6 py-3 md:py-4">
            <h1 className="text-lg md:text-xl font-bold">Training Complete</h1>
            <p className="text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1">Review your performance</p>
          </div>

          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center gap-4 md:gap-8">
            {/* Grade Circle */}
            <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full ${grade.bg} flex items-center justify-center flex-shrink-0 score-reveal`}>
              <div className="text-center">
                <div className={`text-3xl md:text-4xl font-black ${grade.color}`}>{grade.letter}</div>
                <div className={`text-sm font-bold ${grade.color}`}>{overallScore}%</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 flex-1 text-center sm:text-left">
              <div>
                <div className="text-xl md:text-2xl font-black text-dhl-dark">{totalCorrect}/{totalFields}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium">Fields Correct</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-dhl-dark">{results.length}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium">Scenarios</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-black text-dhl-dark">{formatTime(totalTime)}</div>
                <div className="text-[10px] md:text-xs text-gray-500 font-medium">Total Time</div>
              </div>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium border-t ${
            overallScore >= 80 ? "bg-green-50 text-green-800 border-green-200" :
            overallScore >= 60 ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
            "bg-red-50 text-red-800 border-red-200"
          }`}>
            {overallScore >= 90 && "Outstanding! Strong CRA proficiency."}
            {overallScore >= 80 && overallScore < 90 && "Good work! A few areas to review."}
            {overallScore >= 60 && overallScore < 80 && "Needs improvement. Review missed fields."}
            {overallScore < 60 && "Additional training recommended."}
          </div>
        </div>

        {/* XP & Level Card */}
        <div className="bg-white border border-dhl-border rounded-lg shadow-sm mb-4 md:mb-6 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center gap-4">
            {/* Level */}
            <div className="text-center">
              <div className="text-3xl mb-1">{level.icon}</div>
              <div className="text-sm font-bold text-dhl-dark">{level.name}</div>
            </div>

            {/* XP Bar */}
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-dhl-dark">{totalXP} XP earned</span>
                {level.next > 0 && <span>{level.next - totalXP} XP to next level</span>}
                {level.next === 0 && <span className="text-yellow-600 font-bold">MAX LEVEL</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-dhl-yellow h-3 rounded-full transition-all"
                  style={{ width: `${level.next > 0 ? Math.min(100, (totalXP / level.next) * 100) : 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="border-t border-dhl-border px-4 md:px-6 py-2 md:py-3">
              <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Badges Earned</div>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span key={b.label} className="flex items-center gap-1 bg-dhl-yellow/20 border border-dhl-yellow rounded-full px-3 py-1 text-xs font-bold">
                    {b.icon} {b.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Individual Scenario Results */}
        <div className="space-y-2 md:space-y-3">
          <h2 className="text-xs md:text-sm font-bold text-dhl-gray uppercase tracking-wider">Scenario Breakdown</h2>

          {results.map((result) => {
            const sg = getGrade(result.score);
            const isExpanded = expandedScenario === result.scenarioId;

            return (
              <div key={result.scenarioId} className="bg-white border border-dhl-border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : result.scenarioId)}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className={`text-xs md:text-sm font-bold px-1.5 md:px-2 py-0.5 rounded ${sg.bg} ${sg.color}`}>
                      {result.score}%
                    </span>
                    <span className="font-medium text-xs md:text-sm">{result.npcName}</span>
                    <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline">
                      {result.correctFields}/{result.totalFields} correct
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-[10px] md:text-xs text-gray-400">{formatTime(result.timeSpent)}</span>
                    <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-dhl-border px-3 md:px-4 py-2 md:py-3 overflow-x-auto">
                    {/* Mobile: card layout / Desktop: table */}
                    <div className="hidden md:block">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="pb-2 font-medium">Field</th>
                            <th className="pb-2 font-medium">Your Answer</th>
                            <th className="pb-2 font-medium">Correct Answer</th>
                            <th className="pb-2 font-medium text-center">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.fieldResults.map((fr) => (
                            <tr
                              key={fr.field}
                              className={`border-b last:border-0 ${fr.correct ? "" : "bg-red-50"}`}
                            >
                              <td className="py-1.5 font-medium text-gray-700">{fr.label}</td>
                              <td className="py-1.5 text-gray-600">{fr.userValue || "—"}</td>
                              <td className="py-1.5 text-gray-600">{fr.correctValue}</td>
                              <td className="py-1.5 text-center">
                                {fr.correct ? (
                                  <span className="text-dhl-success font-bold">✓</span>
                                ) : (
                                  <span className="text-dhl-error font-bold">✗</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile: stacked cards */}
                    <div className="md:hidden space-y-2">
                      {result.fieldResults.map((fr) => (
                        <div
                          key={fr.field}
                          className={`p-2 rounded text-xs ${fr.correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-700">{fr.label}</span>
                            {fr.correct ? (
                              <span className="text-dhl-success font-bold">✓</span>
                            ) : (
                              <span className="text-dhl-error font-bold">✗</span>
                            )}
                          </div>
                          <div className="text-gray-600">
                            <span className="text-gray-400">You: </span>{fr.userValue || "—"}
                          </div>
                          {!fr.correct && (
                            <div className="text-gray-600 mt-0.5">
                              <span className="text-gray-400">Correct: </span>{fr.correctValue}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pb-6 md:pb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem("gameResults");
              router.push("/");
            }}
            className="w-full sm:w-auto bg-dhl-dark text-white px-6 py-3 text-sm font-bold rounded hover:bg-gray-800 transition cursor-pointer active:bg-gray-900"
          >
            BACK TO MENU
          </button>
          <button
            onClick={() => router.push("/quiz")}
            className="w-full sm:w-auto bg-dhl-yellow text-dhl-dark px-6 py-3 text-sm font-bold rounded hover:bg-yellow-400 transition cursor-pointer"
          >
            TAKE QUIZ →
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("gameResults");
              router.push("/game");
            }}
            className="w-full sm:w-auto bg-dhl-red text-white px-6 py-3 text-sm font-bold rounded hover:bg-red-700 transition cursor-pointer active:bg-red-800"
          >
            RETRY TRAINING
          </button>
        </div>
      </div>
    </div>
  );
}
