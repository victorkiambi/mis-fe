"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddHouseholdDialog } from "@/components/households/add-household-dialog";

interface Location {
  sublocation: string;
  location: string;
  subcounty: string;
  county: string;
}

interface Program {
  id: number;
  name: string;
}

interface Household {
  id: number;
  head_first_name: string;
  head_last_name: string;
  phone: string;
  program: Program;
  location: Location;
}

const columns: ColumnDef<Household>[] = [
  {
    accessorKey: "head_first_name",
    header: "First Name",
  },
  {
    accessorKey: "head_last_name",
    header: "Last Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "program.name",
    header: "Program",
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.original.location;
      return (
        <div className="space-y-1">
          <div className="text-sm">{location.sublocation}</div>
          <div className="text-xs text-muted-foreground">
            {location.location}, {location.subcounty}, {location.county}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const household = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/households/${household.id}/members`}>
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];

export default function HouseholdsPage() {
  const router = useRouter();
  const api = useApi();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadHouseholds() {
    try {
      const response = await api.getHouseholds();
      setHouseholds(response.data);
    } catch (error) {
      console.error("Failed to load households:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        router.push("/login");
        return;
      }
      setError("Failed to load households. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHouseholds();
  }, [api, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg">Loading households...</div>
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Households</h2>
          <p className="text-muted-foreground">
            Manage beneficiary households
          </p>
        </div>
        <AddHouseholdDialog onSuccess={loadHouseholds} />
      </div>

      <DataTable 
        columns={columns} 
        data={households}
        searchKey="head_first_name"
      />
    </div>
  );
} 