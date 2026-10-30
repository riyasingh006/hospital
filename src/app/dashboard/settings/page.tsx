"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Globe,
  LogOut,
  MapPin,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth-context";
import { useI18n } from "@/lib/i18n";
import { useAccessibility } from "@/components/accessibility";
import {
  clearPatientLocation,
  loadPatientLocation,
} from "@/lib/patient/location";

function DeviceToggle({
  labelKey,
  label,
}: {
  labelKey: string;
  label: string;
}) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    setOn(window.localStorage.getItem(labelKey) === "1");
  }, [labelKey]);
  return (
    <label className="flex items-center justify-between gap-3 py-2 text-sm text-slate-700">
      <span>
        {label}
        <span className="block text-[11px] text-slate-400">
          Saved on this device only
        </span>
      </span>
      <Switch
        checked={on}
        onCheckedChange={(v) => {
          setOn(v);
          window.localStorage.setItem(labelKey, v ? "1" : "0");
        }}
      />
    </label>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { lang, setLang } = useI18n();
  const a11y = useAccessibility();
  const [loc, setLoc] = React.useState<{ lat: number; lng: number; label: string } | null>(null);

  React.useEffect(() => {
    setLoc(loadPatientLocation());
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="institutional-heading text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your patient portal preferences.
        </p>
      </header>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4" aria-hidden /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><span className="data-label block">Signed in as</span> {user?.name} · {user?.email}</p>
          <p><span className="data-label block">Role</span> <Badge variant="primary" size="sm">Patient</Badge></p>
          <Button
            variant="ghost"
            className="gap-2 text-red-700"
            onClick={() =>
              void logout().then(() => {
                router.push("/");
                router.refresh();
              })
            }
          >
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </Button>
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-4 w-4" aria-hidden /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Update your personal and medical details.
          </p>
          <Link href="/dashboard/profile">
            <Button variant="secondary" size="sm">Edit Medical Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-4 w-4" aria-hidden /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceToggle
            labelKey="js_pref_appt_reminders"
            label="Appointment reminders"
          />
          <DeviceToggle
            labelKey="js_pref_bed_updates"
            label="Saved-hospital bed updates"
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Delivery preferences are device-level for now. Server-side
            notification settings will be available in a future update.
          </p>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden /> Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            Default search origin used across Find Hospitals and directions.
          </p>
          {loc ? (
            <>
              <Badge variant="green" size="md">{loc.label}</Badge>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-red-700"
                onClick={() => {
                  clearPatientLocation();
                  setLoc(null);
                  toast({ title: "Saved location cleared", variant: "info" });
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Clear saved location
              </Button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No location saved — searches use the default centre (New Delhi).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" aria-hidden /> Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-700">Language</span>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              {(["en", "hi"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
                    lang === l ? "bg-primary-700 text-white" : "text-slate-600"
                  }`}
                >
                  {l === "en" ? "English" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm text-slate-700">
            High contrast mode
            <Switch checked={a11y.contrastMode} onCheckedChange={(v) => a11y.update({ contrastMode: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
            Reduce motion
            <Switch checked={a11y.reducedMotion} onCheckedChange={(v) => a11y.update({ reducedMotion: v })} />
          </label>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden /> Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>
            Your medical profile is private to your account and is never exposed
            publicly. Manage your Digital Health Profile share PIN from the{" "}
            <Link href="/dashboard/profile" className="font-semibold text-care-700 hover:underline">
              Medical Profile
            </Link>{" "}
            page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
