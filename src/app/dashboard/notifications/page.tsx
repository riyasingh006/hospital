"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, BellRing, CheckCheck, CircleCheckBig, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_STYLES: Record<string, { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; badge: "green" | "red" | "saffron" | "primary"; label: string }> = {
  SUCCESS: { icon: CircleCheckBig, badge: "green", label: "Success" },
  WARNING: { icon: AlertTriangle, badge: "saffron", label: "Warning" },
  CRITICAL: { icon: AlertTriangle, badge: "red", label: "Critical" },
  INFO: { icon: Info, badge: "primary", label: "Info" },
};

export default function NotificationsPage() {
  const [rows, setRows] = React.useState<NotificationRow[] | null>(null);
  const [unread, setUnread] = React.useState(0);
  const { toast } = useToast();

  const load = React.useCallback(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) {
          setRows(json.data.notifications ?? []);
          setUnread(json.data.unread ?? 0);
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => void load(), [load]);

  async function markOne(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    setRows((prev) => prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? null);
    setUnread((u) => Math.max(0, u - 1));
  }

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    toast({ title: "All notifications marked as read", variant: "success" });
    load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="institutional-heading text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Appointment reminders, saved-hospital updates and system messages.
          </p>
        </div>
        {unread > 0 && rows && rows.length > 0 && (
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => void markAll()}>
            <CheckCheck className="h-4 w-4" aria-hidden /> Mark all read ({unread})
          </Button>
        )}
      </header>

      {rows === null && (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )}

      {rows !== null && rows.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={<BellRing className="h-6 w-6" />}
            title="No notifications yet"
            description="Important updates about your care will appear here."
          />
        </div>
      )}

      {rows !== null && rows.length > 0 && (
        <ul className="mt-6 space-y-3">
          {rows.map((n) => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.INFO;
            const Icon = style.icon;
            return (
              <li key={n.id}>
                <Card className={!n.read ? "border-l-4 border-l-saffron-500" : undefined}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-800" aria-hidden>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm ${n.read ? "font-medium text-slate-700" : "font-semibold text-primary-950"}`}>
                          {n.title}
                        </p>
                        <Badge variant={style.badge} size="sm">{style.label}</Badge>
                        {!n.read && <Badge variant="saffron" size="sm">New</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <time dateTime={n.createdAt}>
                          {new Date(n.createdAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </time>
                        {n.link && (
                          <Link href={n.link} className="font-semibold text-care-700 hover:underline">
                            Open →
                          </Link>
                        )}
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => void markOne(n.id)}
                            className="font-medium text-slate-500 hover:text-primary-800 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
