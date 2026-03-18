"use client";

import { useRouter } from "next/navigation";
import { scenarios } from "@/data/scenarios";

export default function Home() {
  const router = useRouter();

  const beginnerCount = scenarios.filter((s) => s.difficulty === "beginner").length;
  const intermediateCount = scenarios.filter((s) => s.difficulty === "intermediate").length;
  const advancedCount = scenarios.filter((s) => s.difficulty === "advanced").length;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* CRA 10 Header — exact match */}
      <header className="bg-[#FFCC00] px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 flex-shrink-0 border-b border-[#e6b800]">
        <div className="flex items-center">
          <div className="bg-[#D40511] rounded-[4px] px-2 md:px-3 py-0.5 flex items-center">
            <span
              className="text-white font-black text-xl md:text-3xl italic tracking-tight leading-none"
              style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
            >
              DHL
            </span>
          </div>
        </div>
        <span className="text-[#1a1a1a] font-bold text-base md:text-xl tracking-tight">CRA 10</span>
      </header>

      {/* Hero section with background */}
      <div
        className="flex-1 relative flex items-start md:items-center justify-center md:justify-start overflow-auto"
        style={{
          background: "linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 40%, #D40511 60%, #FFCC00 100%)",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Right side color wash (desktop) */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block" style={{
          background: "linear-gradient(to left, rgba(212,5,17,0.3), transparent)",
        }} />

        {/* Bottom DHL branding strip */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-20" style={{
          background: "linear-gradient(to right, #FFCC00 0%, #FFCC00 30%, #D40511 30%, #D40511 100%)",
          opacity: 0.15,
        }} />

        {/* Floating card */}
        <div className="relative z-10 w-full md:w-auto md:max-w-md mx-0 md:mx-12 lg:mx-20 my-0 md:my-8">
          {/* Mobile: full width, flush edges / Desktop: floating card */}
          <div className="bg-[#f2f2f2] md:bg-[#f2f2f2]/95 md:backdrop-blur-sm md:rounded-sm md:shadow-2xl min-h-[calc(100dvh-44px)] md:min-h-0 flex flex-col">
            {/* Card header */}
            <div className="px-5 md:px-8 pt-8 md:pt-8 pb-3 md:pb-4">
              <h1 className="text-[#1a1a1a] text-xl md:text-2xl font-bold text-center">
                CRA 10
              </h1>
              <p className="text-gray-500 text-xs text-center mt-1">Training Simulator</p>
            </div>

            {/* Card body */}
            <div className="px-5 md:px-8 pb-6 md:pb-8 flex-1 flex flex-col">
              {/* Steps — styled like CRA form fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5 font-normal">
                    1. Talk to Customers
                  </label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    NPCs walk up with shipping requests. Read their info carefully.
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5 font-normal">
                    2. Fill Out the CRA Form
                  </label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    Enter sender, receiver, and shipment details — just like the real system.
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-[#333] mb-1.5 font-normal">
                    3. Get Graded
                  </label>
                  <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2.5 text-xs text-gray-500">
                    See which fields you got right and wrong. Learn from your mistakes.
                  </div>
                </div>
              </div>

              {/* Checkbox row — matches CRA "Remember Me" / "Use default" style */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[13px] text-[#333]">{scenarios.length} Scenarios</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[13px] text-[#333]">
                    {beginnerCount} Easy / {intermediateCount} Med / {advancedCount} Hard
                  </span>
                </label>
              </div>

              {/* Start button — yellow, matches CRA "Ingresar/Login" */}
              <button
                onClick={() => router.push("/game")}
                className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 md:py-2.5 text-sm font-bold cursor-pointer transition w-full md:w-auto"
              >
                Ingresar/Start Training
              </button>

              {/* Spacer for mobile */}
              <div className="flex-1 md:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
