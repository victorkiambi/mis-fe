"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Sublocation {
  id: number;
  locationId: number;
  name: string;
  code: string;
}

interface AdminLocation {
  id: number;
  subcountyId: number;
  name: string;
  code: string;
  sublocations: Sublocation[];
}

interface Subcounty {
  id: number;
  countyId: number;
  name: string;
  code: string;
  locations: AdminLocation[];
}

interface County {
  id: number;
  name: string;
  code: string;
  subcounties: Subcounty[];
}

interface FlatLocation {
  id: number;
  name: string;
  code: string;
  type: "county" | "subcounty" | "location" | "sublocation";
  parent_name: string | null;
  full_path: string;
}

const columns: ColumnDef<FlatLocation>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("type")}</div>
    ),
  },
  {
    id: "parent",
    header: "Parent",
    cell: ({ row }) => {
      const location = row.original;
      if (!location.parent_name) return null;
      
      return (
        <div className="flex items-center space-x-1">
          <span className="text-muted-foreground capitalize">
            {location.parent_name}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span>{location.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "full_path",
    header: "Full Path",
  },
];

function flattenLocations(counties: County[]): FlatLocation[] {
  const flatLocations: FlatLocation[] = [];

  counties.forEach(county => {
    // Add county
    flatLocations.push({
      id: county.id,
      name: county.name,
      code: county.code,
      type: "county",
      parent_name: null,
      full_path: county.name,
    });

    county.subcounties.forEach(subcounty => {
      // Add subcounty
      flatLocations.push({
        id: subcounty.id,
        name: subcounty.name,
        code: subcounty.code,
        type: "subcounty",
        parent_name: county.name,
        full_path: `${county.name} > ${subcounty.name}`,
      });

      subcounty.locations.forEach(location => {
        // Add location
        flatLocations.push({
          id: location.id,
          name: location.name,
          code: location.code,
          type: "location",
          parent_name: subcounty.name,
          full_path: `${county.name} > ${subcounty.name} > ${location.name}`,
        });

        location.sublocations.forEach(sublocation => {
          // Add sublocation
          flatLocations.push({
            id: sublocation.id,
            name: sublocation.name,
            code: sublocation.code,
            type: "sublocation",
            parent_name: location.name,
            full_path: `${county.name} > ${subcounty.name} > ${location.name} > ${sublocation.name}`,
          });
        });
      });
    });
  });

  return flatLocations;
}

export default function LocationsPage() {
  const router = useRouter();
  const api = useApi();
  const [locations, setLocations] = useState<FlatLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadLocations() {
    try {
      const response = await api.getCounties();
      const flatLocations = flattenLocations(response.data);
      setLocations(flatLocations);
    } catch (error) {
      console.error("Failed to load locations:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        router.push("/login");
        return;
      }
      setError("Failed to load locations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, [api, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg">Loading locations...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg text-red-500">{error}</div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <p className="text-muted-foreground">
          View and manage administrative locations
        </p>
      </div>

      <DataTable 
        columns={columns} 
        data={locations}
        searchKey="name"
      />
    </div>
  );
} 