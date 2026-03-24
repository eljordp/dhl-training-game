"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/auth";
import DHLHeader from "@/components/DHLHeader";
import { TIER_CONFIG } from "@/data/assessment";

// --- Types ---

interface FieldResultRow {
  field: string;
  label: string;
  user_value: string;
  correct_value: string;
  is_correct: boolean;
}

interface ScenarioAttemptRow {
  id: string;
  scenario_id: string;
  npc_name: string;
  score: number;
  correct_fields: number;
  total_fields: number;
  time_spent: number;
  xp_earned: number;
  created_at: string;
  field_results: FieldResultRow[];
}

interface QuestionResult {
  questionId: string;
  category: string;
  correct: boolean;
}

interface QuizAttemptRow {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  question_results: QuestionResult[] | null;
  difficulty: string;
  created_at: string;
}

interface ActivityData {
  total_active: number;
  total_idle: number;
  total_away: number;
  total_interactions: number;
  heartbeat_count: number;
  last_heartbeat: string | null;
}

interface EmployeeStats {
  id: string;
  username: string;
  display_name: string;
  attempts: ScenarioAttemptRow[];
  quizAttempts: QuizAttemptRow[];
  activity?: ActivityData | null;
}

// --- Helpers ---

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function avgScore(attempts: ScenarioAttemptRow[]) {
  if (!attempts.length) return null;
  return Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);
}

function bestScore(attempts: ScenarioAttemptRow[]) {
  if (!attempts.length) return null;
  return Math.max(...attempts.map((a) => a.score));
}

function lastActive(attempts: ScenarioAttemptRow[], quizAttempts: QuizAttemptRow[]) {
  const dates = [
    ...attempts.map((a) => a.created_at),
    ...quizAttempts.map((a) => a.created_at),
  ];
  if (!dates.length) return null;
  return dates.sort().reverse()[0];
}

// --- Activity Helpers ---

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getEngagementRate(activity: ActivityData | null | undefined): number | null {
  if (!activity) return null;
  const total = activity.total_active + activity.total_idle + activity.total_away;
  if (total === 0) return null;
  return Math.round((activity.total_active / total) * 100);
}

function engagementColor(rate: number | null): string {
  if (rate === null) return "text-[#aaa]";
  if (rate >= 70) return "text-green-600";
  if (rate >= 50) return "text-yellow-600";
  return "text-[#D40511]";
}

function engagementBgColor(rate: number | null): string {
  if (rate === null) return "bg-[#f2f2f2] text-[#aaa]";
  if (rate >= 70) return "bg-green-50 text-green-700";
  if (rate >= 50) return "bg-yellow-50 text-yellow-700";
  return "bg-red-50 text-[#D40511]";
}

function getActivityAlerts(employee: EmployeeStats): { type: "warning" | "danger"; label: string }[] {
  const alerts: { type: "warning" | "danger"; label: string }[] = [];
  const activity = employee.activity;

  if (!activity || activity.heartbeat_count === 0) {
    alerts.push({ type: "warning", label: "No activity recorded" });
    return alerts;
  }

  const engRate = getEngagementRate(activity);
  if (engRate !== null && engRate < 50) {
    alerts.push({ type: "danger", label: "Low engagement" });
  }

  if (activity.total_away > activity.total_active) {
    alerts.push({ type: "danger", label: "Frequently away" });
  }

  return alerts;
}

// --- Weak Spots ---

function computeWeakSpots(employees: EmployeeStats[]) {
  const fieldMisses: Record<string, { label: string; missed: number; total: number }> = {};

  for (const emp of employees) {
    for (const attempt of emp.attempts) {
      for (const fr of attempt.field_results) {
        if (!fieldMisses[fr.field]) {
          fieldMisses[fr.field] = { label: fr.label || fr.field, missed: 0, total: 0 };
        }
        fieldMisses[fr.field].total += 1;
        if (!fr.is_correct) {
          fieldMisses[fr.field].missed += 1;
        }
      }
    }
  }

  return Object.entries(fieldMisses)
    .filter(([, v]) => v.total > 0)
    .map(([field, v]) => ({
      field,
      label: v.label,
      missRate: Math.round((v.missed / v.total) * 100),
      missed: v.missed,
      total: v.total,
    }))
    .sort((a, b) => b.missRate - a.missRate)
    .slice(0, 5);
}

