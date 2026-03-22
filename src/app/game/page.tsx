"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import DHLHeader from "@/components/DHLHeader";
import NPCChat from "@/components/NPCChat";
import CRAForm from "@/components/CRAForm";
import { scenarios } from "@/data/scenarios";
import { gradeScenario, getFieldResultMap } from "@/data/grading";
import { ShipmentForm, ScenarioResult } from "@/types/game";
import { saveScenarioAttempt } from "@/lib/tracking";

function emptyForm(): ShipmentForm {
  return {
    shipmentInfo: {
      originCountry: "US",
      originCity: "",
      originZip: "",
      originSuburb: "",
      destinationCountry: "",
      destinationCity: "",
      destinationZip: "",
      destinationSuburb: "",
      residentialAddress: false,
      accountShipment: false,
      accountNumber: "",
      searchType: "",
      pieceId: "",
      description: "",
      contentType: "",
      shipmentPurpose: "",
      declaredValue: "",
      currency: "USD",
      shipmentDate: new Date().toLocaleDateString('en-US'),
      promotionCode: "",
      protectionValue: false,
      weight: "",
      length: "",
      width: "",
      height: "",
      numberOfPieces: "",
      serviceType: "",
    },
    shipper: { companyName: "", contactName: "", country: "", city: "", zip: "", address1: "", address2: "", address3: "", suburb: "", phone: "", email: "", partyTraderType: "", identificationType: "", identificationNumber: "" },
    consignee: { companyName: "", contactName: "", country: "", city: "", zip: "", address1: "", address2: "", address3: "", suburb: "", phone: "", email: "", partyTraderType: "", identificationType: "", identificationNumber: "" },
    customs: { customsRequired: true, harmonizedCode: "", countryOfOrigin: "" },
    commercialInvoice: {
      invoiceType: "Commercial Invoice",
      tradingTransactionType: "Commercial",
      number: "",
      remarks: "",
      items: [],
    },
  };
}

// --- Product definitions ---
interface Product {
  name: string;
  code: string;
  serviceType: string;
  deliveryDays: number;
  baseRate: number; // per lb
  fuelSurcharge: number; // %
  directSignature: number;
}

const PRODUCTS: Product[] = [
  { name: "DHL Express Worldwide", code: "P", serviceType: "EXPRESS_WORLDWIDE", deliveryDays: 3, baseRate: 3.85, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "DHL Express 9:00", code: "9", serviceType: "EXPRESS_9:00", deliveryDays: 1, baseRate: 5.5, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "DHL Express 12:00", code: "12", serviceType: "EXPRESS_12:00", deliveryDays: 2, baseRate: 4.75, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "DHL Economy Select", code: "D", serviceType: "ECONOMY_SELECT", deliveryDays: 5, baseRate: 2.1, fuelSurcharge: 0.18, directSignature: 7.6 },
];

