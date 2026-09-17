export type AssessmentTier = "fundamentals" | "operations" | "expert" | "scenarios";

export interface AssessmentQuestion {
  id: string;
  tier: AssessmentTier;
  tierNumber: number; // 1, 2, 3, or 4 (bonus)
  question: string;
  answerKey: string[]; // bullet points of the correct answer
  warningNote?: string; // Context, not an extra scored requirement
  sources?: string[];
}

export const assessmentQuestions: AssessmentQuestion[] = [
  // ══════════════════════════════════════════════════
  // TIER 1 — FUNDAMENTALS (10)
  // ══════════════════════════════════════════════════
  {
    id: "t1-1",
    tier: "fundamentals",
    tierNumber: 1,
    question: "When does DHL classify a shipment as DOC vs NON-DOC, and what's the financial impact of misclassification?",
    answerKey: [
      "Documents are eligible paperwork without commercial value; check destination classification rules.",
      "Goods and merchandise are non-document shipments and need accurate customs information.",
      "Wrong classification can cause clearance delays, corrected charges or penalties."
    ],
    warningNote: "Misclassifying = customs delays, re-billing, penalties",
  },
  {
    id: "t1-2",
    sources: ["https://support.dhlexpresscommerce.com/hc/en-gb/articles/900003468466-Setup-DHL-Express"],
    tier: "fundamentals",
    tierNumber: 1,
    question: "Explain DOX, WPX and ECX, and how you verify which service is available for a shipment.",
    answerKey: [
      "DOX is the document product; WPX is the parcel/non-document Express Worldwide product in the applicable system.",
      "ECX is Express Worldwide within the European Union, not Economy Select.",
      "Check the current DHL product guide or booking system for the origin, destination and delivery commitment."
    ],
    warningNote: "Product codes and availability depend on the system and shipping lane. Do not guess the meaning of an unfamiliar code.",
  },
  {
    id: "t1-3",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What happens if shipper and payer are different, but the payer account is invalid?",
    answerKey: [
      "An invalid payer account can stop processing, delay movement or cause charges to be billed back to the shipper.",
      "Verify the payer account and obtain an authorized valid payment arrangement before processing."
    ],
  },
  {
    id: "t1-4",
    sources: ["https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf"],
    tier: "fundamentals",
    tierNumber: 1,
    question: "What is the exact difference between declared value for carriage vs customs value?",
    answerKey: [
      "Carriage value concerns carrier liability or optional shipment protection for loss or damage, subject to the terms.",
      "Customs value is used for customs assessment, including duties and taxes."
    ],
    warningNote: "Declaring a value does not automatically purchase insurance. Customs value and coverage are different concepts.",
  },
  {
    id: "t1-5",
    tier: "fundamentals",
    tierNumber: 1,
    question: "A shipment is under 0.5kg — why might it still be rated at a higher weight?",
    answerKey: [
      "Chargeable weight can exceed scale weight because dimensional weight is based on package size.",
      "DHL compares actual and volumetric weight and uses the higher weight, subject to applicable rounding and minimums."
    ],
  },
  {
    id: "t1-6",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What triggers a remote area surcharge, and how do you verify it before shipping?",
    answerKey: [
      "Triggered by destination ZIP/postal code in remote zones",
      "Verified via DHL system lookup before quoting",
    ],
    warningNote: "Must check BEFORE quoting the customer",
  },
  {
    id: "t1-7",
    tier: "fundamentals",
    tierNumber: 1,
    question: "A customer requests delivery without a signature. What must you check before agreeing?",
    answerKey: [
      "Check whether signature release is offered for this shipment, destination and service, including shipper restrictions.",
      "Do not override a mandatory signature requirement; confirm with DHL if eligibility is unclear."
    ],
    warningNote: "Do not assume that every high-value or dangerous-goods shipment has the same release rule.",
  },
  {
    id: "t1-8",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What are the risks of using a personal name instead of a company name on a commercial shipment?",
    answerKey: [
      "Using a person instead of the legal business can create a mismatch with the importer, tax ID or invoice.",
      "Use the correct legal consignee/company and a separate contact person to reduce identification and clearance delays."
    ],
  },
  {
    id: "t1-9",
    tier: "fundamentals",
    tierNumber: 1,
    question: "Explain how dimensional weight overrides actual weight. What's the formula?",
    answerKey: [
      "Chargeable weight is the higher of actual and volumetric weight.",
      "For the applicable DHL Express calculation: length × width × height in centimetres divided by 5000 gives kilograms."
    ],    warningNote: "An example can help explain this, but no particular box dimensions or wording are required.",
  },
  {
    id: "t1-10",
    sources: ["https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf"],
    tier: "fundamentals",
    tierNumber: 1,
    question: "Why is a missing phone number more serious than most employees think?",
    answerKey: [
      "A reachable receiver number helps DHL or customs obtain clearance information.",
      "It also supports delivery arrangements and resolving delivery problems.",
      "Without contact details a shipment may be delayed, undeliverable or returned."
    ],
  },

  // ══════════════════════════════════════════════════
  // TIER 2 — OPERATIONS + COMPLIANCE (10)
  // ══════════════════════════════════════════════════
  {
    id: "t2-1",
    tier: "operations",
    tierNumber: 2,
    question: "Customer says 'sample, no value' — what do you enter and why?",
    answerKey: [
      "Do not enter zero merely because goods are a free sample.",
      "Obtain a supportable value for customs and describe the sample accurately."
    ],    warningNote: "Do not invent a token value such as $5 or $20. Verify the appropriate valuation for the actual goods.",
  },
  {
    id: "t2-2",
    sources: ["https://www.dhl.com/discover/zh-tw/ship-with-dhl/export-with-dhl/saudi-arabia-regulatory", "https://rulebook.sama.gov.sa/en/providing-postal-service-providers-national-address"],
    tier: "operations",
    tierNumber: 2,
    question: "Before accepting goods for Saudi Arabia, what address, contact and customs information do you verify?",
    answerKey: [
      "Verify the required Saudi National Address or Short Address Code.",
      "Obtain a reachable receiver phone number and any required importer ID or business registration.",
      "Check the item descriptions, accurate customs invoice values and current destination requirements."
    ],
  },
  {
    id: "t2-3",
    tier: "operations",
    tierNumber: 2,
    question: "Multi-piece shipment (3 boxes) — one box has different content. How do you invoice and declare it?",
    answerKey: [
      "List distinct commodities on separate invoice lines rather than a single combined description.",
      "Include accurate descriptions, quantities, values, origin and appropriate tariff classification for the goods."
    ],    warningNote: "Different boxes alone do not require different HS codes; classification follows the actual goods.",
  },
  {
    id: "t2-4",
    tier: "operations",
    tierNumber: 2,
    question: "Customer intentionally undervalues goods — what are your responsibilities?",
    answerKey: [
      "Explain the risks of false values, such as customs holds, seizure or penalties.",
      "Require accurate values; do not knowingly process an intentionally false declaration."
    ],
  },
  {
    id: "t2-5",
    tier: "operations",
    tierNumber: 2,
    question: "When does country of origin NOT equal where it shipped from?",
    answerKey: [
      "Origin concerns where goods were produced or manufactured under the applicable origin rules.",
      "A warehouse or dispatch country is not automatically the country of origin."
    ],    warningNote: "Any valid example is acceptable. Substantial transformation and product-specific origin rules may matter.",
  },
  {
    id: "t2-6",
    tier: "operations",
    tierNumber: 2,
    question: "Name common issues that can trigger customs questions or inspection. Is inspection always predictable?",
    answerKey: [
      "Suspicious values or vague descriptions can prompt scrutiny.",
      "Inconsistent shipment data or missing required information can cause clearance checks.",
      "Customs can also select shipments for inspection independently; no clearance guarantee is possible."
    ],
  },
  {
    id: "t2-7",
    tier: "operations",
    tierNumber: 2,
    question: "Explain the difference between Importer of Record and Receiver.",
    answerKey: [
      "Receiver: The person/company who physically gets the package",
      "Importer of Record: The entity legally responsible for customs clearance, duties, and compliance",
      "They can be different people/entities",
    ],
  },
  {
    id: "t2-8",
    tier: "operations",
    tierNumber: 2,
    question: "When is a shipment considered dangerous goods even if the customer says it's not?",
    answerKey: [
      "Contents such as lithium batteries, flammable perfume or aerosols may be regulated dangerous goods.",
      "Verify the actual contents and applicable dangerous-goods acceptance requirements rather than relying on the customer’s assurance."
    ],    warningNote: "Classification depends on the actual product and transport rules; not every liquid or electronic item has the same requirements.",
  },
  {
    id: "t2-9",
    sources: ["https://mydhl.express.dhl/br/pt/shipment/service-type.html"],
    tier: "operations",
    tierNumber: 2,
    question: "For a goods shipment to Brazil, what can be missing even when the delivery address looks correct?",
    answerKey: [
      "Verify the receiver’s valid CPF for an individual or CNPJ for a company.",
      "Check a detailed accurate customs invoice and current import requirements."
    ],    warningNote: "Missing or invalid information can block clearance; do not promise a particular customs outcome.",
  },
  {
    id: "t2-10",
    sources: ["https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf"],
    tier: "operations",
    tierNumber: 2,
    question: "PO Box entered for international shipment — what happens operationally?",
    answerKey: [
      "DHL Express needs a deliverable physical street address, not just a PO Box.",
      "Obtain the correct address before processing to avoid a hold, failed delivery or return."
    ],
  },

  // ══════════════════════════════════════════════════
  // TIER 3 — EXPERT LEVEL (10)
  // ══════════════════════════════════════════════════
  {
    id: "t3-1",
    tier: "expert",
    tierNumber: 3,
    question: "The AWB customs value is $50 and the invoice customs value is $500 for the same goods. What is the problem and what do you do?",
    answerKey: [
      "Conflicting customs values can trigger a hold, inspection or an undervaluation query.",
      "Confirm the true goods value and correct the conflicting records before proceeding."
    ],    warningNote: "This question compares two customs values, not customs value against separate insurance coverage.",
  },
  {
    id: "t3-2",
    tier: "expert",
    tierNumber: 3,
    question: "There are 10 identical items. The invoice says quantity 1 and value $100, without saying whether that is unit or total value. What do you check and correct?",
    answerKey: [
      "Correct the quantity to 10 and clarify whether $100 is the unit price or the total.",
      "Use accurate unit and total values; the mismatch can cause incorrect duties, delays or penalties."
    ],    warningNote: "If $100 is each, the total is $1,000. If $100 is the total, do not invent a $1,000 value.",
  },
  {
    id: "t3-3",
    tier: "expert",
    tierNumber: 3,
    question: "Shipment stuck in customs — customer calls angry. What 3 things do you check BEFORE escalating to DHL?",
    answerKey: [
      "1. Invoice accuracy — values, descriptions, HS codes correct?",
      "2. Receiver contact info — phone number provided and valid?",
      "3. Country-specific requirements met — tax IDs, licenses, certifications?",
    ],
  },
  {
    id: "t3-4",
    tier: "expert",
    tierNumber: 3,
    question: "When does DHL refuse a shipment even after pickup?",
    answerKey: [
      "Undeclared or unacceptable dangerous goods, prohibited contents or sanctions issues can stop transport.",
      "False declarations, inadequate documents or unsafe packaging can also cause rejection."
    ],    warningNote: "Pickup does not guarantee final acceptance or customs clearance.",
  },
  {
    id: "t3-5",
    sources: ["https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf"],
    tier: "expert",
    tierNumber: 3,
    question: "Explain how duties & taxes payer selection affects delivery speed.",
    answerKey: [
      "Receiver-paid duties can delay clearance or delivery while payment or contact is outstanding.",
      "A valid shipper-paid duties arrangement can avoid waiting for the receiver’s payment."
    ],    warningNote: "Payment arrangements do not guarantee faster customs inspection or clearance.",
  },
  {
    id: "t3-6",
    sources: ["https://www.cbsa-asfc.gc.ca/import/courier/menu-eng.html"],
    tier: "expert",
    tierNumber: 3,
    question: "Why do shipments marked as 'gift' still get taxed?",
    answerKey: [
      "Gift status does not automatically remove import duties or taxes.",
      "Exemptions depend on destination rules, eligibility and value limits."
    ],    warningNote: "For an eligible Canadian gift above CAD $60, applicable duties/taxes are generally assessed on the excess over CAD $60, not automatically the full value. Check current destination rules.",
  },
  {
    id: "t3-7",
    tier: "expert",
    tierNumber: 3,
    question: "What's the risk of shipping electronics without proper description?",
    answerKey: [
      "Describe the actual device specifically, including relevant battery details.",
      "Vague descriptions can prevent correct customs or dangerous-goods checks and cause holds."
    ],
    warningNote: "No particular device example is required.",
  },
  {
    id: "t3-8",
    sources: ["https://mydhlplus.dhl.com/content/dam/downloads/global/en/t-c/terms_conditions_of_carriage_en-2024.pdf.coredownload.pdf"],
    tier: "expert",
    tierNumber: 3,
    question: "A shipment is returned — who pays and why?",
    answerKey: [
      "The shipper is generally responsible for return costs under the carriage terms.",
      "Returns may follow receiver refusal, nonpayment, an undeliverable address or clearance problems."
    ],    warningNote: "Confirm the reason and applicable terms before promising a refund or quoting return charges.",
  },
  {
    id: "t3-9",
    tier: "expert",
    tierNumber: 3,
    question: "Customer uses wrong HS code intentionally — what happens legally and operationally?",
    answerKey: [
      "Knowingly using a false HS code can be a customs compliance or fraud issue.",
      "Possible consequences include holds, duty reassessment, seizure or penalties; do not knowingly process the false declaration."
    ],    warningNote: "The actual legal outcome depends on the jurisdiction and facts.",
  },
  {
    id: "t3-10",
    tier: "expert",
    tierNumber: 3,
    question: "Give five common preventable causes of international shipment problems.",
    answerKey: [
      "Inaccurate or incomplete invoice, goods description, quantities or value.",
      "Missing or incorrect receiver address or contact information.",
      "Missing destination documents, importer IDs or permits.",
      "Prohibited/restricted goods or undeclared dangerous goods.",
      "Unpaid duties or receiver refusal/nonresponse."
    ],    warningNote: "These are training examples, not a claimed ranking from DHL operational statistics.",
  },

  // ══════════════════════════════════════════════════
  // BONUS — LIVE SCENARIOS (7)
  // ══════════════════════════════════════════════════
  {
    id: "sc-1",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer says: 'Just put $20, it's actually $200 but I don't want taxes.' How do you respond?",
    answerKey: [
      "Require the actual value and refuse the requested false declaration.",
      "Explain the risk professionally, such as holds, fines or seizure."
    ],
    warningNote: "Escalate unresolved intentional false declarations according to the location’s procedure.",
  },
  {
    id: "sc-2",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer says: 'It's just stuff.' How do you get a proper description?",
    answerKey: [
      "Ask what each item is, its material and its intended use; obtain a specific description.",
      "Do not guess or accept a vague description such as “stuff”."
    ],
  },
  {
    id: "sc-3",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer says: 'It's just a gift' — but there's perfume inside. What do you do?",
    answerKey: [
      "Identify the actual perfume as potentially flammable dangerous goods; “gift” does not decide classification.",
      "Pause normal processing and check acceptance with trained staff; refuse if it cannot be shipped compliantly."
    ],
  },
  {
    id: "sc-4",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer doesn't want to give receiver's phone number. What do you say?",
    answerKey: [
      "Request a valid receiver phone number and explain its role in clearance or delivery.",
      "Explain the risk of delays or returns and pause if required contact information cannot be obtained."
    ],
  },
  {
    id: "sc-5",
    sources: ["https://mydhl.express.dhl/br/pt/shipment/service-type.html"],
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer is shipping to Brazil. What do you need to ask for specifically?",
    answerKey: [
      "Ask for a valid receiver CPF (individual) or CNPJ (company), as applicable.",
      "Explain that missing required identification can prevent clearance."
    ],
  },
  {
    id: "sc-6",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer calls angry: 'Why is my package stuck?!' How do you handle it?",
    answerKey: [
      "Check the shipment status and relevant documents or receiver information to find the cause.",
      "Respond calmly and explain the next action, escalating based on verified information."
    ],
  },
  {
    id: "sc-7",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer insists: 'It always worked before' but shipment is non-compliant. What do you say?",
    answerKey: [
      "Follow the current applicable requirements and do not knowingly accept the non-compliant shipment.",
      "Explain that previous successful delivery does not prove compliance or guarantee acceptance now."
    ],
  },
];

export const TIER_CONFIG: Record<AssessmentTier, { label: string; number: number; color: string; bgColor: string; borderColor: string; description: string }> = {
  fundamentals: {
    label: "Tier 1 — Fundamentals",
    number: 1,
    color: "text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
    description: "Classification, values, weight and delivery requirements.",
  },
  operations: {
    label: "Tier 2 — Operations & Compliance",
    number: 2,
    color: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    description: "Customs documentation, destination checks and safe acceptance.",
  },
  expert: {
    label: "Tier 3 — Expert Level",
    number: 3,
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
    description: "Resolve ambiguous details and explain operational consequences.",
  },
  scenarios: {
    label: "Bonus — Live Scenarios",
    number: 4,
    color: "text-purple-800",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    description: "Real in-store situations. How do you respond?",
  },
};
