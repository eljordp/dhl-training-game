"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/lib/auth";
import DHLHeader from "@/components/DHLHeader";

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

interface QuizAttemptRow {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent: number;
  created_at: string;
}

interface EmployeeStats {
  id: string;
  username: string;
  display_name: string;
  attempts: ScenarioAttemptRow[];
  quizAttempts: QuizAttemptRow[];
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

function EmployeeRow({ employee }: { employee: EmployeeStats }) {
  const [expanded, setExpanded] = useState(false);

  const avg = avgScore(employee.attempts);
  const best = bestScore(employee.attempts);
  const last = lastActive(employee.attempts, employee.quizAttempts);

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
        <td className="px-4 py-3 text-sm text-[#888]">
          {last ? formatDate(last) : <span className="text-[#aaa]">Never</span>}
        </td>
        <td className="px-4 py-3 text-xs text-[#888]">{expanded ? "\u25B2 Hide" : "\u25BC View"}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-[#fafafa] border-b border-[#eee]">
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
            {employee.quizAttempts.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-bold text-[#888] uppercase mb-2 tracking-wide">
                  Quiz Attempts
                </div>
                <div className="flex flex-wrap gap-2">
                  {employee.quizAttempts.map((qa) => (
                    <div
                      key={qa.id}
                      className="border border-[#ddd] rounded-[2px] bg-white px-3 py-2 text-xs"
                    >
                      <div className="font-bold text-[#1a1a1a]">
                        {qa.correct_answers}/{qa.total_questions} correct
                      </div>
                      <div className="text-[#888]">{formatDate(qa.created_at)}</div>
                      <div className="text-[#888]">{formatTime(qa.time_spent)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
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
                      <th className="text-left px-4 py-2.5 font-bold text-xs uppercase tracking-wide">Last Active</th>
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

        {/* Section 2: Team Weak Spots */}
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

        {/* Section 3: Add Employee */}
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
