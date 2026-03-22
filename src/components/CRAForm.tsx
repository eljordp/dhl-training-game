"use client";

import { useState } from "react";
import { ShipmentForm, InvoiceItem } from "@/types/game";
import { COUNTRIES } from "@/data/countries";

interface CRAFormProps {
  form: ShipmentForm;
  onChange: (form: ShipmentForm) => void;
  fieldResults?: Record<string, boolean>;
  disabled?: boolean;
  onSaveAndProcess: () => void;
}

type TabId = "shipmentInfo" | "shipperConsignee" | "pickupBooking" | "party" | "customs" | "commercialInvoice";

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }))
  .sort((a, b) => a.label.localeCompare(b.label));

const PHONE_CODES: Record<string, string> = {
  US: "+1", CA: "+1", MX: "+52", GT: "+502", SV: "+503", HN: "+504", NI: "+505", CR: "+506", PA: "+507",
  CO: "+57", VE: "+58", EC: "+593", PE: "+51", BR: "+55", CL: "+56", AR: "+54", BO: "+591", PY: "+595", UY: "+598",
  GB: "+44", DE: "+49", FR: "+33", ES: "+34", IT: "+39", PT: "+351", NL: "+31", BE: "+32", AT: "+43", CH: "+41",
  SE: "+46", NO: "+47", DK: "+45", FI: "+358", PL: "+48", CZ: "+420", RO: "+40", GR: "+30", IE: "+353",
  HR: "+385", HU: "+36", BG: "+359", SK: "+421", SI: "+386", RS: "+381", BA: "+387", MK: "+389", ME: "+382",
  LT: "+370", LV: "+371", EE: "+372",
  JP: "+81", CN: "+86", KR: "+82", IN: "+91", PH: "+63", ID: "+62", TH: "+66", VN: "+84", MY: "+60", SG: "+65",
  AU: "+61", NZ: "+64", HK: "+852", TW: "+886", BD: "+880", PK: "+92", LK: "+94", NP: "+977",
  EG: "+20", ZA: "+27", NG: "+234", KE: "+254", GH: "+233", ET: "+251", TZ: "+255", UG: "+256",
  SA: "+966", AE: "+971", JO: "+962", LB: "+961", IQ: "+964", KW: "+965", QA: "+974", BH: "+973", OM: "+968",
  IL: "+972", TR: "+90", IR: "+98", SY: "+963",
  RU: "+7", UA: "+380", BY: "+375", GE: "+995", AM: "+374", AZ: "+994", KZ: "+7", UZ: "+998", KG: "+996",
  DO: "+1", JM: "+1", TT: "+1", BB: "+1", BS: "+1", HT: "+509", BZ: "+501", GY: "+592", SR: "+597",
  MA: "+212", TN: "+216", DZ: "+213", LY: "+218", SD: "+249", SN: "+221", CM: "+237", CI: "+225",
  MN: "+976", KH: "+855", LA: "+856", MM: "+95", BN: "+673", FJ: "+679", PG: "+675",
  IS: "+354", LU: "+352", MT: "+356", CY: "+357", AL: "+355", MD: "+373",
  YE: "+967", MR: "+222", BF: "+226", SS: "+211", TL: "+670", TO: "+676", VU: "+678",
  AO: "+244", BJ: "+229", BW: "+267", BI: "+257", KM: "+269", CG: "+242", GM: "+220",
  GN: "+224", GW: "+245", LS: "+266", LR: "+231", MG: "+261", MW: "+265", ML: "+223",
  MZ: "+258", NA: "+264", NE: "+227", RW: "+250", SC: "+248", TG: "+228", ZM: "+260", ZW: "+263",
  MU: "+230", MV: "+960", AF: "+93", KP: "+850", RE: "+262", GF: "+594", GP: "+590", PF: "+689",
  KY: "+1", PR: "+1", VI: "+1", BM: "+1",
};

function getPhoneCode(countryCode: string): string {
  return PHONE_CODES[countryCode] || "+1";
}

const COMMODITY_SUGGESTIONS = [
  "0901 COFFEE",
  "1006 RICE",
  "1704 SUGAR CONFECTIONERY",
  "1806 CHOCOLATE AND COCOA PREPARATIONS",
  "2106 FOOD PREPARATIONS NEC",
  "2204210000 WINE OF FRESH GRAPES",
  "3004 MEDICAMENTS FOR RETAIL SALE",
  "3304 BEAUTY OR MAKE-UP PREPARATIONS",
  "3305 PREPARATIONS FOR USE ON HAIR",
  "3401 SOAP",
  "3923 PLASTIC ARTICLES FOR PACKING",
  "4202 TRUNKS SUITCASES HANDBAGS WALLETS",
  "4820 REGISTERS BOOKS NOTEBOOKS STATIONERY",
  "4901 PRINTED BOOKS BROCHURES",
  "4907 STAMPS CHEQUE FORMS BANKNOTES",
  "4911 OTHER PRINTED MATTER",
  "6104 WOMEN KNITTED SUITS DRESSES SKIRTS",
  "6109100000 T-SHIRTS COTTON",
  "6110 JERSEYS PULLOVERS SWEATSHIRTS WAISTCOATS",
  "6115 HOSIERY SOCKS STOCKINGS",
  "6204 WOMEN SUITS ENSEMBLES DRESSES",
  "6205 MEN SHIRTS",
  "6211 TRACKSUITS SKI SUITS SWIMWEAR",
  "6302 BED LINEN TABLE LINEN TOILET LINEN",
  "6403 FOOTWEAR WITH OUTER SOLES OF RUBBER",
  "6404 FOOTWEAR WITH OUTER SOLES OF RUBBER TEXTILE UPPERS",
  "6506 HEADGEAR",
  "6913 CERAMIC HOUSEHOLD ARTICLES",
  "7113 ARTICLES OF JEWELRY",
  "7117 IMITATION JEWELRY",
  "7321 STOVES RANGES GRATES COOKERS",
  "8409990000 ENGINE PARTS NEC",
  "8414 AIR OR VACUUM PUMPS COMPRESSORS FANS",
  "8418 REFRIGERATORS FREEZERS",
  "8443 PRINTING MACHINERY PRINTERS COPIERS",
  "8471300000 PORTABLE DIGITAL ADP MACHINES LAPTOPS",
  "8504 ELECTRICAL TRANSFORMERS POWER SUPPLIES",
  "8507 ELECTRIC ACCUMULATORS BATTERIES",
  "8516 ELECTRIC WATER HEATERS HAIR DRYERS IRONS",
  "8517130000 SMARTPHONES TELEPHONES",
  "8518 MICROPHONES LOUDSPEAKERS HEADPHONES",
  "8521 VIDEO RECORDING APPARATUS",
  "8523 DISCS TAPES STORAGE MEDIA",
  "8525 CAMERAS TV CAMERAS",
  "8528 MONITORS AND PROJECTORS TELEVISION RECEIVERS",
  "8534 PRINTED CIRCUITS",
  "8536 ELECTRICAL SWITCHES CONNECTORS",
  "8541 DIODES TRANSISTORS SEMICONDUCTORS",
  "8544 INSULATED WIRE CABLE",
  "8708 MOTOR VEHICLE PARTS AND ACCESSORIES",
  "9006 PHOTOGRAPHIC CAMERAS FLASH",
  "9018 MEDICAL INSTRUMENTS AND APPLIANCES",
  "9021 ORTHOPEDIC APPLIANCES HEARING AIDS",
  "9101 WRIST-WATCHES POCKET-WATCHES",
  "9102 WRIST-WATCHES OTHER",
  "9403 OTHER FURNITURE",
  "9503000000 TOYS AND GAMES",
  "9504 VIDEO GAME CONSOLES",
  "9506 SPORTS EQUIPMENT",
  "9608 BALL POINT PENS FELT TIPPED PENS",
  "9706 ANTIQUES OVER 100 YEARS OLD",
];

