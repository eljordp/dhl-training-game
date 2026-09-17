/** Curated concept rules, not general natural-language understanding.
 * Each regex recognizes a relationship within a bounded passage. Alternative
 * wording is explicit; unmatched ideas are sent to review, never called wrong.
 * Examples and optional notes are deliberately excluded from scored criteria.
 */
export interface ConceptRubric {
  criteria: RegExp[][];
  contradictions?: RegExp[];
}
const re = (pattern: string) => new RegExp(pattern, "i");
const criterion = (...patterns: string[]) => patterns.map(re);
const gap = "[^.!?;\\n]{0,160}";
const has = (left: string, right: string) => `(?:${left})${gap}(?:${right})`;
const eitherOrder = (a: string, b: string) => `${has(a,b)}|${has(b,a)}`;
const effect = "hold|held|delay|return|penalt|fine\\b|re.?bill|corrected charges|seiz";
const check = "check|verif|confirm|validat|obtain|ask|review|look.?up";
const delay = criterion(eitherOrder("shipment|package|clearance|delivery|movement|processing|billing|charges", effect));
const truthful = criterion(
  has("declare|enter|require|use|obtain", "actual|accurate|true|correct|supportable|fair market|realistic"),
  has("actual|accurate|true|correct|truthful|realistic|fair market|supportable", "value|declaration")
);
const refuseFalse = criterion(
  has("refuse|reject|cannot|can't|will not|must not|do not|never", "false|fraud|undervalu|non.?compliant|misdeclar"),
  has("false|fraud|undervalu|non.?compliant", "refuse|reject|stop|pause")
);
const harms = criterion("\\b(?:risks?|cause|lead|result|can|could|may|possible|potential)\\b"+gap+"(?:"+effect+")");
const noUndervalue = [re("(?:cannot|do not|will not|must not|should not) (?:refuse|reject|correct)"+gap+"(?:false|fraud|undervalu)"),re("(?:will|would|should|can) (?:accept|process)"+gap+"(?:false|fraudulent|undervalued)"),re("(?:i will|we will|i would|we should|just) (?:declare|enter|put|use) (?:\\$?20|zero|0|a lower value)"), re("(?:it is|it's|is) (?:fine|okay|ok|acceptable|safe) to undervalue")];
const noFalseAcceptance = [re("(?:do not|must not|should not|will not|never) (?:follow|meet|comply with)"+gap+"(?:current|applicable)"+gap+"(?:requirements|rules|regulations)"),re("(?:i will|i would|we should|just) (?:accept|process|ship)"+gap+"(?:anyway|even if|despite|non.?compliant)"), re("(?:previous|past|before)"+gap+"(?:proves? compliance|guarantees? acceptance|means it is compliant)")];
export const assessmentRubrics: Record<string, ConceptRubric> = {
  't1-1': { criteria: [
    criterion(has("\\bdoc\\b|dox|documents|paperwork", "no commercial|without commercial|non.?commercial|no resale")),
    criterion(eitherOrder("non.?doc|non.?document|parcel|wpx", "goods|merchandise|products")), harms,
  ], contradictions: [re("(?:goods|merchandise) (?:are|is) (?:documents|doc\\b)"), re("documents have commercial value")] },
  't1-2': { criteria: [
    criterion("(?=.*\\bdox\\b"+gap+"document)(?=.*\\bwpx\\b"+gap+"(?:parcel|non.?doc))"),
    criterion(has("\\becx\\b", "within (?:the )?(?:eu\\b|european union)|intra.?eu|both")),
    criterion(has(check, "guide|booking|system|service|product|availability|lane")),
  ], contradictions: [re("\\becx\\b"+gap+"(?:is|means|for) (?:an? )?economy"), re("\\becx\\b\\s*[:=-]\\s*economy")] },
  't1-3': { criteria: [delay, criterion(has(check,"account|payer|payment"))], contradictions:[re("(?:ignore|skip)"+gap+"(?:invalid|account)"), re("invalid"+gap+"(?:does not matter|no effect)")] },
  't1-4': { criteria: [criterion(eitherOrder("carriage|carrier", "liability|insurance|protection|coverage")), criterion(eitherOrder("customs value", "duties|tax|assessment"))], contradictions:[re("customs value"+gap+"(?:automatically (?:buys|provides|includes)|guarantees)"+gap+"insurance")] },
  't1-5': { criteria: [criterion(eitherOrder("dimensional|volumetric", "size|large|dimensions|length|volume")), criterion(eitherOrder("higher|greater|maximum|whichever is more", "actual|scale|weigh"))], contradictions:[re("(?:use|charge|bill)"+gap+"(?:lower|smaller|lesser)"+gap+"weight")] },
  't1-6': { criteria: [criterion(eitherOrder("remote", "address|postal|postcode|zip|destination|pickup|delivery")), criterion(has(check,"dhl|system|remote.?area|list|postcode|postal|quote"))] },
  't1-7': { criteria: [criterion(has(check,"signature|release|eligib|restriction|service|destination")), criterion(has("do not|never|cannot|can't|must not", "override|waive|release|mandatory|requirement"), has("confirm|escalate", "dhl|eligib|unclear"))], contradictions:[re("(?:always|any shipment)"+gap+"(?:waive|release without)|(?:ignore|override) (?:the )?mandatory signature")] },
  't1-8': { criteria: [criterion(eitherOrder("mismatch|inconsistent|identification|delay", "invoice|importer|tax id|business|company|registration")), criterion(has("use|enter|record|include", "legal|company|business"))] },
  't1-9': { criteria: [criterion(eitherOrder("higher|greater|maximum", "actual|volumetric|dimensional")), criterion("(?:length|\\bl\\b)\\s*(?:x|times|\\*)\\s*(?:width|\\bw\\b)\\s*(?:x|times|\\*)\\s*(?:height|\\bh\\b)"+gap+"(?:5000|5,000)")], contradictions:[re("(?:use|charge|bill)"+gap+"(?:lower|smaller|lesser)"+gap+"weight"),re("(?:divide|divided|/)\\s*(?:by )?(?:6000|6,000|4000|4,000)\\b")] },
  't1-10': { criteria: [criterion(eitherOrder("phone|number|contact|reach", "customs|clearance")), criterion(eitherOrder("phone|number|contact|arrang|coordinat|resolv", "deliver")), delay], contradictions: [re("(?:phone|number|contact)"+gap+"(?:not needed|not required|unnecessary|optional)"),re("(?:do not|does not|never) need"+gap+"(?:phone|number|contact)")] },
  't2-1': { criteria: [criterion(has("do not|never|cannot|can't|must not|not", "zero|\\$?0\\b|no customs value"), "no charge"+gap+"not"+gap+"no customs value"), truthful], contradictions:noUndervalue },
  't2-2': { criteria: [criterion("saudi national address|national address|short address(?: code)?"), criterion("(?=.*(?:phone|contact|reachable))(?=.*(?:importer|receiver|consignee).{0,80}(?:id|identification|registration))"), criterion("(?=.*(?:description|contents|item))(?=.*invoice)(?=.*(?:value|accurate))") ] },
  't2-3': { criteria: [criterion(has("separate|distinct|each|individual", "line|commodity|commodities|item|description")), criterion("(?=.*(?:description|commodit))(?=.*quantit)(?=.*value)(?=.*origin)(?=.*(?:hs|tariff|classif))")], contradictions:[re("(?:use|enter|list|put) (?:everything|all items|all goods)"+gap+"(?:one|single|combined) (?:line|description)")] },
  't2-4': { criteria: [harms, refuseFalse], contradictions:noUndervalue },
  't2-5': { criteria: [criterion(has("origin", "manufactur|produc|made|substantial.*transform")), criterion(has("not|different|rather than", "dispatch|ship|warehouse"), "made in"+gap+"(?:shipped|stored|warehouse)"+gap+"origin", "(?:dispatch|shipping|warehouse) country"+gap+"not")], contradictions:[re("origin is (?:always )?(?:the )?(?:shipping|dispatch) country"),re("origin"+gap+"(?:not|never).{0,30}where"+gap+"(?:manufactured|made|produced)")] },
  't2-6': { criteria: [criterion("suspicious.*value|low.*value|undervalu|vague.*description"), criterion("inconsisten|mismatch|missing.*(?:document|information)|incomplete.*(?:document|information)"), criterion("random|independent|cannot guarantee|no.{0,40}guarantee|unpredictab") ] },
  't2-7': { criteria: [criterion(has("receiver|consignee", "receiv|deliver|physical")), criterion(has("importer", "legal|responsib|duties|compliance")), criterion("(?:can|may|could) be different|not (?:always|necessarily) the same|on behalf of a different")], contradictions:[re("(?:receiver|consignee) (?:is|are) always the importer")] },
  't2-8': { criteria: [criterion("lithium batter|flammable.*perfume|perfume.*flammable|aerosol"), criterion(has(check+"|identify|classif|escalate", "contents|dangerous|acceptance|safety|rules|trained|restrictions"))], contradictions:[re("(?:perfume|lithium batteries|aerosols) (?:are|is) (?:always safe|never dangerous|not dangerous)"),re("(?:no need|do not need) to check")] },
  't2-9': { criteria: [criterion("(?=.*\\bcpf\\b)(?=.*\\bcnpj\\b)"), criterion(eitherOrder("invoice", "detail|accurate|description|incomplete|check|correct|missing"))], contradictions:[re("(?:cpf|cnpj|tax id)"+gap+"(?:not required|optional|unnecessary)")] },
  't2-10': { criteria: [criterion("physical (?:street )?address|deliverable.*street|street address"), criterion(has("obtain|get|confirm|require|ask", "address"))], contradictions:[re("(?:po box|p\.o\. box)"+gap+"(?:always accepted|is sufficient|is fine|works normally)")] },
  't3-1': { criteria: [criterion("mismatch|conflicting|inconsistent|false declaration|undervalu"), criterion(has("confirm|verify|correct|align|resolve", "value|records|data|invoice"))] },
  't3-2': { criteria: [criterion("(?=.*(?:quantity.{0,30}10|10.{0,30}(?:quantity|items)))(?=.*(?:unit|per item|each))(?=.*total)(?=.*(?:ask|clarif|check|confirm|whether))"), criterion("(?=.*(?:accurate|correct|true).{0,50}(?:value|total))(?=.*(?:duties|delay|penalt|fine|hold))")], contradictions:[re("(?:always|must be|definitely)"+gap+"(?:1000|1,000)"),re("keep (?:the )?quantity (?:at )?1\\b")] },
  't3-3': { criteria: [criterion(eitherOrder("invoice", "check|verif|accura|missing|inconsisten|description|value")), criterion("receiver.{0,80}(?:contact|phone)|(?:valid|verified).{0,30}contact"), criterion("country.specific|destination.*requirement|importer id|tax id|permit|clearance document")] },
  't3-4': { criteria: [criterion("undeclared.*dangerous|dangerous.*goods|prohibited|sanctions"), criterion("false.*declar|fraud|inaccurate.*declar|unsafe.*pack|inadequate.*pack|missing.*(?:document|permit)")] },
  't3-5': { criteria: [criterion(has("receiver|recipient|unpaid", "wait|delay|hold|held|pay")), criterion(has("shipper|sender|dtp", "avoid|prevent|reduce|delay|payment|wait|paid"))], contradictions:[re("(?:dtp|shipper.paid)"+gap+"(?:guarantees?|always)"+gap+"(?:fast|clearance|no delay)")] },
  't3-6': { criteria: [criterion("gift[^.!?]{0,100}(?:not|doesn't|does not|still|may|can|depend)[^.!?]{0,100}(?:tax|dut|exempt)", "(?:tax|dut)"+gap+"(?:still|may|can)"+gap+"gift"), criterion("(?:country|countries|destination)"+gap+"(?:rules|threshold|exempt|limit)|(?:exempt|threshold)"+gap+"(?:country|countries|destination)")], contradictions:[re("gifts? (?:is|are) (?:always |automatically )?(?:tax.free|duty.free|exempt)|(?:no|never) (?:duties|taxes) on gifts")] },
  't3-7': { criteria: [criterion("(?=.*(?:specific|exact|actual|type|model))(?=.*(?:device|item|electronic))(?=.*batter)"), criterion("(?:vague|description)"+gap+"(?:customs|dangerous|holds|screening|classif)")] },
  't3-8': { criteria: [criterion(has("shipper|sender", "pay|responsib|cost|charge")), criterion("refus|unpaid|nonpayment|undeliverable|wrong address|clearance|cannot clear")], contradictions:[re("(?:dhl|carrier) always pays|(?:shipper|sender) never pays")] },
  't3-9': { criteria: [criterion("fraud|false.*classif|compliance violation|legal violation"), harms], contradictions:[re("(?:wrong|false) hs code"+gap+"(?:is fine|is legal|does not matter)")] },
  't3-10': { criteria: [criterion("inaccurate|incomplete|missing|wrong"+gap+"invoice"), criterion("(?:missing|incorrect|inaccurate|incomplete)"+gap+"(?:address|contact|phone)"), criterion("(?:missing|incomplete)"+gap+"(?:id|permit|document|requirement)"), criterion("prohibited|restricted|undeclared.*dangerous"), criterion("unpaid|refusal|nonresponse|non.response") ] },
  'sc-1': { criteria: [refuseFalse, harms], contradictions:noUndervalue },
  'sc-2': { criteria: [criterion("(?=.*(?:ask|identify|find out))(?=.*(?:item|contents))(?=.*(?:material|made of))(?=.*(?:use|purpose))"), criterion("(?:do not|never|cannot|can't|not)"+gap+"(?:guess|vague|stuff)|replace.{0,30}stuff") ] },
  'sc-3': { criteria: [criterion("perfume"+gap+"(?:flammable|dangerous)|(?:flammable|dangerous)"+gap+"perfume"), criterion("(?:stop|pause|refuse|check|escalate)"+gap+"(?:processing|acceptance|trained|dangerous|comply|compliant|staff|restrictions)")], contradictions:[re("(?:perfume|gift)"+gap+"(?:not dangerous|always safe|ship normally)")] },
  'sc-4': { criteria: [criterion("(?=.*(?:phone|number))(?=.*(?:clearance|deliver))(?=.*(?:need|require|request|ask|obtain))"), criterion("delay|return|fail|pause")], contradictions:[re("(?:invent|make up|fake) (?:a |the )?(?:phone|number)|(?:phone|number) is optional")] },
  'sc-5': { criteria: [criterion("(?=.*\\bcpf\\b)(?=.*\\bcnpj\\b)"), criterion("(?:missing|without|invalid)"+gap+"(?:clear|block|hold|delay|prevent)", "(?:ensure|meet|complete).{0,60}clearance")], contradictions:[re("(?:cpf|cnpj|tax id)"+gap+"(?:not required|optional|unnecessary)")] },
  'sc-6': { criteria: [criterion("(?=.*(?:check|inspect|verify|review))(?=.*(?:status|tracking|hold reason))(?=.*(?:invoice|documents|receiver|contact))"), criterion("(?=.*(?:calm|acknowledge|understand|empath|professional))(?=.*(?:next action|next step|follow.up|escalat|explain))") ] },
  'sc-7': { criteria: [criterion("(?=.*(?:current|applicable).{0,45}(?:requirements|rules|regulations|compliance))(?=.*(?:cannot|can't|refuse|do not|must not|will not|never).{0,100}(?:accept|process|ship|non.?compliant))"), criterion("(?:before|previous|past)"+gap+"(?:not|doesn't|does not|no guarantee)"+gap+"(?:compliant|compliance|prove|guarantee)|previous exceptions.{0,40}(?:not|no).{0,20}precedent")], contradictions:noFalseAcceptance },
};
