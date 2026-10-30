"use client";

import * as React from "react";
import { Ambulance, BedDouble, Siren } from "lucide-react";
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
  emergencySummary,
  availableIcuBeds,
  bedCounts,
  formatDemoTime,
  type EmergencySeverity,
  type EmergencyStatus,
} from "@/lib/hospital/demo-data";

const STATUS_OPTS: EmergencyStatus[] = ["RECEIVED", "IN_TREATMENT", "STABILIZED", "DISCHARGED"];
const SEV_OPTS: EmergencySeverity[] = ["CRITICAL", "URGENT", "MODERATE"];

export default function HospitalEmergencyPage() {
  const { emergencyCases, beds, updateEmergencyStatus } = useHospitalDemo();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("active");

  const summary = emergencySummary(emergencyCases);
  const _counts = bedCounts(beds);
  const icuAvail = availableIcuBeds(beds);
  const erTotal = beds.filter((b) => b.bedType === "EMERGENCY").length;
  const erAvailable = beds.filter((b) => b.bedType === "EMERGENCY" && b.status === "AVAILABLE").length;

  const filtered = React.useMemo(() => {
    return emergencyCases.filter((e) => {
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;
      if (statusFilter === "active" && e.status === "DISCHARGED") return false;
      if (statusFilter === "discharged" && e.status !== "DISCHARGED") return false;
      return true;
    });
  }, [emergencyCases, severityFilter, statusFilter]);

  function updateStatus(id: string, status: EmergencyStatus) {
    updateEmergencyStatus(id, status);
    toast({ title: "Emergency status updated", description: "Demo case status updated.", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Management"
        title="Emergency Status"
        description="Monitor demo emergency cases, severity, location, assigned department, and ICU availability."
        icon={Siren}
        actions={
          <Button variant="emergency" size="sm" className="gap-1.5">
            <Ambulance className="h-4 w-4" aria-hidden />
            Emergency Line 112
          </Button>
        }
      />

      <DemoNotice>
        This page uses fictional sample cases only. No real patient information
        is shown and this must not be treated as a live emergency board.
      </DemoNotice>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Cases" value={summary.active} hint="Not discharged" icon={Siren} tone="red" />
        <StatCard label="Critical" value={summary.critical} hint="Requires immediate attention" icon={Siren} tone="red" />
        <StatCard label="In Treatment" value={summary.inTreatment} hint="Currently being treated" icon={Ambulance} tone="amber" />
        <StatCard label="Available ICU Beds" value={icuAvail} hint={`${erTotal} ER beds total in demo`} icon={BedDouble} tone="blue" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Emergency Department Status" description="Demo readiness snapshot">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-600">Triage</span><HospitalStatusBadge status="AVAILABLE" size="sm" /></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">Resuscitation Bays</span><span className="tabular-nums text-primary-900">4 / 4</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">ER Beds</span><span className="tabular-nums text-primary-900">{erAvailable} available / {erTotal} total</span></div>
          </div>
        </SectionCard>
        <SectionCard title="ICU Availability Summary" description="Critical care capacity">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-600">ICU Beds Available</span><span className="tabular-nums text-primary-900">{icuAvail}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">Ventilator Unit</span><span className="tabular-nums text-primary-900">{beds.filter((b) => b.bedType === "VENTILATOR" && b.status === "AVAILABLE").length} available</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">Critical Care Team</span><HospitalStatusBadge status="AVAILABLE" size="sm" /></div>
          </div>
        </SectionCard>
        <SectionCard title="Response Overview" description="Demo queue state">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-600">Received</span><span className="tabular-nums">{summary.received}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">In Treatment</span><span className="tabular-nums">{summary.inTreatment}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-600">Stabilized</span><span className="tabular-nums">{summary.stabilized}</span></div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Emergency Cases"
        description="Demo cases with severity indicators, time reported, status, assigned department and location."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <NativeSelect value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="h-9 w-40">
              <option value="all">All severity</option>
              {SEV_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-40">
              <option value="active">Active only</option>
              <option value="all">All statuses</option>
              <option value="discharged">Discharged</option>
            </NativeSelect>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Ref</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Time Reported</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium tabular-nums text-primary-950">{e.reference}</TableCell>
                  <TableCell>{e.patientRef} • {e.age}y</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-slate-700">{e.condition}</TableCell>
                  <TableCell><HospitalStatusBadge status={e.severity} size="sm" /></TableCell>
                  <TableCell className="text-sm text-slate-600">{e.department}</TableCell>
                  <TableCell className="text-sm text-slate-600">{e.location}</TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDemoTime(e.reportedAt)}</TableCell>
                  <TableCell><HospitalStatusBadge status={e.status} size="sm" /></TableCell>
                  <TableCell className="text-right">
                    <NativeSelect
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value as EmergencyStatus)}
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
