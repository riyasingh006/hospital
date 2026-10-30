"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function formatNow(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function NoticeBar() {
  const { t } = useI18n();
  // Deterministic placeholder during SSR; the live clock is set after
  // hydration to avoid a server/client text mismatch.
  const [updated, setUpdated] = React.useState("");

  React.useEffect(() => {
    const tick = () => setUpdated(formatNow());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="note"
      className="border-b border-saffron-100 bg-saffron-50/70"
    >
      <div className="container flex flex-wrap items-center gap-x-6 gap-y-1 py-1.5 text-xs text-slate-600">
        <p className="flex min-w-0 items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-saffron-600" aria-hidden />
          <span>
            <strong className="font-semibold text-saffron-800">Important:</strong>{" "}
            {t("notice.text")}
          </span>
        </p>
        <p className="ml-auto hidden shrink-0 md:block">
          <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-india-500 align-middle" />{" "}
          Last system update: Today, {updated || "—"}
        </p>
      </div>
    </div>
  );
}
