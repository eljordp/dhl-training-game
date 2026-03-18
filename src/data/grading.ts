import { ShipmentForm, FieldResult, ScenarioResult, NPCScenario } from "@/types/game";

function normalizeValue(val: string | boolean | undefined): string {
  if (val === undefined || val === null) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  return String(val).trim().toLowerCase().replace(/\s+/g, " ");
}

function fuzzyMatch(userVal: string, correctVal: string): boolean {
  const u = normalizeValue(userVal);
  const c = normalizeValue(correctVal);

  if (!c) return true; // if correct answer is empty, anything is fine
  if (!u) return false;

  // Exact match
  if (u === c) return true;

  // Numeric match (strip leading zeros, commas, dollar signs)
  const uNum = u.replace(/[$,]/g, "");
  const cNum = c.replace(/[$,]/g, "");
  if (!isNaN(Number(uNum)) && !isNaN(Number(cNum)) && Number(uNum) === Number(cNum)) return true;

  // Contains match for descriptions (user answer contains key words)
  if (c.length > 10) {
    const cWords = c.split(" ").filter((w) => w.length > 3);
    const matchCount = cWords.filter((w) => u.includes(w)).length;
    if (matchCount >= Math.ceil(cWords.length * 0.6)) return true;
  }

  return false;
}

interface FieldDef {
  path: string;
  label: string;
  getValue: (form: ShipmentForm) => string | boolean | undefined;
  required: boolean;
}

const fieldDefs: FieldDef[] = [
  // Sender
  { path: "sender.name", label: "Sender Name", getValue: (f) => f.sender.name, required: true },
  { path: "sender.company", label: "Sender Company", getValue: (f) => f.sender.company, required: false },
  { path: "sender.street", label: "Sender Street", getValue: (f) => f.sender.street, required: true },
  { path: "sender.city", label: "Sender City", getValue: (f) => f.sender.city, required: true },
  { path: "sender.state", label: "Sender State", getValue: (f) => f.sender.state, required: false },
  { path: "sender.zip", label: "Sender ZIP", getValue: (f) => f.sender.zip, required: true },
  { path: "sender.country", label: "Sender Country", getValue: (f) => f.sender.country, required: true },
  { path: "sender.phone", label: "Sender Phone", getValue: (f) => f.sender.phone, required: true },
  // Receiver
  { path: "receiver.name", label: "Receiver Name", getValue: (f) => f.receiver.name, required: true },
  { path: "receiver.company", label: "Receiver Company", getValue: (f) => f.receiver.company, required: false },
  { path: "receiver.street", label: "Receiver Street", getValue: (f) => f.receiver.street, required: true },
  { path: "receiver.city", label: "Receiver City", getValue: (f) => f.receiver.city, required: true },
  { path: "receiver.state", label: "Receiver State/Province", getValue: (f) => f.receiver.state, required: false },
  { path: "receiver.zip", label: "Receiver Postal Code", getValue: (f) => f.receiver.zip, required: true },
  { path: "receiver.country", label: "Receiver Country", getValue: (f) => f.receiver.country, required: true },
  { path: "receiver.phone", label: "Receiver Phone", getValue: (f) => f.receiver.phone, required: true },
  // Shipment
  { path: "shipment.serviceType", label: "Service Type", getValue: (f) => f.shipment.serviceType, required: true },
  { path: "shipment.packageType", label: "Package Type", getValue: (f) => f.shipment.packageType, required: true },
  { path: "shipment.weight", label: "Weight", getValue: (f) => f.shipment.weight, required: true },
  { path: "shipment.length", label: "Length", getValue: (f) => f.shipment.length, required: true },
  { path: "shipment.width", label: "Width", getValue: (f) => f.shipment.width, required: true },
  { path: "shipment.height", label: "Height", getValue: (f) => f.shipment.height, required: true },
  { path: "shipment.numberOfPieces", label: "Number of Pieces", getValue: (f) => f.shipment.numberOfPieces, required: true },
  { path: "shipment.declaredValue", label: "Declared Value", getValue: (f) => f.shipment.declaredValue, required: true },
  { path: "shipment.currency", label: "Currency", getValue: (f) => f.shipment.currency, required: true },
  { path: "shipment.description", label: "Description", getValue: (f) => f.shipment.description, required: true },
  { path: "shipment.customsRequired", label: "Customs Required", getValue: (f) => f.shipment.customsRequired, required: true },
  { path: "shipment.harmonizedCode", label: "HS Code", getValue: (f) => f.shipment.harmonizedCode, required: false },
  { path: "shipment.countryOfOrigin", label: "Country of Origin", getValue: (f) => f.shipment.countryOfOrigin, required: false },
];

export function gradeScenario(
  scenario: NPCScenario,
  userForm: ShipmentForm,
  timeSpent: number
): ScenarioResult {
  const correct = scenario.correctAnswers;
  const fieldResults: FieldResult[] = [];
  let correctCount = 0;
  let totalGraded = 0;

  for (const def of fieldDefs) {
    const userVal = String(def.getValue(userForm) ?? "");
    const correctVal = String(def.getValue(correct) ?? "");

    // Skip optional fields that have no correct answer
    if (!def.required && !correctVal) continue;

    totalGraded++;
    const isCorrect = fuzzyMatch(userVal, correctVal);
    if (isCorrect) correctCount++;

    fieldResults.push({
      field: def.path,
      label: def.label,
      userValue: userVal,
      correctValue: correctVal,
      correct: isCorrect,
    });
  }

  return {
    scenarioId: scenario.id,
    npcName: scenario.npcName,
    score: totalGraded > 0 ? Math.round((correctCount / totalGraded) * 100) : 0,
    totalFields: totalGraded,
    correctFields: correctCount,
    fieldResults,
    timeSpent,
  };
}

export function getFieldResultMap(fieldResults: FieldResult[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const fr of fieldResults) {
    map[fr.field] = fr.correct;
  }
  return map;
}
