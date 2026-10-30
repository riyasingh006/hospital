/**
 * Rule-based healthcare NLP — extracts structured care intent from a natural
 * language query. Deterministic, offline, and auditable; used by hospital
 * search and as the fallback engine for जीवन AI when no LLM key is configured.
 */

export interface ParsedNeed {
  specialty?: string;
  requiresIcu?: boolean;
  requiresEmergency?: boolean;
  requiresVentilator?: boolean;
  requiresDiagnostics?: boolean;
  urgency: "EMERGENCY" | "URGENT" | "ROUTINE";
}

const SPECIALTY_PATTERNS: [string, RegExp][] = [
  ["CARDIOLOGY", /(cardiolog|heart|chest pain|cardiac|angioplasty|bypass|ecg|bp.*high)/],
  ["NEUROLOGY", /(neurolog|brain|stroke|seizure|epilep|migraine|paralys|numbness)/],
  ["PULMONOLOGY", /(pulmonolog|lung|breath|asthma|respirator|copd|cough(ing)? blood|wheez)/],
  ["ORTHOPEDICS", /(orthoped|bone|fracture|joint|knee|hip|spine|back ?pain|sprain)/],
  ["PEDIATRICS", /(pediatric|paediatric|child|baby|infant|newborn|kid)/],
  ["ONCOLOGY", /(oncolog|cancer|tumou?r|chemothera|carcinoma)/],
  ["DERMATOLOGY", /(dermatolog|skin|rash|eczema|psoriasi|acne)/],
  ["GYNECOLOGY", /(gynecolog|gynaecolog|pregnan|delivery|maternit|obstetric|periods)/],
  ["GASTROENTEROLOGY", /(gastroenterolog|stomach|abdomen|gastric|liver|intestin|appendic)/],
  ["ENT", /\b(ent|ear|nose|throat|tonsil)\b/],
  ["EMERGENCY_MEDICINE", /(emergency|accident|trauma|injur)/],
];

const EMERGENCY_PATTERN =
  /(severe|unconscious|unresponsive|fainted|not breathing|difficulty breathing|breathless|can'?t breathe|bleeding heavily|heavy bleeding|heart attack|chest pain|stroke|accident|collapsed|convulsion|seizure|poison|overdose|suicid|drowning|electric shock|gunshot|stab|critical|\bemergenc(?:y|ies)\b)/;
const URGENT_PATTERN =
  /(high fever|vomit(ing)? blood|dehydrat|broken|fracture|severe pain|can't move|cannot move|urgent|immediately|right now|asap)/;

const ICU_PATTERN = /\b(icu|intensive care|critical care|life support|ventilat)/;
const DIAGNOSTIC_PATTERN =
  /\b(mri|ct scan|x-?ray|ultrasound|blood test|diagnostic|pathology|scan)\b/;

export function interpretQuery(query: string): ParsedNeed {
  const q = query.toLowerCase();

  let specialty: string | undefined;
  for (const [key, pattern] of SPECIALTY_PATTERNS) {
    if (pattern.test(q)) {
      specialty = key;
      break;
    }
  }

  const requiresEmergency = EMERGENCY_PATTERN.test(q);
  const requiresIcu = ICU_PATTERN.test(q);
  const requiresDiagnostics = !requiresEmergency && DIAGNOSTIC_PATTERN.test(q);

  const urgency: ParsedNeed["urgency"] = requiresEmergency
    ? "EMERGENCY"
    : URGENT_PATTERN.test(q)
      ? "URGENT"
      : "ROUTINE";

  return {
    specialty,
    requiresEmergency,
    requiresIcu,
    requiresDiagnostics,
    urgency,
  };
}
