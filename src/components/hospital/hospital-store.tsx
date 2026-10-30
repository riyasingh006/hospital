"use client";

import * as React from "react";
import {
  createDemoDataset,
  findWard,
  type AppointmentRecord,
  type AppointmentStatus,
  type BedRecord,
  type BedStatus,
  type DepartmentRecord,
  type DoctorAvailability,
  type DoctorRecord,
  type EmergencyCaseRecord,
  type EmergencyStatus,
  type HospitalNotification,
  type HospitalProfileRecord,
  type HospitalSettingsRecord,
  type ServiceRecord,
} from "@/lib/hospital/demo-data";

export interface NewBedInput {
  id: string;
  ward: string;
  status: BedStatus;
}

export interface NewDoctorInput {
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

export type DoctorPatch = Partial<
  Omit<DoctorRecord, "id">
> & { id?: never };

export interface NewDepartmentInput {
  name: string;
  head: string;
  status: DepartmentRecord["status"];
  location: string;
  description: string;
}

export interface NewServiceInput {
  name: string;
  department: string;
  status: ServiceRecord["status"];
  hours: string;
  description: string;
}

export type NewAppointmentStatus = AppointmentStatus;

interface HospitalDemoContextValue {
  beds: BedRecord[];
  doctors: DoctorRecord[];
  departments: DepartmentRecord[];
  emergencyCases: EmergencyCaseRecord[];
  services: ServiceRecord[];
  appointments: AppointmentRecord[];
  profile: HospitalProfileRecord;
  settings: HospitalSettingsRecord;
  notifications: HospitalNotification[];
  activity: ReturnType<typeof createDemoDataset>["activity"];
  trend: ReturnType<typeof createDemoDataset>["trend"];
  addBed: (input: NewBedInput) => { ok: boolean; error?: string };
  updateBed: (id: string, patch: Partial<Omit<BedRecord, "id">>) => void;
  removeBed: (id: string) => void;
  addDoctor: (input: NewDoctorInput) => { ok: boolean; error?: string };
  updateDoctor: (id: string, patch: DoctorPatch) => void;
  toggleDoctorAvailability: (id: string) => void;
  removeDoctor: (id: string) => void;
  addDepartment: (input: NewDepartmentInput) => { ok: boolean; error?: string };
  updateDepartment: (
    id: string,
    patch: Partial<Omit<DepartmentRecord, "id">>
  ) => void;
  addService: (input: NewServiceInput) => { ok: boolean; error?: string };
  updateService: (
    id: string,
    patch: Partial<Omit<ServiceRecord, "id">>
  ) => void;
  removeService: (id: string) => void;
  updateEmergencyStatus: (id: string, status: EmergencyStatus) => void;
  updateAppointmentStatus: (
    id: string,
    status: NewAppointmentStatus
  ) => void;
  updateProfile: (patch: Partial<HospitalProfileRecord>) => void;
  updateSettings: (patch: Partial<HospitalSettingsRecord>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const HospitalDemoContext =
  React.createContext<HospitalDemoContextValue | null>(null);

function patchInList<T extends { id: string }>(
  list: T[],
  id: string,
  patch: Partial<T>
): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function HospitalDemoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initial] = React.useState(() => createDemoDataset());
  const [beds, setBeds] = React.useState(initial.beds);
  const [doctors, setDoctors] = React.useState(initial.doctors);
  const [departments, setDepartments] = React.useState(initial.departments);
  const [emergencyCases, setEmergencyCases] = React.useState(
    initial.emergencyCases
  );
  const [services, setServices] = React.useState(initial.services);
  const [appointments, setAppointments] = React.useState(initial.appointments);
  const [profile, setProfile] = React.useState(initial.profile);
  const [settings, setSettings] = React.useState(initial.settings);
  const [notifications, setNotifications] = React.useState(
    initial.notifications
  );
  const [activity] = React.useState(initial.activity);
  const [trend] = React.useState(initial.trend);

