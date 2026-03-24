"use client";

import { useRouter } from "next/navigation";
import { scenarios } from "@/data/scenarios";
import { assessmentQuestions } from "@/data/assessment";

export default function Home() {
  const router = useRouter();

  const beginnerCount = scenarios.filter((s) => s.difficulty === "beginner").length;
  const intermediateCount = scenarios.filter((s) => s.difficulty === "intermediate").length;
  const advancedCount = scenarios.filter((s) => s.difficulty === "advanced").length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* DHL Header */}
      <header className="bg-[#FFCC00] px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0 border-b border-[#e6b800]">
        <div className="bg-[#D40511] rounded-[4px] px-2 md:px-3 py-0.5 flex items-center">
          <span
            className="text-white font-black text-xl md:text-3xl italic tracking-tight leading-none"
            style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
          >
            DHL
          </span>
        </div>
        <span className="text-[#1a1a1a] font-bold text-base md:text-xl tracking-tight">Training Simulator</span>
      </header>

      {/* Page body */}
      <div className="flex-1 flex items-start md:items-center justify-center bg-white px-4 py-8 md:py-16">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-[#1a1a1a] text-2xl md:text-3xl font-black tracking-tight">DHL Training Simulator</h1>
            <p className="text-[#555] text-sm mt-1">Practice shipping scenarios and prove your competency</p>
          </div>

          {/* Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Practice Mode */}
            <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🖥️</span>
                  <h2 className="text-[#1a1a1a] text-lg font-bold">Practice Mode</h2>
                </div>
                <p className="text-xs text-[#555]">
                  Real NPC customers walk up with shipping requests. Fill out the CRA form, select a service, and get graded instantly.
                </p>
              </div>

              <div className="px-6 pb-4 flex flex-col gap-2">
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Talk to the customer — read carefully
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Fill out the CRA 10 form — every field counts
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Earn XP, level up, and unlock badges
                </div>
              </div>

              <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">{scenarios.length} Scenarios</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">
                    {beginnerCount} Easy / {intermediateCount} Med / {advancedCount} Hard
                  </span>
                </label>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => router.push("/game")}
                  className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                >
                  Start Practice
                </button>
              </div>
            </div>

            {/* Assessment Mode */}
            <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📋</span>
                  <h2 className="text-[#1a1a1a] text-lg font-bold">Advanced Assessment</h2>
                </div>
                <p className="text-xs text-[#555]">
                  Written competency assessment. Answer in your own words, then review against the answer key. Built for real operators.
                </p>
              </div>

              <div className="px-6 pb-4 flex flex-col gap-2">
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Tier 1 — Fundamentals (10 questions)
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Tier 2 — Operations &amp; Compliance (10 questions)
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Tier 3 — Expert Level (10 questions)
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Bonus — Live Scenarios (7 situations)
                </div>
              </div>

              <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">{assessmentQuestions.length} Questions</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">4 Tiers — progressive difficulty</span>
                </label>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => router.push("/quiz")}
                  className="bg-[#D40511] hover:bg-[#b8040e] active:bg-[#9a030c] text-white border border-[#9a030c] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-[11px] text-[#aaa]">
              Train new hires with Tier 1 + Practice Mode — Use Tier 2 as pass/fail after 1–2 weeks — Only allow CRA handling after Tier 3 pass
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
