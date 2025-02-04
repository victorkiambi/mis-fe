"use client";

import { useEffect, useState, use } from "react";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  phone: string;
  location: string;
  program_id: number;
}

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "headFirstName",
    header: "First Name",
  },
  {
    accessorKey: "headLastName",
    header: "Last Name",
  },
  {
    accessorKey: "headIdNumber",
    header: "Id Number",
  },
  
];

export default function ProgramMembersPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const api = useApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [program, setProgram] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [programResponse, membersResponse] = await Promise.all([
          api.getPrograms(),
          api.getProgramMembers(parseInt(resolvedParams.id)),
        ]);

        const programData = programResponse.data.find(
          (p) => p.id === parseInt(resolvedParams.id)
        );
        if (programData) {
          setProgram(programData);
        }
        setMembers(membersResponse.data);
      } catch (error) {
        console.error("Failed to load program members:", error);
        setError("Failed to load program members");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [api, resolvedParams.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/programs">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {program?.name} Households
              </h2>
              <p className="text-muted-foreground">
                View and manage program households
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={members}
        searchKey="first_name"
      />
    </div>
  );
} 