function getDeliveryDate(days: number): string {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function calcCost(product: Product, weight: number) {
  const weightCharge = Math.max(weight, 1) * product.baseRate;
  const fuelCharge = weightCharge * product.fuelSurcharge;
  const subtotal = weightCharge + fuelCharge + product.directSignature;
  return { weightCharge, fuelCharge, subtotal };
}

interface ProductCardProps {
  product: Product;
  weight: number;
  isCorrect: boolean;
  onSelect: (serviceType: string) => void;
}

function ProductCard({ product, weight, isCorrect, onSelect }: ProductCardProps) {
  const { weightCharge, fuelCharge, subtotal } = calcCost(product, weight);
  const deliveryDate = getDeliveryDate(product.deliveryDays);

  return (
    <div
      className="border rounded-sm overflow-hidden flex flex-col min-w-0 md:min-w-[220px]"
      style={{ borderColor: isCorrect ? "#FFCC00" : "#ccc", borderWidth: isCorrect ? "2px" : "1px" }}
    >
      <div className="px-3 py-2" style={{ background: isCorrect ? "#FFCC00" : "#f5f5f5", borderBottom: "1px solid #ccc" }}>
        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{product.name}</div>
        <div style={{ fontSize: "11px", color: "#555" }}>Est. Delivery: {deliveryDate}</div>
      </div>
      <div className="flex-1 p-2">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#FFCC00" }}>
              <th className="px-2 py-1 text-left font-bold border border-gray-200">Product (Code)</th>
              <th className="px-2 py-1 text-right font-bold border border-gray-200">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2 py-0.5 border border-gray-200">{product.name} ({product.code})</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="px-2 py-0.5 border border-gray-200">Discount</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">0.00</td>
            </tr>
            <tr>
              <td className="px-2 py-0.5 border border-gray-200">Weight Charge</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">${weightCharge.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: "6px", fontSize: "11px", fontWeight: "bold", color: "#555" }}>Extracharges</div>
        <table className="w-full text-xs mt-1">
          <tbody>
            <tr>
              <td className="px-2 py-0.5 border border-gray-200">Fuel Surcharge (FF)</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">${fuelCharge.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="px-2 py-0.5 border border-gray-200">Direct Signature (SF)</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">${product.directSignature.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-xs mt-1">
          <tbody>
            <tr style={{ fontWeight: "bold" }}>
              <td className="px-2 py-0.5 border border-gray-200">Grand Total</td>
              <td className="px-2 py-0.5 border border-gray-200 text-right">${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 border-t border-gray-200">
        <button
          onClick={() => onSelect(product.serviceType)}
          className="w-full py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
          style={{ background: "#28a745" }}
        >
          Select
        </button>
      </div>
    </div>
  );
}

interface ProductsModalProps {
  form: ShipmentForm;
  correctServiceType: string;
  onSelect: (serviceType: string) => void;
  onCancel: () => void;
}

function ProductsModal({ form, correctServiceType, onSelect, onCancel }: ProductsModalProps) {
  const weight = parseFloat(form.shipmentInfo.weight) || 1;

  // Primary product = correct service type; secondary = next best alternative
  const primary = PRODUCTS.find((p) => p.serviceType === correctServiceType) || PRODUCTS[0];
  const secondary = PRODUCTS.find((p) => p.serviceType !== correctServiceType) || PRODUCTS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded shadow-xl w-full max-w-2xl mx-4 overflow-hidden" style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between" style={{ background: "#f5f5f5" }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Products</span>
          <span style={{ fontSize: "12px", color: "#555" }}>Currency: USD</span>
        </div>

        {/* Product cards */}
        <div className="p-4 flex flex-col md:flex-row gap-4 overflow-x-auto">
          <ProductCard
            product={primary}
            weight={weight}
            isCorrect={true}
            onSelect={onSelect}
          />
          <ProductCard
            product={secondary}
            weight={weight}
            isCorrect={false}
            onSelect={onSelect}
          />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5" />
            Report Error?
          </label>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
            style={{ background: "#D40511" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- XP Calculation ---
function calcXP(score: number, timeSpent: number): { base: number; bonus: number; total: number } {
  const base = score;
  const speedBonus = timeSpent < 60 ? 20 : timeSpent < 120 ? 10 : timeSpent < 180 ? 5 : 0;
  const perfectBonus = score === 100 ? 25 : 0;
  const bonus = speedBonus + perfectBonus;
  return { base, bonus, total: base + bonus };
}

// --- Main GamePage ---
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
  const [showProducts, setShowProducts] = useState(false);

  const scenario = scenarios[currentIndex];

  const handleProductSelect = useCallback((serviceType: string) => {
    setShowProducts(false);
    const finalForm: ShipmentForm = {
      ...form,
      shipmentInfo: { ...form.shipmentInfo, serviceType },
    };
    const timeSpent = Math.round((Date.now() - scenarioStartTime) / 1000);
    const graded = gradeScenario(scenario, finalForm, timeSpent);
    const xp = calcXP(graded.score, timeSpent);
    const result: ScenarioResult = { ...graded, xpEarned: xp.total, bonusXp: xp.bonus };
    const newResults = [...results, result];
    setResults(newResults);
    setFieldResults(getFieldResultMap(result.fieldResults));
    setForm(finalForm);
    setSubmitted(true);
  }, [form, scenario, scenarioStartTime, results]);

  const handleSaveAndProcess = useCallback(() => {
    setShowProducts(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= scenarios.length) {
      const allResults = [...results];
      sessionStorage.setItem("gameResults", JSON.stringify(allResults));
      // Save all results to Supabase (fire and forget — don't await to avoid blocking)
      Promise.all(
        allResults.map((result, idx) =>
          saveScenarioAttempt(result, scenarios[idx].id, scenarios[idx].difficulty)
        )
      ).catch(() => {}); // fail silently if not logged in
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        if (submitted) handleNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [submitted, handleNext]);

  const lastResult = results[results.length - 1];

  return (
    <div className="h-[100dvh] flex flex-col">
      <DHLHeader />

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
            {lastResult.xpEarned != null && (
              <>
                {" — "}
                <span className="font-bold text-yellow-600">+{lastResult.xpEarned} XP ⚡</span>
                {(lastResult.bonusXp ?? 0) > 0 && (
                  <span className="ml-1 font-bold text-yellow-500">+{lastResult.bonusXp} BONUS</span>
                )}
              </>
            )}
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

      {/* Main layout: NPC chat + CRA form */}
      <div className="flex-1 flex min-h-0">
        {/* NPC Chat */}
        <div className={`${mobileTab === "chat" ? "flex" : "hidden"} md:flex w-full md:w-[380px] flex-shrink-0 md:border-r border-dhl-border flex-col`}>
          <NPCChat
            npcName={scenario.npcName}
            npcAvatar={scenario.npcAvatar}
            dialogues={scenario.dialogues}
            difficulty={scenario.difficulty}
            hints={scenario.hints}
            showHints={showHints}
          />

          <div className="md:hidden border-t border-dhl-border bg-white px-3 py-2">
            <button
              onClick={() => setMobileTab("form")}
              className="w-full bg-dhl-red text-white py-2.5 text-sm font-bold rounded cursor-pointer active:bg-red-800"
            >
              FILL OUT FORM →
            </button>
          </div>
        </div>

        {/* CRA Form */}
        <div className={`${mobileTab === "form" ? "flex" : "hidden"} md:flex flex-1 flex-col min-h-0`}>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <CRAForm
              form={form}
              onChange={setForm}
              fieldResults={fieldResults}
              disabled={submitted}
              onSaveAndProcess={handleSaveAndProcess}
            />
          </div>

          {/* Action bar for post-submit navigation */}
          {submitted && (
            <div className="border-t border-dhl-border bg-white px-3 md:px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-dhl-blue hover:underline cursor-pointer"
                >
                  {showHints ? "Hide Hints" : "Show Hints"}
                </button>
                <span className="text-[10px] text-gray-400 hidden md:inline">Ctrl+Enter to continue</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMobileTab("chat")}
                  className="md:hidden text-xs text-dhl-gray font-medium px-3 py-2 border border-dhl-border rounded cursor-pointer"
                >
                  ← CHAT
                </button>
                <button
                  onClick={handleNext}
                  className="bg-dhl-yellow text-dhl-dark px-4 md:px-6 py-2 text-sm font-bold rounded hover:bg-yellow-400 transition cursor-pointer active:bg-yellow-500"
                >
                  {currentIndex + 1 >= scenarios.length ? "RESULTS" : "NEXT →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Modal */}
      {showProducts && (
        <ProductsModal
          form={form}
          correctServiceType={scenario.correctAnswers.shipmentInfo.serviceType}
          onSelect={handleProductSelect}
          onCancel={() => setShowProducts(false)}
        />
      )}
    </div>
  );
}
