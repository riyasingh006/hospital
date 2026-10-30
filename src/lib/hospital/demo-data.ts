/**
 * Centralized hospital-portal demo data.
 *
 * Everything in the Hospital Portal is derived from this file so that summary
 * cards, tables, and analytics never disagree with each other. The data is
 * intentionally fictional and must never be presented as live hospital
 * information.
 */

export const DEMO_DATE = "2026-10-24";

export type BedType =
  | "GENERAL"
  | "ICU"
  | "EMERGENCY"
  | "PRIVATE"
  | "PEDIATRIC"
  | "MATERNITY"
  | "ISOLATION"
  | "VENTILATOR";

export type BedStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export type DoctorAvailability = "AVAILABLE" | "LIMITED" | "UNAVAILABLE";

export type DepartmentStatus = "ACTIVE" | "LIMITED" | "INACTIVE";

export type EmergencySeverity = "CRITICAL" | "URGENT" | "MODERATE";

export type EmergencyStatus =
  | "RECEIVED"
  | "IN_TREATMENT"
  | "STABILIZED"
  | "DISCHARGED";

export type ServiceStatus = "AVAILABLE" | "LIMITED" | "UNAVAILABLE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type NotificationTone = "info" | "success" | "warning" | "critical";

export interface WardSpec {
  key: string;
  ward: string;
  bedType: BedType;
  department: string;
  prefix: string;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface BedRecord {
  id: string;
  ward: string;
  bedType: BedType;
  department: string;
  status: BedStatus;
  updatedAt: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  department: string;
  qualification: string;
  experienceYears: number;
  availability: DoctorAvailability;
  shift: string;
  phone: string;
  email: string;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  head: string;
  status: DepartmentStatus;
  location: string;
  description: string;
}

export interface EmergencyCaseRecord {
  id: string;
  reference: string;
  patientRef: string;
  age: number;
  condition: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  department: string;
  location: string;
  reportedAt: string;
}

export interface ServiceRecord {
  id: string;
  name: string;
  department: string;
  status: ServiceStatus;
  hours: string;
  description: string;
}

export interface AppointmentRecord {
  id: string;
  reference: string;
  patientRef: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
}

export interface HospitalProfileRecord {
  name: string;
  type: "GOVERNMENT" | "PRIVATE" | "TRUST" | "PSU";
  registrationNumber: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  accreditation: string;
  established: number;
  about: string;
}

export interface HospitalSettingsRecord {
  notifications: {
    emergencyAlerts: boolean;
    appointmentReminders: boolean;
    bedCapacityAlerts: boolean;
    dailySummary: boolean;
    email: boolean;
    sms: boolean;
  };
  display: {
    landingPage: "overview" | "beds" | "appointments";
    density: "comfortable" | "compact";
    showDemoBadges: boolean;
    autoRefresh: boolean;
  };
  preferences: {
    timezone: string;
    dateFormat: "DD MMM YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
    language: "English" | "Hindi";
    weekStart: "Monday" | "Sunday";
  };
}

export interface HospitalNotification {
  id: string;
  title: string;
  body: string;
  tone: NotificationTone;
  createdAt: string;
  read: boolean;
  href: string;
}

export interface HospitalActivity {
  id: string;
  message: string;
  detail: string;
  at: string;
  tone: "blue" | "teal" | "amber" | "red";
}

export interface DailyTrendPoint {
  date: string;
  admissions: number;
  discharges: number;
  emergency: number;
  appointments: number;
}

export interface DemoDataset {
  beds: BedRecord[];
  doctors: DoctorRecord[];
  departments: DepartmentRecord[];
  emergencyCases: EmergencyCaseRecord[];
  services: ServiceRecord[];
  appointments: AppointmentRecord[];
  profile: HospitalProfileRecord;
  settings: HospitalSettingsRecord;
  notifications: HospitalNotification[];
  activity: HospitalActivity[];
  trend: DailyTrendPoint[];
}

export interface WardOption {
  key: string;
  ward: string;
  bedType: BedType;
  department: string;
}

export const WARD_SPECS: WardSpec[] = [
  {
    key: "general-a",
    ward: "General Ward A",
    bedType: "GENERAL",
    department: "General Medicine",
    prefix: "GW-A",
    available: 9,
    occupied: 28,
    reserved: 2,
    maintenance: 1,
  },
  {
    key: "general-b",
    ward: "General Ward B",
    bedType: "GENERAL",
    department: "General Medicine",
    prefix: "GW-B",
    available: 7,
    occupied: 30,
    reserved: 2,
    maintenance: 1,
  },
  {
    key: "icu-1",
    ward: "ICU - Level 1",
    bedType: "ICU",
    department: "Critical Care",
    prefix: "ICU-1",
    available: 2,
    occupied: 10,
    reserved: 1,
    maintenance: 1,
  },
  {
    key: "icu-2",
    ward: "ICU - Level 2",
    bedType: "ICU",
    department: "Critical Care",
    prefix: "ICU-2",
    available: 2,
    occupied: 7,
    reserved: 1,
    maintenance: 0,
  },
  {
    key: "emergency",
    ward: "Emergency Ward",
    bedType: "EMERGENCY",
    department: "Emergency Medicine",
    prefix: "ER",
    available: 3,
    occupied: 11,
    reserved: 1,
    maintenance: 1,
  },
  {
    key: "private",
    ward: "Private Ward",
    bedType: "PRIVATE",
    department: "General Medicine",
    prefix: "PVT",
    available: 8,
    occupied: 18,
    reserved: 3,
    maintenance: 1,
  },
  {
    key: "pediatric",
    ward: "Pediatric Ward",
    bedType: "PEDIATRIC",
    department: "Pediatrics",
    prefix: "PED",
    available: 7,
    occupied: 15,
    reserved: 1,
    maintenance: 1,
  },
  {
    key: "maternity",
    ward: "Maternity Ward",
    bedType: "MATERNITY",
    department: "Obstetrics & Gynaecology",
    prefix: "MAT",
    available: 6,
    occupied: 9,
    reserved: 1,
    maintenance: 0,
  },
  {
    key: "isolation",
    ward: "Isolation Ward",
    bedType: "ISOLATION",
    department: "General Medicine",
    prefix: "ISO",
    available: 3,
    occupied: 6,
    reserved: 0,
    maintenance: 1,
  },
  {
    key: "ventilator",
    ward: "Ventilator Unit",
    bedType: "VENTILATOR",
    department: "Critical Care",
    prefix: "VEN",
    available: 2,
    occupied: 7,
    reserved: 1,
    maintenance: 0,
  },
];

export const WARD_OPTIONS: WardOption[] = WARD_SPECS.map(
  ({ key, ward, bedType, department }) => ({ key, ward, bedType, department })
);

function demoDateTime(hour: number, minute: number): string {
  return new Date(2026, 9, 24, hour, minute, 0).toISOString();
}

function interleaveStatuses(spec: WardSpec): BedStatus[] {
  const buckets: BedStatus[][] = [
    Array(spec.available).fill("AVAILABLE"),
    Array(spec.occupied).fill("OCCUPIED"),
    Array(spec.reserved).fill("RESERVED"),
    Array(spec.maintenance).fill("MAINTENANCE"),
  ];
  const total =
    spec.available + spec.occupied + spec.reserved + spec.maintenance;
  const out: BedStatus[] = [];
  while (out.length < total) {
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) out.push(next);
    }
  }
  return out;
}

