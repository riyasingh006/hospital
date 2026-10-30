"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth-context";
import authBackground from "@/components/landing/logo/doc.jpg";

function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { refresh } = useAuth();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Unable to create your account. Please retry.");
        return;
      }
      await refresh();
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network problem — please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* ---------- healthcare background ---------- */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.08), rgba(0, 31, 63, 0.08)), url(${authBackground.src})`,
        }}
      />

      <div className="relative space-y-5">
      <div className="w-full mx-auto text-center">
        <h1 className="text-2xl font-bold text-primary-950">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Register to save hospitals, track bed availability and manage your
          health profile.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient registration</CardTitle>
          <CardDescription>All fields marked * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                placeholder="e.g. Riya Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address *</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile number (optional)</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="+91 …"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters with a letter & number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-slate-400">
                At least 8 characters, including one letter and one number.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              loading={loading}
            >
              <UserRoundPlus className="h-4 w-4" aria-hidden /> Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-care-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-slate-200/70" />}
    >
      <SignupForm />
    </React.Suspense>
  );
}
