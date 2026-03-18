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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DHLHeader />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* Overall Score Card */}
        <div className="bg-white border border-dhl-border rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="bg-dhl-dark text-white px-6 py-4">
            <h1 className="text-xl font-bold">Training Session Complete</h1>
            <p className="text-sm text-gray-400 mt-1">Review your performance across all scenarios</p>
          </div>

          <div className="p-6 flex items-center gap-8">
            {/* Grade Circle */}
            <div className={`w-28 h-28 rounded-full ${grade.bg} flex items-center justify-center flex-shrink-0 score-reveal`}>
              <div className="text-center">
                <div className={`text-4xl font-black ${grade.color}`}>{grade.letter}</div>
                <div className={`text-sm font-bold ${grade.color}`}>{overallScore}%</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 flex-1">
              <div>
                <div className="text-2xl font-black text-dhl-dark">{totalCorrect}/{totalFields}</div>
                <div className="text-xs text-gray-500 font-medium">Fields Correct</div>
              </div>
              <div>
                <div className="text-2xl font-black text-dhl-dark">{results.length}</div>
                <div className="text-xs text-gray-500 font-medium">Scenarios Completed</div>
              </div>
              <div>
                <div className="text-2xl font-black text-dhl-dark">{formatTime(totalTime)}</div>
                <div className="text-xs text-gray-500 font-medium">Total Time</div>
              </div>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`px-6 py-3 text-sm font-medium border-t ${
            overallScore >= 80 ? "bg-green-50 text-green-800 border-green-200" :
            overallScore >= 60 ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
            "bg-red-50 text-red-800 border-red-200"
          }`}>
            {overallScore >= 90 && "Outstanding performance! You demonstrate strong proficiency with the CRA system."}
            {overallScore >= 80 && overallScore < 90 && "Good work! A few areas to review, but solid overall performance."}
            {overallScore >= 60 && overallScore < 80 && "Needs improvement. Review the scenarios where you missed fields and try again."}
            {overallScore < 60 && "Additional training recommended. Pay close attention to customer details and shipping requirements."}
          </div>
        </div>

        {/* Individual Scenario Results */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-dhl-gray uppercase tracking-wider">Scenario Breakdown</h2>

          {results.map((result) => {
            const sg = getGrade(result.score);
            const isExpanded = expandedScenario === result.scenarioId;

            return (
              <div key={result.scenarioId} className="bg-white border border-dhl-border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedScenario(isExpanded ? null : result.scenarioId)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${sg.bg} ${sg.color}`}>
                      {result.score}%
                    </span>
                    <span className="font-medium text-sm">{result.npcName}</span>
                    <span className="text-xs text-gray-400">
                      {result.correctFields}/{result.totalFields} correct
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatTime(result.timeSpent)}</span>
                    <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-dhl-border px-4 py-3">
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
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4 pb-8">
          <button
            onClick={() => {
              sessionStorage.removeItem("gameResults");
              router.push("/");
            }}
            className="bg-dhl-dark text-white px-6 py-3 text-sm font-bold rounded hover:bg-gray-800 transition cursor-pointer"
          >
            BACK TO MENU
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("gameResults");
              router.push("/game");
            }}
            className="bg-dhl-red text-white px-6 py-3 text-sm font-bold rounded hover:bg-red-700 transition cursor-pointer"
          >
            RETRY TRAINING
          </button>
        </div>
      </div>
    </div>
  );
}
