import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  // ── Document vs Package ──
  {
    id: "q1",
    category: "document_vs_package",
    difficulty: "beginner",
    question: "A customer says 'It's just paperwork — contracts and notarized letters, no commercial value.' What content type do you select?",
    options: ["PACKAGE", "DOCUMENT", "PARCEL", "ENVELOPE"],
    correct: 1,
    explanation: "Documents have no commercial value and do not require a Commercial Invoice. Always select DOCUMENT for paperwork."
  },
  {
    id: "q2",
    category: "document_vs_package",
    difficulty: "beginner",
    question: "When is a Commercial Invoice NOT required?",
    options: ["When shipping to Mexico", "When the package is under $100", "When shipping DOCUMENTS", "When the customer is a private individual"],
    correct: 2,
    explanation: "DOCUMENT shipments skip the Commercial Invoice tab entirely. It is only required for PACKAGE content type."
  },
  {
    id: "q3",
    category: "document_vs_package",
    difficulty: "intermediate",
    question: "What declared value should you enter for a DOCUMENT shipment (internal legal papers)?",
    options: ["The paper's printing cost", "The document's legal value", "0 — documents have no commercial value", "Whatever the customer states"],
    correct: 2,
    explanation: "Internal documents have no commercial/resale value. Declared value = 0."
  },

  // ── Country Codes (6 total) ──
  {
    id: "q4",
    category: "country_codes",
    difficulty: "beginner",
    question: "What is Germany's DHL country code?",
    options: ["GE", "GM", "DE", "GR"],
    correct: 2,
    explanation: "DE is the ISO 3166-1 country code for Germany (Deutschland)."
  },
  {
    id: "q5",
    category: "country_codes",
    difficulty: "beginner",
    question: "What is Japan's DHL country code?",
    options: ["JA", "JP", "JPN", "JN"],
    correct: 1,
    explanation: "JP is the ISO 3166-1 country code for Japan."
  },
  {
    id: "q6",
    category: "country_codes",
    difficulty: "intermediate",
    question: "What is the United Kingdom's DHL country code?",
    options: ["UK", "EN", "GB", "BR"],
    correct: 2,
    explanation: "GB (Great Britain) is the ISO 3166-1 country code for the United Kingdom."
  },
  {
    id: "q7",
    category: "country_codes",
    difficulty: "intermediate",
    question: "What is Australia's DHL country code?",
    options: ["AUS", "AS", "AU", "AT"],
    correct: 2,
    explanation: "AU is the ISO 3166-1 country code for Australia. (AT is Austria — don't confuse them!)"
  },
  {
    id: "q8",
    category: "country_codes",
    difficulty: "beginner",
    question: "What is Canada's DHL country code?",
    options: ["CN", "CAN", "CA", "CD"],
    correct: 2,
    explanation: "CA is the ISO 3166-1 country code for Canada. (CN is China — easy mix-up!)"
  },
  {
    id: "q9",
    category: "country_codes",
    difficulty: "intermediate",
    question: "What is Colombia's DHL country code?",
    options: ["CL", "CB", "CM", "CO"],
    correct: 3,
    explanation: "CO is the country code for Colombia. CL is Chile — a very common mix-up."
  },

  // ── Service Types ──
  {
    id: "q10",
    category: "service_types",
    difficulty: "intermediate",
    question: "A customer says their documents must arrive at the destination office by 9:00 AM. Which service do you select?",
    options: ["EXPRESS_WORLDWIDE", "EXPRESS_12:00", "ECONOMY_SELECT", "EXPRESS_9:00"],
    correct: 3,
    explanation: "EXPRESS_9:00 guarantees delivery by 9:00 AM on the next business day."
  },

  // ── Customs & HS Codes ──
  {
    id: "q11",
    category: "customs",
    difficulty: "beginner",
    question: "A customer ships engine parts to Brazil. Is customs documentation required?",
    options: ["Only if value exceeds $1,000", "Yes — all international shipments require customs", "No — industrial parts are exempt", "Only if declared value exceeds $5,000"],
    correct: 1,
    explanation: "ALL international shipments require customs documentation regardless of value or content type."
  },
  {
    id: "q12",
    category: "customs",
    difficulty: "intermediate",
    question: "A customer ships 12 bottles of California wine to Sydney, Australia. What is the country of origin?",
    options: ["AU", "FR", "US", "Depends on the grape variety"],
    correct: 2,
    explanation: "Country of origin is where the product was MADE, not where it is being shipped from or to. California wine = US."
  },
  {
    id: "q13",
    category: "customs",
    difficulty: "advanced",
    question: "What harmonized (HS) code covers women's dresses and garments?",
    options: ["8409.99", "6204", "2204.21", "6913"],
    correct: 1,
    explanation: "HS code 6204 covers women's suits, ensembles, dresses, and similar garment articles."
  },
  {
    id: "q14",
    category: "customs",
    difficulty: "advanced",
    question: "What is the harmonized (HS) code for bottled wine?",
    options: ["2204.21", "6204", "8471.30", "6913"],
    correct: 0,
    explanation: "HS code 2204.21 covers wine of fresh grapes in containers of 2 liters or less (bottled wine)."
  },

  // ── General Knowledge ──
  {
    id: "q15",
    category: "general",
    difficulty: "beginner",
    question: "A customer brings 2 separate boxes to ship to Japan. What number goes in 'Number of Pieces'?",
    options: ["1", "2", "The total item count inside the boxes", "Leave blank"],
    correct: 1,
    explanation: "Number of Pieces refers to the number of physical boxes/parcels, not items inside. The customer has 2 boxes = 2 pieces."
  },
  {
    id: "q16",
    category: "general",
    difficulty: "beginner",
    question: "What does 'Declared Value' represent in the CRA form?",
    options: ["The shipping cost", "The market value of the goods being shipped", "The customs duty amount", "The insurance payout amount"],
    correct: 1,
    explanation: "Declared Value is the market value of the goods. This is used to calculate duties/taxes and insurance."
  },
  {
    id: "q17",
    category: "general",
    difficulty: "beginner",
    question: "A customer is sending a birthday present to their mother in Mexico. What is the shipment purpose?",
    options: ["SOLD", "PERSONAL_USE", "GIFT", "COMMERCIAL_SAMPLE"],
    correct: 2,
    explanation: "A birthday present is a GIFT. This affects customs treatment and duty exemptions in many countries."
  },
  {
    id: "q18",
    category: "general",
    difficulty: "intermediate",
    question: "A fashion company sends 6 sample dresses to a London showroom for a fashion show. What is the shipment purpose?",
    options: ["GIFT", "SOLD", "COMMERCIAL_SAMPLE", "PERSONAL_USE"],
    correct: 2,
    explanation: "Samples sent for business evaluation or display (not for sale) are COMMERCIAL_SAMPLE."
  },
  {
    id: "q19",
    category: "general",
    difficulty: "intermediate",
    question: "A customer ships 2 boxes to Japan, each weighing 25 lbs. What total weight goes in the shipment form?",
    options: ["25 lbs (one box only)", "50 lbs (combined total)", "Either is acceptable", "Depends on the carrier service"],
    correct: 1,
    explanation: "Always enter the TOTAL combined weight of all pieces. 2 boxes × 25 lbs = 50 lbs."
  },

  // ── Scenarios (NEW) ──
  {
    id: "s1",
    category: "scenarios",
    difficulty: "intermediate",
    question: "A customer walks in with a box of used clothes for their mother in Guatemala. They say 'these are just old clothes, they're not worth anything.' What declared value should you enter?",
    options: ["$0 — customer says worthless", "Ask the customer for a fair market value estimate", "Enter $1 as a placeholder", "Skip declared value for used items"],
    correct: 1,
    explanation: "Even used items have market value. You MUST ask the customer to estimate the fair market value. Entering $0 for physical goods can cause customs issues."
  },
  {
    id: "s2",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer gives you a phone number +52-555-1234 for a Mexico shipment. The CRA form shows +1 as the country code prefix. What do you do?",
    options: ["Enter the full number including +52", "Remove the +52 and just enter 555-1234 since CRA adds the prefix", "Change the destination country to fix the prefix", "Tell the customer the number is wrong"],
    correct: 1,
    explanation: "The CRA auto-adds the country code prefix based on the destination country. Enter only the local number without the country code — the system handles the prefix."
  },
  {
    id: "s3",
    category: "scenarios",
    difficulty: "intermediate",
    question: "A customer brings in an envelope with legal contracts to send to a law firm in Canada. They ask 'do I need to fill out a commercial invoice?' What do you tell them?",
    options: ["Yes, all international shipments need a commercial invoice", "No — select DOCUMENT as content type and the commercial invoice tab is not required", "Yes, but enter $0 value", "Only if the documents are notarized"],
    correct: 1,
    explanation: "Legal documents with no commercial value are DOCUMENT type. The Commercial Invoice tab locks automatically for DOCUMENT shipments — it's not needed."
  },
  {
    id: "s4",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer ships a package to a DHL Express Service Point in Mexico (not a home address). Should you check the 'Residential Address' box?",
    options: ["Yes — it's going to Mexico", "No — a DHL Service Point is a business location, not residential", "Yes — the final recipient lives at a house", "Only if the package weighs over 10 lbs"],
    correct: 1,
    explanation: "Residential Address refers to the DELIVERY address, not the recipient's home. A DHL Service Point is a commercial/business location — do NOT check residential."
  },
  {
    id: "s5",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer wants to send electronics (a tablet worth $500) and clothing ($150) in ONE box to Colombia. How many items do you add in the Commercial Invoice?",
    options: ["1 item — it's one box", "2 items — electronics and clothing are different commodity types", "It doesn't matter as long as the total value is correct", "3 items — tablet, charger, and clothing"],
    correct: 1,
    explanation: "Different product types need separate line items on the Commercial Invoice because they have different HS codes. Electronics (8471.30) and clothing (6110) must be listed separately."
  },
  {
    id: "s6",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer says 'I need this there by tomorrow morning, 9 AM.' The destination is Amman, Jordan. What do you check first?",
    options: ["Select EXPRESS_9:00 immediately", "Check if EXPRESS_9:00 service is available to Jordan", "Tell them it's impossible for international", "Select EXPRESS_WORLDWIDE and hope for the best"],
    correct: 1,
    explanation: "Not all services are available to all destinations. EXPRESS_9:00 is only available in select markets. Always verify service availability for the destination before promising delivery times."
  },
  {
    id: "s7",
    category: "scenarios",
    difficulty: "intermediate",
    question: "You're filling out a shipment and realize the customer's home address in Chicago is the SHIPPER, not the consignee. The shipper country code should be:",
    options: ["Whatever country the package is going to", "US — the shipper is in Chicago", "The customer's nationality", "Leave blank — CRA fills it automatically"],
    correct: 1,
    explanation: "The SHIPPER is whoever is sending the package. If they're shipping FROM Chicago, the shipper country is US regardless of their nationality or destination."
  },
  {
    id: "s8",
    category: "scenarios",
    difficulty: "intermediate",
    question: "A customer brings 3 separate boxes, all going to the same address in the Philippines. Each box weighs 10 lbs. What do you enter for pieces and weight?",
    options: ["Pieces: 1, Weight: 30 lbs", "Pieces: 3, Weight: 10 lbs", "Pieces: 3, Weight: 30 lbs", "Create 3 separate shipments"],
    correct: 2,
    explanation: "Number of Pieces = number of physical boxes (3). Weight = total combined weight of ALL pieces (3 × 10 = 30 lbs)."
  },
];
