"use client";

import * as React from "react";
import { Bell, Settings as SettingsIcon } from "lucide-react";
import { useHospitalDemo } from "@/components/hospital/hospital-store";
import {
  DemoNotice,
  PageHeader,
  SectionCard,
} from "@/components/hospital/hospital-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/hospital/hospital-ui";
import { useToast } from "@/components/ui/toast";

export default function HospitalSettingsPage() {
  const { settings, updateSettings, resetDemoData } = useHospitalDemo();
  const { toast } = useToast();
  const [form, setForm] = React.useState(settings);

  React.useEffect(() => setForm(settings), [settings]);

  function save() {
    updateSettings(form);
    toast({ title: "Settings saved", description: "Demo hospital preferences updated.", variant: "success" });
  }

  function reset() {
    resetDemoData();
    toast({ title: "Demo data reset", description: "All hospital demo tables restored to defaults.", variant: "info" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hospital Management"
        title="Settings"
        description="Hospital preferences, notification preferences, and dashboard display preferences."
        icon={SettingsIcon}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={reset}>Reset Demo Data</Button>
            <Button size="sm" onClick={save}>Save Changes</Button>
          </div>
        }
      />

      <DemoNotice>
        Settings are stored locally in the demo store. No real configuration is
        sent to production systems.
      </DemoNotice>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Notification Preferences" description="Alerts and communication">
          <div className="space-y-3">
            {[
              ["emergencyAlerts", "Emergency alerts"],
              ["appointmentReminders", "Appointment reminders"],
              ["bedCapacityAlerts", "Bed capacity alerts"],
              ["dailySummary", "Daily summary"],
              ["email", "Email notifications"],
              ["sms", "SMS notifications"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm text-primary-950">{label}</p>
                </div>
                <Switch
                  checked={(form.notifications as any)[key]}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, notifications: { ...f.notifications, [key]: v } }))}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Dashboard Display Preferences" description="UI behavior">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-sm text-primary-950">Show Demo Badges</p>
              <Switch
                checked={form.display.showDemoBadges}
                onCheckedChange={(v) => setForm((f) => ({ ...f, display: { ...f.display, showDemoBadges: v } }))}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-sm text-primary-950">Auto Refresh</p>
              <Switch
                checked={form.display.autoRefresh}
                onCheckedChange={(v) => setForm((f) => ({ ...f, display: { ...f.display, autoRefresh: v } }))}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Landing Page</p>
              <NativeSelect value={form.display.landingPage} onChange={(e) => setForm((f) => ({ ...f, display: { ...f.display, landingPage: e.target.value as any } }))}>
                <option value="overview">Hospital Overview</option>
                <option value="beds">Bed Management</option>
                <option value="appointments">Appointments</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Density</p>
              <NativeSelect value={form.display.density} onChange={(e) => setForm((f) => ({ ...f, display: { ...f.display, density: e.target.value as any } }))}>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </NativeSelect>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Hospital Preferences" description="Locale and time settings">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Timezone</p>
              <NativeSelect value={form.preferences.timezone} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, timezone: e.target.value } }))}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Date Format</p>
              <NativeSelect value={form.preferences.dateFormat} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, dateFormat: e.target.value as any } }))}>
                <option value="DD MMM YYYY">DD MMM YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Language</p>
              <NativeSelect value={form.preferences.language} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, language: e.target.value as any } }))}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </NativeSelect>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-primary-900">Week Start</p>
              <NativeSelect value={form.preferences.weekStart} onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, weekStart: e.target.value as any } }))}>
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </NativeSelect>
            </div>
          </div>
        </SectionCard>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-care-600" aria-hidden />
              <p className="text-sm font-semibold text-primary-950">Demo Notice</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              This implementation uses structured local demo data. Resetting
              returns all hospital portal tables, profile, and settings to their
              original demo values.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
