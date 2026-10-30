"use client";

import { AccessibilityProvider } from "@/components/accessibility";
import { AuthProvider } from "@/components/auth-context";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </I18nProvider>
  );
}
