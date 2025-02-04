"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  id: number;
  name: string;
  code: string;
}

interface LocationSelectorProps {
  onLocationChange: (location: {
    county?: number;
    subcounty?: number;
    location?: number;
    sublocation?: number;
  }) => void;
}

export function LocationSelector({ onLocationChange }: LocationSelectorProps) {
  const [counties, setCounties] = useState<Location[]>([]);
  const [subcounties, setSubcounties] = useState<Location[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sublocations, setSublocations] = useState<Location[]>([]);

  const [selectedCounty, setSelectedCounty] = useState<string>();
  const [selectedSubcounty, setSelectedSubcounty] = useState<string>();
  const [selectedLocation, setSelectedLocation] = useState<string>();
  const [selectedSublocation, setSelectedSublocation] = useState<string>();

  useEffect(() => {
    // Fetch counties
    fetch("/api/v1/locations/counties")
      .then((res) => res.json())
      .then((data) => setCounties(data.data));
  }, []);

  const handleCountyChange = async (value: string) => {
    setSelectedCounty(value);
    setSelectedSubcounty(undefined);
    setSelectedLocation(undefined);
    setSelectedSublocation(undefined);
    
    const res = await fetch(`/api/v1/locations/counties/${value}/subcounties`);
    const data = await res.json();
    setSubcounties(data.data);
    
    onLocationChange({ county: Number(value) });
  };

  const handleSubcountyChange = async (value: string) => {
    setSelectedSubcounty(value);
    setSelectedLocation(undefined);
    setSelectedSublocation(undefined);
    
    const res = await fetch(`/api/v1/locations/subcounties/${value}/locations`);
    const data = await res.json();
    setLocations(data.data);
    
    onLocationChange({ 
      county: Number(selectedCounty),
      subcounty: Number(value)
    });
  };

  // Similar handlers for location and sublocation...

  return (
    <div className="flex space-x-4">
      <Select value={selectedCounty} onValueChange={handleCountyChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select county" />
        </SelectTrigger>
        <SelectContent>
          {counties.map((county) => (
            <SelectItem key={county.id} value={county.id.toString()}>
              {county.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCounty && (
        <Select value={selectedSubcounty} onValueChange={handleSubcountyChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select subcounty" />
          </SelectTrigger>
          <SelectContent>
            {subcounties.map((subcounty) => (
              <SelectItem key={subcounty.id} value={subcounty.id.toString()}>
                {subcounty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Similar Select components for locations and sublocations */}
    </div>
  );
} 