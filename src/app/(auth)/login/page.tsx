"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  HeartPulse,
  Info,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import authBackground from "@/components/landing/logo/doc.jpg";
import { useAuth } from "@/components/auth-context";
import { cn } from "@/lib/utils";

function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

type Role = "patient" | "hospital" | "admin" | null;

const ROLES: { id: Exclude<Role, null>; title: string; desc: string; icon: typeof HeartPulse }[] = [
  {
    id: "patient",
    title: "Patient Application",
    desc: "Find hospitals, specialists and healthcare services.",
    icon: HeartPulse,
  },
  {
    id: "hospital",
    title: "Hospital Portal",
    desc: "Manage hospital information and healthcare availability.",
    icon: Building2,
  },
  {
    id: "admin",
    title: "Admin Portal",
    desc: "Manage platform operations and administrative services.",
    icon: ShieldCheck,
  },
];

/* ------------------------- static modal shell ------------------------- */

function Modal({
  labelledBy,
  onClose,
  children,
}: {
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#031C45]/45 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_64px_rgba(3,28,69,0.22)]"
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------ OTP boxes ----------------------------- */

function OtpBoxes() {
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""));
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    setDigits((d) => d.map((x, j) => (j === i ? v : x)));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit OTP">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(0, 1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
          }}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-full rounded-[10px] border border-[#D7E0EC] bg-white text-center text-lg font-bold text-[#102A56] outline-none transition-colors focus:border-[#062B67] focus:ring-2 focus:ring-[#062B67]/15"
        />
      ))}
    </div>
  );
}