function buildBeds(): BedRecord[] {
  const beds: BedRecord[] = [];
  WARD_SPECS.forEach((spec, wardIndex) => {
    const statuses = interleaveStatuses(spec);
    statuses.forEach((status, index) => {
      const minute = (wardIndex * 11 + index * 3) % 60;
      const hour = 8 + Math.floor((wardIndex * 11 + index * 3) / 60);
      beds.push({
        id: `${spec.prefix}-${String(index + 1).padStart(3, "0")}`,
        ward: spec.ward,
        bedType: spec.bedType,
        department: spec.department,
        status,
        updatedAt: demoDateTime(Math.min(hour, 11), minute),
      });
    });
  });
  return beds;
}

export const demoBeds: BedRecord[] = buildBeds();

export const demoDepartments: DepartmentRecord[] = [
  {
    id: "dept-cardiology",
    name: "Cardiology",
    head: "Dr. Arjun Mehta",
    status: "ACTIVE",
    location: "Block A, 3rd Floor",
    description:
      "Tertiary cardiac care including coronary intervention, heart failure and preventive cardiology.",
  },
  {
    id: "dept-neurology",
    name: "Neurology",
    head: "Dr. Rohan Kapoor",
    status: "ACTIVE",
    location: "Block B, 2nd Floor",
    description:
      "Stroke response, epilepsy, neuromuscular disorders and neuro-diagnostics.",
  },
  {
    id: "dept-orthopedics",
    name: "Orthopedics",
    head: "Dr. Sameer Khanna",
    status: "ACTIVE",
    location: "Block C, 1st Floor",
    description:
      "Joint replacement, sports injuries, trauma and rehabilitation support.",
  },
  {
    id: "dept-emergency",
    name: "Emergency Medicine",
    head: "Dr. Ishaan Verma",
    status: "ACTIVE",
    location: "Ground Floor, Emergency Block",
    description:
      "24x7 emergency response, triage, resuscitation and acute care bays.",
  },
  {
    id: "dept-pediatrics",
    name: "Pediatrics",
    head: "Dr. Meera Patel",
    status: "ACTIVE",
    location: "Block D, 2nd Floor",
    description:
      "Newborn and child health, immunization, pediatric emergency and inpatient care.",
  },
  {
    id: "dept-obgyn",
    name: "Obstetrics & Gynaecology",
    head: "Dr. Nandini Rao",
    status: "ACTIVE",
    location: "Block D, 3rd Floor",
    description:
      "Maternity care, high-risk pregnancy, gynaecological surgery and family planning.",
  },
  {
    id: "dept-general-medicine",
    name: "General Medicine",
    head: "Dr. Anil Deshmukh",
    status: "ACTIVE",
    location: "Block A, 1st Floor",
    description:
      "Adult inpatient care, chronic disease management and internal medicine clinics.",
  },
  {
    id: "dept-critical-care",
    name: "Critical Care",
    head: "Dr. Vivek Chandra",
    status: "ACTIVE",
    location: "Block B, 4th Floor",
    description:
      "ICU and ventilator units with 24x7 intensivist coverage and isolation support.",
  },
  {
    id: "dept-radiology",
    name: "Radiology",
    head: "Dr. Farah Khan",
    status: "LIMITED",
    location: "Ground Floor, Diagnostics Wing",
    description:
      "CT, MRI, ultrasound and interventional radiology with limited weekend slots.",
  },
];

