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
      protectionAmount: "",
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
  { name: "EXPRESS DOMESTIC", code: "N", serviceType: "EXPRESS_DOMESTIC", deliveryDays: 2, baseRate: 2.75, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "EXPRESS WORLDWIDE", code: "P", serviceType: "EXPRESS_WORLDWIDE", deliveryDays: 3, baseRate: 3.85, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "EXPRESS 9:00", code: "9", serviceType: "EXPRESS_9:00", deliveryDays: 1, baseRate: 5.5, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "EXPRESS 12:00", code: "12", serviceType: "EXPRESS_12:00", deliveryDays: 2, baseRate: 4.75, fuelSurcharge: 0.23, directSignature: 7.6 },
  { name: "ECONOMY SELECT", code: "D", serviceType: "ECONOMY_SELECT", deliveryDays: 5, baseRate: 2.1, fuelSurcharge: 0.18, directSignature: 7.6 },
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


interface ProductsModalProps {
  form: ShipmentForm;
  correctServiceType: string;
  onSelect: (serviceType: string) => void;
  onCancel: () => void;
}

const PROMO_CODES: Record<string, number> = {
  LOVE15: 0.15,
  LOVE50: 0.50,
};

function ProductsModal({ form, correctServiceType, onSelect, onCancel }: ProductsModalProps) {
  const weight = parseFloat(form.shipmentInfo.weight) || 1;
  const isDomestic = form.shipmentInfo.originCountry === form.shipmentInfo.destinationCountry;

  // Filter products based on domestic/international
  const availableProducts = isDomestic
    ? PRODUCTS.filter((p) => p.serviceType === "EXPRESS_DOMESTIC")
    : PRODUCTS.filter((p) => p.serviceType !== "EXPRESS_DOMESTIC");

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [fuelChecked, setFuelChecked] = useState(true);
  const [goGreenChecked, setGoGreenChecked] = useState(false);
  const [directSigChecked, setDirectSigChecked] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(false);

  const product = availableProducts[selectedIdx] || PRODUCTS[0];
  const weightCharge = Math.max(weight, 1) * product.baseRate;
  const discount = promoApplied && PROMO_CODES[promoApplied] ? weightCharge * PROMO_CODES[promoApplied] : 0;
  const discountedWeight = weightCharge - discount;
  const fuelCharge = fuelChecked ? discountedWeight * product.fuelSurcharge : 0;
  const goGreenCharge = goGreenChecked ? discountedWeight * 0.02 : 0;
  const directSigCharge = directSigChecked ? product.directSignature : 0;
  const otherCharges = fuelCharge + goGreenCharge + directSigCharge;
  const subtotal = discountedWeight + otherCharges;
  const grandTotal = subtotal;
  const deliveryDate = getDeliveryDate(product.deliveryDays);

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (PROMO_CODES[code]) {
      setPromoApplied(code);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="bg-white rounded shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto" style={{ fontFamily: "Arial, sans-serif" }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between" style={{ background: "#f5f5f5" }}>
          <span style={{ fontWeight: "bold", fontSize: "16px" }}>Products</span>
          <button onClick={onCancel} className="text-xl font-bold text-gray-500 hover:text-black cursor-pointer">×</button>
        </div>

        <div className="p-4">
          {/* Currency */}
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: "12px", color: "#555" }}>Currency</span>
            <select className="border border-gray-300 rounded-sm px-2 py-1 text-sm" defaultValue="USD">
              <option>USD</option>
            </select>
          </div>

          {/* Product selector tabs (if multiple products available) */}
          {availableProducts.length > 1 && (
            <div className="flex gap-1 mb-3">
              {availableProducts.map((p, i) => (
                <button
                  key={p.code}
                  onClick={() => setSelectedIdx(i)}
                  className="px-3 py-1.5 text-xs font-bold rounded-sm border cursor-pointer"
                  style={{
                    background: i === selectedIdx ? "#FFCC00" : "white",
                    borderColor: i === selectedIdx ? "#FFCC00" : "#ccc",
                  }}
                >
                  {p.name} ({p.code})
                </button>
              ))}
            </div>
          )}

          {/* Estimated Delivery & Cost */}
          <table className="w-full text-sm mb-2 border border-gray-200">
            <thead>
              <tr style={{ background: "#FFCC00" }}>
                <th className="px-3 py-2 text-left font-bold border border-gray-200">Estimated Delivery Date</th>
                <th className="px-3 py-2 text-right font-bold border border-gray-200">Estimated Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-gray-200">{deliveryDate}</td>
                <td className="px-3 py-2 border border-gray-200 text-right font-bold">{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Product (Code) */}
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr style={{ background: "#FFCC00" }}>
                <th className="px-3 py-1.5 text-left font-bold border border-gray-200">Product (Code)</th>
                <th className="px-3 py-1.5 text-right font-bold border border-gray-200">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-1 border border-gray-200">{product.name} ({product.code})</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{weightCharge.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-3 py-1 border border-gray-200">Discount</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{discount > 0 ? `-${discount.toFixed(2)}` : "0.00"}</td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td className="px-3 py-1 border border-gray-200">Weight Charge</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{discountedWeight.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Extracharges */}
          <table className="w-full text-sm mt-2 border border-gray-200">
            <thead>
              <tr style={{ background: "#FFCC00" }}>
                <th className="px-1 py-1.5 w-8 border border-gray-200"></th>
                <th className="px-3 py-1.5 text-left font-bold border border-gray-200">Extracharge (Code)</th>
                <th className="px-3 py-1.5 text-right font-bold border border-gray-200">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-1 py-1 border border-gray-200 text-center">
                  <input type="checkbox" checked={fuelChecked} onChange={(e) => setFuelChecked(e.target.checked)} className="w-4 h-4 accent-green-600" />
                </td>
                <td className="px-3 py-1 border border-gray-200">Fuel Surcharge (FF)</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{fuelCharge.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-200 text-center">
                  <input type="checkbox" checked={goGreenChecked} onChange={(e) => setGoGreenChecked(e.target.checked)} className="w-4 h-4" />
                </td>
                <td className="px-3 py-1 border border-gray-200">Go Green Plus (FT)</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{goGreenCharge.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="px-1 py-1 border border-gray-200 text-center">
                  <input type="checkbox" checked={directSigChecked} onChange={(e) => setDirectSigChecked(e.target.checked)} className="w-4 h-4" />
                </td>
                <td className="px-3 py-1 border border-gray-200">Direct Signature (SF)</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{directSigCharge.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td className="border border-gray-200"></td>
                <td className="px-3 py-1 border border-gray-200">Other Charges</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{otherCharges.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Subtotal / Grand Total */}
          <table className="w-full text-sm mt-2 border border-gray-200">
            <thead>
              <tr style={{ background: "#FFCC00" }}>
                <th className="px-3 py-1.5 text-left font-bold border border-gray-200">Description</th>
                <th className="px-3 py-1.5 text-right font-bold border border-gray-200">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-1 border border-gray-200">Subtotal</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{subtotal.toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold" }}>
                <td className="px-3 py-1 border border-gray-200">Grand Total</td>
                <td className="px-3 py-1 border border-gray-200 text-right">{grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Promo applied badge */}
          {promoApplied && (
            <div className="mt-2 text-xs text-green-700 font-bold">
              ✓ Promo {promoApplied} applied ({(PROMO_CODES[promoApplied] * 100).toFixed(0)}% off)
            </div>
          )}

          {/* Report Error */}
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer mt-3">
            <input type="checkbox" className="w-3.5 h-3.5" />
            Report Error ?
          </label>
        </div>

        {/* Add Promotionals */}
        {showPromo ? (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code (e.g. LOVE15)"
                className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm flex-1"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
                style={{ background: "#28a745" }}
              >
                Apply
              </button>
            </div>
            {promoCode && !PROMO_CODES[promoCode.toUpperCase().trim()] && (
              <div className="text-xs text-red-600 mt-1">Invalid promo code. Try LOVE15 or get manager approval.</div>
            )}
          </div>
        ) : (
          <div className="px-4 pb-2 flex justify-center">
            <button
              onClick={() => setShowPromo(true)}
              className="px-4 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
              style={{ background: "#333" }}
            >
              Add Promotionals
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={() => onSelect(product.serviceType)}
            className="px-6 py-1.5 text-sm font-bold rounded-sm cursor-pointer border border-gray-300"
            style={{ background: "white" }}
          >
            Select
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
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
