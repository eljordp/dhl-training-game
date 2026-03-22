export interface ShipmentInfoForm {
  originCountry: string;
  originCity: string;
  originZip: string;
  originSuburb: string;
  destinationCountry: string;
  destinationCity: string;
  destinationZip: string;
  destinationSuburb: string;
  residentialAddress: boolean;
  accountShipment: boolean;
  accountNumber: string;
  searchType: string;
  pieceId: string;
  description: string;
  contentType: "DOCUMENT" | "PACKAGE" | "";
  shipmentPurpose: string;
  declaredValue: string;
  currency: string;
  shipmentDate: string;
  promotionCode: string;
  protectionValue: boolean;
  protectionAmount: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  numberOfPieces: string;
  serviceType: string;
}

export interface PartyForm {
  companyName: string;
  contactName: string;
  country: string;
  city: string;
  zip: string;
  address1: string;
  address2: string;
  address3: string;
  suburb: string;
  phone: string;
  email: string;
  partyTraderType: string;
  identificationType: string;
  identificationNumber: string;
}

export interface CustomsForm {
  customsRequired: boolean;
  harmonizedCode: string;
  countryOfOrigin: string;
}

export interface InvoiceItem {
  quantity: string;
  unit: string;
  countryOfOrigin: string;
  description: string;
  commodity: string;
  totalWeight: string;
  unitValue: string;
}

export interface CommercialInvoiceForm {
  invoiceType: string;
  tradingTransactionType: string;
  number: string;
  remarks: string;
  items: InvoiceItem[];
}

export interface ShipmentForm {
  shipmentInfo: ShipmentInfoForm;
  shipper: PartyForm;
  consignee: PartyForm;
  customs: CustomsForm;
  commercialInvoice: CommercialInvoiceForm;
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
  xpEarned?: number;
  bonusXp?: number; // speed + perfect bonuses
}
