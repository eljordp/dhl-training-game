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
  const [mobileTab, setMobileTab] = useState<"chat" | "form">("chat");

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
      setMobileTab("chat");
    }
  }, [currentIndex, results, router]);

  // Keyboard shortcut (desktop)
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

  const lastResult = results[results.length - 1];

  return (
    <div className="h-[100dvh] flex flex-col">
      <DHLHeader
        scenarioNumber={currentIndex + 1}
        totalScenarios={scenarios.length}
        showProgress
      />

      {/* Score banner after submit */}
      {submitted && lastResult && (
        <div className={`px-3 md:px-4 py-1.5 md:py-2 text-center text-xs md:text-sm font-bold flex-shrink-0 ${
          lastResult.score >= 80
            ? "bg-green-100 text-green-800 border-b border-green-300"
            : lastResult.score >= 50
              ? "bg-yellow-100 text-yellow-800 border-b border-yellow-300"
              : "bg-red-100 text-red-800 border-b border-red-300"
        }`}>
          <span className="score-reveal inline-block">
            {lastResult.correctFields}/{lastResult.totalFields} correct ({lastResult.score}%)
            {lastResult.score === 100 && " — PERFECT!"}
            {lastResult.score >= 80 && lastResult.score < 100 && " — Great job!"}
            {lastResult.score >= 50 && lastResult.score < 80 && " — Needs work"}
            {lastResult.score < 50 && " — Review carefully"}
          </span>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex-shrink-0 bg-white border-b border-dhl-border flex">
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition cursor-pointer ${
            mobileTab === "chat"
              ? "text-dhl-red border-b-2 border-dhl-red bg-white"
              : "text-gray-500 bg-gray-50"
          }`}
        >
          💬 CUSTOMER
        </button>
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 py-2.5 text-xs font-bold text-center transition cursor-pointer ${
            mobileTab === "form"
              ? "text-dhl-red border-b-2 border-dhl-red bg-white"
              : "text-gray-500 bg-gray-50"
          }`}
        >
          📋 CRA FORM
        </button>
      </div>

      {/* Desktop: side-by-side / Mobile: tabbed */}
      <div className="flex-1 flex min-h-0">
        {/* NPC Chat - desktop always visible, mobile only when tab active */}
        <div className={`${mobileTab === "chat" ? "flex" : "hidden"} md:flex w-full md:w-[400px] flex-shrink-0 md:border-r border-dhl-border flex-col`}>
          <NPCChat
            npcName={scenario.npcName}
            npcAvatar={scenario.npcAvatar}
            dialogues={scenario.dialogues}
            difficulty={scenario.difficulty}
            hints={scenario.hints}
            showHints={showHints}
          />

          {/* Mobile: button to switch to form */}
          <div className="md:hidden border-t border-dhl-border bg-white px-3 py-2 safe-bottom">
            <button
              onClick={() => setMobileTab("form")}
              className="w-full bg-dhl-red text-white py-2.5 text-sm font-bold rounded cursor-pointer active:bg-red-800"
            >
              FILL OUT FORM →
            </button>
          </div>
        </div>

        {/* CRA Form - desktop always visible, mobile only when tab active */}
        <div className={`${mobileTab === "form" ? "flex" : "hidden"} md:flex flex-1 flex-col min-h-0`}>
          <CRAForm
            form={form}
            onChange={setForm}
            fieldResults={fieldResults}
            disabled={submitted}
          />

          {/* Action Bar */}
          <div className="border-t border-dhl-border bg-white px-3 md:px-4 py-2.5 md:py-3 flex items-center justify-between flex-shrink-0 safe-bottom">
            <div className="flex items-center gap-2 md:gap-3">
              {!submitted && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-dhl-blue hover:underline cursor-pointer"
                >
                  {showHints ? "Hide Hints" : "Hints"}
                </button>
              )}
              <span className="text-[10px] text-gray-400 hidden md:inline">Ctrl+Enter to submit</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile: back to chat */}
              <button
                onClick={() => setMobileTab("chat")}
                className="md:hidden text-xs text-dhl-gray font-medium px-3 py-2 border border-dhl-border rounded cursor-pointer active:bg-gray-100"
              >
                ← CHAT
              </button>
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  className="bg-dhl-red text-white px-4 md:px-6 py-2 text-sm font-bold rounded hover:bg-red-700 transition cursor-pointer active:bg-red-800"
                >
                  SUBMIT
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-dhl-yellow text-dhl-dark px-4 md:px-6 py-2 text-sm font-bold rounded hover:bg-yellow-400 transition cursor-pointer active:bg-yellow-500"
                >
                  {currentIndex + 1 >= scenarios.length ? "RESULTS" : "NEXT →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