const DHL_PACKAGING_OPTIONS = [
  { name: "Box #2 - Cube", description: "", dimensions: "10.10 x 5.80 x 5.90", requiredWeight: 0.00 },
  { name: "Box #2 - Medium (Pizza)", description: "", dimensions: "13.20 x 12.60 x 2.00", requiredWeight: 0.00 },
  { name: "Box #2 - Small (Small Pizza)", description: "", dimensions: "12.50 x 11.10 x 1.50", requiredWeight: 0.00 },
  { name: "Box #3", description: "Newest box as of 10/26/22", dimensions: "13.27 x 12.68 x 3.94", requiredWeight: 4.41 },
  { name: "Box #3 - Large (Large Atlas)", description: "", dimensions: "17.50 x 12.50 x 3.00", requiredWeight: 0.00 },
  { name: "Box #4", description: "", dimensions: "13.30 x 12.70 x 7.10", requiredWeight: 0.00 },
  { name: "Box #4 - Large Tri-Tube", description: "", dimensions: "38.40 x 6.90 x 6.90", requiredWeight: 0.00 },
  { name: "Box #4 - Small Tri-Tube", description: "", dimensions: "5.00 x 5.00 x 25.00", requiredWeight: 0.00 },
  { name: "Box #5", description: "", dimensions: "13.30 x 12.70 x 13.60", requiredWeight: 0.00 },
  { name: "Box #6", description: "", dimensions: "16.40 x 14.20 x 14.60", requiredWeight: 0.00 },
  { name: "Box #7", description: "", dimensions: "18.90 x 15.90 x 15.40", requiredWeight: 0.00 },
  { name: "Box #8", description: "", dimensions: "21.30 x 17.50 x 16.10", requiredWeight: 0.00 },
  { name: "Envelope #1 (Card Envelope)", description: "", dimensions: "0.00 x 0.00 x 0.00", requiredWeight: 0.50 },
  { name: "Express easy envelope for 1lb or less", description: "", dimensions: "13.80 x 0.00 x 10.80", requiredWeight: 1.00 },
  { name: "Express envelope for 0.5lbs or less", description: "", dimensions: "0.00 x 0.00 x 0.00", requiredWeight: 0.50 },
  { name: "Express Envelope with Sleeve", description: "", dimensions: "0.00 x 0.00 x 0.00", requiredWeight: 0.50 },
  { name: "Express Legal Envelope", description: "", dimensions: "0.00 x 0.00 x 0.00", requiredWeight: 0.50 },
  { name: "Express Legal Envelope with Sleeve", description: "", dimensions: "0.00 x 0.00 x 0.00", requiredWeight: 0.50 },
  { name: "Large Flyer (Large Express Pack)", description: "", dimensions: "15.00 x 18.70 x 1.00", requiredWeight: 0.00 },
  { name: "Large Padded Pouch", description: "", dimensions: "11.90 x 14.80 x 1.00", requiredWeight: 0.00 },
  { name: "Small Padded Pouch", description: "", dimensions: "9.80 x 12.00 x 1.00", requiredWeight: 0.00 },
  { name: "Standard Flyer (Small Express Pack)", description: "", dimensions: "11.80 x 15.70 x 1.00", requiredWeight: 0.00 },
];

function inputBorderClass(result?: boolean) {
  if (result === true) return "border-[#28a745]";
  if (result === false) return "border-[#D40511]";
  return "border-[#ccc]";
}

function FieldError({ result, label }: { result?: boolean; label?: string }) {
  if (result === false) {
    return <div style={{ color: "#D40511", fontSize: "11px", marginTop: "2px" }}>This field is incorrect{label ? ` (${label})` : ""}</div>;
  }
  return null;
}

