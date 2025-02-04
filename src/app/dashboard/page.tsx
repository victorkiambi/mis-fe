"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { DataTable } from "@/components/ui/data-table";
import { Users2Icon, FolderIcon, HomeIcon } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { log } from "console";

interface DashboardStats {
  totalPrograms: number;
  totalHouseholds: number;
  totalMembers: number;
  isLoading: boolean;
  error: string | null;
}

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  relationship: string;
  household: {
    id: number;
    head_first_name: string;
    head_last_name: string;
    program: {
      id: number;
      name: string;
    };
  };
}

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "relationship",
    header: "Relationship",
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateOfBirth"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "household.headFirstName",
    header: "Household Head",
    cell: ({ row }) => {
      const household = row.original.household;
      return `${household.headFirstName} ${household.headLastName}`;
    },
  },
  {
    accessorKey: "household.program.name",
    header: "Program",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const api = useApi();
  const [stats, setStats] = useState<DashboardStats>({
    totalPrograms: 0,
    totalHouseholds: 0,
    totalMembers: 0,
    isLoading: true,
    error: null,
  });
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all required data in parallel
        const [programsResponse, householdsResponse, membersResponse] = await Promise.all([
          api.getPrograms(),
          api.getHouseholds(),
          api.getMembers(),
        ]);

        // Calculate totals
        const totalPrograms = programsResponse.data.length;
        const totalHouseholds = householdsResponse.data.length;
        const totalMembers = membersResponse.data.length;

        setStats({
          totalPrograms,
          totalHouseholds,
          totalMembers,
          isLoading: false,
          error: null,
        });

        setMembers(membersResponse.data);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (error instanceof Error && error.message === "Unauthorized") {
          router.push("/login");
          return;
        }
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to load dashboard statistics",
        }));
      }
    }

    loadData();
  }, [api, router]);

  if (stats.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg">Loading dashboard...</div>
          <div className="text-sm text-muted-foreground">Please wait</div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg text-red-500">{stats.error}</div>
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your social protection programs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Total Programs"
          value={stats.totalPrograms.toString()}
          icon={<FolderIcon className="h-4 w-4" />}
          description="Active social protection programs"
        />
        <DashboardCard
          title="Total Households"
          value={stats.totalHouseholds.toLocaleString()}
          icon={<HomeIcon className="h-4 w-4" />}
          description="Registered beneficiary households"
        />
        <DashboardCard
          title="Total Members"
          value={stats.totalMembers.toLocaleString()}
          icon={<Users2Icon className="h-4 w-4" />}
          description="Individual beneficiaries"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">All Members</h3>
          <p className="text-muted-foreground">
            List of all registered beneficiary members
          </p>
        </div>
        <DataTable 
          columns={columns} 
          data={members}
          searchKey="first_name"
        />
      </div>
    </div>
  );
}