export const demoDoctors: DoctorRecord[] = [
  {
    id: "doc-arjun-mehta",
    name: "Dr. Arjun Mehta",
    specialty: "Cardiology",
    department: "Cardiology",
    qualification: "MBBS, MD, DM (Cardiology)",
    experienceYears: 22,
    availability: "AVAILABLE",
    shift: "09:00 - 17:00",
    phone: "+91 90000 01001",
    email: "arjun.mehta@cityhospital.example.in",
  },
  {
    id: "doc-kavita-bansal",
    name: "Dr. Kavita Bansal",
    specialty: "Cardiology",
    department: "Cardiology",
    qualification: "MBBS, DNB (Cardiology)",
    experienceYears: 14,
    availability: "LIMITED",
    shift: "10:00 - 16:00",
    phone: "+91 90000 01002",
    email: "kavita.bansal@cityhospital.example.in",
  },
  {
    id: "doc-neeraj-joshi",
    name: "Dr. Neeraj Joshi",
    specialty: "Cardiac Surgery",
    department: "Cardiology",
    qualification: "MBBS, MCh (Cardiothoracic)",
    experienceYears: 17,
    availability: "AVAILABLE",
    shift: "08:00 - 14:00",
    phone: "+91 90000 01003",
    email: "neeraj.joshi@cityhospital.example.in",
  },
  {
    id: "doc-rohan-kapoor",
    name: "Dr. Rohan Kapoor",
    specialty: "Neurology",
    department: "Neurology",
    qualification: "MBBS, MD, DM (Neurology)",
    experienceYears: 18,
    availability: "AVAILABLE",
    shift: "09:00 - 17:00",
    phone: "+91 90000 01004",
    email: "rohan.kapoor@cityhospital.example.in",
  },
  {
    id: "doc-shalini-menon",
    name: "Dr. Shalini Menon",
    specialty: "Neurology",
    department: "Neurology",
    qualification: "MBBS, DNB (Neurology)",
    experienceYears: 11,
    availability: "LIMITED",
    shift: "12:00 - 18:00",
    phone: "+91 90000 01005",
    email: "shalini.menon@cityhospital.example.in",
  },
  {
    id: "doc-sameer-khanna",
    name: "Dr. Sameer Khanna",
    specialty: "Orthopedics",
    department: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experienceYears: 15,
    availability: "AVAILABLE",
    shift: "08:00 - 16:00",
    phone: "+91 90000 01006",
    email: "sameer.khanna@cityhospital.example.in",
  },
  {
    id: "doc-priya-nair",
    name: "Dr. Priya Nair",
    specialty: "Orthopedics",
    department: "Orthopedics",
    qualification: "MBBS, DNB (Orthopedics)",
    experienceYears: 9,
    availability: "AVAILABLE",
    shift: "10:00 - 18:00",
    phone: "+91 90000 01007",
    email: "priya.nair@cityhospital.example.in",
  },
  {
    id: "doc-tarun-bhatia",
    name: "Dr. Tarun Bhatia",
    specialty: "Sports Medicine",
    department: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experienceYears: 8,
    availability: "UNAVAILABLE",
    shift: "On leave",
    phone: "+91 90000 01008",
    email: "tarun.bhatia@cityhospital.example.in",
  },
  {
    id: "doc-ishaan-verma",
    name: "Dr. Ishaan Verma",
    specialty: "Emergency Medicine",
    department: "Emergency Medicine",
    qualification: "MBBS, MD (Emergency Medicine)",
    experienceYears: 12,
    availability: "AVAILABLE",
    shift: "08:00 - 20:00",
    phone: "+91 90000 01009",
    email: "ishaan.verma@cityhospital.example.in",
  },
  {
    id: "doc-aditi-kulkarni",
    name: "Dr. Aditi Kulkarni",
    specialty: "Emergency Medicine",
    department: "Emergency Medicine",
    qualification: "MBBS, DNB (Emergency Medicine)",
    experienceYears: 7,
    availability: "AVAILABLE",
    shift: "20:00 - 08:00",
    phone: "+91 90000 01010",
    email: "aditi.kulkarni@cityhospital.example.in",
  },
  {
    id: "doc-rahul-sen",
    name: "Dr. Rahul Sen",
    specialty: "Trauma Care",
    department: "Emergency Medicine",
    qualification: "MBBS, MS (General Surgery)",
    experienceYears: 13,
    availability: "LIMITED",
    shift: "14:00 - 22:00",
    phone: "+91 90000 01011",
    email: "rahul.sen@cityhospital.example.in",
  },
  {
    id: "doc-meera-patel",
    name: "Dr. Meera Patel",
    specialty: "Pediatrics",
    department: "Pediatrics",
    qualification: "MBBS, MD (Pediatrics)",
    experienceYears: 16,
    availability: "AVAILABLE",
    shift: "08:30 - 15:30",
    phone: "+91 90000 01012",
    email: "meera.patel@cityhospital.example.in",
  },
  {
    id: "doc-nikhil-rao",
    name: "Dr. Nikhil Rao",
    specialty: "Neonatology",
    department: "Pediatrics",
    qualification: "MBBS, DM (Neonatology)",
    experienceYears: 10,
    availability: "AVAILABLE",
    shift: "12:00 - 20:00",
    phone: "+91 90000 01013",
    email: "nikhil.rao@cityhospital.example.in",
  },
  {
    id: "doc-nandini-rao",
    name: "Dr. Nandini Rao",
    specialty: "Obstetrics & Gynaecology",
    department: "Obstetrics & Gynaecology",
    qualification: "MBBS, MS (Obstetrics & Gynaecology)",
    experienceYears: 19,
    availability: "AVAILABLE",
    shift: "09:00 - 17:00",
    phone: "+91 90000 01014",
    email: "nandini.rao@cityhospital.example.in",
  },
  {
    id: "doc-pooja-iyer",
    name: "Dr. Pooja Iyer",
    specialty: "Maternal Medicine",
    department: "Obstetrics & Gynaecology",
    qualification: "MBBS, DNB (Obstetrics & Gynaecology)",
    experienceYears: 8,
    availability: "LIMITED",
    shift: "11:00 - 18:00",
    phone: "+91 90000 01015",
    email: "pooja.iyer@cityhospital.example.in",
  },
  {
    id: "doc-anil-deshmukh",
    name: "Dr. Anil Deshmukh",
    specialty: "Internal Medicine",
    department: "General Medicine",
    qualification: "MBBS, MD (General Medicine)",
    experienceYears: 24,
    availability: "AVAILABLE",
    shift: "08:00 - 16:00",
    phone: "+91 90000 01016",
    email: "anil.deshmukh@cityhospital.example.in",
  },
  {
    id: "doc-ritu-malhotra",
    name: "Dr. Ritu Malhotra",
    specialty: "Internal Medicine",
    department: "General Medicine",
    qualification: "MBBS, DNB (General Medicine)",
    experienceYears: 12,
    availability: "AVAILABLE",
    shift: "12:00 - 20:00",
    phone: "+91 90000 01017",
    email: "ritu.malhotra@cityhospital.example.in",
  },
  {
    id: "doc-vivek-chandra",
    name: "Dr. Vivek Chandra",
    specialty: "Critical Care",
    department: "Critical Care",
    qualification: "MBBS, MD, IDCCM",
    experienceYears: 20,
    availability: "AVAILABLE",
    shift: "08:00 - 20:00",
    phone: "+91 90000 01018",
    email: "vivek.chandra@cityhospital.example.in",
  },
  {
    id: "doc-sneha-pillai",
    name: "Dr. Sneha Pillai",
    specialty: "Critical Care",
    department: "Critical Care",
    qualification: "MBBS, DNB, IDCCM",
    experienceYears: 9,
    availability: "AVAILABLE",
    shift: "20:00 - 08:00",
    phone: "+91 90000 01019",
    email: "sneha.pillai@cityhospital.example.in",
  },
  {
    id: "doc-farah-khan",
    name: "Dr. Farah Khan",
    specialty: "Radiology",
    department: "Radiology",
    qualification: "MBBS, MD (Radiodiagnosis)",
    experienceYears: 15,
    availability: "LIMITED",
    shift: "09:00 - 14:00",
    phone: "+91 90000 01020",
    email: "farah.khan@cityhospital.example.in",
  },
  {
    id: "doc-karan-gupta",
    name: "Dr. Karan Gupta",
    specialty: "Anaesthesiology",
    department: "Critical Care",
    qualification: "MBBS, MD (Anaesthesiology)",
    experienceYears: 11,
    availability: "UNAVAILABLE",
    shift: "On leave",
    phone: "+91 90000 01021",
    email: "karan.gupta@cityhospital.example.in",
  },
];

