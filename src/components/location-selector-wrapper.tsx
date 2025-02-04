"use client";

import { LocationSelector } from "@/components/location-selector";

export function LocationSelectorWrapper() {
  return (
    <LocationSelector
      onLocationChange={(location) => {
        console.log("Selected location:", location);
      }}
    />
  );
} 