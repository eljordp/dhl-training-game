export type AssessmentTier = "fundamentals" | "operations" | "expert" | "scenarios";

export interface AssessmentQuestion {
  id: string;
  tier: AssessmentTier;
  tierNumber: number; // 1, 2, 3, or 4 (bonus)
  question: string;
  answerKey: string[]; // bullet points of the correct answer
  warningNote?: string; // ⚠️ risk/impact note
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
      "DOC (DOX): Paper only, no commercial value (contracts, passports)",
      "NON-DOC (WPX/EXP): Anything with value or goods",
    ],
    warningNote: "Misclassifying = customs delays, re-billing, penalties",
  },
  {
    id: "t1-2",
    tier: "fundamentals",
    tierNumber: 1,
    question: "Explain when to use each service type: WPX, DOX, EXP, ECX",
    answerKey: [
      "DOX: Documents only",
      "WPX: Worldwide Parcel Express (default non-doc)",
      "EXP: Time-definite express",
      "ECX: Economy (slower, cheaper)",
    ],
    warningNote: "Wrong service = pricing + transit failure",
  },
  {
    id: "t1-3",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What happens if shipper and payer are different, but the payer account is invalid?",
    answerKey: [
      "Shipment gets held or re-billed to shipper",
      "Can delay movement instantly",
    ],
  },
  {
    id: "t1-4",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What is the exact difference between declared value for carriage vs customs value?",
    answerKey: [
      "Declared value (carriage): DHL liability coverage",
      "Customs value: Used for duties/taxes calculation",
    ],
    warningNote: "Must match logically or shipment gets flagged",
  },
  {
    id: "t1-5",
    tier: "fundamentals",
    tierNumber: 1,
    question: "A shipment is under 0.5kg — why might it still be rated at a higher weight?",
    answerKey: [
      "Due to dimensional (volumetric) weight",
      "Formula: (L × W × H in cm) ÷ 5000",
      "DHL charges whichever is higher: actual vs volumetric",
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
    question: "When is signature release NOT allowed, even if customer requests it?",
    answerKey: [
      "High-value shipments",
      "Certain countries with strict delivery rules",
      "Dangerous goods shipments",
    ],
    warningNote: "Liability issue — releasing without signature can make DHL responsible",
  },
  {
    id: "t1-8",
    tier: "fundamentals",
    tierNumber: 1,
    question: "What are the risks of using a personal name instead of a company name on a commercial shipment?",
    answerKey: [
      "Company name improves customs clearance speed",
      "Personal name may cause delays and ID verification issues",
      "Some countries require company name for commercial imports",
    ],
  },
  {
    id: "t1-9",
    tier: "fundamentals",
    tierNumber: 1,
    question: "Explain how dimensional weight overrides actual weight. What's the formula?",
    answerKey: [
      "DHL charges whichever is higher: actual weight vs volumetric weight",
      "Formula: (L × W × H in cm) ÷ 5000",
      "A large but light box can cost more than a small heavy one",
    ],
  },
  {
    id: "t1-10",
    tier: "fundamentals",
    tierNumber: 1,
    question: "Why is a missing phone number more serious than most employees think?",
    answerKey: [
      "Critical for customs contact during clearance",
      "Required for delivery coordination and scheduling",
      "Missing number = delays, failed delivery, or returns",
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
      "NEVER enter $0 for physical goods",
      "Must declare fair market value (even $5–$20 for samples)",
      "Customs requires a declared value for all goods",
    ],
  },
  {
    id: "t2-2",
    tier: "operations",
    tierNumber: 2,
    question: "Shipment to Saudi Arabia — what 3 things must NEVER be missing?",
    answerKey: [
      "Accurate, detailed description of contents",
      "Commercial invoice with correct values",
      "Receiver phone number",
      "Often also requires receiver ID or company registration info",
    ],
  },
  {
    id: "t2-3",
    tier: "operations",
    tierNumber: 2,
    question: "Multi-piece shipment (3 boxes) — one box has different content. How do you invoice and declare it?",
    answerKey: [
      "Must list each item type separately on the commercial invoice",
      "NOT one combined description — different HS codes, different lines",
      "Each line needs: description, quantity, value, country of origin",
    ],
  },
  {
    id: "t2-4",
    tier: "operations",
    tierNumber: 2,
    question: "Customer intentionally undervalues goods — what are your responsibilities?",
    answerKey: [
      "Warn the customer about consequences (seizure, fines)",
      "Refuse to process if clearly fraudulent",
      "You have legal liability — DHL compliance requires accurate declarations",
    ],
  },
  {
    id: "t2-5",
    tier: "operations",
    tierNumber: 2,
    question: "When does country of origin NOT equal where it shipped from?",
    answerKey: [
      "Country of origin = where item was manufactured",
      "NOT where it's being shipped from",
      "Example: Chinese-made laptop shipped from US → origin is CN",
    ],
  },
  {
    id: "t2-6",
    tier: "operations",
    tierNumber: 2,
    question: "What causes a shipment to be flagged by customs inspection automatically?",
    answerKey: [
      "Low declared value relative to item type",
      "Vague descriptions ('gift', 'sample', 'stuff')",
      "Data mismatches between AWB and invoice",
      "High-risk country routes",
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
      "Perfume/cologne (flammable — contains alcohol)",
      "Lithium batteries (loose or in devices)",
      "Aerosol sprays, nail polish, certain liquids",
      "Must identify DG even if customer doesn't know or disclose",
    ],
  },
  {
    id: "t2-9",
    tier: "operations",
    tierNumber: 2,
    question: "Why do shipments to Brazil fail frequently even when info looks correct?",
    answerKey: [
      "Brazil requires CPF (individual) or CNPJ (company) tax ID",
      "Must have detailed commercial invoice with specific item descriptions",
      "Missing tax ID = automatic customs rejection",
    ],
  },
  {
    id: "t2-10",
    tier: "operations",
    tierNumber: 2,
    question: "PO Box entered for international shipment — what happens operationally?",
    answerKey: [
      "DHL Express requires a physical street address",
      "PO Box = delivery failure",
      "Must get physical address before processing",
    ],
  },

  // ══════════════════════════════════════════════════
  // TIER 3 — EXPERT LEVEL (10)
  // ══════════════════════════════════════════════════
  {
    id: "t3-1",
    tier: "expert",
    tierNumber: 3,
    question: "AWB shows $50 declared value, but the invoice shows $500 — what happens?",
    answerKey: [
      "Triggers customs hold due to data mismatch",
      "Considered suspicious — potential fraud flag",
      "Shipment will not clear until discrepancy is resolved",
    ],
  },
  {
    id: "t3-2",
    tier: "expert",
    tierNumber: 3,
    question: "Customer ships 10 identical items but lists Qty: 1, Value: $100. What problem does this cause?",
    answerKey: [
      "Incorrect duties calculation (should be 10 × $100 = $1,000 total)",
      "Risk of customs seizure for misrepresentation",
      "Potential fines for both shipper and carrier",
    ],
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
      "Dangerous goods discovered during processing",
      "Compliance violation (prohibited items, sanctions)",
      "Fraud suspicion (false declarations, undervaluation)",
    ],
  },
  {
    id: "t3-5",
    tier: "expert",
    tierNumber: 3,
    question: "Explain how duties & taxes payer selection affects delivery speed.",
    answerKey: [
      "If duties unpaid or payer unclear → shipment held at customs",
      "Receiver refusal to pay → return shipment (shipper pays return)",
      "DTP (Duties/Taxes Paid by shipper) = fastest clearance",
    ],
  },
  {
    id: "t3-6",
    tier: "expert",
    tierNumber: 3,
    question: "Why do shipments marked as 'gift' still get taxed?",
    answerKey: [
      "Countries have gift exemption thresholds (varies by country)",
      "Over threshold = full duties and taxes apply",
      "Example: Canada CAD $60, EU €45 — above that, taxed like any import",
    ],
  },
  {
    id: "t3-7",
    tier: "expert",
    tierNumber: 3,
    question: "What's the risk of shipping electronics without proper description?",
    answerKey: [
      "'Electronics' is too vague — must specify exact item",
      "Example: 'mobile phone, lithium battery included' not just 'electronics'",
      "Vague descriptions trigger customs holds and DG screening",
    ],
    warningNote: "Compliance + safety violation risk",
  },
  {
    id: "t3-8",
    tier: "expert",
    tierNumber: 3,
    question: "A shipment is returned — who pays and why?",
    answerKey: [
      "Usually the shipper pays for return shipping",
      "Common causes: refused by receiver, failed customs, wrong address",
      "Return costs can exceed original shipping cost",
    ],
  },
  {
    id: "t3-9",
    tier: "expert",
    tierNumber: 3,
    question: "Customer uses wrong HS code intentionally — what happens legally and operationally?",
    answerKey: [
      "Legal violation — customs fraud",
      "Goods can be seized by customs",
      "Fines issued to shipper, potentially to carrier",
      "Criminal charges possible for repeat offenders",
    ],
  },
  {
    id: "t3-10",
    tier: "expert",
    tierNumber: 3,
    question: "What are the top 5 reasons shipments fail internationally, based on real DHL operations?",
    answerKey: [
      "1. Bad or incomplete commercial invoice",
      "2. Wrong or underreported declared value",
      "3. Missing receiver contact info (phone/email)",
      "4. Restricted or prohibited items not identified",
      "5. Country-specific requirements not met (tax IDs, licenses, certifications)",
    ],
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
      "\"I understand, but we're required to declare the actual value. If we undervalue it, customs can seize the shipment or fine both you and the carrier.\"",
      "Stand firm — educate without confrontation",
    ],
    warningNote: "Never undervalue at customer's request — personal liability",
  },
  {
    id: "sc-2",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer says: 'It's just stuff.' How do you get a proper description?",
    answerKey: [
      "\"I'll need a more detailed description — for example, 'men's cotton shirts' or 'plastic phone cases.' This helps avoid customs delays.\"",
      "Force clarity — prevent customs holds",
    ],
  },
  {
    id: "sc-3",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer says: 'It's just a gift' — but there's perfume inside. What do you do?",
    answerKey: [
      "\"Perfumes contain alcohol and are regulated as dangerous goods. Let me check if we can ship it safely under DHL guidelines.\"",
      "Catch dangerous goods early — don't rely on customer's description",
    ],
  },
  {
    id: "sc-4",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer doesn't want to give receiver's phone number. What do you say?",
    answerKey: [
      "\"I just need a phone number for the receiver — without it, delivery or customs clearance may fail.\"",
      "Reinforce that this is a critical field, not optional",
    ],
  },
  {
    id: "sc-5",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer is shipping to Brazil. What do you need to ask for specifically?",
    answerKey: [
      "\"For Brazil, I'll need the receiver's tax ID — CPF for individuals, CNPJ for companies. Without it, the shipment will not clear customs.\"",
      "Country-specific expertise — Brazil rejects without tax ID",
    ],
  },
  {
    id: "sc-6",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer calls angry: 'Why is my package stuck?!' How do you handle it?",
    answerKey: [
      "\"Let me check — usually delays happen due to customs needing more information. I'll verify the invoice, value, and contact details so we can resolve it quickly.\"",
      "Stay calm, take control, check the data before escalating",
    ],
  },
  {
    id: "sc-7",
    tier: "scenarios",
    tierNumber: 4,
    question: "Customer insists: 'It always worked before' but shipment is non-compliant. What do you say?",
    answerKey: [
      "\"Regulations change and enforcement varies — we have to follow current DHL and customs compliance to avoid delays or penalties.\"",
      "Stand firm professionally — past exceptions don't set precedent",
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
    description: "High-level fundamentals. These look easy... but they expose gaps fast.",
  },
  operations: {
    label: "Tier 2 — Operations & Compliance",
    number: 2,
    color: "text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    description: "This is where average employees fail.",
  },
  expert: {
    label: "Tier 3 — Expert Level",
    number: 3,
    color: "text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
    description: "Only strong operators pass this.",
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