// --- Assessment Analytics Helpers ---

// Map quiz difficulty values to display-friendly tier labels and colors
const DIFFICULTY_DISPLAY: Record<string, { label: string; shortLabel: string; color: string; bgColor: string; borderColor: string }> = {
  beginner: { label: "Tier 1 — Fundamentals", shortLabel: "T1", color: "text-green-800", bgColor: "bg-green-50", borderColor: "border-green-400" },
  intermediate: { label: "Tier 2 — Operations", shortLabel: "T2", color: "text-yellow-800", bgColor: "bg-yellow-50", borderColor: "border-yellow-400" },
  advanced: { label: "Tier 3 — Expert", shortLabel: "T3", color: "text-red-800", bgColor: "bg-red-50", borderColor: "border-red-400" },
  all: { label: "Full Assessment", shortLabel: "All", color: "text-purple-800", bgColor: "bg-purple-50", borderColor: "border-purple-400" },
};

// Also support assessment tier names from TIER_CONFIG
const ASSESSMENT_TIER_DISPLAY: Record<string, { label: string; shortLabel: string; color: string; bgColor: string; borderColor: string }> = {
  fundamentals: { ...TIER_CONFIG.fundamentals, label: TIER_CONFIG.fundamentals.label, shortLabel: "T1" },
  operations: { ...TIER_CONFIG.operations, label: TIER_CONFIG.operations.label, shortLabel: "T2" },
  expert: { ...TIER_CONFIG.expert, label: TIER_CONFIG.expert.label, shortLabel: "T3" },
  scenarios: { ...TIER_CONFIG.scenarios, label: TIER_CONFIG.scenarios.label, shortLabel: "Bonus" },
};

function getDifficultyDisplay(difficulty: string) {
  return ASSESSMENT_TIER_DISPLAY[difficulty] || DIFFICULTY_DISPLAY[difficulty] || DIFFICULTY_DISPLAY["all"];
}

// All tier keys we want to show in the matrix (ordered)
const ALL_TIER_KEYS = ["beginner", "intermediate", "advanced", "fundamentals", "operations", "expert", "scenarios", "all"];

function computeTierPassRates(employees: EmployeeStats[]) {
  const allAttempts = employees.flatMap((e) => e.quizAttempts);
  const tierMap: Record<string, { attempts: number; passes: number; totalScore: number }> = {};

  for (const qa of allAttempts) {
    const tier = qa.difficulty || "all";
    if (!tierMap[tier]) tierMap[tier] = { attempts: 0, passes: 0, totalScore: 0 };
    tierMap[tier].attempts += 1;
    const pct = qa.total_questions > 0 ? Math.round((qa.correct_answers / qa.total_questions) * 100) : 0;
    tierMap[tier].totalScore += pct;
    if (pct >= 70) tierMap[tier].passes += 1;
  }

  return Object.entries(tierMap)
    .map(([tier, data]) => ({
      tier,
      display: getDifficultyDisplay(tier),
      attempts: data.attempts,
      passRate: data.attempts > 0 ? Math.round((data.passes / data.attempts) * 100) : 0,
      avgScore: data.attempts > 0 ? Math.round(data.totalScore / data.attempts) : 0,
      uniqueEmployees: new Set(
        employees.filter((e) => e.quizAttempts.some((qa) => (qa.difficulty || "all") === tier)).map((e) => e.id)
      ).size,
    }))
    .sort((a, b) => {
      const order = ALL_TIER_KEYS;
      return order.indexOf(a.tier) - order.indexOf(b.tier);
    });
}