  const addBed = React.useCallback<HospitalDemoContextValue["addBed"]>(
    (input) => {
      const trimmedId = input.id.trim().toUpperCase();
      if (!trimmedId) return { ok: false, error: "Bed ID is required." };
      if (beds.some((bed) => bed.id.toUpperCase() === trimmedId)) {
        return { ok: false, error: "A bed with this ID already exists." };
      }
      const knownWard = findWard(input.ward);
      if (!knownWard) return { ok: false, error: "Select a valid ward." };
      const newBed: BedRecord = {
        id: trimmedId,
        ward: knownWard.ward,
        bedType: knownWard.bedType,
        department: knownWard.department,
        status: input.status,
        updatedAt: new Date().toISOString(),
      };
      setBeds((prev) => [newBed, ...prev]);
      return { ok: true };
    },
    [beds]
  );

  const updateBed = React.useCallback<HospitalDemoContextValue["updateBed"]>(
    (id, patch) => {
      setBeds((prev) =>
        prev.map((bed) => {
          if (bed.id !== id) return bed;
          const next = { ...bed, ...patch, updatedAt: new Date().toISOString() };
          if (patch.ward) {
            const ward = findWard(patch.ward);
            if (ward) {
              next.ward = ward.ward;
              next.bedType = ward.bedType;
              next.department = ward.department;
            }
          }
          return next;
        })
      );
    },
    []
  );

  const removeBed = React.useCallback<HospitalDemoContextValue["removeBed"]>(
    (id) => setBeds((prev) => prev.filter((bed) => bed.id !== id)),
    []
  );

  const addDoctor = React.useCallback<HospitalDemoContextValue["addDoctor"]>(
    (input) => {
      if (!input.name.trim()) return { ok: false, error: "Doctor name is required." };
      if (!input.department.trim())
        return { ok: false, error: "Department is required." };
      if (!input.specialty.trim())
        return { ok: false, error: "Specialty is required." };
      if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      const doctor: DoctorRecord = {
        ...input,
        id: `doc-${Date.now().toString(36)}`,
        name: input.name.trim(),
        specialty: input.specialty.trim(),
        department: input.department.trim(),
        qualification: input.qualification.trim(),
        shift: input.shift.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        experienceYears: Math.max(0, Math.round(input.experienceYears)),
      };
      setDoctors((prev) => [doctor, ...prev]);
      return { ok: true };
    },
    []
  );

  const updateDoctor = React.useCallback<
    HospitalDemoContextValue["updateDoctor"]
  >((id, patch) => setDoctors((prev) => patchInList(prev, id, patch)), []);

  const toggleDoctorAvailability = React.useCallback<
    HospitalDemoContextValue["toggleDoctorAvailability"]
  >((id) => {
    setDoctors((prev) =>
      prev.map((doctor) => {
        if (doctor.id !== id) return doctor;
        return {
          ...doctor,
          availability:
            doctor.availability === "UNAVAILABLE" ? "AVAILABLE" : "UNAVAILABLE",
        };
      })
    );
  }, []);

  const removeDoctor = React.useCallback<
    HospitalDemoContextValue["removeDoctor"]
  >((id) => setDoctors((prev) => prev.filter((doctor) => doctor.id !== id)), []);

