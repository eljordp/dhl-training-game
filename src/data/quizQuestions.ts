import { QuizQuestion } from "@/types/quiz";

export const quizQuestions: QuizQuestion[] = [
  // ── BEGINNER (6) — Core CRA knowledge every employee needs day 1 ──
  {
    id: "q3",
    category: "document_vs_package",
    difficulty: "beginner",
    question: "What declared value should you enter for a DOCUMENT shipment (internal legal papers)?",
    options: ["The paper's printing cost", "The document's legal value", "0 — documents have no commercial value", "Whatever the customer states"],
    correct: 2,
    explanation: "Internal documents have no commercial/resale value. Declared value = 0."
  },
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
    id: "q7",
    category: "country_codes",
    difficulty: "beginner",
    question: "What is Australia's DHL country code?",
    options: ["AUS", "AS", "AU", "AT"],
    correct: 2,
    explanation: "AU is the ISO 3166-1 country code for Australia. (AT is Austria — don't confuse them!)"
  },
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
    id: "q19",
    category: "general",
    difficulty: "beginner",
    question: "A customer ships 2 boxes to Japan, each weighing 25 lbs. What total weight goes in the shipment form?",
    options: ["25 lbs (one box only)", "50 lbs (combined total)", "Either is acceptable", "Depends on the carrier service"],
    correct: 1,
    explanation: "Always enter the TOTAL combined weight of all pieces. 2 boxes × 25 lbs = 50 lbs."
  },
  {
    id: "s7",
    category: "scenarios",
    difficulty: "beginner",
    question: "You're filling out a shipment and realize the customer's home address in Chicago is the SHIPPER, not the consignee. The shipper country code should be:",
    options: ["Whatever country the package is going to", "US — the shipper is in Chicago", "The customer's nationality", "Leave blank — CRA fills it automatically"],
    correct: 1,
    explanation: "The SHIPPER is whoever is sending the package. If they're shipping FROM Chicago, the shipper country is US regardless of their nationality or destination."
  },

  // ── INTERMEDIATE (7) — Requires understanding how CRA fields interact ──
  {
    id: "q9",
    category: "country_codes",
    difficulty: "intermediate",
    question: "What is Colombia's DHL country code?",
    options: ["CL", "CB", "CM", "CO"],
    correct: 3,
    explanation: "CO is the country code for Colombia. CL is Chile — a very common mix-up."
  },
  {
    id: "q10",
    category: "service_types",
    difficulty: "intermediate",
    question: "A customer says their documents must arrive at the destination office by 9:00 AM. Which service do you select?",
    options: ["EXPRESS_WORLDWIDE", "EXPRESS_12:00", "ECONOMY_SELECT", "EXPRESS_9:00"],
    correct: 3,
    explanation: "EXPRESS_9:00 guarantees delivery by 9:00 AM on the next business day."
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
    id: "q18",
    category: "general",
    difficulty: "intermediate",
    question: "A fashion company sends 6 sample dresses to a London showroom for a fashion show. What is the shipment purpose?",
    options: ["GIFT", "SOLD", "COMMERCIAL_SAMPLE", "PERSONAL_USE"],
    correct: 2,
    explanation: "Samples sent for business evaluation or display (not for sale) are COMMERCIAL_SAMPLE."
  },
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
    id: "s3",
    category: "scenarios",
    difficulty: "intermediate",
    question: "A customer brings in an envelope with legal contracts to send to a law firm in Canada. They ask 'do I need to fill out a commercial invoice?' What do you tell them?",
    options: ["Yes, all international shipments need a commercial invoice", "No — select DOCUMENT as content type and the commercial invoice tab is not required", "Yes, but enter $0 value", "Only if the documents are notarized"],
    correct: 1,
    explanation: "Legal documents with no commercial value are DOCUMENT type. The Commercial Invoice tab locks automatically for DOCUMENT shipments — it's not needed."
  },
  {
    id: "a8_2",
    category: "scenarios",
    difficulty: "intermediate",
    question: "You're processing a shipment and the customer says the consignee's name is a company, but they also want to list a contact person. Where does the contact person's name go?",
    options: ["Replace the Company Name with the person's name", "Put the person's name in the Contact Name field — they are separate fields", "Add the person's name in Address Line 2", "It doesn't matter — either field works"],
    correct: 1,
    explanation: "Company Name and Contact Name are two distinct fields. Company Name is the business entity receiving the shipment. Contact Name is the specific person who should be contacted for delivery."
  },

  // ── ADVANCED (7) — Edge cases, gotchas, real-world traps ──
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
    id: "a1",
    category: "customs",
    difficulty: "advanced",
    question: "A customer ships a laptop manufactured in China from the US to Germany. What country of origin do you enter on the Commercial Invoice?",
    options: ["US — that's where it's shipping from", "DE — that's the destination", "CN — that's where the laptop was manufactured", "The brand's home country"],
    correct: 2,
    explanation: "Country of origin is ALWAYS where the product was manufactured, not where it's being shipped from or to. A Chinese-made laptop shipped from the US still has country of origin CN."
  },
  {
    id: "a2",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer wants to ship lithium batteries (spare, not installed in a device) to the UK. What should you do?",
    options: ["Process it normally — batteries are standard goods", "Check DHL's dangerous goods restrictions — loose lithium batteries have shipping restrictions", "Refuse the shipment entirely", "Ship it as DOCUMENT to avoid customs"],
    correct: 1,
    explanation: "Loose/spare lithium batteries are classified as dangerous goods and have strict shipping restrictions. You must check DHL's prohibited and restricted items list before accepting."
  },
  {
    id: "a3",
    category: "customs",
    difficulty: "advanced",
    question: "A customer declares a package value of $2,500 USD shipping to Brazil. They ask if the receiver will pay any extra fees. What do you tell them?",
    options: ["No — the shipping cost covers everything", "Yes — the receiver may owe import duties and taxes assessed by Brazilian customs", "Only if they chose the wrong service type", "Duties only apply above $5,000"],
    correct: 1,
    explanation: "Import duties and taxes are assessed by the destination country's customs authority. Brazil has high import duties. The RECEIVER pays these unless the shipper selects Duties/Taxes Paid (DTP)."
  },
  {
    id: "a4",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer is shipping car parts worth $3,200 to Nigeria. They hand you a commercial invoice they printed themselves. What do you do?",
    options: ["Use their printed invoice — it's already done", "Create one in the CRA system AND attach their invoice as supporting documentation", "Tell them their invoice is invalid", "Only use CRA if their invoice is missing info"],
    correct: 1,
    explanation: "You MUST always create the commercial invoice in the CRA system regardless of what the customer provides. Their printed invoice can be attached as supporting docs, but the CRA-generated invoice is what DHL and customs use."
  },
  {
    id: "a6",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer wants to ship a package to a PO Box address in Dubai, UAE. What do you tell them?",
    options: ["Process it normally with the PO Box address", "DHL Express does not deliver to PO Boxes — they need a physical street address", "Add the PO Box as Address Line 2 only", "Ship it but flag it for the destination facility"],
    correct: 1,
    explanation: "DHL Express requires a physical street address for delivery. PO Boxes cannot receive Express shipments. The customer must provide a physical address."
  },
  {
    id: "a7",
    category: "scenarios",
    difficulty: "advanced",
    question: "A customer ships a $50 t-shirt to Canada as a gift. They ask 'since it's a gift, there's no duty right?' What do you tell them?",
    options: ["Correct — gifts are always duty-free", "Not necessarily — each country has its own gift exemption threshold, and duties may still apply", "Gifts never have duties under $500", "Only commercial shipments have duties"],
    correct: 1,
    explanation: "Gift exemption thresholds vary by country. Canada's gift exemption is CAD $60 — above that, duties and taxes may apply. Never promise a customer that gifts are duty-free."
  },
];
