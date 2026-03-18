"use client";

import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import { scenarios } from "@/data/scenarios";

export default function Home() {
  const router = useRouter();

  const beginnerCount = scenarios.filter((s) => s.difficulty === "beginner").length;
  const intermediateCount = scenarios.filter((s) => s.difficulty === "intermediate").length;
  const advancedCount = scenarios.filter((s) => s.difficulty === "advanced").length;

  return (
    <div className="min-h-screen flex flex-col">
      <DHLHeader />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {/* Hero Card */}
          <div className="bg-white border border-dhl-border rounded-lg shadow-lg overflow-hidden">
            {/* Top Banner */}
            <div className="bg-dhl-red px-8 py-8 text-center">
              <div className="bg-dhl-yellow text-dhl-dark font-black text-4xl px-4 py-2 rounded inline-block mb-4 tracking-wider">
                DHL
              </div>
              <h1 className="text-white text-2xl font-bold">CRA Training Simulator</h1>
              <p className="text-red-200 text-sm mt-2">
                Customer Receiving Application — Interactive Training
              </p>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-dhl-yellow rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <div className="font-bold text-sm">Talk to Customers</div>
                    <div className="text-xs text-gray-500">NPCs walk up with shipping requests. Read their info carefully.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-dhl-yellow rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <div className="font-bold text-sm">Fill Out the CRA Form</div>
                    <div className="text-xs text-gray-500">Enter sender, receiver, and shipment details — just like the real system.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-dhl-yellow rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <div className="font-bold text-sm">Get Graded</div>
                    <div className="text-xs text-gray-500">See which fields you got right and wrong. Learn from mistakes.</div>
                  </div>
                </div>
              </div>

              {/* Scenario Stats */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-black text-dhl-dark">{scenarios.length}</div>
                  <div className="text-[10px] text-gray-500 font-medium">SCENARIOS</div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-lg font-black text-green-600">{beginnerCount}</div>
                  <div className="text-[10px] text-gray-500 font-medium">BEGINNER</div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-lg font-black text-yellow-600">{intermediateCount}</div>
                  <div className="text-[10px] text-gray-500 font-medium">INTERMEDIATE</div>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-lg font-black text-red-600">{advancedCount}</div>
                  <div className="text-[10px] text-gray-500 font-medium">ADVANCED</div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => router.push("/game")}
                className="w-full bg-dhl-red text-white py-3 text-lg font-bold rounded hover:bg-red-700 transition cursor-pointer"
              >
                START TRAINING
              </button>

              <p className="text-center text-[10px] text-gray-400 mt-3">
                Scenarios include shipping to Mexico, Germany, Japan, UK, Brazil & Australia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
