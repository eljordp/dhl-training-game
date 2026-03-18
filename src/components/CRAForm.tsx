"use client";

import { ShipmentForm } from "@/types/game";

interface CRAFormProps {
  form: ShipmentForm;
  onChange: (form: ShipmentForm) => void;
  fieldResults?: Record<string, boolean>;
  disabled?: boolean;
}

function FieldInput({
  label,
  value,
  onChange,
  result,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  result?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const resultClass = result === undefined ? "" : result ? "correct" : "incorrect";
  return (
    <div>
      <label className="cra-label">{label}</label>
      <input
        type="text"
        className={`cra-input ${resultClass}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
      {result === false && (
        <div className="text-[10px] text-dhl-error mt-0.5 font-medium">✗ Incorrect</div>
      )}
      {result === true && (
        <div className="text-[10px] text-dhl-success mt-0.5 font-medium">✓ Correct</div>
      )}
    </div>
  );
}

export default function CRAForm({ form, onChange, fieldResults, disabled }: CRAFormProps) {
  const updateSender = (field: string, value: string) => {
    onChange({ ...form, sender: { ...form.sender, [field]: value } });
  };
  const updateReceiver = (field: string, value: string) => {
    onChange({ ...form, receiver: { ...form.receiver, [field]: value } });
  };
  const updateShipment = (field: string, value: string) => {
    onChange({ ...form, shipment: { ...form.shipment, [field]: value } });
  };

  const fr = fieldResults || {};

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      {/* CRA Toolbar */}
      <div className="bg-dhl-dark text-white px-4 py-2 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider">NEW SHIPMENT</span>
          <span className="text-[10px] text-gray-400 border border-gray-600 px-1.5 rounded">CRA-2024</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          ONLINE
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sender Section */}
        <div className="border border-dhl-border rounded bg-white">
          <div className="bg-dhl-red text-white px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-2">
            <span>📤</span> SENDER (SHIPPER) INFORMATION
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <FieldInput label="Full Name *" value={form.sender.name} onChange={(v) => updateSender("name", v)} result={fr["sender.name"]} disabled={disabled} placeholder="John Doe" />
            <FieldInput label="Company" value={form.sender.company || ""} onChange={(v) => updateSender("company", v)} result={fr["sender.company"]} disabled={disabled} placeholder="Company name" />
            <div className="col-span-2">
              <FieldInput label="Street Address *" value={form.sender.street} onChange={(v) => updateSender("street", v)} result={fr["sender.street"]} disabled={disabled} placeholder="123 Main St" />
            </div>
            <FieldInput label="City *" value={form.sender.city} onChange={(v) => updateSender("city", v)} result={fr["sender.city"]} disabled={disabled} placeholder="City" />
            <div className="grid grid-cols-2 gap-2">
              <FieldInput label="State" value={form.sender.state || ""} onChange={(v) => updateSender("state", v)} result={fr["sender.state"]} disabled={disabled} placeholder="CA" />
              <FieldInput label="Zip *" value={form.sender.zip} onChange={(v) => updateSender("zip", v)} result={fr["sender.zip"]} disabled={disabled} placeholder="90210" />
            </div>
            <div>
              <label className="cra-label">Country *</label>
              <select
                className={`cra-select ${fr["sender.country"] === undefined ? "" : fr["sender.country"] ? "correct" : "incorrect"}`}
                value={form.sender.country}
                onChange={(e) => updateSender("country", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                <option value="US">US - United States</option>
                <option value="CA">CA - Canada</option>
                <option value="MX">MX - Mexico</option>
                <option value="GB">GB - United Kingdom</option>
                <option value="DE">DE - Germany</option>
                <option value="FR">FR - France</option>
                <option value="JP">JP - Japan</option>
                <option value="CN">CN - China</option>
                <option value="AU">AU - Australia</option>
                <option value="BR">BR - Brazil</option>
                <option value="KR">KR - South Korea</option>
                <option value="IN">IN - India</option>
              </select>
            </div>
            <FieldInput label="Phone *" value={form.sender.phone} onChange={(v) => updateSender("phone", v)} result={fr["sender.phone"]} disabled={disabled} placeholder="+1-555-0100" />
          </div>
        </div>

        {/* Receiver Section */}
        <div className="border border-dhl-border rounded bg-white">
          <div className="bg-dhl-red text-white px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-2">
            <span>📥</span> RECEIVER (CONSIGNEE) INFORMATION
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <FieldInput label="Full Name *" value={form.receiver.name} onChange={(v) => updateReceiver("name", v)} result={fr["receiver.name"]} disabled={disabled} placeholder="Jane Smith" />
            <FieldInput label="Company" value={form.receiver.company || ""} onChange={(v) => updateReceiver("company", v)} result={fr["receiver.company"]} disabled={disabled} placeholder="Company name" />
            <div className="col-span-2">
              <FieldInput label="Street Address *" value={form.receiver.street} onChange={(v) => updateReceiver("street", v)} result={fr["receiver.street"]} disabled={disabled} placeholder="456 Oak Ave" />
            </div>
            <FieldInput label="City *" value={form.receiver.city} onChange={(v) => updateReceiver("city", v)} result={fr["receiver.city"]} disabled={disabled} placeholder="City" />
            <div className="grid grid-cols-2 gap-2">
              <FieldInput label="State/Province" value={form.receiver.state || ""} onChange={(v) => updateReceiver("state", v)} result={fr["receiver.state"]} disabled={disabled} placeholder="State" />
              <FieldInput label="Postal Code *" value={form.receiver.zip} onChange={(v) => updateReceiver("zip", v)} result={fr["receiver.zip"]} disabled={disabled} placeholder="Postal code" />
            </div>
            <div>
              <label className="cra-label">Country *</label>
              <select
                className={`cra-select ${fr["receiver.country"] === undefined ? "" : fr["receiver.country"] ? "correct" : "incorrect"}`}
                value={form.receiver.country}
                onChange={(e) => updateReceiver("country", e.target.value)}
                disabled={disabled}
              >
                <option value="">Select...</option>
                <option value="US">US - United States</option>
                <option value="CA">CA - Canada</option>
                <option value="MX">MX - Mexico</option>
                <option value="GB">GB - United Kingdom</option>
                <option value="DE">DE - Germany</option>
                <option value="FR">FR - France</option>
                <option value="JP">JP - Japan</option>
                <option value="CN">CN - China</option>
                <option value="AU">AU - Australia</option>
                <option value="BR">BR - Brazil</option>
                <option value="KR">KR - South Korea</option>
                <option value="IN">IN - India</option>
                <option value="IT">IT - Italy</option>
                <option value="ES">ES - Spain</option>
                <option value="NL">NL - Netherlands</option>
              </select>
            </div>
            <FieldInput label="Phone *" value={form.receiver.phone} onChange={(v) => updateReceiver("phone", v)} result={fr["receiver.phone"]} disabled={disabled} placeholder="+44-20-555-0100" />
          </div>
        </div>

        {/* Shipment Details Section */}
        <div className="border border-dhl-border rounded bg-white">
          <div className="bg-dhl-red text-white px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-2">
            <span>📦</span> SHIPMENT DETAILS
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="cra-label">Service Type *</label>
                <select
                  className={`cra-select ${fr["shipment.serviceType"] === undefined ? "" : fr["shipment.serviceType"] ? "correct" : "incorrect"}`}
                  value={form.shipment.serviceType}
                  onChange={(e) => updateShipment("serviceType", e.target.value)}
                  disabled={disabled}
                >
                  <option value="">Select service...</option>
                  <option value="EXPRESS_WORLDWIDE">Express Worldwide</option>
                  <option value="EXPRESS_9:00">Express 9:00</option>
                  <option value="EXPRESS_12:00">Express 12:00</option>
                  <option value="ECONOMY_SELECT">Economy Select</option>
                  <option value="EXPRESS_ENVELOPE">Express Envelope</option>
                </select>
              </div>
              <div>
                <label className="cra-label">Package Type *</label>
                <select
                  className={`cra-select ${fr["shipment.packageType"] === undefined ? "" : fr["shipment.packageType"] ? "correct" : "incorrect"}`}
                  value={form.shipment.packageType}
                  onChange={(e) => updateShipment("packageType", e.target.value)}
                  disabled={disabled}
                >
                  <option value="">Select type...</option>
                  <option value="DOCUMENT">Document</option>
                  <option value="PACKAGE">Package</option>
                  <option value="PALLET">Pallet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <FieldInput label="Weight (lbs) *" value={form.shipment.weight} onChange={(v) => updateShipment("weight", v)} result={fr["shipment.weight"]} disabled={disabled} placeholder="0" />
              <FieldInput label="Length (in)" value={form.shipment.length} onChange={(v) => updateShipment("length", v)} result={fr["shipment.length"]} disabled={disabled} placeholder="0" />
              <FieldInput label="Width (in)" value={form.shipment.width} onChange={(v) => updateShipment("width", v)} result={fr["shipment.width"]} disabled={disabled} placeholder="0" />
              <FieldInput label="Height (in)" value={form.shipment.height} onChange={(v) => updateShipment("height", v)} result={fr["shipment.height"]} disabled={disabled} placeholder="0" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <FieldInput label="# of Pieces *" value={form.shipment.numberOfPieces} onChange={(v) => updateShipment("numberOfPieces", v)} result={fr["shipment.numberOfPieces"]} disabled={disabled} placeholder="1" />
              <FieldInput label="Declared Value *" value={form.shipment.declaredValue} onChange={(v) => updateShipment("declaredValue", v)} result={fr["shipment.declaredValue"]} disabled={disabled} placeholder="0.00" />
              <div>
                <label className="cra-label">Currency</label>
                <select
                  className={`cra-select ${fr["shipment.currency"] === undefined ? "" : fr["shipment.currency"] ? "correct" : "incorrect"}`}
                  value={form.shipment.currency}
                  onChange={(e) => updateShipment("currency", e.target.value)}
                  disabled={disabled}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="AUD">AUD</option>
                  <option value="BRL">BRL</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            <div>
              <FieldInput label="Contents Description *" value={form.shipment.description} onChange={(v) => updateShipment("description", v)} result={fr["shipment.description"]} disabled={disabled} placeholder="Describe the contents..." />
            </div>
          </div>
        </div>

        {/* Customs Section */}
        <div className="border border-dhl-border rounded bg-white">
          <div className="bg-dhl-yellow text-dhl-dark px-3 py-1.5 text-xs font-bold tracking-wider flex items-center gap-2">
            <span>🛃</span> CUSTOMS / COMMERCIAL INVOICE
          </div>
          <div className="p-3 space-y-3">
            <div className="flex items-center gap-3">
              <label className="cra-label mb-0">Customs Required *</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="customs"
                  checked={form.shipment.customsRequired === true}
                  onChange={() => updateShipment("customsRequired", "true")}
                  disabled={disabled}
                  className="accent-dhl-red"
                />
                <span className="text-xs">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="customs"
                  checked={form.shipment.customsRequired === false}
                  onChange={() => updateShipment("customsRequired", "false")}
                  disabled={disabled}
                  className="accent-dhl-red"
                />
                <span className="text-xs">No</span>
              </label>
              {fr["shipment.customsRequired"] === false && (
                <span className="text-[10px] text-dhl-error font-medium">✗ Incorrect</span>
              )}
              {fr["shipment.customsRequired"] === true && (
                <span className="text-[10px] text-dhl-success font-medium">✓ Correct</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FieldInput
                label="HS/Harmonized Code"
                value={form.shipment.harmonizedCode || ""}
                onChange={(v) => updateShipment("harmonizedCode", v)}
                result={fr["shipment.harmonizedCode"]}
                disabled={disabled}
                placeholder="e.g. 6204.00"
              />
              <div>
                <label className="cra-label">Country of Origin</label>
                <select
                  className={`cra-select ${fr["shipment.countryOfOrigin"] === undefined ? "" : fr["shipment.countryOfOrigin"] ? "correct" : "incorrect"}`}
                  value={form.shipment.countryOfOrigin || ""}
                  onChange={(e) => updateShipment("countryOfOrigin", e.target.value)}
                  disabled={disabled}
                >
                  <option value="">Select...</option>
                  <option value="US">US - United States</option>
                  <option value="CN">CN - China</option>
                  <option value="MX">MX - Mexico</option>
                  <option value="DE">DE - Germany</option>
                  <option value="JP">JP - Japan</option>
                  <option value="GB">GB - United Kingdom</option>
                  <option value="KR">KR - South Korea</option>
                  <option value="IN">IN - India</option>
                  <option value="IT">IT - Italy</option>
                  <option value="FR">FR - France</option>
                  <option value="BR">BR - Brazil</option>
                  <option value="AU">AU - Australia</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
