"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth-context";

export function useSavedHospitals() {
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [loaded, setLoaded] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/user/saved", { cache: "no-store" });
      const json = await res.json();
      if (json.ok) {
        setSavedIds(
          new Set(
            (json.data.saved as { hospitalId: string }[]).map(
              (s) => s.hospitalId
            )
          )
        );
      }
    } catch {
      // guest or offline — treat as empty
    } finally {
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { savedIds, loaded, refresh };
}

export function SaveHospitalButton({
  hospitalId,
  saved,
  onChange,
  size = "sm",
}: {
  hospitalId: string;
  saved: boolean;
  onChange?: (next: boolean) => void;
  size?: "sm" | "md" | "lg";
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to save hospitals.", variant: "info" });
      return;
    }
    setBusy(true);
    try {
      if (!saved) {
        const res = await fetch("/api/user/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hospitalId }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Failed");
        toast({ title: "Hospital saved", variant: "success" });
        onChange?.(true);
      } else {
        const res = await fetch(`/api/user/saved?hospitalId=${encodeURIComponent(hospitalId)}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error ?? "Failed");
        toast({ title: "Removed from saved hospitals", variant: "info" });
        onChange?.(false);
      }
    } catch (e) {
      toast({
        title: "Could not update saved hospitals",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={saved ? "outlineSaffron" : "ghost"}
      size={size}
      className="gap-1.5"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={saved}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" aria-hidden />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden />
      )}
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