function CraInput({
  label,
  value,
  onChange,
  result,
  disabled,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  result?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>
        {label}{required && <span style={{ color: "#D40511" }}> *</span>}
      </label>
      <input
        type={type}
        className={`w-full bg-white border rounded-sm px-2 py-2.5 md:py-1 focus:outline-none focus:border-[#D40511] text-base md:text-[13px] ${inputBorderClass(result)} disabled:bg-gray-100 disabled:text-gray-400`}
        style={{ fontFamily: "Arial, sans-serif" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
      />
      <FieldError result={result} />
    </div>
  );
}

function CraSelect({
  label,
  value,
  onChange,
  options,
  result,
  disabled,
  required,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  result?: boolean;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>
        {label}{required && <span style={{ color: "#D40511" }}> *</span>}
      </label>
      <select
        className={`w-full bg-white border rounded-sm px-2 py-2.5 md:py-1 focus:outline-none focus:border-[#D40511] text-base md:text-[13px] ${inputBorderClass(result)} disabled:bg-gray-100 disabled:text-gray-400`}
        style={{ fontFamily: "Arial, sans-serif" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <FieldError result={result} />
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginTop: "12px", marginBottom: "6px", borderBottom: "1px solid #e0e0e0", paddingBottom: "3px" }}>
      {children}
    </div>
  );
}

function todayFormatted() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

// --- Add Item Modal ---
interface AddItemModalProps {
  item: Partial<InvoiceItem>;
  onSave: (item: InvoiceItem) => void;
  onCancel: () => void;
  isEdit: boolean;
}

function AddItemModal({ item, onSave, onCancel, isEdit }: AddItemModalProps) {
  const [qty, setQty] = useState(item.quantity ?? "1");
  const [unit, setUnit] = useState(item.unit ?? "PCE");
  const [coo, setCoo] = useState(item.countryOfOrigin ?? "");
  const [desc, setDesc] = useState(item.description ?? "");
  const [commodity, setCommodity] = useState(item.commodity ?? "");
  const [weight, setWeight] = useState(item.totalWeight ?? "");
  const [unitValue, setUnitValue] = useState(item.unitValue ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const totalValue = (parseFloat(qty) || 0) * (parseFloat(unitValue) || 0);
  const filtered = COMMODITY_SUGGESTIONS.filter((s) => s.toLowerCase().includes(commodity.toLowerCase()) && commodity.length > 0);

  const handleSave = () => {
    onSave({ quantity: qty, unit, countryOfOrigin: coo, description: desc, commodity, totalWeight: weight, unitValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200" style={{ background: "#f5f5f5" }}>
          <span style={{ fontWeight: "bold", fontSize: "14px" }}>{isEdit ? "Edit Item" : "Add Item"}</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Quantity <span style={{ color: "#D40511" }}>*</span></label>
              <input type="number" min="1" className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Unit <span style={{ color: "#D40511" }}>*</span></label>
              <select className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">Type and select a unit</option>
                <option value="PCE">Piece - PCE</option>
                <option value="BOX">Box - BOX</option>
                <option value="CM">Centimeter - CM</option>
                <option value="COM">Combined pallets and boxes - COM</option>
                <option value="CM3">Cubic Centimeter - CM3</option>
                <option value="FT3">Cubic Feet - FT3</option>
                <option value="M3">Cubic Meter - M3</option>
                <option value="YD3">Cubic Yard - YD3</option>
                <option value="DEG">Degrees - DEG</option>
                <option value="FT">Feet - FT</option>
                <option value="IN">Inches - IN</option>
                <option value="KG">Kilogram - KG</option>
                <option value="KM">Kilometer - KM</option>
                <option value="KMS">Kilometer per second - KMS</option>
                <option value="M">Meter - M</option>
                <option value="MS">Meter per second - MS</option>
                <option value="MI">Mile - MI</option>
                <option value="NMB">Number - NMB</option>
                <option value="PAL">Pallet - PAL</option>
                <option value="PRT">Part/Article - PRT</option>
                <option value="LB">Pounds - LB</option>
                <option value="RAD">Radians - RAD</option>
                <option value="YD">Yard - YD</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Country of Origin <span style={{ color: "#D40511" }}>*</span></label>
            <select className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={coo} onChange={(e) => setCoo(e.target.value)}>
              <option value="">Select...</option>
              {COUNTRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label.toUpperCase()} - {o.value}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Description <span style={{ color: "#D40511" }}>*</span></label>
            <input type="text" className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="relative">
            <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Commodity</label>
            <div
              className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <span className={commodity ? "text-[#333]" : "text-gray-400"}>
                {commodity || "Select a commodity code"}
              </span>
              <span className="text-gray-400 text-xs">{showSuggestions ? "▲" : "▼"}</span>
            </div>
            {showSuggestions && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-hidden flex flex-col">
                <div className="p-1.5 border-b border-gray-200 sticky top-0 bg-white">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-[#D40511]"
                    placeholder="Search HS code or description..."
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-48">
                  {(commodity.length > 0 ? filtered : COMMODITY_SUGGESTIONS).map((s) => (
                    <div
                      key={s}
                      className={`px-3 py-2.5 md:py-1.5 text-sm md:text-xs hover:bg-yellow-50 cursor-pointer border-b border-gray-100 ${commodity === s ? "bg-yellow-100 font-bold" : ""}`}
                      onMouseDown={() => { setCommodity(s); setShowSuggestions(false); }}
                    >{s}</div>
                  ))}
                  {commodity.length > 0 && filtered.length === 0 && (
                    <div className="px-3 py-3 text-sm text-gray-400 text-center">No matching codes</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Total Weight (lb) <span style={{ color: "#D40511" }}>*</span></label>
              <input type="number" min="0" step="0.1" className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Unit Value (USD) <span style={{ color: "#D40511" }}>*</span></label>
              <input type="number" min="0" step="0.01" className="w-full border border-gray-300 rounded-sm px-2 py-2.5 md:py-1 text-base md:text-sm" value={unitValue} onChange={(e) => setUnitValue(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded text-sm">
            <span style={{ fontSize: "12px", color: "#555" }}>Total Item Value:</span>
            <span style={{ fontWeight: "bold", fontSize: "13px" }}>${totalValue.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-1.5 text-sm font-bold text-white rounded cursor-pointer" style={{ background: "#D40511" }}>Cancel</button>
          <button onClick={handleSave} className="px-4 py-1.5 text-sm font-bold text-white rounded cursor-pointer" style={{ background: "#28a745" }}>{isEdit ? "Save" : "Add"}</button>
        </div>
      </div>
    </div>
  );
}

// --- Tab completion logic ---
function isShipmentInfoComplete(form: ShipmentForm): boolean {
  const s = form.shipmentInfo;
  return !!(s.originCountry && s.originCity && s.destinationCountry && s.destinationCity && s.description && s.contentType && s.shipmentPurpose && s.declaredValue && s.weight && s.numberOfPieces);
}

function isShipperConsigneeComplete(form: ShipmentForm): boolean {
  const sh = form.shipper;
  const co = form.consignee;
  return !!(sh.companyName && sh.contactName && sh.address1 && sh.phone && co.companyName && co.contactName && co.address1 && co.phone);
}

function isCustomsComplete(form: ShipmentForm): boolean {
  return !!(form.customs.harmonizedCode && form.customs.countryOfOrigin);
}

function isCommercialInvoiceComplete(form: ShipmentForm): boolean {
  if (form.shipmentInfo.contentType === "DOCUMENT") return false; // locked
  if (form.shipmentInfo.contentType === "PACKAGE") return form.commercialInvoice.items.length > 0;
  return false;
}

type TabStatus = "active" | "complete" | "incomplete" | "locked" | "auto-green";

function getTabStatus(tabId: TabId, activeTab: TabId, form: ShipmentForm): TabStatus {
  if (tabId === "pickupBooking") return "locked";
  if (tabId === "party") return activeTab === "party" ? "active" : "auto-green";
  if (tabId === activeTab) return "active";

  if (tabId === "shipmentInfo") return isShipmentInfoComplete(form) ? "complete" : "incomplete";
  if (tabId === "shipperConsignee") return isShipperConsigneeComplete(form) ? "complete" : "incomplete";
  if (tabId === "customs") return isCustomsComplete(form) ? "complete" : "incomplete";
  if (tabId === "commercialInvoice") {
    if (form.shipmentInfo.contentType === "DOCUMENT") return "locked";
    return isCommercialInvoiceComplete(form) ? "complete" : "incomplete";
  }
  return "incomplete";
}

function allTabsComplete(form: ShipmentForm): boolean {
  return (
    isShipmentInfoComplete(form) &&
    isShipperConsigneeComplete(form) &&
    isCustomsComplete(form) &&
    (form.shipmentInfo.contentType === "DOCUMENT" || isCommercialInvoiceComplete(form))
  );
}

function TabButton({
  tabId,
  label,
  status,
  onClick,
}: {
  tabId: TabId;
  label: string;
  status: TabStatus;
  onClick: () => void;
}) {
  const isLocked = status === "locked";
  const isActive = status === "active";
  const isComplete = status === "complete" || status === "auto-green";

  let bgStyle: React.CSSProperties = { background: "white", color: "#333" };
  if (isActive) bgStyle = { background: "#FFCC00", color: "#000", fontWeight: "bold" };
  if (isLocked) bgStyle = { background: "#e0e0e0", color: "#999", cursor: "not-allowed" };

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className="flex items-center gap-1.5 px-3 py-3 md:py-2 border-r border-gray-300 text-xs whitespace-nowrap transition-none"
      style={{ ...bgStyle, fontFamily: "Arial, sans-serif", fontSize: "12px", minHeight: "44px" }}
    >
      <span>{label}</span>
      {!isActive && !isLocked && (
        <span style={{ color: isComplete ? "#28a745" : "#D40511", fontSize: "14px", lineHeight: 1 }}>●</span>
      )}
    </button>
  );
}

// --- Main CRAForm ---
export default function CRAForm({ form, onChange, fieldResults, disabled, onSaveAndProcess }: CRAFormProps) {
  const [activeTab, setActiveTab] = useState<TabId>("shipmentInfo");
  const [piecesQty, setPiecesQty] = useState("1");
  const [piecesWeight, setPiecesWeight] = useState("");
  const [piecesLength, setPiecesLength] = useState("");
  const [piecesWidth, setPiecesWidth] = useState("");
  const [piecesHeight, setPiecesHeight] = useState("");
  const [piecesAdded, setPiecesAdded] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [packagingQuantities, setPackagingQuantities] = useState<Record<number, string>>({});

  const fr = fieldResults || {};

  const updateShipmentInfo = (field: string, value: string | boolean) => {
    const updatedInfo = { ...form.shipmentInfo, [field]: value };
    let updatedShipper = form.shipper;
    let updatedConsignee = form.consignee;

    // Auto-sync Origin → Shipper
    if (field === "originCountry") {
      const countryLabel = COUNTRIES.find((c) => c.code === value)?.name || "";
      updatedShipper = { ...updatedShipper, country: countryLabel };
    }
    if (field === "originCity") updatedShipper = { ...updatedShipper, city: value as string };
    if (field === "originZip") updatedShipper = { ...updatedShipper, zip: value as string };
    if (field === "originSuburb") updatedShipper = { ...updatedShipper, suburb: value as string };

    // Auto-sync Destination → Consignee
    if (field === "destinationCountry") {
      const countryLabel = COUNTRIES.find((c) => c.code === value)?.name || "";
      updatedConsignee = { ...updatedConsignee, country: countryLabel };
    }
    if (field === "destinationCity") updatedConsignee = { ...updatedConsignee, city: value as string };
    if (field === "destinationZip") updatedConsignee = { ...updatedConsignee, zip: value as string };
    if (field === "destinationSuburb") updatedConsignee = { ...updatedConsignee, suburb: value as string };

    onChange({ ...form, shipmentInfo: updatedInfo, shipper: updatedShipper, consignee: updatedConsignee });
  };
  const updateShipper = (field: string, value: string) => {
    onChange({ ...form, shipper: { ...form.shipper, [field]: value } });
  };
  const updateConsignee = (field: string, value: string) => {
    onChange({ ...form, consignee: { ...form.consignee, [field]: value } });
  };
  const updateCustoms = (field: string, value: string | boolean) => {
    onChange({ ...form, customs: { ...form.customs, [field]: value } });
  };
  const updateCI = (field: string, value: string) => {
    onChange({ ...form, commercialInvoice: { ...form.commercialInvoice, [field]: value } });
  };

  const handleAddPiece = () => {
    updateShipmentInfo("weight", piecesWeight);
    updateShipmentInfo("length", piecesLength);
    updateShipmentInfo("width", piecesWidth);
    updateShipmentInfo("height", piecesHeight);
    updateShipmentInfo("numberOfPieces", piecesQty);
    setPiecesAdded(true);
  };

  const handleDeletePiece = () => {
    setPiecesAdded(false);
    updateShipmentInfo("weight", "");
    updateShipmentInfo("length", "");
    updateShipmentInfo("width", "");
    updateShipmentInfo("height", "");
    updateShipmentInfo("numberOfPieces", "");
  };

  const volWeight = () => {
    const l = parseFloat(piecesLength) || 0;
    const w = parseFloat(piecesWidth) || 0;
    const h = parseFloat(piecesHeight) || 0;
    if (l && w && h) return (l * w * h / 139).toFixed(1);
    return "";
  };

  const handleSaveItem = (item: InvoiceItem) => {
    const items = [...form.commercialInvoice.items];
    if (editItemIndex !== null) {
      items[editItemIndex] = item;
    } else {
      items.push(item);
    }
    onChange({ ...form, commercialInvoice: { ...form.commercialInvoice, items } });
    setShowAddItem(false);
    setEditItemIndex(null);
  };

  const handleDeleteItem = (idx: number) => {
    const items = form.commercialInvoice.items.filter((_, i) => i !== idx);
    onChange({ ...form, commercialInvoice: { ...form.commercialInvoice, items } });
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "shipmentInfo", label: "Shipment Info" },
    { id: "shipperConsignee", label: "Shipper/Consignee" },
    { id: "pickupBooking", label: "Pickup Booking" },
    { id: "party", label: "+Party" },
    { id: "customs", label: "Customs" },
    { id: "commercialInvoice", label: "Commercial Invoice" },
  ];

  const protectionExceedsDeclared = form.shipmentInfo.protectionValue &&
    form.shipmentInfo.protectionAmount &&
    form.shipmentInfo.declaredValue &&
    parseFloat(form.shipmentInfo.protectionAmount) > parseFloat(form.shipmentInfo.declaredValue);

  const canProcess = allTabsComplete(form) && !disabled && !protectionExceedsDeclared;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: "Arial, sans-serif", background: "#f5f5f5" }}>
      {/* "Create a Shipment" subtitle */}
      <div className="px-3 py-1.5 bg-white border-b border-gray-200" style={{ fontSize: "13px", fontWeight: "bold", color: "#333" }}>
        Create a Shipment
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-300 bg-white overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => {
          const status = getTabStatus(tab.id, activeTab, form);
          return (
            <TabButton
              key={tab.id}
              tabId={tab.id}
              label={tab.label}
              status={status}
              onClick={() => setActiveTab(tab.id)}
            />
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#f5f5f5" }}>

        {/* ---- TAB 1: Shipment Info ---- */}
        {activeTab === "shipmentInfo" && (
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT COLUMN */}
            <div className="bg-white border border-gray-200 p-3 rounded-sm">
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginBottom: "10px" }}>Rate Information</div>

              {/* Account Shipment */}
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="acct-shipment"
                  className="w-3.5 h-3.5"
                  checked={form.shipmentInfo.accountShipment}
                  onChange={(e) => updateShipmentInfo("accountShipment", e.target.checked)}
                  disabled={disabled}
                />
                <label htmlFor="acct-shipment" style={{ fontSize: "12px", color: "#555" }}>Account Shipment</label>
              </div>
              <div className="mb-3">
                <CraSelect
                  label="Account Number"
                  value={form.shipmentInfo.accountNumber}
                  onChange={(v) => updateShipmentInfo("accountNumber", v)}
                  options={[
                    { value: "CASHUS001", label: "CASHUS001 - CASH" },
                  ]}
                  disabled={disabled}
                  required
                  placeholder="CASHUS001 - CASH"
                />
              </div>

              <SectionHeader>Origin <span style={{ color: "#D40511" }}>*</span></SectionHeader>
              <div className="space-y-2">
                <CraSelect
                  label="Country"
                  value={form.shipmentInfo.originCountry}
                  onChange={(v) => updateShipmentInfo("originCountry", v)}
                  options={COUNTRY_OPTIONS.map((o) => ({ value: o.value, label: `${o.value} - ${o.label}` }))}
                  result={fr["shipmentInfo.originCountry"]}
                  disabled={disabled}
                  required
                />
                <CraInput label="City" value={form.shipmentInfo.originCity} onChange={(v) => updateShipmentInfo("originCity", v)} result={fr["shipmentInfo.originCity"]} disabled={disabled} required />
                <CraInput label="Zip" value={form.shipmentInfo.originZip} onChange={(v) => updateShipmentInfo("originZip", v)} result={fr["shipmentInfo.originZip"]} disabled={disabled} required />
                <CraInput label="Suburb/County" value={form.shipmentInfo.originSuburb} onChange={(v) => updateShipmentInfo("originSuburb", v)} disabled={disabled} placeholder="Type and select a suburb" />
              </div>

              <SectionHeader>Destination <span style={{ color: "#D40511" }}>*</span></SectionHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    id="residential"
                    className="w-3.5 h-3.5"
                    checked={form.shipmentInfo.residentialAddress}
                    onChange={(e) => updateShipmentInfo("residentialAddress", e.target.checked)}
                    disabled={disabled}
                  />
                  <label htmlFor="residential" style={{ fontSize: "12px", color: "#555" }}>Residential Address <span style={{ color: "#888" }}>ⓘ</span></label>
                </div>
                <CraSelect
                  label="Country"
                  value={form.shipmentInfo.destinationCountry}
                  onChange={(v) => updateShipmentInfo("destinationCountry", v)}
                  options={COUNTRY_OPTIONS.map((o) => ({ value: o.value, label: `${o.value} - ${o.label}` }))}
                  result={fr["shipmentInfo.destinationCountry"]}
                  disabled={disabled}
                  required
                />
                <CraInput label="City" value={form.shipmentInfo.destinationCity} onChange={(v) => updateShipmentInfo("destinationCity", v)} result={fr["shipmentInfo.destinationCity"]} disabled={disabled} required />
                <CraInput label="Zip" value={form.shipmentInfo.destinationZip} onChange={(v) => updateShipmentInfo("destinationZip", v)} result={fr["shipmentInfo.destinationZip"]} disabled={disabled} required />
                <CraInput label="Suburb/County" value={form.shipmentInfo.destinationSuburb} onChange={(v) => updateShipmentInfo("destinationSuburb", v)} disabled={disabled} placeholder="Type and select a suburb" />
              </div>

              {/* Shipment Creation Date */}
              <div className="mt-2">
                <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Shipment Creation Date <span style={{ color: "#D40511" }}>*</span></label>
                <div className="flex gap-1">
                  <input type="text" className="flex-1 border border-gray-300 rounded-sm px-2 py-1 bg-gray-100" style={{ fontSize: "13px" }} value={todayFormatted()} readOnly disabled />
                  <button className="px-2 py-1 text-sm font-bold text-black rounded-sm" style={{ background: "#FFCC00", border: "1px solid #ccc" }} disabled>📅</button>
                </div>
              </div>

              <div className="mt-2 flex gap-2 items-end">
                <div className="flex-1">
                  <CraInput label="Promotion Code" value={form.shipmentInfo.promotionCode} onChange={(v) => updateShipmentInfo("promotionCode", v)} disabled={disabled} />
                </div>
                <button
                  className="px-3 py-2.5 md:py-1 text-xs font-bold rounded-sm whitespace-nowrap"
                  style={{ border: "1px solid #ccc", background: "white", color: "#333" }}
                  disabled={disabled}
                >
                  Select Product
                </button>
              </div>

              <div className="mt-2 space-y-2">
                <CraInput label="Description" value={form.shipmentInfo.description} onChange={(v) => updateShipmentInfo("description", v)} result={fr["shipmentInfo.description"]} disabled={disabled} required placeholder="Describe the contents" />

                <CraSelect
                  label="Shipment Content Type"
                  value={form.shipmentInfo.contentType}
                  onChange={(v) => updateShipmentInfo("contentType", v)}
                  options={[{ value: "DOCUMENT", label: "Document" }, { value: "PACKAGE", label: "Package" }]}
                  result={fr["shipmentInfo.contentType"]}
                  disabled={disabled}
                  required
                />

                <CraSelect
                  label="Shipment Purpose"
                  value={form.shipmentInfo.shipmentPurpose}
                  onChange={(v) => updateShipmentInfo("shipmentPurpose", v)}
                  options={[
                    { value: "GIFT", label: "Gift" },
                    { value: "SOLD", label: "Sold" },
                    { value: "COMMERCIAL_SAMPLE", label: "Commercial Sample" },
                    { value: "PERSONAL_USE", label: "Personal Use" },
                    { value: "RETURN", label: "Return" },
                    { value: "REPAIR", label: "Repair" },
                  ]}
                  result={fr["shipmentInfo.shipmentPurpose"]}
                  disabled={disabled}
                  required
                />

                <CraSelect
                  label="Declared/Protection Currency"
                  value={form.shipmentInfo.currency}
                  onChange={(v) => updateShipmentInfo("currency", v)}
                  options={[
                    { value: "USD", label: "US Dollar - USD" },
                    { value: "EUR", label: "Euro - EUR" },
                    { value: "GBP", label: "British Pound - GBP" },
                    { value: "MXN", label: "Mexican Peso - MXN" },
                    { value: "CAD", label: "Canadian Dollar - CAD" },
                  ]}
                  disabled={disabled}
                />

                <CraInput label="Declared Value" value={form.shipmentInfo.declaredValue} onChange={(v) => updateShipmentInfo("declaredValue", v)} result={fr["shipmentInfo.declaredValue"]} disabled={disabled} required type="number" placeholder="0.00" />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="protection"
                    className="w-3.5 h-3.5"
                    checked={form.shipmentInfo.protectionValue}
                    onChange={(e) => updateShipmentInfo("protectionValue", e.target.checked)}
                    disabled={disabled}
                  />
                  <label htmlFor="protection" style={{ fontSize: "12px", color: "#555" }}>Protection Value</label>
                </div>
                {form.shipmentInfo.protectionValue && (
                  <div>
                    <CraInput
                      label="Protection Amount"
                      value={form.shipmentInfo.protectionAmount}
                      onChange={(v) => updateShipmentInfo("protectionAmount", v)}
                      disabled={disabled}
                      type="number"
                      placeholder="0.00"
                      required
                    />
                    {form.shipmentInfo.protectionAmount && form.shipmentInfo.declaredValue && parseFloat(form.shipmentInfo.protectionAmount) > parseFloat(form.shipmentInfo.declaredValue) && (
                      <div style={{ color: "#D40511", fontSize: "11px", marginTop: "4px", fontWeight: "bold" }}>Protection value cannot exceed declared value</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN - Pieces */}
            <div className="bg-white border border-gray-200 p-3 rounded-sm">
              <div className="flex items-center justify-between" style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222" }}>Pieces</div>
                <div className="flex flex-col items-center">
                  <span style={{ fontSize: "10px", color: "#333", marginBottom: "2px" }}>Packaging</span>
                  <button
                    onClick={() => setShowPackagingModal(true)}
                    className="px-2 py-1 text-sm font-bold text-white rounded-sm cursor-pointer"
                    style={{ background: "#1a6b2a" }}
                    disabled={disabled}
                  >
                    📦
                  </button>
                </div>
              </div>

              {/* Search Type and ID */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                <CraSelect
                  label="Search Type"
                  value={form.shipmentInfo.searchType}
                  onChange={(v) => updateShipmentInfo("searchType", v)}
                  options={[
                    { value: "Email", label: "Email" },
                    { value: "Waybill", label: "Waybill" },
                    { value: "Reference", label: "Reference" },
                    { value: "Shipment", label: "Shipment" },
                  ]}
                  disabled={disabled}
                  placeholder="Select a search type"
                />
                <CraInput
                  label={form.shipmentInfo.searchType ? `${form.shipmentInfo.searchType}` : "ID"}
                  value={form.shipmentInfo.pieceId}
                  onChange={(v) => updateShipmentInfo("pieceId", v)}
                  disabled={disabled}
                  required
                />
              </div>

              {/* Pieces input row */}
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Qty (pcs) <span style={{ color: "#D40511" }}>*</span></label>
                  <input type="number" min="1" className="w-full border border-gray-300 rounded-sm px-1.5 py-1" style={{ fontSize: "12px" }} value={piecesQty} onChange={(e) => setPiecesQty(e.target.value)} disabled={disabled || piecesAdded} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Weight (lb) <span style={{ color: "#D40511" }}>*</span></label>
                  <input type="number" min="0" step="0.1" className="w-full border border-gray-300 rounded-sm px-1.5 py-1" style={{ fontSize: "12px" }} value={piecesWeight} onChange={(e) => setPiecesWeight(e.target.value)} disabled={disabled || piecesAdded} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Length (in)</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-sm px-1.5 py-1" style={{ fontSize: "12px" }} value={piecesLength} onChange={(e) => setPiecesLength(e.target.value)} disabled={disabled || piecesAdded} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Width (in)</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-sm px-1.5 py-1" style={{ fontSize: "12px" }} value={piecesWidth} onChange={(e) => setPiecesWidth(e.target.value)} disabled={disabled || piecesAdded} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Height (in)</label>
                  <input type="number" min="0" className="w-full border border-gray-300 rounded-sm px-1.5 py-1" style={{ fontSize: "12px" }} value={piecesHeight} onChange={(e) => setPiecesHeight(e.target.value)} disabled={disabled || piecesAdded} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#333", display: "block", marginBottom: "2px" }}>Vol. Weight (lb)</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-1.5 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "12px" }} value={volWeight()} readOnly />
                </div>
              </div>

              {!piecesAdded && !disabled && (
                <button
                  onClick={handleAddPiece}
                  className="mb-3 px-3 py-1 text-sm font-bold text-white rounded-sm cursor-pointer"
                  style={{ background: "#28a745" }}
                >
                  Add
                </button>
              )}

              {/* Pieces table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr style={{ background: "#FFCC00" }}>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Piece</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Weight (lb)</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Measurements (in)</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Packaging Cost (USD)</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Vol. Weight (lb)</th>
                      <th className="border border-gray-300 px-2 py-1 text-left font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!piecesAdded ? (
                      <tr>
                        <td colSpan={6} className="border border-gray-300 px-2 py-3 text-center text-gray-400">Please add pieces</td>
                      </tr>
                    ) : (
                      <tr>
                        <td className="border border-gray-300 px-2 py-1">{piecesQty}</td>
                        <td className="border border-gray-300 px-2 py-1">{piecesWeight}</td>
                        <td className="border border-gray-300 px-2 py-1">{piecesLength}×{piecesWidth}×{piecesHeight}</td>
                        <td className="border border-gray-300 px-2 py-1 text-gray-400">—</td>
                        <td className="border border-gray-300 px-2 py-1">{volWeight()}</td>
                        <td className="border border-gray-300 px-2 py-1">
                          {!disabled && (
                            <button onClick={handleDeletePiece} className="text-red-500 hover:text-red-700 font-bold text-sm cursor-pointer">✕</button>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB 2: Shipper/Consignee ---- */}
        {activeTab === "shipperConsignee" && (
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shipper */}
            <div className="bg-white border border-gray-200 p-3 rounded-sm">
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginBottom: "10px" }}>Shipper</div>
              <div className="space-y-2">
                <CraInput label="Company Name or Name" value={form.shipper.companyName} onChange={(v) => updateShipper("companyName", v)} result={fr["shipper.companyName"]} disabled={disabled} required />
                <CraInput label="Contact Name" value={form.shipper.contactName} onChange={(v) => updateShipper("contactName", v)} result={fr["shipper.contactName"]} disabled={disabled} required />
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Country</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value="US - UNITED STATES OF AMERICA" readOnly disabled />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>City</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value={form.shipmentInfo.originCity} readOnly disabled />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Zip</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value={form.shipmentInfo.originZip} readOnly disabled />
                </div>
                <CraInput label="Suburb/County" value={form.shipper.suburb} onChange={(v) => updateShipper("suburb", v)} disabled={disabled} />
                <CraInput label="Address 1" value={form.shipper.address1} onChange={(v) => updateShipper("address1", v)} result={fr["shipper.address1"]} disabled={disabled} required />
                <CraInput label="Address 2" value={form.shipper.address2} onChange={(v) => updateShipper("address2", v)} disabled={disabled} />
                <CraInput label="Address 3" value={form.shipper.address3} onChange={(v) => updateShipper("address3", v)} disabled={disabled} />
                <div className="grid grid-cols-2 gap-2">
                  <CraSelect
                    label="Identification Type"
                    value={form.shipper.identificationType}
                    onChange={(v) => updateShipper("identificationType", v)}
                    options={[{ value: "Passport", label: "Passport" }, { value: "Tax ID", label: "Tax ID" }, { value: "National ID", label: "National ID" }, { value: "Driver License", label: "Driver License" }]}
                    disabled={disabled}
                  />
                  <CraInput label="Identification Number" value={form.shipper.identificationNumber} onChange={(v) => updateShipper("identificationNumber", v)} disabled={disabled} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Phone 1 <span style={{ color: "#D40511" }}>*</span></label>
                  <div className="flex gap-1">
                    <span className="border border-gray-300 rounded-sm px-2 py-1 bg-gray-100 text-gray-500 text-xs flex items-center">{getPhoneCode(form.shipmentInfo.originCountry)}</span>
                    <input
                      type="text"
                      className={`flex-1 bg-white border rounded-sm px-2 py-1 focus:outline-none focus:border-[#D40511] ${inputBorderClass(fr["shipper.phone"])} disabled:bg-gray-100`}
                      style={{ fontSize: "13px" }}
                      value={form.shipper.phone}
                      onChange={(e) => updateShipper("phone", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <FieldError result={fr["shipper.phone"]} />
                </div>
                <CraInput label="Email" value={form.shipper.email} onChange={(v) => updateShipper("email", v)} disabled={disabled} />
                <CraSelect
                  label="Party Trader Type"
                  value={form.shipper.partyTraderType}
                  onChange={(v) => updateShipper("partyTraderType", v)}
                  options={[
                    { value: "Private", label: "Private" },
                    { value: "Direct Consumer", label: "Direct Consumer" },
                    { value: "Business", label: "Business" },
                    { value: "Government", label: "Government" },
                    { value: "Reseller", label: "Reseller" },
                  ]}
                  disabled={disabled}
                  required
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" disabled={disabled} />
                  <label style={{ fontSize: "12px", color: "#555" }}>Email Receipt</label>
                </div>
              </div>
            </div>

            {/* Consignee */}
            <div className="bg-white border border-gray-200 p-3 rounded-sm">
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginBottom: "10px" }}>Consignee</div>
              <div className="space-y-2">
                <CraInput label="Company Name or Name" value={form.consignee.companyName} onChange={(v) => updateConsignee("companyName", v)} result={fr["consignee.companyName"]} disabled={disabled} required />
                <CraInput label="Contact Name" value={form.consignee.contactName} onChange={(v) => updateConsignee("contactName", v)} result={fr["consignee.contactName"]} disabled={disabled} required />
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Country</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value={form.shipmentInfo.destinationCountry} readOnly disabled />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>City</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value={form.shipmentInfo.destinationCity} readOnly disabled />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Zip</label>
                  <input type="text" className="w-full border border-gray-200 rounded-sm px-2 py-1 bg-gray-100 text-gray-500" style={{ fontSize: "13px" }} value={form.shipmentInfo.destinationZip} readOnly disabled />
                </div>
                <CraInput label="Suburb/County" value={form.consignee.suburb} onChange={(v) => updateConsignee("suburb", v)} disabled={disabled} />
                <CraInput label="Address 1" value={form.consignee.address1} onChange={(v) => updateConsignee("address1", v)} result={fr["consignee.address1"]} disabled={disabled} required />
                <CraInput label="Address 2" value={form.consignee.address2} onChange={(v) => updateConsignee("address2", v)} disabled={disabled} />
                <CraInput label="Address 3" value={form.consignee.address3} onChange={(v) => updateConsignee("address3", v)} disabled={disabled} />
                <div className="grid grid-cols-2 gap-2">
                  <CraSelect
                    label="Identification Type"
                    value={form.consignee.identificationType}
                    onChange={(v) => updateConsignee("identificationType", v)}
                    options={[{ value: "Passport", label: "Passport" }, { value: "Tax ID", label: "Tax ID" }, { value: "National ID", label: "National ID" }, { value: "Driver License", label: "Driver License" }]}
                    disabled={disabled}
                  />
                  <CraInput label="Identification Number" value={form.consignee.identificationNumber} onChange={(v) => updateConsignee("identificationNumber", v)} disabled={disabled} />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#333", display: "block", marginBottom: "2px" }}>Phone 1 <span style={{ color: "#D40511" }}>*</span></label>
                  <div className="flex gap-1">
                    <span className="border border-gray-300 rounded-sm px-2 py-1 bg-gray-100 text-gray-500 text-xs flex items-center">{getPhoneCode(form.shipmentInfo.destinationCountry)}</span>
                    <input
                      type="text"
                      className={`flex-1 bg-white border rounded-sm px-2 py-1 focus:outline-none focus:border-[#D40511] ${inputBorderClass(fr["consignee.phone"])} disabled:bg-gray-100`}
                      style={{ fontSize: "13px" }}
                      value={form.consignee.phone}
                      onChange={(e) => updateConsignee("phone", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                  <FieldError result={fr["consignee.phone"]} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CraInput label="Email" value={form.consignee.email} onChange={(v) => updateConsignee("email", v)} disabled={disabled} />
                    <button
                      type="button"
                      onClick={() => updateConsignee("email", form.shipper.email)}
                      disabled={disabled || !form.shipper.email}
                      className="mt-4 px-2 py-1 text-xs border border-gray-300 rounded-sm bg-gray-50 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      title="Copy shipper email"
                    >
                      ← Copy
                    </button>
                  </div>
                </div>
                <CraSelect
                  label="Party Trader Type"
                  value={form.consignee.partyTraderType}
                  onChange={(v) => updateConsignee("partyTraderType", v)}
                  options={[
                    { value: "Private", label: "Private" },
                    { value: "Direct Consumer", label: "Direct Consumer" },
                    { value: "Business", label: "Business" },
                    { value: "Government", label: "Government" },
                    { value: "Reseller", label: "Reseller" },
                  ]}
                  disabled={disabled}
                  required
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-3.5 h-3.5" disabled={disabled} />
                  <label style={{ fontSize: "12px", color: "#555" }}>Email Receipt</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---- TAB 3: Pickup Booking (LOCKED) ---- */}
        {activeTab === "pickupBooking" && (
          <div className="p-4 flex items-center justify-center">
            <div className="bg-white border border-gray-200 rounded p-6 text-center max-w-md">
              <div style={{ color: "#999", fontSize: "32px", marginBottom: "12px" }}>🚚</div>
              <div style={{ fontWeight: "bold", color: "#666", fontSize: "14px" }}>Pickup Booking not required for counter service.</div>
            </div>
          </div>
        )}

        {/* ---- TAB 4: +Party (auto-green) ---- */}
        {activeTab === "party" && (
          <div className="p-4 flex items-center justify-center">
            <div className="bg-white border border-gray-200 rounded p-6 text-center max-w-md">
              <div style={{ color: "#28a745", fontSize: "32px", marginBottom: "12px" }}>✓</div>
              <div style={{ fontWeight: "bold", color: "#333", fontSize: "14px" }}>No additional parties required for this shipment.</div>
            </div>
          </div>
        )}

        {/* ---- TAB 5: Customs ---- */}
        {activeTab === "customs" && (
          <div className="p-3">
            <div className="bg-white border border-gray-200 p-4 rounded-sm max-w-xl space-y-3">
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginBottom: "8px" }}>Customs</div>

              <div className="flex items-center gap-3">
                <label style={{ fontSize: "12px", color: "#333" }}>Customs Required</label>
                <div className="flex items-center gap-1.5">
                  <input type="checkbox" checked={true} readOnly className="w-3.5 h-3.5 accent-[#D40511]" />
                  <span style={{ fontSize: "12px", color: "#555" }}>Yes (all international shipments)</span>
                </div>
              </div>

              <CraInput
                label="HS/Harmonized Code"
                value={form.customs.harmonizedCode}
                onChange={(v) => updateCustoms("harmonizedCode", v)}
                result={fr["customs.harmonizedCode"]}
                disabled={disabled}
                required
                placeholder="e.g. 6204, 8471.30"
              />

              <CraSelect
                label="Country of Origin"
                value={form.customs.countryOfOrigin}
                onChange={(v) => updateCustoms("countryOfOrigin", v)}
                options={COUNTRY_OPTIONS.map((o) => ({ value: o.value, label: `${o.value} - ${o.label}` }))}
                result={fr["customs.countryOfOrigin"]}
                disabled={disabled}
                required
              />
            </div>
          </div>
        )}

        {/* ---- TAB 6: Commercial Invoice ---- */}
        {activeTab === "commercialInvoice" && (
          <div className="p-3">
            {form.shipmentInfo.contentType === "DOCUMENT" ? (
              <div className="flex items-center justify-center p-6">
                <div className="bg-white border border-gray-200 rounded p-6 text-center max-w-md" style={{ background: "#f0f0f0" }}>
                  <div style={{ color: "#999", fontSize: "32px", marginBottom: "12px" }}>📄</div>
                  <div style={{ fontWeight: "bold", color: "#666", fontSize: "14px" }}>Commercial Invoice not required for Document shipments.</div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 p-4 rounded-sm space-y-3">
                <div style={{ fontSize: "13px", fontWeight: "bold", color: "#222", marginBottom: "8px" }}>Commercial Invoice</div>

                <div className="grid grid-cols-2 gap-3">
                  <CraSelect
                    label="Invoice Type"
                    value={form.commercialInvoice.invoiceType}
                    onChange={(v) => updateCI("invoiceType", v)}
                    options={[{ value: "Commercial Invoice", label: "Commercial Invoice" }, { value: "Pro-Forma", label: "Pro-Forma" }]}
                    disabled={disabled}
                    required
                    placeholder="Select an invoice type"
                  />
                  <CraSelect
                    label="Trading Transaction Type"
                    value={form.commercialInvoice.tradingTransactionType}
                    onChange={(v) => updateCI("tradingTransactionType", v)}
                    options={[{ value: "Personal", label: "Personal" }, { value: "Commercial", label: "Commercial" }]}
                    placeholder="Type and select a transaction type"
                    disabled={disabled}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CraInput label="Number" value={form.commercialInvoice.number} onChange={(v) => updateCI("number", v)} disabled={disabled} />
                  <CraInput label="Remarks" value={form.commercialInvoice.remarks} onChange={(v) => updateCI("remarks", v)} disabled={disabled} />
                </div>

                {!disabled && (
                  <button
                    onClick={() => { setEditItemIndex(null); setShowAddItem(true); }}
                    className="px-3 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
                    style={{ background: "#28a745" }}
                  >
                    + Add Items
                  </button>
                )}

                {/* Items table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr style={{ background: "#FFCC00" }}>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Qty</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Unit</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">COO</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Description</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Commodity</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Wt (lb)</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Unit Val</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Total Val</th>
                        <th className="border border-gray-300 px-2 py-1 text-left font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.commercialInvoice.items.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="border border-gray-300 px-2 py-3 text-center text-gray-400">No items added</td>
                        </tr>
                      ) : (
                        <>
                          {form.commercialInvoice.items.map((item, idx) => {
                            const totalVal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitValue) || 0);
                            const descResult = idx === 0 ? fr["commercialInvoice.items[0].description"] : undefined;
                            const valResult = idx === 0 ? fr["commercialInvoice.items[0].unitValue"] : undefined;
                            return (
                              <tr key={idx} className={`${descResult === false || valResult === false ? "bg-red-50" : ""}`}>
                                <td className="border border-gray-300 px-2 py-1">{item.quantity}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.unit}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.countryOfOrigin}</td>
                                <td className={`border border-gray-300 px-2 py-1 ${descResult === false ? "text-red-600" : descResult === true ? "text-green-700" : ""}`}>{item.description}</td>
                                <td className="border border-gray-300 px-2 py-1 text-xs">{item.commodity}</td>
                                <td className="border border-gray-300 px-2 py-1">{item.totalWeight}</td>
                                <td className={`border border-gray-300 px-2 py-1 ${valResult === false ? "text-red-600" : valResult === true ? "text-green-700" : ""}`}>${item.unitValue}</td>
                                <td className="border border-gray-300 px-2 py-1">${totalVal.toFixed(2)}</td>
                                <td className="border border-gray-300 px-2 py-1">
                                  {!disabled && (
                                    <div className="flex gap-1">
                                      <button onClick={() => { setEditItemIndex(idx); setShowAddItem(true); }} className="text-xs font-bold px-1.5 py-0.5 text-white rounded cursor-pointer" style={{ background: "#28a745" }}>Edit</button>
                                      <button onClick={() => handleDeleteItem(idx)} className="text-xs font-bold px-1.5 py-0.5 text-white rounded cursor-pointer" style={{ background: "#D40511" }}>Del</button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Total row */}
                          {form.commercialInvoice.items.length > 0 && (
                            <tr style={{ fontWeight: "bold", background: "#f9f9f9" }}>
                              <td colSpan={5} className="border border-gray-300 px-2 py-1 text-right">Totals:</td>
                              <td className="border border-gray-300 px-2 py-1">
                                {form.commercialInvoice.items.reduce((s, i) => s + (parseFloat(i.totalWeight) || 0), 0).toFixed(1)}
                              </td>
                              <td className="border border-gray-300 px-2 py-1">—</td>
                              <td className="border border-gray-300 px-2 py-1">
                                ${form.commercialInvoice.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitValue) || 0), 0).toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-2 py-1"></td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notice Banner */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-yellow-400" style={{ background: "#fffde7", fontSize: "11px", color: "#555" }}>
        <strong>NOTICE:</strong> Please advise Customer that there may be additional duty and tax charges for dutiable shipments payable by the RECEIVER at destination.
      </div>

      {/* Bottom Action Bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-300 px-3 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <button
          className="px-3 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
          style={{ background: "#D40511" }}
          disabled={disabled}
        >
          Cancel Shipment
        </button>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            className="px-3 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
            style={{ background: "#28a745" }}
            disabled={disabled}
          >
            Save Shipment
          </button>
          <button
            onClick={canProcess ? onSaveAndProcess : undefined}
            disabled={!canProcess}
            className={`px-3 py-1.5 text-sm font-bold rounded-sm ${canProcess ? "cursor-pointer hover:bg-yellow-400" : "opacity-50 cursor-not-allowed"}`}
            style={{ background: "#FFCC00", color: "#000" }}
            title={!canProcess ? "Complete all tabs before processing" : undefined}
          >
            Save and Process Shipment
          </button>
        </div>
      </div>

      {/* Packaging Modal */}
      {showPackagingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded shadow-lg w-full max-w-4xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between" style={{ background: "#fff" }}>
              <span style={{ fontWeight: "bold", fontSize: "14px" }}>Available Packaging</span>
              <button onClick={() => setShowPackagingModal(false)} className="text-gray-500 hover:text-gray-800 text-lg font-bold cursor-pointer" style={{ lineHeight: 1 }}>✕</button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr style={{ background: "#FFCC00" }}>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Package Name</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Description</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Dimensions (in)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Required Weight (lb)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Quantity</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Unit Price (USD)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">VAT (USD)</th>
                    <th className="border border-gray-300 px-2 py-1 text-left font-bold">Total (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {DHL_PACKAGING_OPTIONS.map((pkg, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-2 py-1">{pkg.name}</td>
                      <td className="border border-gray-300 px-2 py-1">{pkg.description}</td>
                      <td className="border border-gray-300 px-2 py-1">{pkg.dimensions}</td>
                      <td className="border border-gray-300 px-2 py-1">{pkg.requiredWeight.toFixed(2)}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          className="w-14 border border-gray-300 rounded-sm px-1 py-0.5 text-xs"
                          value={packagingQuantities[idx] || ""}
                          onChange={(e) => setPackagingQuantities({ ...packagingQuantities, [idx]: e.target.value })}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1">0.00</td>
                      <td className="border border-gray-300 px-2 py-1">0.00</td>
                      <td className="border border-gray-300 px-2 py-1">0.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  // Find the first packaging with quantity > 0 and auto-fill dimensions
                  for (const [idxStr, qty] of Object.entries(packagingQuantities)) {
                    const q = parseInt(qty);
                    if (q > 0) {
                      const pkg = DHL_PACKAGING_OPTIONS[parseInt(idxStr)];
                      const dims = pkg.dimensions.split(" x ");
                      if (dims.length === 3) {
                        setPiecesLength(dims[0]);
                        setPiecesWidth(dims[1]);
                        setPiecesHeight(dims[2]);
                      }
                      if (pkg.requiredWeight > 0) {
                        setPiecesWeight(pkg.requiredWeight.toString());
                      }
                      setPiecesQty(q.toString());
                      break;
                    }
                  }
                  setShowPackagingModal(false);
                }}
                className="px-4 py-1.5 text-sm font-bold text-white rounded-sm cursor-pointer"
                style={{ background: "#28a745" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          item={editItemIndex !== null ? form.commercialInvoice.items[editItemIndex] : {}}
          onSave={handleSaveItem}
          onCancel={() => { setShowAddItem(false); setEditItemIndex(null); }}
          isEdit={editItemIndex !== null}
        />
      )}
    </div>
  );
}
