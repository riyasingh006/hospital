import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { BrandLockup } from "@/components/brand";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-16 text-center"
    >
      <BrandLockup />

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-saffron-600">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-primary-950 sm:text-4xl">
        This page could not be found.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
        The page you are looking for may have been moved, renamed or might not
        exist yet. Use the links below to continue navigating जीवन Sahay.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-700 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-800"
        >
          <Home className="h-4 w-4" aria-hidden /> Go to homepage
        </Link>
        <Link
          href="/hospitals"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-primary-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
        >
          <Compass className="h-4 w-4" aria-hidden /> Find Hospitals
        </Link>
      </div>
      <p className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-400">
        In a medical emergency, call <strong className="text-red-700">112</strong> or{" "}
        <strong className="text-red-700">108</strong> immediately.
      </p>
    </main>
  );
}
