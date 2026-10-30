import { prisma } from "@/lib/prisma";
import type { HospitalLike } from "@/lib/scoring";

export interface HospitalFull extends HospitalLike {
  name: string;
  shortName: string | null;
  type: string;
  status: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergencyPhone: string | null;
  email: string | null;
  website: string | null;
  about: string | null;
  accreditation: string | null;
  established: number | null;
  lastAvailabilityUpdate: Date;
  beds: { category: string; total: number; available: number }[];
  services: { key: string; status: string }[];
  doctors: {
    specialty: string;
    availability: string;
    experienceYears: number;
  }[];
}

export async function loadVerifiedHospitals(): Promise<HospitalFull[]> {
  const rows = await prisma.hospital.findMany({
    where: { status: "VERIFIED" },
    include: {
      beds: true,
      services: true,
      doctors: {
        select: { specialty: true, availability: true, experienceYears: true },
      },
    },
  });
  return rows as unknown as HospitalFull[];
}

export async function loadHospitalById(id: string): Promise<HospitalFull | null> {
  const row = await prisma.hospital.findUnique({
    where: { id },
    include: {
      beds: true,
      services: true,
      doctors: {
        select: { specialty: true, availability: true, experienceYears: true },
      },
    },
  });
  return (row as unknown as HospitalFull) ?? null;
}