export const demoEmergencyCases: EmergencyCaseRecord[] = [
  {
    id: "er-1042",
    reference: "ER-2026-1042",
    patientRef: "Patient #A-2041",
    age: 56,
    condition: "Chest pain - suspected cardiac event",
    severity: "CRITICAL",
    status: "IN_TREATMENT",
    department: "Cardiology",
    location: "ER Bay 2",
    reportedAt: demoDateTime(8, 42),
  },
  {
    id: "er-1043",
    reference: "ER-2026-1043",
    patientRef: "Patient #B-1178",
    age: 34,
    condition: "Road traffic accident - multiple fractures",
    severity: "URGENT",
    status: "RECEIVED",
    department: "Orthopedics",
    location: "ER Bay 4",
    reportedAt: demoDateTime(9, 5),
  },
  {
    id: "er-1044",
    reference: "ER-2026-1044",
    patientRef: "Patient #C-3092",
    age: 12,
    condition: "High fever with dehydration",
    severity: "MODERATE",
    status: "STABILIZED",
    department: "Pediatrics",
    location: "Pediatric ER",
    reportedAt: demoDateTime(9, 18),
  },
  {
    id: "er-1045",
    reference: "ER-2026-1045",
    patientRef: "Patient #D-2287",
    age: 67,
    condition: "Acute respiratory distress",
    severity: "CRITICAL",
    status: "IN_TREATMENT",
    department: "Critical Care",
    location: "ICU Bay 1",
    reportedAt: demoDateTime(9, 31),
  },
  {
    id: "er-1046",
    reference: "ER-2026-1046",
    patientRef: "Patient #E-1183",
    age: 45,
    condition: "Abdominal pain - observation",
    severity: "MODERATE",
    status: "DISCHARGED",
    department: "General Medicine",
    location: "Observation Bay",
    reportedAt: demoDateTime(7, 55),
  },
];

