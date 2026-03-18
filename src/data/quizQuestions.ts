import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    category: "document_vs_package",
    question: "A customer says 'It's just paperwork — contracts and notarized letters, no commercial value.' What content type do you select?",
    options: ["PACKAGE", "DOCUMENT", "PARCEL", "ENVELOPE"],
    correct: 1,
    explanation: "Documents have no commercial value and do not require a Commercial Invoice. Always select DOCUMENT for paperwork."
  },
  {
    id: "q2",
    category: "country_codes",
    question: "What is Germany's DHL country code?",
    options: ["GE", "GM", "DE", "GR"],
    correct: 2,
    explanation: "DE is the ISO 3166-1 country code for Germany (Deutschland)."
  },
  {
    id: "q3",
    category: "service_types",
    question: "A customer says their documents must arrive at the destination office by 9:00 AM. Which service do you select?",
    options: ["EXPRESS_WORLDWIDE", "EXPRESS_12:00", "ECONOMY_SELECT", "EXPRESS_9:00"],
    correct: 3,
    explanation: "EXPRESS_9:00 guarantees delivery by 9:00 AM on the next business day."
  },
  {
    id: "q4",
    category: "document_vs_package",
    question: "When is a Commercial Invoice NOT required?",
    options: ["When shipping to Mexico", "When the package is under $100", "When shipping DOCUMENTS", "When the customer is a private individual"],
    correct: 2,
    explanation: "DOCUMENT shipments skip the Commercial Invoice tab entirely. It is only required for PACKAGE content type."
  },
  {
    id: "q5",
    category: "general",
    question: "A customer brings 2 separate boxes to ship to Japan. What number goes in 'Number of Pieces'?",
    options: ["1", "2", "The total item count inside the boxes", "Leave blank"],
    correct: 1,
    explanation: "Number of Pieces refers to the number of physical boxes/parcels, not items inside. The customer has 2 boxes = 2 pieces."
  },
  {
    id: "q6",
    category: "country_codes",
    question: "What is Japan's DHL country code?",
    options: ["JA", "JP", "JPN", "JN"],
    correct: 1,
    explanation: "JP is the ISO 3166-1 country code for Japan."
  },
  {
    id: "q7",
    category: "customs",
    question: "A customer ships engine parts to Brazil. Is customs documentation required?",
    options: ["Only if value exceeds $1,000", "Yes — all international shipments require customs", "No — industrial parts are exempt", "Only if declared value exceeds $5,000"],
    correct: 1,
    explanation: "ALL international shipments require customs documentation regardless of value or content type."
  },
  {
    id: "q8",
    category: "general",
    question: "What does 'Declared Value' represent in the CRA form?",
    options: ["The shipping cost", "The market value of the goods being shipped", "The customs duty amount", "The insurance payout amount"],
    correct: 1,
    explanation: "Declared Value is the market value of the goods. This is used to calculate duties/taxes and insurance."
  },
  {
    id: "q9",
    category: "service_types",
    question: "A customer needs to ship engine parts to Brazil — no rush, just reliable delivery. Which service is best?",
    options: ["EXPRESS_9:00", "EXPRESS_12:00", "EXPRESS_WORLDWIDE", "ECONOMY_SELECT"],
    correct: 3,
    explanation: "ECONOMY_SELECT is the most cost-effective service for non-urgent international shipments."
  },
  {
    id: "q10",
    category: "customs",
    question: "A customer ships 12 bottles of California wine to Sydney, Australia. What is the country of origin?",
    options: ["AU", "FR", "US", "Depends on the grape variety"],
    correct: 2,
    explanation: "Country of origin is where the product was MADE, not where it is being shipped from or to. California wine = US."
  },
  {
    id: "q11",
    category: "country_codes",
    question: "What is the United Kingdom's DHL country code?",
    options: ["UK", "EN", "GB", "BR"],
    correct: 2,
    explanation: "GB (Great Britain) is the ISO 3166-1 country code for the United Kingdom."
  },
  {
    id: "q12",
    category: "customs",
    question: "Which harmonized (HS) code applies to laptops and portable computers?",
    options: ["6913", "8471.30", "2204.21", "6204"],
    correct: 1,
    explanation: "HS code 8471.30 covers portable digital ADP (Automatic Data Processing) machines — laptops, notebooks."
  },
  {
    id: "q13",
    category: "general",
    question: "A customer is sending a birthday present to their mother in Mexico. What is the shipment purpose?",
    options: ["SOLD", "PERSONAL_USE", "GIFT", "COMMERCIAL_SAMPLE"],
    correct: 2,
    explanation: "A birthday present is a GIFT. This affects customs treatment and duty exemptions in many countries."
  },
  {
    id: "q14",
    category: "customs",
    question: "What harmonized (HS) code covers women's dresses and garments?",
    options: ["8409.99", "6204", "2204.21", "6913"],
    correct: 1,
    explanation: "HS code 6204 covers women's suits, ensembles, dresses, and similar garment articles."
  },
  {
    id: "q15",
    category: "country_codes",
    question: "What is Australia's DHL country code?",
    options: ["AUS", "AS", "AU", "AT"],
    correct: 2,
    explanation: "AU is the ISO 3166-1 country code for Australia. (AT is Austria — don't confuse them!)"
  },
  {
    id: "q16",
    category: "document_vs_package",
    question: "What declared value should you enter for a DOCUMENT shipment (internal legal papers)?",
    options: ["The paper's printing cost", "The document's legal value", "0 — documents have no commercial value", "Whatever the customer states"],
    correct: 2,
    explanation: "Internal documents have no commercial/resale value. Declared value = 0."
  },
  {
    id: "q17",
    category: "country_codes",
    question: "What is Brazil's DHL country code?",
    options: ["BZ", "BA", "BR", "BRA"],
    correct: 2,
    explanation: "BR is the ISO 3166-1 country code for Brazil (Brasil)."
  },
  {
    id: "q18",
    category: "general",
    question: "A fashion company sends 6 sample dresses to a London showroom for a fashion show. What is the shipment purpose?",
    options: ["GIFT", "SOLD", "COMMERCIAL_SAMPLE", "PERSONAL_USE"],
    correct: 2,
    explanation: "Samples sent for business evaluation or display (not for sale) are COMMERCIAL_SAMPLE."
  },
  {
    id: "q19",
    category: "customs",
    question: "What is the harmonized (HS) code for bottled wine?",
    options: ["2204.21", "6204", "8471.30", "6913"],
    correct: 0,
    explanation: "HS code 2204.21 covers wine of fresh grapes in containers of 2 liters or less (bottled wine)."
  },
  {
    id: "q20",
    category: "general",
    question: "A customer ships 2 boxes to Japan, each weighing 25 lbs. What total weight goes in the shipment form?",
    options: ["25 lbs (one box only)", "50 lbs (combined total)", "Either is acceptable", "Depends on the carrier service"],
    correct: 1,
    explanation: "Always enter the TOTAL combined weight of all pieces. 2 boxes × 25 lbs = 50 lbs."
  }
];
