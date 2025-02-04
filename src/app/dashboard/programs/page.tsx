"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import Link from "next/link";
import { AddProgramDialog } from "@/components/programs/add-program-dialog";

interface Program {
  id: number;
  name: string;
  description: string;
  beneficiaries: number;
  status: "active" | "inactive";
}

const columns: ColumnDef<Program>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const program = row.original;
      
      return (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/programs/${program.id}/households`}>
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
  
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <div className={`capitalize ${
  //       row.getValue("status") === "active" ? "text-green-600" : "text-red-600"
  //     }`}>
  //       {row.getValue("status")}
  //     </div>
  //   ),
  // },
];

export default function ProgramsPage() {
  const api = useApi();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPrograms() {
    try {
      const response = await api.getPrograms();
      setPrograms(response.data);
    } catch (error) {
      console.error("Failed to load programs:", error);
      setError("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, [api]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
          <p className="text-muted-foreground">
            Manage your social protection programs
          </p>
        </div>
        <AddProgramDialog onSuccess={loadPrograms} />
      </div>

      <DataTable columns={columns} data={programs} />
    </div>
  );
} 