export const demoServices: ServiceRecord[] = [
  {
    id: "svc-emergency",
    name: "Emergency Care",
    department: "Emergency Medicine",
    status: "AVAILABLE",
    hours: "24x7",
    description: "Triage, resuscitation and acute care with dedicated ER bays.",
  },
  {
    id: "svc-cardiology",
    name: "Cardiology",
    department: "Cardiology",
    status: "AVAILABLE",
    hours: "08:00 - 20:00",
    description: "Cardiac consultation, ECG, echocardiography and interventional care.",
  },
  {
    id: "svc-orthopedics",
    name: "Orthopedics",
    department: "Orthopedics",
    status: "AVAILABLE",
    hours: "08:00 - 18:00",
    description: "Fracture care, joint replacement and sports injury management.",
  },
  {
    id: "svc-radiology",
    name: "Radiology & Imaging",
    department: "Radiology",
    status: "LIMITED",
    hours: "08:00 - 20:00",
    description: "X-ray, ultrasound, CT and MRI with limited weekend slots.",
  },
  {
    id: "svc-laboratory",
    name: "Laboratory Services",
    department: "General Medicine",
    status: "AVAILABLE",
    hours: "24x7",
    description: "Pathology, biochemistry and hematology sample processing.",
  },
  {
    id: "svc-icu",
    name: "Intensive Care Unit",
    department: "Critical Care",
    status: "LIMITED",
    hours: "24x7",
    description: "Level 2 and 3 critical care with continuous monitoring.",
  },
  {
    id: "svc-ambulance",
    name: "Ambulance Service",
    department: "Emergency Medicine",
    status: "AVAILABLE",
    hours: "24x7",
    description: "Basic and advanced life support ambulance dispatch.",
  },
  {
    id: "svc-blood-bank",
    name: "Blood Bank",
    department: "General Medicine",
    status: "AVAILABLE",
    hours: "24x7",
    description: "Screened blood components with cross-match support.",
  },
  {
    id: "svc-pharmacy",
    name: "Pharmacy",
    department: "General Medicine",
    status: "AVAILABLE",
    hours: "24x7",
    description: "Inpatient and outpatient pharmacy with emergency stock.",
  },
  {
    id: "svc-ct",
    name: "CT Scan",
    department: "Radiology",
    status: "AVAILABLE",
    hours: "08:00 - 22:00",
    description: "Emergency and elective computed tomography imaging.",
  },
  {
    id: "svc-mri",
    name: "MRI",
    department: "Radiology",
    status: "LIMITED",
    hours: "09:00 - 18:00",
    description: "Elective magnetic resonance imaging with scheduled slots.",
  },
  {
    id: "svc-dialysis",
    name: "Dialysis",
    department: "General Medicine",
    status: "AVAILABLE",
    hours: "07:00 - 21:00",
    description: "Hemodialysis unit with isolation and infection-control protocols.",
  },
];

