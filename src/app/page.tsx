"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/data/assessment";
import { quizQuestions } from "@/data/quizQuestions";
import { getProfile } from "@/lib/auth";
import ConsentBanner from "@/components/ConsentBanner";

export default function Home() {
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      if (profile && profile.role === "employee") {
        setShowConsent(true);
      }
    })();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {showConsent && <ConsentBanner />}
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
      <div className="flex-1 bg-white px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8 md:mb-10">
            <h1 className="text-[#1a1a1a] text-2xl md:text-3xl font-black tracking-tight">DHL Training Simulator</h1>
            <p className="text-[#555] text-sm mt-1">Practice, quiz, and prove your competency</p>
          </div>

          {/* Cards grid — Practice left, Quiz + Assessment right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* LEFT — Practice Assessment */}
            <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
              <div className="px-6 pt-6 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🖥️</span>
                  <h2 className="text-[#1a1a1a] text-lg font-bold">Practice Assessment</h2>
                </div>
                <p className="text-xs text-[#555]">
                  Interactive CRA scenarios. A customer walks up — read what they need, fill out the shipment form, get graded on accuracy.
                </p>
              </div>

              <div className="px-6 pb-4 flex flex-col gap-2">
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  12 real customer scenarios
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  NPC dialogue + full CRA form
                </div>
                <div className="bg-white border border-[#ccc] rounded-[2px] px-3 py-2 text-xs text-gray-500">
                  Field-by-field grading + XP system
                </div>
              </div>

              <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">12 Scenarios</span>
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                  <span className="text-[12px] text-[#333]">Beginner to Advanced</span>
                </label>
              </div>

              <div className="px-6 pb-6 mt-auto">
                <button
                  onClick={() => router.push("/game")}
                  className="bg-[#D40511] hover:bg-[#b8040e] active:bg-[#9a030c] text-white border border-[#9a030c] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                >
                  Start Practice
                </button>
              </div>
            </div>

            {/* RIGHT — Quiz + Assessment stacked */}
            <div className="flex flex-col gap-5">

              {/* Quiz Card */}
              <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
                <div className="px-6 pt-6 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <h2 className="text-[#1a1a1a] text-lg font-bold">Quiz</h2>
                  </div>
                  <p className="text-xs text-[#555]">
                    Multiple choice questions. Pick the right answer, get instant feedback with explanations.
                  </p>
                </div>

                <div className="px-6 pb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                    <span className="text-[12px] text-[#333]">{quizQuestions.length} Questions</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked readOnly className="accent-[#D40511] w-4 h-4" />
                    <span className="text-[12px] text-[#333]">3 Difficulty Levels</span>
                  </label>
                </div>

                <div className="px-6 pb-6 mt-auto">
                  <button
                    onClick={() => router.push("/mc-quiz")}
                    className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>

              {/* Assessment Card */}
              <div className="bg-[#f2f2f2] border border-[#ddd] rounded-sm shadow-sm flex flex-col">
                <div className="px-6 pt-6 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📋</span>
                    <h2 className="text-[#1a1a1a] text-lg font-bold">CRA Assessment</h2>
                  </div>
                  <p className="text-xs text-[#555]">
                    Written competency assessment. Answer in your own words, then review against the answer key.
                  </p>
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
                    className="bg-[#FFCC00] hover:bg-[#e6b800] active:bg-[#cca300] text-[#1a1a1a] border border-[#cca300] rounded-[3px] px-6 py-3 text-sm font-bold cursor-pointer transition w-full"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-[11px] text-[#aaa]">
              Start with Practice — Use Quiz to test knowledge — Assessment is the final evaluation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
