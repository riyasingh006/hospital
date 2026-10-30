"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  BrainCircuit,
  CheckCircle2,
  Mic,
  Navigation,
  Search,
  Siren,
} from "lucide-react";
import { IndiaMapViz } from "@/components/landing/india-map-viz";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#EEF3FB,transparent_55%)]"
      />
      <div className="container relative grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        {/* ---------------- Left: copy + CTAs ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-care-200 bg-care-50 px-3 py-1 text-xs font-semibold text-care-700">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-india-500" aria-hidden />
            Live availability • AI-powered recommendations
          </p>

          <h1 className="mt-4 max-w-xl font-sans text-3xl font-bold leading-tight tracking-tight text-primary-900 sm:text-4xl lg:text-[2.75rem]">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            {t("hero.body")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/hospitals"
              className="inline-flex h-13 items-center gap-2 rounded-lg bg-primary-700 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
            >
              {t("hero.cta.primary")}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              href="/emergency"
              className="inline-flex h-13 items-center gap-2 rounded-lg bg-[#B42318] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#912018]"
            >
              <Siren className="h-5 w-5" aria-hidden />
              {t("hero.cta.emergency")}
            </Link>
            <Link
              href="/ai-assistant"
              className="inline-flex h-13 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-base font-medium text-primary-800 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
            >
              <BrainCircuit className="h-5 w-5 text-care-600" aria-hidden />
              {t("hero.cta.askAi")}
            </Link>
          </div>

          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-slate-200 pt-5">
            {[
              { value: "500+", label: "Partner Hospitals" },
              { value: "24×7", label: "Emergency Tracking" },
              { value: "8", label: "Languages Planned" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-xl font-bold text-primary-900">{s.value}</dd>
                <dd className="text-xs text-slate-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* ---------------- Right: dashboard visualisation ---------------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto hidden w-full max-w-[520px] md:block"
          aria-hidden
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-raised">
            <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Hospital Network — Live View
              </p>
              <span className="flex items-center gap-1.5 rounded-full bg-status-available-bg px-2 py-0.5 text-[10px] font-semibold text-status-available-fg">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-india-500" />
                LIVE
              </span>
            </div>

            <div className="relative h-[380px] overflow-hidden rounded-xl bg-paper">
              <IndiaMapViz />

              {/* AI recommendation floating card */}
              <div className="absolute right-3 top-3 w-60 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-raised backdrop-blur">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-care-600">
                      <BrainCircuit className="h-3 w-3" /> AI Recommended
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary-900">
                      City Multispeciality Hospital
                    </p>
                  </div>
                  <ScoreRing value={94} />
                </div>
                <ul className="mt-2.5 space-y-1">
                  {["Cardiology available", "ICU — 4 beds", "ETA 10 min"].map((r) => (
                    <li key={r} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="h-3 w-3 text-india-600" aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* availability strip */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
                <Chip icon={<BedDouble className="h-3.5 w-3.5" />} tone="green" label="ICU · 4 Available" />
                <Chip icon={<Siren className="h-3.5 w-3.5" />} tone="red" label="Emergency Active" pulse />
                <Chip icon={<Navigation className="h-3.5 w-3.5" />} tone="blue" label="4.2 km · 10 min" />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-paper px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="truncate text-xs text-slate-400">
                &ldquo;I need a hospital with ICU availability&rdquo;
              </span>
              <Mic className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Chip({
  icon,
  label,
  tone,
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "green" | "red" | "blue";
  pulse?: boolean;
}) {
  const tones = {
    green: "bg-status-available-bg text-status-available-fg border-status-available-border",
    red: "bg-status-unavailable-bg text-red-700 border-red-200",
    blue: "bg-status-info-bg text-status-info-fg border-status-info-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-red-500" />
      )}
      {icon}
      {label}
    </span>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <span className="relative h-11 w-11 shrink-0" title={`${value}% match`}>
      <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#E2E8F0" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#12813B"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-india-600">
        {value}
      </span>
    </span>
  );
}
