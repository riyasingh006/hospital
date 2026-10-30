"use client";

import * as React from "react";
import { CalendarClock, Search } from "lucide-react";
import { useHospitalDemo } from "@/components/hospital/hospital-store";
import {
  DemoNotice,
  HospitalStatusBadge,
  NativeSelect,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/hospital/hospital-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  appointmentStatusCounts,
  DEMO_DATE,
  todayAppointments,
  type AppointmentStatus,
} from "@/lib/hospital/demo-data";

const STATUS_OPTS: AppointmentStatus[] = ["SCHEDULED", "CHECKED_IN", "COMPLETED", "CANCELLED", "NO_SHOW"];

export default function HospitalAppointmentsPage() {
  const { appointments, doctors, departments, updateAppointmentStatus } = useHospitalDemo();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("all");

  const counts = appointmentStatusCounts(appointments);
  const todays = todayAppointments(appointments);
  const depts = React.useMemo(() => Array.from(new Set(appointments.map((a) => a.department))), [appointments]);
  const dates = React.useMemo(() => Array.from(new Set(appointments.map((a) => a.date))).sort(), [appointments]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return appointments.filter((a) => {
      if (deptFilter !== "all" && a.department !== deptFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (dateFilter !== "all" && a.date !== dateFilter) return false;
      if (!q) return true;
      return (
        a.reference.toLowerCase().includes(q) ||
        a.patientRef.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q)
      );
    });
  }, [appointments, query, deptFilter, statusFilter, dateFilter]);

  function updateStatus(id: string, status: AppointmentStatus) {
    updateAppointmentStatus(id, status);
    toast({ title: "Appointment updated", description: "Demo appointment status updated.", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Management"
        title="Appointments"
        description="Manage demo appointments with references, doctors, departments, time and status updates."
        icon={CalendarClock}
      />

      <DemoNotice>
        Uses fictional patient names/references only. Status updates are local
        demo interactions.
      </DemoNotice>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total" value={counts.total} hint="All appointments" icon={CalendarClock} tone="blue" />
        <StatCard label="Today (active)" value={todays.length} hint={`Demo date ${DEMO_DATE}`} icon={CalendarClock} tone="teal" />
        <StatCard label="Scheduled" value={counts.scheduled} hint="Upcoming" icon={CalendarClock} tone="blue" />
        <StatCard label="Checked In" value={counts.checkedIn} hint="In queue" icon={CalendarClock} tone="amber" />
        <StatCard label="Completed / Cancelled" value={counts.completed + counts.cancelled} hint={`${counts.noShow} no show`} icon={CalendarClock} tone="green" />
      </div>

      <SectionCard
        title="Appointment List"
        description={`${filtered.length} appointments shown`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search ref, patient, doctor" className="h-9 w-64 pl-9" />
            </div>
            <NativeSelect value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 w-44">
              <option value="all">All dates</option>
              {dates.map((d) => <option key={d} value={d}>{d}</option>)}
            </NativeSelect>
            <NativeSelect value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="h-9 w-48">
              <option value="all">All departments</option>
              {depts.map((d) => <option key={d} value={d}>{d}</option>)}
            </NativeSelect>
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-40">
              <option value="all">All statuses</option>
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium tabular-nums text-primary-950">{apt.reference}</TableCell>
                  <TableCell className="text-sm text-slate-700">{apt.patientRef}</TableCell>
                  <TableCell className="text-sm text-slate-700">{apt.doctorName}</TableCell>
                  <TableCell className="text-sm text-slate-600">{apt.department}</TableCell>
                  <TableCell className="text-sm text-slate-600">{apt.date} • {apt.time}</TableCell>
                  <TableCell className="text-sm text-slate-600">{apt.type}</TableCell>
                  <TableCell><HospitalStatusBadge status={apt.status} size="sm" /></TableCell>
                  <TableCell className="text-right">
                    <NativeSelect
                      value={apt.status}
                      onChange={(ev) => updateStatus(apt.id, ev.target.value as AppointmentStatus)}
                      className="ml-auto h-8 w-36 text-xs"
                    >
                      {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
