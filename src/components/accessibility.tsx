"use client";

import * as React from "react";
import { Contrast, Keyboard, MousePointerClick, Type } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type TextScale = "sm" | "md" | "lg";

interface AccessibilityState {
  textScale: TextScale;
  contrastMode: boolean;
  reducedMotion: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  update: (patch: Partial<AccessibilityState>) => void;
  openPanel: () => void;
}

const DEFAULTS: AccessibilityState = {
  textScale: "sm",
  contrastMode: false,
  reducedMotion: false,
};

const AccessibilityContext = React.createContext<AccessibilityContextValue>({
  ...DEFAULTS,
  update: () => {},
  openPanel: () => {},
});

const STORAGE_KEY = "js_a11y";

export function applyAccessibility(state: AccessibilityState) {
  const root = document.documentElement;
  root.classList.toggle("text-md-mode", state.textScale === "md");
  root.classList.toggle("text-lg-mode", state.textScale === "lg");
  root.classList.toggle("contrast-mode", state.contrastMode);
  root.classList.toggle("reduced-motion", state.reducedMotion);
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<AccessibilityState>(DEFAULTS);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        const merged = { ...DEFAULTS, ...parsed };
        setState(merged);
        applyAccessibility(merged);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = React.useCallback((patch: Partial<AccessibilityState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      applyAccessibility(next);
      return next;
    });
  }, []);

  const openPanel = React.useCallback(() => setOpen(true), []);

  return (
    <AccessibilityContext.Provider
      value={{ ...state, update, openPanel }}
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby="a11y-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-care-600" aria-hidden />
              Accessibility Options
            </DialogTitle>
            <DialogDescription id="a11y-desc">
              Adjust the interface for comfortable reading and navigation. Your
              preferences are saved on this device.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-sm font-medium text-primary-900">
                <Type className="h-4 w-4 text-slate-500" aria-hidden />
                Text size
              </p>
              <div
                role="radiogroup"
                aria-label="Text size"
                className="grid grid-cols-3 gap-2"
              >
                {(
                  [
                    { key: "sm", label: "Normal" },
                    { key: "md", label: "Large" },
                    { key: "lg", label: "Extra Large" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    role="radio"
                    aria-checked={state.textScale === key}
                    onClick={() => update({ textScale: key })}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      state.textScale === key
                        ? "border-care-500 bg-primary-50 text-primary-800"
                        : "border-slate-300 bg-white text-slate-600 hover:border-primary-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              checked={state.contrastMode}
              onChange={(v) => update({ contrastMode: v })}
              icon={<Contrast className="h-4 w-4 text-slate-500" aria-hidden />}
              title="High contrast mode"
              desc="Stronger colours and borders for improved visibility."
            />

            <ToggleRow
              checked={state.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
              icon={
                <MousePointerClick className="h-4 w-4 text-slate-500" aria-hidden />
              }
              title="Reduce motion"
              desc="Minimise animations and transitions across the platform."
            />
          </div>

          <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            Keyboard navigation is fully supported. Press{" "}
            <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-mono text-[10px]">
              Tab
            </kbd>{" "}
            to move between controls. A “Skip to Content” link is available on
            every page.
          </p>
        </DialogContent>
      </Dialog>
    </AccessibilityContext.Provider>
  );
}

function ToggleRow({
  checked,
  onChange,
  icon,
  title,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 p-3.5 hover:border-primary-200">
      <span className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <span>
          <span className="block text-sm font-medium text-primary-900">{title}</span>
          <span className="mt-0.5 block text-xs text-slate-500">{desc}</span>
        </span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function useAccessibility() {
  return React.useContext(AccessibilityContext);
}
