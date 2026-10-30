"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, Cpu, MapPinned, ListOrdered, PhoneCall, Siren } from "lucide-react";
import { SectionHeading } from "@/components/layout/page-header";

const STEPS = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Tell Us Your Requirement",
    desc: "Describe symptoms or needs in plain language — type, speak, or use quick options.",
  },
  {
    num: "02",
    icon: Cpu,
    title: "AI Understands Your Need",
    desc: "जीवन AI interprets the medical requirement, urgency and relevant specialty.",
  },
  {
    num: "03",
    icon: ListOrdered,
    title: "Hospitals Are Intelligently Ranked",
    desc: "Facilities are scored on capability, specialist and bed availability, emergency readiness and distance.",
  },
  {
    num: "04",
    icon: MapPinned,
    title: "Navigate to the Right Facility",
    desc: "Get directions, travel time and a direct line to the hospital.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-slate-200 bg-white py-14">
      <div className="container">
        <SectionHeading
          eyebrow="Process"
          title="How जीवन Sahay Works"
          description="From requirement to the right hospital door — in four clear steps."
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-slate-200 bg-paper p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary-100">{step.num}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-care-200 bg-white text-care-600">
                  <step.icon className="h-5 w-5" aria-hidden />
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3.5 top-1/2 hidden h-px w-7 border-t-2 border-dashed border-slate-300 lg:block"
                />
              )}
              <h3 className="mt-3 text-sm font-bold uppercase tracking-wide text-primary-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function EmergencyBanner() {
  return (
    <section className="relative overflow-hidden bg-[#B42318] py-14 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)",
        }}
      />
      <div className="container relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-red-200">
            <Siren className="h-4 w-4 animate-pulse-dot" aria-hidden /> Emergency Support
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight md:text-3xl">
            Need Urgent Medical Assistance?
          </h2>
          <p className="mt-2 max-w-lg leading-relaxed text-red-100">
            Find nearby healthcare facilities equipped to handle your requirement —
            sorted by emergency readiness and travel time.
          </p>
        </motion.div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link
            href="/emergency"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-4 text-base font-extrabold uppercase tracking-wide text-[#B42318] shadow-raised transition-transform hover:-translate-y-0.5"
          >
            🚨 Find Emergency Care
          </Link>
          <a
            href="tel:112"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            <PhoneCall className="h-5 w-5" aria-hidden />
            Emergency Helpline · 112
          </a>
        </div>
      </div>
    </section>
  );
}
