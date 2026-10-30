"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Ambulance,
  BedDouble,
  FlaskConical,
  Map,
  Search,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { SectionHeading } from "@/components/layout/page-header";

const SERVICES = [
  {
    icon: Search,
    emoji: "🏥",
    title: "Find Hospital",
    desc: "Find suitable healthcare facilities near you, ranked intelligently.",
    href: "/hospitals",
  },
  {
    icon: Stethoscope,
    emoji: "👨‍⚕️",
    title: "Find Specialist",
    desc: "Search verified doctors across 12+ specialties and departments.",
    href: "/doctors",
  },
  {
    icon: BedDouble,
    emoji: "🛏️",
    title: "Bed Availability",
    desc: "Check recently updated bed, ICU and ventilator availability.",
    href: "/hospitals?icu=1",
  },
  {
    icon: Ambulance,
    emoji: "🚨",
    title: "Emergency Care",
    desc: "Locate emergency-capable facilities within minutes.",
    href: "/emergency",
  },
  {
    icon: FlaskConical,
    emoji: "🧪",
    title: "Diagnostic Services",
    desc: "Find hospitals offering pathology, MRI, CT and more.",
    href: "/hospitals?service=DIAGNOSTICS",
  },
  {
    icon: Map,
    emoji: "🗺️",
    title: "Navigate",
    desc: "Get directions with distance and estimated travel time.",
    href: "/hospitals",
  },
];

export function QuickServices() {
  return (
    <section className="bg-paper py-14">
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="Quick Services"
          description="Essential healthcare navigation services, available in a few clicks."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Link
                href={s.href}
                className="group flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-care-300 hover:shadow-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-lg"
                  aria-hidden
                >
                  <s.icon className="h-5 w-5 text-primary-700" />
                </span>
                <span>
                  <span className="flex items-center gap-1 font-semibold text-primary-900">
                    {s.title}
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-care-500" aria-hidden />
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                    {s.desc}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
