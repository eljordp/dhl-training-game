export interface Address {
  name: string;
  company?: string;
  street: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone: string;
}

export interface ShipmentDetails {
  serviceType: "EXPRESS_WORLDWIDE" | "EXPRESS_9:00" | "EXPRESS_12:00" | "ECONOMY_SELECT" | "EXPRESS_ENVELOPE";
  packageType: "DOCUMENT" | "PACKAGE" | "PALLET";
  weight: string; // in lbs
  length: string; // in inches
  width: string;
  height: string;
  declaredValue: string;
  currency: string;
  description: string;
  customsRequired: boolean;
  harmonizedCode?: string;
  countryOfOrigin?: string;
  numberOfPieces: string;
}

export interface ShipmentForm {
  sender: Address;
  receiver: Address;
  shipment: ShipmentDetails;
}

export interface NPCDialogue {
  speaker: "npc" | "system";
  text: string;
  delay?: number;
}

export interface NPCScenario {
  id: string;
  npcName: string;
  npcAvatar: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  dialogues: NPCDialogue[];
  correctAnswers: ShipmentForm;
  hints: Record<string, string>;
}

export interface FieldResult {
  field: string;
  label: string;
  userValue: string;
  correctValue: string;
  correct: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  npcName: string;
  score: number;
  totalFields: number;
  correctFields: number;
  fieldResults: FieldResult[];
  timeSpent: number;
}

export interface GameState {
  currentScenarioIndex: number;
  scenarios: NPCScenario[];
  results: ScenarioResult[];
  startTime: number;
}
