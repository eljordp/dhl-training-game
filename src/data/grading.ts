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
  // if provided, only grade this field when condition is true
  condition?: (correct: ShipmentForm) => boolean;
}

const fieldDefs: FieldDef[] = [
  // shipmentInfo fields
  { path: "shipmentInfo.originCountry", label: "Origin Country", getValue: (f) => f.shipmentInfo.originCountry, required: true },
  { path: "shipmentInfo.originCity", label: "Origin City", getValue: (f) => f.shipmentInfo.originCity, required: true },
  { path: "shipmentInfo.originZip", label: "Origin ZIP", getValue: (f) => f.shipmentInfo.originZip, required: true },
  { path: "shipmentInfo.destinationCountry", label: "Destination Country", getValue: (f) => f.shipmentInfo.destinationCountry, required: true },
  { path: "shipmentInfo.destinationCity", label: "Destination City", getValue: (f) => f.shipmentInfo.destinationCity, required: true },
  { path: "shipmentInfo.destinationZip", label: "Destination ZIP", getValue: (f) => f.shipmentInfo.destinationZip, required: true },
  { path: "shipmentInfo.description", label: "Contents Description", getValue: (f) => f.shipmentInfo.description, required: true },
  { path: "shipmentInfo.contentType", label: "Content Type", getValue: (f) => f.shipmentInfo.contentType, required: true },
  { path: "shipmentInfo.shipmentPurpose", label: "Shipment Purpose", getValue: (f) => f.shipmentInfo.shipmentPurpose, required: true },
  { path: "shipmentInfo.declaredValue", label: "Declared Value", getValue: (f) => f.shipmentInfo.declaredValue, required: true },
  { path: "shipmentInfo.weight", label: "Weight (lbs)", getValue: (f) => f.shipmentInfo.weight, required: true },
  { path: "shipmentInfo.numberOfPieces", label: "Number of Pieces", getValue: (f) => f.shipmentInfo.numberOfPieces, required: true },
  { path: "shipmentInfo.serviceType", label: "Service Type", getValue: (f) => f.shipmentInfo.serviceType, required: true },
  // shipper fields
  { path: "shipper.companyName", label: "Shipper Name/Company", getValue: (f) => f.shipper.companyName, required: true },
  { path: "shipper.contactName", label: "Shipper Contact", getValue: (f) => f.shipper.contactName, required: true },
  { path: "shipper.address1", label: "Shipper Address", getValue: (f) => f.shipper.address1, required: true },
  { path: "shipper.phone", label: "Shipper Phone", getValue: (f) => f.shipper.phone, required: true },
  // consignee fields
  { path: "consignee.companyName", label: "Consignee Name/Company", getValue: (f) => f.consignee.companyName, required: true },
  { path: "consignee.contactName", label: "Consignee Contact", getValue: (f) => f.consignee.contactName, required: true },
  { path: "consignee.address1", label: "Consignee Address", getValue: (f) => f.consignee.address1, required: true },
  { path: "consignee.phone", label: "Consignee Phone", getValue: (f) => f.consignee.phone, required: true },
  // customs fields
  {
    path: "customs.harmonizedCode",
    label: "HS/Harmonized Code",
    getValue: (f) => f.customs.harmonizedCode,
    required: false,
    condition: (correct) => !!correct.customs.harmonizedCode,
  },
  { path: "customs.countryOfOrigin", label: "Country of Origin", getValue: (f) => f.customs.countryOfOrigin, required: true },
  // commercial invoice fields — only graded when contentType is PACKAGE and items exist
  {
    path: "commercialInvoice.items[0].description",
    label: "Invoice Item Description",
    getValue: (f) => f.commercialInvoice.items[0]?.description ?? "",
    required: false,
    condition: (correct) => correct.shipmentInfo.contentType === "PACKAGE" && correct.commercialInvoice.items.length > 0,
  },
  {
    path: "commercialInvoice.items[0].unitValue",
    label: "Invoice Item Value",
    getValue: (f) => f.commercialInvoice.items[0]?.unitValue ?? "",
    required: false,
    condition: (correct) => correct.shipmentInfo.contentType === "PACKAGE" && correct.commercialInvoice.items.length > 0,
  },
  {
    path: "commercialInvoice.items[0].countryOfOrigin",
    label: "Invoice Item Origin",
    getValue: (f) => f.commercialInvoice.items[0]?.countryOfOrigin ?? "",
    required: false,
    condition: (correct) => correct.shipmentInfo.contentType === "PACKAGE" && correct.commercialInvoice.items.length > 0,
  },
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
    // Skip if condition not met
    if (def.condition && !def.condition(correct)) continue;

    const userVal = String(def.getValue(userForm) ?? "");
    const correctVal = String(def.getValue(correct) ?? "");

    // Skip optional fields that have no correct answer and no condition
    if (!def.required && !def.condition && !correctVal) continue;

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
