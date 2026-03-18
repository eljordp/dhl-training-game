"use client";

import { useRouter } from "next/navigation";
import { scenarios } from "@/data/scenarios";

export default function Home() {
  const router = useRouter();

  const beginnerCount = scenarios.filter((s) => s.difficulty === "beginner").length;
  const intermediateCount = scenarios.filter((s) => s.difficulty === "intermediate").length;
  const advancedCount = scenarios.filter((s) => s.difficulty === "advanced").length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* CRA 10 Header */}
      <header className="bg-[#FFCC00] px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0 border-b border-[#e6b800]">
        <div className="bg-[#D40511] rounded-[4px] px-2 md:px-3 py-0.5 flex items-center">
          <span
            className="text-white font-black text-xl md:text-3xl italic tracking-tight leading-none"
            style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
          >
            DHL
          </span>
        </div>
        <span className="text-[#1a1a1a] font-bold text-base md:text-xl tracking-tight">CRA 10</span>
      </header>

      {/* White page body */}
      <div className="flex-1 flex items-start md:items-center justify-center bg-white px-4 py-8 md:py-16">
        <div className="w-full max-w-md">
          {/* Card — matches CRA login card */}
          <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm">
            {/* Card header */}
            <div className="px-6 md:px-8 pt-7 pb-3">
              <h1 className="text-[#1a1a1a] text-xl md:text-2xl font-bold text-center">CRA 10</h1>
              <p className="text-gray-500 text-xs text-center mt-1">Training Simulator</p>
            </div>

            {/* Card body */}
            <div className="px-6 md:px-8 pb-7">
              {/* Steps */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5">1. Talk to Customers</label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    NPCs walk up with shipping requests. Read their info carefully.
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5">2. Fill Out the CRA Form</label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    Enter sender, receiver, and shipment details — just like the real system.
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5">3. Get Graded</label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    See which fields you got right and wrong. Learn from your mistakes.
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[13px] text-[#333]">{scenarios.length} Scenarios</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[13px] text-[#333]">
                    {beginnerCount} Easy / {intermediateCount} Med / {advancedCount} Hard
                  </span>
                </label>
              </div>

              {/* Start button */}
              <button
                onClick={() => router.push("/game")}
                className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
              >
                Ingresar/Start Training
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