/* ------------------------------- form --------------------------------- */

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const reason = params.get("reason");
  const { refresh } = useAuth();

  const [role, setRole] = React.useState<Role>(null);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [roleHint, setRoleHint] = React.useState(false);

  React.useEffect(() => {
    const err = params.get("error");
    if (!err) return;
    const map: Record<string, string> = {
      google_cancelled: "Google sign-in was cancelled.",
      google_invalid: "Invalid Google sign-in request. Please try again.",
      google_state_mismatch: "Security validation failed. Please try again.",
      google_config_missing: "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
      google_email_missing: "Google account has no email. Please use another account.",
      account_suspended: "This account has been suspended. Contact support.",
      google_failed: "Google sign-in failed. Please try again.",
    };
    setError(map[err] || "Google sign-in failed. Please try again.");
  }, [params]);
  const [modal, setModal] = React.useState<"forgot" | "google" | "otp" | null>(null);
  const [otpNote, setOtpNote] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!role) {
      setRoleHint(true);
      return;
    }
    setLoading(true);
    try {
      // Existing authentication contract — unchanged.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Unable to sign in. Please try again.");
        return;
      }
      await refresh();
      const roleFromResp = json.data?.user?.role;
      let dest = next;
      if (next === "/dashboard") {
        if (roleFromResp === "HOSPITAL_ADMIN") dest = "/hospital";
        else if (roleFromResp === "SUPER_ADMIN") dest = "/admin";
        else dest = "/dashboard";
      } else if (role === "hospital" && roleFromResp === "HOSPITAL_ADMIN") {
        dest = "/hospital";
      } else if (role === "admin" && roleFromResp === "SUPER_ADMIN") {
        dest = "/admin";
      } else if (role === "patient" && roleFromResp === "PATIENT") {
        dest = next.startsWith("/dashboard") || next === "/" ? "/dashboard" : next;
      } else if (role === "hospital" && roleFromResp !== "HOSPITAL_ADMIN") {
        setError("This account is not authorized for the Hospital Portal. Please select the correct portal or use an authorized Hospital Admin account.");
        setLoading(false);
        return;
      } else if (role === "admin" && roleFromResp !== "SUPER_ADMIN") {
        setError("This account is not authorized for the Admin Portal. Please select the correct portal or use a Super Admin account.");
        setLoading(false);
        return;
      } else if (role === "patient" && roleFromResp !== "PATIENT") {
        setError("This account is not authorized for the Patient Application. Please select the correct portal for your account.");
        setLoading(false);
        return;
      }
      router.replace(dest);
      router.refresh();
    } catch {
      setError("Network problem — please check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* ---------- hospital corridor background ---------- */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 31, 63, 0.08), rgba(0, 31, 63, 0.08)), url(${authBackground.src})`,
        }}
      />

      <div className="relative space-y-5">
      {/* ---------- heading ---------- */}
      <div className="text-center">
        <h1 className="text-[32px] font-bold leading-tight text-[#062B67]">Sign In</h1>
        <p className="mt-1.5 text-[15px] text-[#5A6B85]">Access your Jeevan Sahay account.</p>
      </div>

      {reason === "auth" && (
        <p className="flex items-start gap-2 rounded-lg border border-saffron-200 bg-saffron-50 px-3.5 py-2.5 text-xs font-medium text-saffron-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Please sign in to continue to that page.
        </p>
      )}

      {/* ---------- card ---------- */}
      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_50px_rgba(3,29,69,0.18)] sm:p-9">
        <form onSubmit={onSubmit} className="space-y-6" noValidate={false}>
          {/* ---- role selection FIRST ---- */}
          <fieldset>
            <legend className="text-sm font-bold text-[#102A56]">Select your role</legend>
            <div
              role="radiogroup"
              aria-label="Select your role"
              className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {ROLES.map(({ id, title, desc, icon: Icon }) => {
                const selected = role === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-2xl border bg-white p-4 transition-all duration-150",
                      selected
                        ? "border-[#062B67] bg-[#EEF4FC] shadow-[0_10px_26px_-12px_rgba(6,43,103,0.45)]"
                        : "border-[#DCE4EF] hover:border-[#B9CBE3] hover:shadow-sm"
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={id}
                      checked={selected}
                      onChange={() => { setRole(id); setRoleHint(false); }}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between">
                      <span
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                          selected ? "bg-[#062B67] text-white" : "bg-[#EEF3FB] text-[#2563EB]"
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                          selected ? "border-[#062B67] bg-[#062B67]" : "border-[#C7D3E6]"
                        )}
                      >
                        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="mt-3 block text-[13.5px] font-bold leading-snug text-[#102A56]">
                      {title}
                      {selected && <span className="sr-only"> (selected)</span>}
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-relaxed text-[#64748B]">
                      {desc}
                    </span>
                  </label>
                );
              })}
            </div>
            {roleHint && !role && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                Please select your role to continue.
              </p>
            )}
          </fieldset>

          {/* ---- email ---- */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-bold text-[#102A56]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" aria-hidden />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[52px] w-full rounded-xl border border-[#D7E0EC] bg-white pl-11 pr-4 text-[14px] text-[#102A56] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#062B67] focus:ring-2 focus:ring-[#062B67]/15"
              />
            </div>
          </div>

          {/* ---- password ---- */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="block text-sm font-bold text-[#102A56]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setModal("forgot")}
                className="text-[12.5px] font-semibold text-[#2563EB] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#94A3B8]" aria-hidden />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[52px] w-full rounded-xl border border-[#D7E0EC] bg-white pl-11 pr-12 text-[14px] text-[#102A56] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#062B67] focus:ring-2 focus:ring-[#062B67]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#94A3B8] transition-colors hover:text-[#102A56] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#062B67]"
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {/* ---- submit ---- */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#062B67] text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(6,43,103,0.65)] transition-all duration-150 hover:bg-[#0A377E] active:translate-y-px disabled:cursor-wait disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden />
            )}
            Sign In
          </button>

          {/* ---- divider + google + otp ---- */}
          <div className="pt-1">
            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">OR</span>
              <span className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              window.location.href = "/api/auth/google";
            }}
            className="mt-4 flex h-[50px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#D7E0EC] bg-white text-[14px] font-bold text-[#102A56] transition-colors hover:bg-[#F5F8FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
              Continue with Google
            </button>

            <button
              type="button"
              onClick={() => { setOtpNote(""); setModal("otp"); }}
              className="mx-auto mt-3.5 block text-[13px] font-semibold text-[#2563EB] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
            >
              Use OTP instead
            </button>
          </div>
        </form>

        {/* ---- create account ---- */}
        <p className="mt-6 border-t border-[#EEF2F8] pt-5 text-center text-sm text-[#64748B]">
          New to Jeevan Sahay?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="font-bold text-[#2563EB] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* ---------------------- static modals ---------------------- */}
      {modal === "forgot" && (
        <Modal labelledBy="forgot-title" onClose={() => setModal(null)}>
          <div className="flex items-start justify-between gap-3">
            <h2 id="forgot-title" className="text-lg font-bold text-[#102A56]">Forgot Password</h2>
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="rounded-md p-1 text-[#94A3B8] hover:text-[#102A56] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#062B67]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
            Password recovery is currently unavailable.
          </p>
          <button
            onClick={() => setModal(null)}
            className="mt-5 h-10 w-full rounded-[10px] bg-[#062B67] text-sm font-bold text-white transition-colors hover:bg-[#0A377E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            Close
          </button>
        </Modal>
      )}

      {modal === "google" && (
        <Modal labelledBy="google-title" onClose={() => setModal(null)}>
          <div className="flex items-start justify-between gap-3">
            <h2 id="google-title" className="text-lg font-bold text-[#102A56]">Google Sign-In</h2>
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="rounded-md p-1 text-[#94A3B8] hover:text-[#102A56] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#062B67]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
            Google sign-in is currently unavailable.
          </p>
          <button
            onClick={() => setModal(null)}
            className="mt-5 h-10 w-full rounded-[10px] bg-[#062B67] text-sm font-bold text-white transition-colors hover:bg-[#0A377E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            Close
          </button>
        </Modal>
      )}

      {modal === "otp" && (
        <Modal labelledBy="otp-title" onClose={() => setModal(null)}>
          <div className="flex items-start justify-between gap-3">
            <h2 id="otp-title" className="text-lg font-bold text-[#102A56]">OTP Verification</h2>
            <button
              onClick={() => setModal(null)}
              aria-label="Close"
              className="rounded-md p-1 text-[#94A3B8] hover:text-[#102A56] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#062B67]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
            Enter the 6-digit OTP sent to your registered mobile number.
          </p>
          <div className="mt-4">
            <OtpBoxes />
          </div>
          {otpNote && (
            <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {otpNote}
            </p>
          )}
          <button
            onClick={() => setOtpNote("OTP verification is currently unavailable.")}
            className="mt-5 h-11 w-full rounded-[10px] bg-[#062B67] text-sm font-bold text-white transition-colors hover:bg-[#0A377E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            Verify OTP
          </button>
          <button
            onClick={() => setOtpNote("Resend is currently unavailable.")}
            className="mt-2.5 h-10 w-full rounded-[10px] border border-[#D7E0EC] bg-white text-sm font-bold text-[#102A56] transition-colors hover:bg-[#F5F8FC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#062B67]"
          >
            Resend OTP
          </button>
        </Modal>
      )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-slate-200/70" />}
    >
      <LoginForm />
    </React.Suspense>
  );
}
