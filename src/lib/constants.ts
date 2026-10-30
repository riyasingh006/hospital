export const APP_NAME = "जीवन Sahay";
export const APP_NAME_EN = "Jeevan Sahay";
export const APP_TAGLINE = "सही अस्पताल • सही समय • सही दिशा";
export const AI_NAME = "जीवन AI";

export const SPECIALTIES = [
  { key: "CARDIOLOGY", label: "Cardiology", hi: "हृदय रोग" },
  { key: "NEUROLOGY", label: "Neurology", hi: "तंत्रिका विज्ञान" },
  { key: "PULMONOLOGY", label: "Pulmonology", hi: "फुफ्फुस विज्ञान" },
  { key: "ORTHOPEDICS", label: "Orthopedics", hi: "अस्थि रोग" },
  { key: "PEDIATRICS", label: "Pediatrics", hi: "बाल चिकित्सा" },
  { key: "ONCOLOGY", label: "Oncology", hi: "कैंसर विज्ञान" },
  { key: "DERMATOLOGY", label: "Dermatology", hi: "त्वचा विज्ञान" },
  { key: "GYNECOLOGY", label: "Gynecology", hi: "स्त्री रोग" },
  { key: "EMERGENCY_MEDICINE", label: "Emergency Medicine", hi: "आपातकालीन चिकित्सा" },
  { key: "GENERAL_MEDICINE", label: "General Medicine", hi: "सामान्य चिकित्सा" },
  { key: "GASTROENTEROLOGY", label: "Gastroenterology", hi: "पाचन रोग" },
  { key: "ENT", label: "ENT", hi: "नासा गला" },
] as const;

export type SpecialtyKey = (typeof SPECIALTIES)[number]["key"];

export const HOSPITAL_TYPES = [
  { key: "GOVERNMENT", label: "Government" },
  { key: "PRIVATE", label: "Private" },
  { key: "TRUST", label: "Trust / NGO" },
  { key: "PSU", label: "PSU / Autonomous" },
] as const;

export const BED_CATEGORIES = [
  { key: "GENERAL", label: "General Beds", hi: "सामान्य बिस्तर" },
  { key: "ICU", label: "ICU", hi: "आईसीयू" },
  { key: "EMERGENCY", label: "Emergency Beds", hi: "आपातकालीन बिस्तर" },
  { key: "VENTILATOR", label: "Ventilators", hi: "वेंटिलेटर" },
  { key: "PEDIATRIC", label: "Pediatric Beds", hi: "बाल बिस्तर" },
  { key: "MATERNITY", label: "Maternity Beds", hi: "प्रसूति बिस्तर" },
  { key: "ISOLATION", label: "Isolation Beds", hi: "आइसोलेशन बिस्तर" },
] as const;

export const SERVICE_CATALOG = [
  { key: "EMERGENCY", label: "Emergency Department", icon: "siren" },
  { key: "ICU", label: "Intensive Care Unit", icon: "activity" },
  { key: "AMBULANCE", label: "Ambulance Service", icon: "ambulance" },
  { key: "BLOOD_BANK", label: "Blood Bank", icon: "droplets" },
  { key: "PHARMACY", label: "Pharmacy (24×7)", icon: "pill" },
  { key: "DIAGNOSTICS", label: "Pathology & Diagnostics", icon: "flask-conical" },
  { key: "MRI", label: "MRI", icon: "scan-line" },
  { key: "CT_SCAN", label: "CT Scan", icon: "scan" },
  { key: "DIALYSIS", label: "Dialysis", icon: "heart-pulse" },
  { key: "OPERATION_THEATRE", label: "Operation Theatre", icon: "stethoscope" },
] as const;

export type ServiceKey = (typeof SERVICE_CATALOG)[number]["key"];

export const AVAILABILITY_STATUSES = ["AVAILABLE", "LIMITED", "UNAVAILABLE"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const DOCTOR_AVAILABILITY_LABEL: Record<string, string> = {
  AVAILABLE: "Available today",
  LIMITED: "Limited slots",
  UNAVAILABLE: "Not available",
};

/** Default map centre (New Delhi). */
export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

/** Staleness threshold for availability data (ms). */
export const FRESHNESS_MS = 45 * 60 * 1000; // 45 minutes

export const EMERGENCY_HELPLINE = "112";
export const AMBULANCE_HELPLINE = "108";

export const RECOMMENDATION_WEIGHTS = {
  medicalCompatibility: 0.3,
  specialistAvailability: 0.2,
  bedIcuAvailability: 0.2,
  emergencyCapability: 0.15,
  distanceEta: 0.1,
  otherServices: 0.05,
} as const;