export const demoAppointments: AppointmentRecord[] = [
  {
    id: "apt-1001",
    reference: "APT-2026-1001",
    patientRef: "Patient #P-5011",
    doctorId: "doc-arjun-mehta",
    doctorName: "Dr. Arjun Mehta",
    department: "Cardiology",
    date: DEMO_DATE,
    time: "09:00",
    status: "COMPLETED",
    type: "Consultation",
  },
  {
    id: "apt-1002",
    reference: "APT-2026-1002",
    patientRef: "Patient #P-5024",
    doctorId: "doc-meera-patel",
    doctorName: "Dr. Meera Patel",
    department: "Pediatrics",
    date: DEMO_DATE,
    time: "09:30",
    status: "CHECKED_IN",
    type: "Follow-up",
  },
  {
    id: "apt-1003",
    reference: "APT-2026-1003",
    patientRef: "Patient #P-5038",
    doctorId: "doc-sameer-khanna",
    doctorName: "Dr. Sameer Khanna",
    department: "Orthopedics",
    date: DEMO_DATE,
    time: "10:00",
    status: "SCHEDULED",
    type: "Consultation",
  },
  {
    id: "apt-1004",
    reference: "APT-2026-1004",
    patientRef: "Patient #P-5042",
    doctorId: "doc-nandini-rao",
    doctorName: "Dr. Nandini Rao",
    department: "Obstetrics & Gynaecology",
    date: DEMO_DATE,
    time: "10:30",
    status: "SCHEDULED",
    type: "Routine check",
  },
  {
    id: "apt-1005",
    reference: "APT-2026-1005",
    patientRef: "Patient #P-5057",
    doctorId: "doc-vivek-chandra",
    doctorName: "Dr. Vivek Chandra",
    department: "Critical Care",
    date: DEMO_DATE,
    time: "11:15",
    status: "CHECKED_IN",
    type: "Post-ICU review",
  },
  {
    id: "apt-1006",
    reference: "APT-2026-1006",
    patientRef: "Patient #P-5061",
    doctorId: "doc-farah-khan",
    doctorName: "Dr. Farah Khan",
    department: "Radiology",
    date: DEMO_DATE,
    time: "12:00",
    status: "SCHEDULED",
    type: "Imaging",
  },
  {
    id: "apt-1007",
    reference: "APT-2026-1007",
    patientRef: "Patient #P-5070",
    doctorId: "doc-rohan-kapoor",
    doctorName: "Dr. Rohan Kapoor",
    department: "Neurology",
    date: DEMO_DATE,
    time: "14:00",
    status: "SCHEDULED",
    type: "Consultation",
  },
  {
    id: "apt-1008",
    reference: "APT-2026-1008",
    patientRef: "Patient #P-5082",
    doctorId: "doc-anil-deshmukh",
    doctorName: "Dr. Anil Deshmukh",
    department: "General Medicine",
    date: DEMO_DATE,
    time: "15:30",
    status: "CANCELLED",
    type: "Follow-up",
  },
  {
    id: "apt-1009",
    reference: "APT-2026-1009",
    patientRef: "Patient #P-5090",
    doctorId: "doc-priya-nair",
    doctorName: "Dr. Priya Nair",
    department: "Orthopedics",
    date: "2026-10-25",
    time: "09:30",
    status: "SCHEDULED",
    type: "Consultation",
  },
  {
    id: "apt-1010",
    reference: "APT-2026-1010",
    patientRef: "Patient #P-5104",
    doctorId: "doc-kavita-bansal",
    doctorName: "Dr. Kavita Bansal",
    department: "Cardiology",
    date: "2026-10-25",
    time: "11:00",
    status: "SCHEDULED",
    type: "Follow-up",
  },
  {
    id: "apt-1011",
    reference: "APT-2026-1011",
    patientRef: "Patient #P-5117",
    doctorId: "doc-nikhil-rao",
    doctorName: "Dr. Nikhil Rao",
    department: "Pediatrics",
    date: "2026-10-25",
    time: "13:30",
    status: "SCHEDULED",
    type: "Newborn review",
  },
  {
    id: "apt-1012",
    reference: "APT-2026-1012",
    patientRef: "Patient #P-5126",
    doctorId: "doc-sneha-pillai",
    doctorName: "Dr. Sneha Pillai",
    department: "Critical Care",
    date: "2026-10-26",
    time: "10:00",
    status: "SCHEDULED",
    type: "Consultation",
  },
  {
    id: "apt-1013",
    reference: "APT-2026-1013",
    patientRef: "Patient #P-5131",
    doctorId: "doc-aditi-kulkarni",
    doctorName: "Dr. Aditi Kulkarni",
    department: "Emergency Medicine",
    date: "2026-10-26",
    time: "16:00",
    status: "SCHEDULED",
    type: "Follow-up",
  },
  {
    id: "apt-1014",
    reference: "APT-2026-1014",
    patientRef: "Patient #P-5144",
    doctorId: "doc-arjun-mehta",
    doctorName: "Dr. Arjun Mehta",
    department: "Cardiology",
    date: "2026-10-27",
    time: "09:00",
    status: "SCHEDULED",
    type: "Consultation",
  },
  {
    id: "apt-1015",
    reference: "APT-2026-1015",
    patientRef: "Patient #P-4988",
    doctorId: "doc-meera-patel",
    doctorName: "Dr. Meera Patel",
    department: "Pediatrics",
    date: "2026-10-23",
    time: "10:30",
    status: "COMPLETED",
    type: "Vaccination",
  },
  {
    id: "apt-1016",
    reference: "APT-2026-1016",
    patientRef: "Patient #P-4971",
    doctorId: "doc-sameer-khanna",
    doctorName: "Dr. Sameer Khanna",
    department: "Orthopedics",
    date: "2026-10-23",
    time: "12:00",
    status: "NO_SHOW",
    type: "Follow-up",
  },
  {
    id: "apt-1017",
    reference: "APT-2026-1017",
    patientRef: "Patient #P-4955",
    doctorId: "doc-rohan-kapoor",
    doctorName: "Dr. Rohan Kapoor",
    department: "Neurology",
    date: "2026-10-22",
    time: "15:00",
    status: "COMPLETED",
    type: "Consultation",
  },
  {
    id: "apt-1018",
    reference: "APT-2026-1018",
    patientRef: "Patient #P-4940",
    doctorId: "doc-nandini-rao",
    doctorName: "Dr. Nandini Rao",
    department: "Obstetrics & Gynaecology",
    date: "2026-10-22",
    time: "11:30",
    status: "CANCELLED",
    type: "Routine check",
  },
];

