"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const HospitalMapDynamic = dynamic(
  () => import("@/components/patient/hospital-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-primary-50">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    ),
  }
);