function getRecentAssessmentActivity(employees: EmployeeStats[], limit = 10) {
  const all: { employee: EmployeeStats; attempt: QuizAttemptRow }[] = [];

  for (const emp of employees) {
    for (const qa of emp.quizAttempts) {
      all.push({ employee: emp, attempt: qa });
    }
  }

  return all
    .sort((a, b) => new Date(b.attempt.created_at).getTime() - new Date(a.attempt.created_at).getTime())
    .slice(0, limit);
}

function getCompletionMatrix(employees: EmployeeStats[]) {
  // Get all unique tiers that have been attempted
  const allTiers = new Set<string>();
  for (const emp of employees) {
    for (const qa of emp.quizAttempts) {
      allTiers.add(qa.difficulty || "all");
    }
  }

  // Sort tiers by predefined order
  const sortedTiers = ALL_TIER_KEYS.filter((t) => allTiers.has(t));

  // Build matrix
  const matrix = employees.map((emp) => {
    const tierStatus: Record<string, "pass" | "fail" | "none"> = {};
    for (const tier of sortedTiers) {
      const tierAttempts = emp.quizAttempts.filter((qa) => (qa.difficulty || "all") === tier);
      if (tierAttempts.length === 0) {
        tierStatus[tier] = "none";
      } else {
        const bestPct = Math.max(
          ...tierAttempts.map((qa) =>
            qa.total_questions > 0 ? Math.round((qa.correct_answers / qa.total_questions) * 100) : 0
          )
        );
        tierStatus[tier] = bestPct >= 70 ? "pass" : "fail";
      }
    }
    return { employee: emp, tierStatus };
  });

  return { tiers: sortedTiers, matrix };
}

function avgQuizScore(quizAttempts: QuizAttemptRow[]) {
  if (!quizAttempts.length) return null;
  const total = quizAttempts.reduce((sum, qa) => {
    const pct = qa.total_questions > 0 ? Math.round((qa.correct_answers / qa.total_questions) * 100) : 0;
    return sum + pct;
  }, 0);
  return Math.round(total / quizAttempts.length);
}

// --- Sub-components ---