export const demoProfile: HospitalProfileRecord = {
  name: "City Multispeciality Hospital",
  type: "PRIVATE",
  registrationNumber: "DL-HOSP-1998-0142",
  addressLine: "12, Connaught Place, Central Delhi",
  city: "New Delhi",
  state: "Delhi",
  pincode: "110001",
  phone: "+91 11 4000 1200",
  emergencyPhone: "+91 11 4000 1299",
  email: "care@cityhospital.example.in",
  website: "https://cityhospital.example.in",
  accreditation: "NABH, NABL",
  established: 1998,
  about:
    "A 210-bed multispeciality tertiary-care hospital in central Delhi with 24x7 emergency care, advanced cardiac and critical care services, and full diagnostic support.",
};

export const demoSettings: HospitalSettingsRecord = {
  notifications: {
    emergencyAlerts: true,
    appointmentReminders: true,
    bedCapacityAlerts: true,
    dailySummary: false,
    email: true,
    sms: false,
  },
  display: {
    landingPage: "overview",
    density: "comfortable",
    showDemoBadges: true,
    autoRefresh: false,
  },
  preferences: {
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    language: "English",
    weekStart: "Monday",
  },
};

export const demoNotifications: HospitalNotification[] = [
  {
    id: "notif-1",
    title: "ICU capacity below threshold",
    body: "Only 4 ICU beds are marked available in the demo dataset.",
    tone: "critical",
    createdAt: demoDateTime(9, 40),
    read: false,
    href: "/hospital/beds",
  },
  {
    id: "notif-2",
    title: "Emergency case awaiting assignment",
    body: "Demo case ER-2026-1043 is marked as received in the emergency queue.",
    tone: "warning",
    createdAt: demoDateTime(9, 12),
    read: false,
    href: "/hospital/emergency",
  },
  {
    id: "notif-3",
    title: "Appointment schedule updated",
    body: "Two demo appointments were checked in this morning.",
    tone: "info",
    createdAt: demoDateTime(8, 55),
    read: false,
    href: "/hospital/appointments",
  },
  {
    id: "notif-4",
    title: "Daily summary available",
    body: "The demo daily operations summary has been generated.",
    tone: "success",
    createdAt: demoDateTime(8, 0),
    read: true,
    href: "/hospital/analytics",
  },
  {
    id: "notif-5",
    title: "Radiology service limited",
    body: "Radiology is marked as limited in the demo service directory.",
    tone: "warning",
    createdAt: demoDateTime(7, 35),
    read: true,
    href: "/hospital/services",
  },
];

export const demoActivity: HospitalActivity[] = [
  {
    id: "act-1",
    message: "Emergency case ER-2026-1045 moved to ICU Bay 1",
    detail: "Critical Care • demo workflow update",
    at: demoDateTime(9, 38),
    tone: "red",
  },
  {
    id: "act-2",
    message: "Bed ICU-1-007 marked for maintenance",
    detail: "ICU - Level 1 • demo inventory update",
    at: demoDateTime(9, 21),
    tone: "amber",
  },
  {
    id: "act-3",
    message: "Appointment APT-2026-1002 checked in",
    detail: "Pediatrics • Dr. Meera Patel",
    at: demoDateTime(9, 4),
    tone: "teal",
  },
  {
    id: "act-4",
    message: "Dr. Shalini Menon availability set to limited",
    detail: "Neurology • demo roster update",
    at: demoDateTime(8, 48),
    tone: "amber",
  },
  {
    id: "act-5",
    message: "Radiology service status reviewed",
    detail: "Radiology • demo service update",
    at: demoDateTime(8, 26),
    tone: "blue",
  },
  {
    id: "act-6",
    message: "Daily bed occupancy snapshot generated",
    detail: "Hospital overview • demo data",
    at: demoDateTime(8, 0),
    tone: "blue",
  },
];

