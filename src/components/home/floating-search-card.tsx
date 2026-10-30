"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, MapPin, Search } from "lucide-react";

const HOSPITAL_TYPES = [
  { value: "", label: "All Hospital Types" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
  { value: "TRUST", label: "Trust / NGO" },
];

const DISTANCES = [
  { value: "10", label: "Within 10 km" },
  { value: "5", label: "Within 5 km" },
  { value: "25", label: "Within 25 km" },
  { value: "50", label: "Within 50 km" },
];

export function FloatingSearchCard() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState("");
  const [type, setType] = React.useState("");
  const [radius, setRadius] = React.useState("10");
  const [loading, setLoading] = React.useState(false);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city.trim()) params.set("city", city.trim());
    if (type) params.set("type", type);
    if (radius) params.set("radiusKm", radius);
    router.push(`/hospitals?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSearch}
      className="w-full max-w-[290px] rounded-[14px] border border-white/60 bg-white/95 p-3 shadow-[0_24px_60px_-16px_rgba(6,31,85,0.28)] backdrop-blur-sm"
      aria-label="Find healthcare near you"
    >
      <h3 className="text-[20px] font-bold leading-tight text-[#062B73]">
        Find Healthcare Near You
      </h3>
      <p className="mt-0.5 text-[12px] font-medium text-[#52627A]">
        Search trusted hospitals, specialists and services
      </p>

      <label className="mt-3 block rounded-lg border border-[#E3EAF4] bg-[#FBFCFE] px-3 py-1.5 transition-colors focus-within:border-[#93C5FD] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#BFDBFE]/50">
        <span className="sr-only">What medical care do you need?</span>
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 text-[#8CA3C3]" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What medical care do you need?"
            className="w-full bg-transparent text-[13px] font-semibold text-[#061F55] outline-none placeholder:font-medium placeholder:text-[#33415C]"
          />
        </span>
        <span className="mt-0.5 block pl-6 text-[11px] text-[#8CA3C3]">
          e.g. Cardiology, Neurology, Orthopedic…
        </span>
      </label>

      <label className="mt-2 flex h-[40px] items-center gap-2 rounded-md border border-[#E3EAF4] bg-white px-3 transition-colors focus-within:border-[#93C5FD] focus-within:ring-2 focus-within:ring-[#BFDBFE]/50">
        <MapPin className="h-4 w-4 shrink-0 text-[#F57C00]" aria-hidden />
        <span className="sr-only">Enter city / district / PIN code</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city / district / PIN code"
          className="w-full bg-transparent text-[13px] font-medium text-[#061F55] outline-none placeholder:text-[#7B8BA5]"
        />
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Hospital type"
          className="h-[40px] rounded-md border border-[#E3EAF4] bg-white px-2.5 text-[12px] font-semibold text-[#33415C] outline-none transition-colors focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          {HOSPITAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          aria-label="Distance"
          className="h-[40px] rounded-md border border-[#E3EAF4] bg-white px-2.5 text-[12px] font-semibold text-[#33415C] outline-none transition-colors focus:border-[#93C5FD] focus:ring-2 focus:ring-[#BFDBFE]/50"
        >
          {DISTANCES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group mt-2.5 flex h-[40px] w-full items-center justify-between rounded-md bg-[#062B73] px-4 text-[13.5px] font-bold text-white shadow-[0_10px_22px_-8px_rgba(6,43,115,0.55)] transition-all duration-150 hover:-translate-y-px hover:bg-[#0B3D91] disabled:opacity-70"
      >
        <span className="tracking-wide">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching…
            </span>
          ) : (
            "Search Now"
          )}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 transition-transform duration-150 group-hover:translate-x-0.5">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
        </span>
      </button>
    </form>
  );
}
