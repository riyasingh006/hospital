import { Suspense } from "react";
import { HospitalsClient } from "@/components/hospital/hospitals-client";
import { CardSkeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Find Hospital",
  description:
    "Search and compare verified hospitals by specialty, availability, emergency capability and distance.",
};

export default function HospitalsPage() {
  return (
    <Suspense
      fallback={
        <div className="container space-y-4 py-10">
          <div className="skeleton h-20 w-full rounded-xl" />
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <HospitalsClient />
    </Suspense>
  );
}
