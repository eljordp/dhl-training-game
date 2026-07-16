"use client";

import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/data/assessment";
import { scenarios } from "@/data/scenarios";

export default function Home() {
  const router = useRouter();

  const beginnerCount = scenarios.filter((scenario) => scenario.difficulty === "beginner").length;
  const intermediateCount = scenarios.filter((scenario) => scenario.difficulty === "intermediate").length;
  const advancedCount = scenarios.filter((scenario) => scenario.difficulty === "advanced").length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
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

      <main className="flex-1 flex items-start md:items-center justify-center bg-white px-4 py-8 md:py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-[#1a1a1a] text-2xl md:text-3xl font-black tracking-tight">DHL Training Simulator</h1>
            <p className="text-[#555] text-sm mt-1">Practice real shipment entry, then prove your competency</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl" aria-hidden="true">🖥️</span>
                  <h2 className="text-[#1a1a1a] text-lg font-bold">CRA Practice Assessment</h2>
                </div>
                <p className="text-xs text-[#555]">
                  Work through realistic customer scenarios, complete the shipment form, and get graded field by field.
                </p>
              </div>

              <div className="px-6 pb-4 flex flex-col gap-2">
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  {scenarios.length} real customer scenarios
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  NPC dialogue + full CRA form
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Field-by-field grading + XP system
                </div>
              </div>

              <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-[12px] text-[#333]">
                  {beginnerCount} beginner / {intermediateCount} intermediate / {advancedCount} advanced
                </span>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => router.push("/game")}
                  className="bg-[#D40511] hover:bg-[#b8040e] active:bg-[#9a030c] text-white border border-[#9a030c] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                >
                  Start Practice Assessment
                </button>
              </div>
            </section>

            <section className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl" aria-hidden="true">📋</span>
                  <h2 className="text-[#1a1a1a] text-lg font-bold">Advanced Knowledge Assessment</h2>
                </div>
                <p className="text-xs text-[#555]">
                  Answer in your own words and receive detailed grading against the operator answer key.
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

              <div className="px-6 pb-3">
                <span className="text-[12px] text-[#333]">{assessmentQuestions.length} questions across 4 tiers</span>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => router.push("/quiz")}
                  className="bg-[#D40511] hover:bg-[#b8040e] active:bg-[#9a030c] text-white border border-[#9a030c] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                >
                  Start Knowledge Assessment
                </button>
              </div>
            </section>
          </div>

          <div className="text-center mt-6">
            <p className="text-[11px] text-[#aaa]">
              No login required — start with practice, then use the knowledge assessment to verify readiness
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