function FieldResultsRow({ results }: { results: FieldResultRow[] }) {
  return (
    <div className="mt-2 border border-[#ddd] rounded-[2px] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f2f2f2] text-[#555]">
            <th className="text-left px-3 py-1.5 font-semibold">Field</th>
            <th className="text-left px-3 py-1.5 font-semibold">Your Answer</th>
            <th className="text-left px-3 py-1.5 font-semibold">Correct</th>
            <th className="text-left px-3 py-1.5 font-semibold w-16">Result</th>
          </tr>
        </thead>
        <tbody>
          {results.map((fr, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
              <td className="px-3 py-1.5 text-[#333] font-medium">{fr.label || fr.field}</td>
              <td className="px-3 py-1.5 text-[#555]">{fr.user_value || "\u2014"}</td>
              <td className="px-3 py-1.5 text-[#555]">{fr.correct_value}</td>
              <td className="px-3 py-1.5">
                {fr.is_correct ? (
                  <span className="text-green-600 font-bold">Pass</span>
                ) : (
                  <span className="text-[#D40511] font-bold">Miss</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttemptCard({ attempt }: { attempt: ScenarioAttemptRow }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#e0e0e0] rounded-[2px] bg-white mb-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#fafafa] transition text-left"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs text-[#888]">{formatDate(attempt.created_at)}</span>
          <span className="text-xs font-semibold text-[#1a1a1a]">{attempt.npc_name || attempt.scenario_id}</span>
          <span className="text-xs text-[#555]">
            {attempt.correct_fields}/{attempt.total_fields} fields
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              attempt.score >= 80
                ? "bg-green-100 text-green-700"
                : attempt.score >= 60
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-[#D40511]"
            }`}
          >
            {attempt.score}%
          </span>
          <span className="text-xs text-[#888]">{formatTime(attempt.time_spent)}</span>
          <span className="text-xs text-[#888]">+{attempt.xp_earned} XP</span>
        </div>
        <span className="text-[#888] text-xs ml-2">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {expanded && attempt.field_results?.length > 0 && (
        <div className="px-4 pb-3">
          <FieldResultsRow results={attempt.field_results} />
        </div>
      )}
    </div>
  );
}

function QuizAttemptCard({ attempt }: { attempt: QuizAttemptRow }) {
  const [expanded, setExpanded] = useState(false);
  const display = getDifficultyDisplay(attempt.difficulty || "all");
  const pct = attempt.total_questions > 0 ? Math.round((attempt.correct_answers / attempt.total_questions) * 100) : 0;
  const passed = pct >= 70;

  return (
    <div className="border border-[#e0e0e0] rounded-[2px] bg-white mb-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#fafafa] transition text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-[#888]">{formatDate(attempt.created_at)}</span>
          <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${display.bgColor} ${display.color} ${display.borderColor}`}>
            {display.label}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              passed ? "bg-green-100 text-green-700" : "bg-red-100 text-[#D40511]"
            }`}
          >
            {pct}% {passed ? "PASS" : "FAIL"}
          </span>
          <span className="text-xs text-[#555]">
            {attempt.correct_answers}/{attempt.total_questions} correct
          </span>
          <span className="text-xs text-[#888]">{formatTime(attempt.time_spent)}</span>
        </div>
        <span className="text-[#888] text-xs ml-2">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {expanded && attempt.question_results && attempt.question_results.length > 0 && (
        <div className="px-4 pb-3">
          <div className="mt-2 border border-[#ddd] rounded-[2px] overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f2f2f2] text-[#555]">
                  <th className="text-left px-3 py-1.5 font-semibold">Question</th>
                  <th className="text-left px-3 py-1.5 font-semibold">Category</th>
                  <th className="text-left px-3 py-1.5 font-semibold w-16">Result</th>
                </tr>
              </thead>
              <tbody>
                {attempt.question_results.map((qr, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                    <td className="px-3 py-1.5 text-[#333] font-medium">{qr.questionId}</td>
                    <td className="px-3 py-1.5 text-[#555]">{qr.category.replace(/_/g, " ")}</td>
                    <td className="px-3 py-1.5">
                      {qr.correct ? (
                        <span className="text-green-600 font-bold">Pass</span>
                      ) : (
                        <span className="text-[#D40511] font-bold">Miss</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeRow({ employee }: { employee: EmployeeStats }) {
  const [expanded, setExpanded] = useState(false);

  const avg = avgScore(employee.attempts);
  const best = bestScore(employee.attempts);
  const last = lastActive(employee.attempts, employee.quizAttempts);
  const quizAvg = avgQuizScore(employee.quizAttempts);
  const engRate = getEngagementRate(employee.activity);

  return (
    <>
      <tr
        className="border-b border-[#eee] hover:bg-[#fffde7] cursor-pointer transition"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="font-semibold text-sm text-[#1a1a1a]">{employee.display_name}</div>
        </td>
        <td className="px-4 py-3 text-sm text-[#555]">@{employee.username}</td>
        <td className="px-4 py-3 text-sm text-center text-[#555]">{employee.attempts.length}</td>
        <td className="px-4 py-3 text-sm text-center">
          {avg !== null ? (
            <span
              className={`font-bold ${
                avg >= 80 ? "text-green-600" : avg >= 60 ? "text-yellow-600" : "text-[#D40511]"
              }`}
            >
              {avg}%
            </span>
          ) : (
            <span className="text-[#aaa]">{"\u2014"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {best !== null ? (
            <span className="font-bold text-[#1a1a1a]">{best}%</span>
          ) : (
            <span className="text-[#aaa]">{"\u2014"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-center text-[#555]">{employee.quizAttempts.length}</td>
        <td className="px-4 py-3 text-sm text-center">
          {quizAvg !== null ? (
            <span
              className={`font-bold ${
                quizAvg >= 80 ? "text-green-600" : quizAvg >= 60 ? "text-yellow-600" : "text-[#D40511]"
              }`}
            >
              {quizAvg}%
            </span>
          ) : (
            <span className="text-[#aaa]">{"\u2014"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-[#888]">
          {last ? formatDate(last) : <span className="text-[#aaa]">Never</span>}
        </td>
        <td className="px-4 py-3 text-sm text-center">
          {engRate !== null ? (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${engagementBgColor(engRate)}`}>
              {engRate}%
            </span>
          ) : (
            <span className="text-[#aaa] text-xs">No data</span>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-[#888]">{expanded ? "\u25B2 Hide" : "\u25BC View"}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={10} className="px-6 py-4 bg-[#fafafa] border-b border-[#eee]">
            <div className="text-xs font-bold text-[#888] uppercase mb-3 tracking-wide">
              Scenario Attempt History
            </div>
            {employee.attempts.length === 0 ? (
              <p className="text-sm text-[#aaa]">No scenario attempts yet.</p>
            ) : (
              employee.attempts.map((attempt) => (
                <AttemptCard key={attempt.id} attempt={attempt} />
              ))
            )}

            <div className="mt-4">
              <div className="text-xs font-bold text-[#888] uppercase mb-3 tracking-wide">
                Assessment Attempts
              </div>
              {employee.quizAttempts.length === 0 ? (
                <p className="text-sm text-[#aaa]">No assessment attempts yet.</p>
              ) : (
                employee.quizAttempts.map((qa) => (
                  <QuizAttemptCard key={qa.id} attempt={qa} />
                ))
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// --- Assessment Analytics Section ---

function AssessmentAnalytics({ employees }: { employees: EmployeeStats[] }) {
  const tierPassRates = computeTierPassRates(employees);
  const recentActivity = getRecentAssessmentActivity(employees);
  const { tiers: matrixTiers, matrix } = getCompletionMatrix(employees);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
        <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Assessment Analytics</h2>
      </div>

      {/* a) Tier Pass Rates */}
      <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5 mb-4">
        <h3 className="text-xs font-bold text-[#888] uppercase mb-4 tracking-wide">Tier Pass Rates</h3>
        {tierPassRates.length === 0 ? (
          <p className="text-[#aaa] text-sm">No assessment data yet. Tier pass rates will appear once employees complete assessments.</p>
        ) : (
          <div className="space-y-4">
            {tierPassRates.map((tier) => (
              <div key={tier.tier}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${tier.display.bgColor} ${tier.display.color} ${tier.display.borderColor}`}>
                      {tier.display.label}
                    </span>
                    <span className="text-xs text-[#888]">
                      {tier.uniqueEmployees} employee{tier.uniqueEmployees !== 1 ? "s" : ""} | {tier.attempts} attempt{tier.attempts !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#555]">Avg: <strong>{tier.avgScore}%</strong></span>
                    <span className={`text-xs font-bold ${tier.passRate >= 70 ? "text-green-600" : tier.passRate >= 50 ? "text-yellow-600" : "text-[#D40511]"}`}>
                      {tier.passRate}% pass rate
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-[#f2f2f2] rounded-full overflow-hidden border border-[#e0e0e0]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      tier.passRate >= 70 ? "bg-green-400" : tier.passRate >= 50 ? "bg-yellow-400" : "bg-[#D40511]"
                    }`}
                    style={{ width: `${tier.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* b) Recent Assessment Activity */}
      <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5 mb-4">
        <h3 className="text-xs font-bold text-[#888] uppercase mb-4 tracking-wide">Recent Assessment Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-[#aaa] text-sm">No recent assessment activity. Results will appear here as employees take assessments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f8f8] text-[#555]">
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Employee</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Tier</th>
                  <th className="text-center px-3 py-2 font-semibold text-xs uppercase">Score</th>
                  <th className="text-center px-3 py-2 font-semibold text-xs uppercase">Time</th>
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map(({ employee, attempt }, i) => {
                  const pct = attempt.total_questions > 0
                    ? Math.round((attempt.correct_answers / attempt.total_questions) * 100)
                    : 0;
                  const passed = pct >= 70;
                  const display = getDifficultyDisplay(attempt.difficulty || "all");
                  return (
                    <tr key={attempt.id} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                      <td className="px-3 py-2 text-[#1a1a1a] font-medium">{employee.display_name}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${display.bgColor} ${display.color} ${display.borderColor}`}>
                          {display.shortLabel}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            passed ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-[#D40511]"
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-[#888]">{formatTime(attempt.time_spent)}</td>
                      <td className="px-3 py-2 text-xs text-[#888]">{formatDate(attempt.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* c) Employee Completion Matrix */}
      <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5">
        <h3 className="text-xs font-bold text-[#888] uppercase mb-4 tracking-wide">Employee Completion Matrix</h3>
        {matrixTiers.length === 0 || matrix.length === 0 ? (
          <p className="text-[#aaa] text-sm">No assessment data yet. A completion grid will appear here showing who has passed which tiers.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8f8f8]">
                  <th className="text-left px-3 py-2 font-semibold text-xs uppercase text-[#555]">Employee</th>
                  {matrixTiers.map((tier) => {
                    const display = getDifficultyDisplay(tier);
                    return (
                      <th key={tier} className="text-center px-3 py-2">
                        <span className={`text-xs font-bold ${display.color}`}>{display.shortLabel}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {matrix.map(({ employee, tierStatus }, i) => (
                  <tr key={employee.id} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                    <td className="px-3 py-2 text-[#1a1a1a] font-medium">{employee.display_name}</td>
                    {matrixTiers.map((tier) => {
                      const status = tierStatus[tier];
                      return (
                        <td key={tier} className="text-center px-3 py-2">
                          {status === "pass" ? (
                            <span className="text-green-600 font-bold text-base" title="Passed (70%+)">&#10003;</span>
                          ) : status === "fail" ? (
                            <span className="text-[#D40511] font-bold text-base" title="Attempted, below 70%">&#10007;</span>
                          ) : (
                            <span className="text-[#ccc] text-base" title="Not attempted">&mdash;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Main Dashboard ---

export default function ManagerDashboard() {
  const router = useRouter();

  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Create employee form
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth guard
  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (!profile || profile.role !== "manager") {
        router.push("/");
        return;
      }
      setAuthChecked(true);
    })();
  }, [router]);

  // Data fetch via API
  useEffect(() => {
    if (!authChecked) return;

    (async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        setEmployees(json.employees ?? []);
      } catch {
        setEmployees([]);
      }
      setLoading(false);
    })();
  }, [authChecked]);

  // Create employee
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);

    const res = await fetch("/api/create-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName, password }),
    });

    const json = await res.json();
    setCreating(false);

    if (json.success) {
      setCreateMsg({ type: "success", text: `Account created for @${username}` });
      setDisplayName("");
      setUsername("");
      setPassword("");
      // Refresh employee list
      try {
        const refreshRes = await fetch("/api/dashboard");
        const refreshJson = await refreshRes.json();
        setEmployees(refreshJson.employees ?? []);
      } catch {
        // keep existing data
      }
    } else {
      setCreateMsg({ type: "error", text: json.error || "Something went wrong." });
    }
  }

  const weakSpots = computeWeakSpots(employees);

  if (!authChecked || loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-white">
        <DHLHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[#888] text-sm animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white" style={{ fontFamily: "Arial, sans-serif" }}>
      <DHLHeader />

      <div className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto w-full">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-[#1a1a1a] text-2xl font-black tracking-tight">Manager Dashboard</h1>
          <p className="text-[#888] text-sm mt-0.5">
            {employees.length} employee{employees.length !== 1 ? "s" : ""} tracked
          </p>
        </div>

        {/* Section 1: Employee Overview */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
            <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Employee Overview</h2>
          </div>

          <div className="border border-[#ddd] rounded-sm overflow-hidden shadow-sm">
            {employees.length === 0 ? (
              <div className="px-6 py-8 text-center text-[#aaa] text-sm bg-[#fafafa]">
                No employees yet. Create one below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#FFCC00] text-[#1a1a1a]">
                      <th className="text-left px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Name</th>
                      <th className="text-left px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Username</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Scenarios</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Avg Score</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Best</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Assessments</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Avg Assessment</th>
                      <th className="text-left px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Last Active</th>
                      <th className="text-center px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Engagement</th>
                      <th className="px-4 py-2.5 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <EmployeeRow key={emp.id} employee={emp} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Assessment Analytics */}
        <AssessmentAnalytics employees={employees} />

        {/* Section 3: Employee Activity Monitor */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
            <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Employee Activity Monitor</h2>
          </div>

          <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5 mb-4">
            {employees.every((e) => !e.activity || e.activity.heartbeat_count === 0) ? (
              <p className="text-[#aaa] text-sm">
                No activity data recorded yet. Activity metrics will appear here once employees start using the training system with activity tracking enabled.
              </p>
            ) : (
              <div className="space-y-4">
                {employees.map((emp) => {
                  const activity = emp.activity;
                  const engRate = getEngagementRate(activity);
                  const totalTime = activity
                    ? activity.total_active + activity.total_idle + activity.total_away
                    : 0;
                  const activePct = totalTime > 0 ? (activity!.total_active / totalTime) * 100 : 0;
                  const idlePct = totalTime > 0 ? (activity!.total_idle / totalTime) * 100 : 0;
                  const awayPct = totalTime > 0 ? (activity!.total_away / totalTime) * 100 : 0;

                  return (
                    <div key={emp.id} className="border border-[#e0e0e0] rounded-[2px] bg-[#fafafa] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-sm font-semibold text-[#1a1a1a]">{emp.display_name}</span>
                          <span className="text-xs text-[#888] ml-2">@{emp.username}</span>
                        </div>
                        {engRate !== null ? (
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${engagementBgColor(engRate)}`}>
                            {engRate}% Engagement
                          </span>
                        ) : (
                          <span className="text-xs text-[#aaa] px-3 py-1 rounded-full bg-[#f2f2f2]">No data</span>
                        )}
                      </div>

                      {activity && activity.heartbeat_count > 0 ? (
                        <>
                          {/* Activity Bar */}
                          <div className="h-4 rounded-full overflow-hidden flex mb-3 border border-[#e0e0e0]">
                            <div
                              className="h-full transition-all"
                              style={{ width: `${activePct}%`, backgroundColor: "#28a745" }}
                              title={`Active: ${formatDuration(activity.total_active)}`}
                            />
                            <div
                              className="h-full transition-all"
                              style={{ width: `${idlePct}%`, backgroundColor: "#ffc107" }}
                              title={`Idle: ${formatDuration(activity.total_idle)}`}
                            />
                            <div
                              className="h-full transition-all"
                              style={{ width: `${awayPct}%`, backgroundColor: "#dc3545" }}
                              title={`Away: ${formatDuration(activity.total_away)}`}
                            />
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <span className="text-[#888] block">Active Time</span>
                              <span className="text-[#1a1a1a] font-bold" style={{ color: "#28a745" }}>
                                {formatDuration(activity.total_active)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#888] block">Idle Time</span>
                              <span className="text-[#1a1a1a] font-bold" style={{ color: "#ffc107" }}>
                                {formatDuration(activity.total_idle)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#888] block">Away Time</span>
                              <span className="text-[#1a1a1a] font-bold" style={{ color: "#dc3545" }}>
                                {formatDuration(activity.total_away)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#888] block">Interactions</span>
                              <span className="text-[#1a1a1a] font-bold">
                                {activity.total_interactions.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[#888] block">Last Active</span>
                              <span className="text-[#1a1a1a] font-bold">
                                {activity.last_heartbeat ? formatDate(activity.last_heartbeat) : "N/A"}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-[#aaa]">No activity data recorded for this employee.</p>
                      )}
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="flex items-center gap-4 pt-2 text-xs text-[#888]">
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#28a745" }} />
                    Active
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#ffc107" }} />
                    Idle
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#dc3545" }} />
                    Away
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3b: Activity Alerts */}
        {(() => {
          const allAlerts = employees
            .map((emp) => ({ employee: emp, alerts: getActivityAlerts(emp) }))
            .filter(({ alerts }) => alerts.length > 0);

          if (allAlerts.length === 0) return null;

          return (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
                <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Activity Alerts</h2>
              </div>

              <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5">
                <div className="space-y-2">
                  {allAlerts.map(({ employee, alerts }) => (
                    <div key={employee.id} className="flex items-center gap-3 py-2 border-b border-[#f0f0f0] last:border-b-0">
                      <span className="text-sm font-semibold text-[#1a1a1a] min-w-[140px]">
                        {employee.display_name}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {alerts.map((alert, i) => (
                          <span
                            key={i}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              alert.type === "danger"
                                ? "bg-red-100 text-[#D40511] border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {alert.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* Section 4: Team Weak Spots */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
            <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Team Weak Spots</h2>
          </div>

          <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5">
            {weakSpots.length === 0 ? (
              <p className="text-[#aaa] text-sm">
                No attempt data yet. Fields most often missed will appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {weakSpots.map((ws) => (
                  <div key={ws.field}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-[#1a1a1a]">{ws.label}</span>
                      <span
                        className={`text-xs font-bold ${
                          ws.missRate >= 60
                            ? "text-[#D40511]"
                            : ws.missRate >= 40
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        missed {ws.missRate}% of the time
                      </span>
                    </div>
                    <div className="h-2.5 bg-[#f2f2f2] rounded-full overflow-hidden border border-[#e0e0e0]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          ws.missRate >= 60
                            ? "bg-[#D40511]"
                            : ws.missRate >= 40
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        }`}
                        style={{ width: `${ws.missRate}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#aaa] mt-0.5">
                      {ws.missed} of {ws.total} attempts incorrect
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Add Employee */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-4 w-1 bg-[#D40511] rounded-full inline-block" />
            <h2 className="text-[#1a1a1a] text-base font-bold uppercase tracking-wide">Add Employee</h2>
          </div>

          <div className="border border-[#ddd] rounded-sm shadow-sm bg-white p-5 max-w-md">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1 uppercase tracking-wide">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maria Garcia"
                  required
                  className="w-full border border-[#ccc] rounded-[2px] px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] bg-[#fafafa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mgarcia"
                  required
                  className="w-full border border-[#ccc] rounded-[2px] px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] bg-[#fafafa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#555] mb-1 uppercase tracking-wide">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full border border-[#ccc] rounded-[2px] px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#FFCC00] focus:ring-1 focus:ring-[#FFCC00] bg-[#fafafa]"
                />
              </div>

              {createMsg && (
                <div
                  className={`text-sm px-3 py-2 rounded-[2px] border ${
                    createMsg.type === "success"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-[#D40511]"
                  }`}
                >
                  {createMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] disabled:opacity-50 disabled:cursor-not-allowed text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-2.5 text-sm font-bold cursor-pointer transition"
              >
                {creating ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}