  const addDepartment = React.useCallback<
    HospitalDemoContextValue["addDepartment"]
  >(
    (input) => {
      const name = input.name.trim();
      if (!name) return { ok: false, error: "Department name is required." };
      if (
        departments.some(
          (department) => department.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return { ok: false, error: "A department with this name already exists." };
      }
      if (!input.head.trim())
        return { ok: false, error: "Department head is required." };
      const department: DepartmentRecord = {
        id: `dept-${Date.now().toString(36)}`,
        name,
        head: input.head.trim(),
        status: input.status,
        location: input.location.trim(),
        description: input.description.trim(),
      };
      setDepartments((prev) => [...prev, department]);
      return { ok: true };
    },
    [departments]
  );

  const updateDepartment = React.useCallback<
    HospitalDemoContextValue["updateDepartment"]
  >((id, patch) => {
    setDepartments((prev) => patchInList(prev, id, patch as any));
  }, []);

  const addService = React.useCallback<HospitalDemoContextValue["addService"]>(
    (input) => {
      const name = input.name.trim();
      if (!name) return { ok: false, error: "Service name is required." };
      if (!input.department.trim())
        return { ok: false, error: "Department is required." };
      if (!input.hours.trim())
        return { ok: false, error: "Operating hours are required." };
      if (
        services.some(
          (service) => service.name.toLowerCase() === name.toLowerCase()
        )
      ) {
        return { ok: false, error: "A service with this name already exists." };
      }
      const service: ServiceRecord = {
        id: `svc-${Date.now().toString(36)}`,
        name,
        department: input.department.trim(),
        status: input.status,
        hours: input.hours.trim(),
        description: input.description.trim(),
      };
      setServices((prev) => [service, ...prev]);
      return { ok: true };
    },
    [services]
  );

  const updateService = React.useCallback<
    HospitalDemoContextValue["updateService"]
  >((id, patch) => setServices((prev) => patchInList(prev, id, patch as any)), []);

  const removeService = React.useCallback<
    HospitalDemoContextValue["removeService"]
  >((id) => setServices((prev) => prev.filter((service) => service.id !== id)), []);

  const updateEmergencyStatus = React.useCallback<
    HospitalDemoContextValue["updateEmergencyStatus"]
  >(
    (id, status) =>
      setEmergencyCases((prev) => patchInList(prev, id, { status })),
    []
  );

  const updateAppointmentStatus = React.useCallback<
    HospitalDemoContextValue["updateAppointmentStatus"]
  >(
    (id, status) =>
      setAppointments((prev) => patchInList(prev, id, { status })),
    []
  );

  const updateProfile = React.useCallback<
    HospitalDemoContextValue["updateProfile"]
  >((patch) => setProfile((prev) => ({ ...prev, ...patch })), []);

  const updateSettings = React.useCallback<
    HospitalDemoContextValue["updateSettings"]
  >((patch) => {
    setSettings((prev) => ({
      notifications: { ...prev.notifications, ...patch.notifications },
      display: { ...prev.display, ...patch.display },
      preferences: { ...prev.preferences, ...patch.preferences },
    }));
  }, []);

  const markNotificationRead = React.useCallback<
    HospitalDemoContextValue["markNotificationRead"]
  >(
    (id) =>
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      ),
    []
  );

  const markAllNotificationsRead = React.useCallback<
    HospitalDemoContextValue["markAllNotificationsRead"]
  >(() => setNotifications((prev) => prev.map((item) => ({ ...item, read: true }))), []);

  const resetDemoData = React.useCallback(() => {
    const fresh = createDemoDataset();
    setBeds(fresh.beds);
    setDoctors(fresh.doctors);
    setDepartments(fresh.departments);
    setEmergencyCases(fresh.emergencyCases);
    setServices(fresh.services);
    setAppointments(fresh.appointments);
    setProfile(fresh.profile);
    setSettings(fresh.settings);
    setNotifications(fresh.notifications);
  }, []);

  const value = React.useMemo<HospitalDemoContextValue>(
    () => ({
      beds,
      doctors,
      departments,
      emergencyCases,
      services,
      appointments,
      profile,
      settings,
      notifications,
      activity,
      trend,
      addBed,
      updateBed,
      removeBed,
      addDoctor,
      updateDoctor,
      toggleDoctorAvailability,
      removeDoctor,
      addDepartment,
      updateDepartment,
      addService,
      updateService,
      removeService,
      updateEmergencyStatus,
      updateAppointmentStatus,
      updateProfile,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData,
    }),
    [
      beds,
      doctors,
      departments,
      emergencyCases,
      services,
      appointments,
      profile,
      settings,
      notifications,
      activity,
      trend,
      addBed,
      updateBed,
      removeBed,
      addDoctor,
      updateDoctor,
      toggleDoctorAvailability,
      removeDoctor,
      addDepartment,
      updateDepartment,
      addService,
      updateService,
      removeService,
      updateEmergencyStatus,
      updateAppointmentStatus,
      updateProfile,
      updateSettings,
      markNotificationRead,
      markAllNotificationsRead,
      resetDemoData,
    ]
  );

  return (
    <HospitalDemoContext.Provider value={value}>
      {children}
    </HospitalDemoContext.Provider>
  );
}

export function useHospitalDemo(): HospitalDemoContextValue {
  const context = React.useContext(HospitalDemoContext);
  if (!context) {
    throw new Error(
      "useHospitalDemo must be used within HospitalDemoProvider."
    );
  }
  return context;
}
