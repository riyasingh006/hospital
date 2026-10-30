"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toast: () => {},
});

let nextId = 1;

const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-india-600" aria-hidden />,
  error: <XCircle className="h-5 w-5 text-red-600" aria-hidden />,
  warning: <AlertTriangle className="h-5 w-5 text-saffron-600" aria-hidden />,
  info: <Info className="h-5 w-5 text-care-600" aria-hidden />,
};

const BORDERS: Record<ToastVariant, string> = {
  success: "border-l-india-500",
  error: "border-l-red-600",
  warning: "border-l-saffron-500",
  info: "border-l-care-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    ({ title, description, variant = "info" }) => {
      const id = nextId++;
      setItems((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), 5200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-3.5 shadow-raised animate-fade-up",
              BORDERS[item.variant]
            )}
          >
            {ICONS[item.variant]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary-900">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(item.id)}
              className="rounded p-0.5 text-slate-400 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return React.useContext(ToastContext);
}
