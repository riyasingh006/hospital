"use client";

import { Route as RouteIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavigateButton({ hospitalId }: { hospitalId: string }) {
  return (
    <Link href={`/navigate/${hospitalId}`}>
      <Button size="lg" className="gap-2">
        <RouteIcon className="h-4.5 w-4.5" aria-hidden /> Start Navigation
      </Button>
    </Link>
  );
}
