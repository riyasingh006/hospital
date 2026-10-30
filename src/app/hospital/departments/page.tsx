"use client";

import * as React from "react";
import { Building2, Plus, Search } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { departmentDoctorCount } from "@/lib/hospital/demo-data";

const DEPT_STATUS = ["ACTIVE", "LIMITED", "INACTIVE"] as const;

export default function HospitalDepartmentsPage() {
  const { departments, doctors, beds, addDepartment, updateDepartment } = useHospitalDemo();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    head: "",
    status: "ACTIVE" as (typeof DEPT_STATUS)[number],
    location: "",
    description: "",
  });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return departments.filter((dept) => {
      if (statusFilter !== "all" && dept.status !== statusFilter) return false;
      if (!q) return true;
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.head.toLowerCase().includes(q) ||
        dept.location.toLowerCase().includes(q)
      );
    });
  }, [departments, query, statusFilter]);

  function openCreate() {
    setEditId(null);
    setForm({ name: "", head: "", status: "ACTIVE", location: "", description: "" });
    setOpen(true);
  }

  function openEdit(id: string) {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return;
    setEditId(dept.id);
    setForm({
      name: dept.name,
      head: dept.head,
      status: dept.status,
      location: dept.location,
      description: dept.description,
    });
    setOpen(true);
  }

  function submit() {
    if (editId) {
      updateDepartment(editId, {
        name: form.name.trim(),
        head: form.head.trim(),
        status: form.status,
        location: form.location.trim(),
        description: form.description.trim(),
      });
      toast({ title: "Department updated", description: "Demo department updated.", variant: "success" });
      setOpen(false);
      return;
    }
    const result = addDepartment(form);
    if (!result.ok) {
      toast({ title: "Could not add department", description: result.error ?? "Invalid input.", variant: "error" });
      return;
    }
    toast({ title: "Department added", description: "New demo department created.", variant: "success" });
    setOpen(false);
  }

  const bedCountFor = (deptName: string) =>
    beds.filter((b) => b.department === deptName).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Management"
        title="Department Management"
        description="Manage departments, department heads, bed capacity, and department details with demo data."
        icon={Building2}
        actions={
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Department
          </Button>
        }
      />

      <DemoNotice>
        Department actions are local to the demo store and keep summary cards
        consistent across the portal.
      </DemoNotice>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Departments" value={departments.length} hint="Configured" icon={Building2} tone="blue" />
        <StatCard label="Active" value={departments.filter((d) => d.status === "ACTIVE").length} hint="Operational" icon={Building2} tone="green" />
        <StatCard label="Limited" value={departments.filter((d) => d.status === "LIMITED").length} hint="Partial capacity" icon={Building2} tone="amber" />
        <StatCard label="Inactive" value={departments.filter((d) => d.status === "INACTIVE").length} hint="Not in use" icon={Building2} tone="red" />
      </div>

      <SectionCard
        title="Department Directory"
        description={`${filtered.length} departments`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search department, head, location"
                className="h-9 w-64 pl-9"
              />
            </div>
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 w-40">
              <option value="all">All statuses</option>
              {DEPT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Department Head</TableHead>
                <TableHead>Doctors</TableHead>
                <TableHead>Bed Capacity (demo)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <p className="font-medium text-primary-950">{dept.name}</p>
                    <p className="max-w-xs truncate text-xs text-slate-500">{dept.description}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">{dept.head}</TableCell>
                  <TableCell className="tabular-nums">{departmentDoctorCount(doctors, dept.name)}</TableCell>
                  <TableCell className="tabular-nums">{bedCountFor(dept.name)}</TableCell>
                  <TableCell className="text-sm text-slate-600">{dept.location}</TableCell>
                  <TableCell><HospitalStatusBadge status={dept.status} size="sm" /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(dept.id)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input id="dept-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept-head">Department Head</Label>
              <Input id="dept-head" value={form.head} onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept-status">Status</Label>
              <NativeSelect id="dept-status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
                {DEPT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="dept-loc">Location</Label>
              <Input id="dept-loc" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="dept-desc">Description</Label>
              <Textarea id="dept-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit}>{editId ? "Save Changes" : "Add Department"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