function isoDateForTrend(daysFromDemoDate: number): string {
  const base = new Date(2026, 9, 24);
  base.setDate(base.getDate() + daysFromDemoDate);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const demoTrend: DailyTrendPoint[] = Array.from(
  { length: 30 },
  (_, index) => {
    const day = index - 29;
    const wave = index % 7;
    return {
      date: isoDateForTrend(day),
      admissions: 22 + ((index * 7) % 15),
      discharges: 19 + ((index * 5) % 16),
      emergency: 4 + ((index * 3) % 8) + (wave === 0 ? 2 : 0),
      appointments: 34 + ((index * 11) % 23),
    };
  }
);

export function createDemoDataset(): DemoDataset {
  return {
    beds: demoBeds.map((bed) => ({ ...bed })),
    doctors: demoDoctors.map((doctor) => ({ ...doctor })),
    departments: demoDepartments.map((department) => ({ ...department })),
    emergencyCases: demoEmergencyCases.map((item) => ({ ...item })),
    services: demoServices.map((service) => ({ ...service })),
    appointments: demoAppointments.map((appointment) => ({ ...appointment })),
    profile: { ...demoProfile },
    settings: {
      notifications: { ...demoSettings.notifications },
      display: { ...demoSettings.display },
      preferences: { ...demoSettings.preferences },
    },
    notifications: demoNotifications.map((notification) => ({
      ...notification,
    })),
    activity: demoActivity.map((item) => ({ ...item })),
    trend: demoTrend.map((point) => ({ ...point })),
  };
}

/* --------------------------------- Helpers -------------------------------- */

export function findWard(ward: string): WardOption | undefined {
  return WARD_OPTIONS.find((option) => option.ward === ward);
}

export function bedCounts(beds: BedRecord[]) {
  return beds.reduce(
    (acc, bed) => {
      acc.total += 1;
      if (bed.status === "AVAILABLE") acc.available += 1;
      if (bed.status === "OCCUPIED") acc.occupied += 1;
      if (bed.status === "RESERVED") acc.reserved += 1;
      if (bed.status === "MAINTENANCE") acc.maintenance += 1;
      return acc;
    },
    {
      total: 0,
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0,
    }
  );
}

export function bedsByType(beds: BedRecord[]) {
  const map = new Map<
    BedType,
    { total: number; available: number; occupied: number }
  >();
  for (const bed of beds) {
    const entry = map.get(bed.bedType) ?? {
      total: 0,
      available: 0,
      occupied: 0,
    };
    entry.total += 1;
    if (bed.status === "AVAILABLE") entry.available += 1;
    if (bed.status === "OCCUPIED") entry.occupied += 1;
    map.set(bed.bedType, entry);
  }
  return Array.from(map.entries()).map(([bedType, counts]) => ({
    bedType,
    ...counts,
  }));
}

export function departmentBedSummary(
  beds: BedRecord[],
  departments: DepartmentRecord[]
) {
  return departments.map((department) => {
    const scoped = beds.filter((bed) => bed.department === department.name);
    const counts = bedCounts(scoped);
    return {
      ...department,
      totalBeds: counts.total,
      availableBeds: counts.available,
      occupiedBeds: counts.occupied,
      utilization: counts.total
        ? Math.round((counts.occupied / counts.total) * 100)
        : 0,
    };
  });
}

export function departmentDoctorCount(
  doctors: DoctorRecord[],
  departmentName: string
): number {
  return doctors.filter((doctor) => doctor.department === departmentName).length;
}

export function availableIcuBeds(beds: BedRecord[]): number {
  return beds.filter(
    (bed) => bed.bedType === "ICU" && bed.status === "AVAILABLE"
  ).length;
}

export function doctorAvailabilityCounts(doctors: DoctorRecord[]) {
  return doctors.reduce(
    (acc, doctor) => {
      acc.total += 1;
      if (doctor.availability === "AVAILABLE") acc.available += 1;
      if (doctor.availability === "LIMITED") acc.limited += 1;
      if (doctor.availability === "UNAVAILABLE") acc.unavailable += 1;
      return acc;
    },
    { total: 0, available: 0, limited: 0, unavailable: 0 }
  );
}

export function todayAppointments(
  appointments: AppointmentRecord[]
): AppointmentRecord[] {
  return appointments.filter(
    (appointment) =>
      appointment.date === DEMO_DATE && appointment.status !== "CANCELLED"
  );
}

export function appointmentStatusCounts(appointments: AppointmentRecord[]) {
  return appointments.reduce(
    (acc, appointment) => {
      acc.total += 1;
      if (appointment.status === "SCHEDULED") acc.scheduled += 1;
      if (appointment.status === "CHECKED_IN") acc.checkedIn += 1;
      if (appointment.status === "COMPLETED") acc.completed += 1;
      if (appointment.status === "CANCELLED") acc.cancelled += 1;
      if (appointment.status === "NO_SHOW") acc.noShow += 1;
      return acc;
    },
    {
      total: 0,
      scheduled: 0,
      checkedIn: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
    }
  );
}

export function serviceStatusCounts(services: ServiceRecord[]) {
  return services.reduce(
    (acc, service) => {
      acc.total += 1;
      if (service.status === "AVAILABLE") acc.available += 1;
      if (service.status === "LIMITED") acc.limited += 1;
      if (service.status === "UNAVAILABLE") acc.unavailable += 1;
      return acc;
    },
    { total: 0, available: 0, limited: 0, unavailable: 0 }
  );
}

export function emergencySummary(cases: EmergencyCaseRecord[]) {
  return cases.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.status !== "DISCHARGED") acc.active += 1;
      if (item.severity === "CRITICAL" && item.status !== "DISCHARGED")
        acc.critical += 1;
      if (item.status === "IN_TREATMENT") acc.inTreatment += 1;
      if (item.status === "RECEIVED") acc.received += 1;
      if (item.status === "STABILIZED") acc.stabilized += 1;
      return acc;
    },
    {
      total: 0,
      active: 0,
      critical: 0,
      inTreatment: 0,
      received: 0,
      stabilized: 0,
    }
  );
}

export function formatDemoDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDemoTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function todayDemoLabel(): string {
  return new Date(`${DEMO_DATE}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
