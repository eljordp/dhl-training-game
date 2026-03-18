"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import NPCChat from "@/components/NPCChat";
import CRAForm from "@/components/CRAForm";
import { scenarios } from "@/data/scenarios";
import { gradeScenario, getFieldResultMap } from "@/data/grading";
import { ShipmentForm, ScenarioResult } from "@/types/game";

function emptyForm(): ShipmentForm {
  return {
    sender: { name: "", street: "", city: "", state: "", zip: "", country: "", phone: "" },
    receiver: { name: "", street: "", city: "", state: "", zip: "", country: "", phone: "" },
    shipment: {
      serviceType: "" as ShipmentForm["shipment"]["serviceType"],
      packageType: "" as ShipmentForm["shipment"]["packageType"],
      weight: "",
      length: "",
      width: "",
      height: "",
      declaredValue: "",
      currency: "USD",
      description: "",
      customsRequired: false,
      numberOfPieces: "",
    },
  };
}

export default function GamePage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [form, setForm] = useState<ShipmentForm>(emptyForm());
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [fieldResults, setFieldResults] = useState<Record<string, boolean> | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [scenarioStartTime, setScenarioStartTime] = useState(Date.now());
  const [showHints, setShowHints] = useState(false);

  const scenario = scenarios[currentIndex];

  const handleSubmit = useCallback(() => {
    const timeSpent = Math.round((Date.now() - scenarioStartTime) / 1000);
    const result = gradeScenario(scenario, form, timeSpent);
    setResults((prev) => [...prev, result]);
    setFieldResults(getFieldResultMap(result.fieldResults));
    setSubmitted(true);
  }, [scenario, form, scenarioStartTime]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= scenarios.length) {
      // Save results to sessionStorage and go to results page
      const allResults = [...results];
      sessionStorage.setItem("gameResults", JSON.stringify(allResults));
      router.push("/results");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setForm(emptyForm());
      setFieldResults(undefined);
      setSubmitted(false);
      setScenarioStartTime(Date.now());
      setShowHints(false);
    }
  }, [currentIndex, results, router]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        if (!submitted) handleSubmit();
        else handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitted, handleSubmit, handleNext]);

  return (
    <div className="h-screen flex flex-col">
      <DHLHeader
        scenarioNumber={currentIndex + 1}
        totalScenarios={scenarios.length}
        showProgress
      />

      {/* Score banner after submit */}
      {submitted && fieldResults && (
        <div className={`px-4 py-2 text-center text-sm font-bold ${
          results[results.length - 1]?.score >= 80
            ? "bg-green-100 text-green-800 border-b border-green-300"
            : results[results.length - 1]?.score >= 50
              ? "bg-yellow-100 text-yellow-800 border-b border-yellow-300"
              : "bg-red-100 text-red-800 border-b border-red-300"
        }`}>
          <span className="score-reveal inline-block">
            Score: {results[results.length - 1]?.correctFields}/{results[results.length - 1]?.totalFields} fields correct
            ({results[results.length - 1]?.score}%)
            {results[results.length - 1]?.score === 100 && " — PERFECT! "}
            {results[results.length - 1]?.score >= 80 && results[results.length - 1]?.score < 100 && " — Great job! "}
            {results[results.length - 1]?.score >= 50 && results[results.length - 1]?.score < 80 && " — Needs improvement "}
            {results[results.length - 1]?.score < 50 && " — Review the customer info carefully "}
          </span>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Left: NPC Chat */}
        <div className="w-[400px] flex-shrink-0 border-r border-dhl-border flex flex-col">
          <NPCChat
            npcName={scenario.npcName}
            npcAvatar={scenario.npcAvatar}
            dialogues={scenario.dialogues}
            difficulty={scenario.difficulty}
            hints={scenario.hints}
            showHints={showHints}
          />
        </div>

        {/* Right: CRA Form */}
        <div className="flex-1 flex flex-col min-h-0">
          <CRAForm
            form={form}
            onChange={setForm}
            fieldResults={fieldResults}
            disabled={submitted}
          />

          {/* Action Bar */}
          <div className="border-t border-dhl-border bg-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!submitted && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-dhl-blue hover:underline cursor-pointer"
                >
                  {showHints ? "Hide Hints" : "Show Hints"}
                </button>
              )}
              <span className="text-[10px] text-gray-400">Ctrl+Enter to submit</span>
            </div>
            <div className="flex items-center gap-2">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  className="bg-dhl-red text-white px-6 py-2 text-sm font-bold rounded hover:bg-red-700 transition cursor-pointer"
                >
                  SUBMIT SHIPMENT
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-dhl-yellow text-dhl-dark px-6 py-2 text-sm font-bold rounded hover:bg-yellow-400 transition cursor-pointer"
                >
                  {currentIndex + 1 >= scenarios.length ? "VIEW FINAL RESULTS" : "NEXT CUSTOMER →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
