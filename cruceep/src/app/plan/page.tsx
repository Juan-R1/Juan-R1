"use client";

import { Suspense } from "react";
import { TripPlanner } from "@/components/trip-planner";
import { LoadingState } from "@/components/states";

export default function PlanPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TripPlanner />
    </Suspense>
  );
}
