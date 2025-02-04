"use client";

import { useEffect, useState, use } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { AddMemberDialog } from "@/components/households/add-member-dialog";

interface Member {
  id: number;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth: string;
  relationship: string;
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
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateOfBirth"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "relationship",
    header: "Relationship",
  },
];

export default function MembersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const api = useApi();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    try {
      const response = await api.getHouseholdMembers(parseInt(resolvedParams.id));
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to load members:", error);
      if (error instanceof Error && error.message === "Unauthorized") {
        router.push("/login");
        return;
      }
      setError("Failed to load household members");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [api, router, resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-lg">Loading members...</div>
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
          <h2 className="text-3xl font-bold tracking-tight">Household Members</h2>
          <p className="text-muted-foreground">
            Manage household members for household #{resolvedParams.id}
          </p>
        </div>
        <AddMemberDialog 
          householdId={parseInt(resolvedParams.id)} 
          onSuccess={loadMembers} 
        />
      </div>

      <DataTable 
        columns={columns} 
        data={members}
        searchKey="firstName" 
      />
    </div>
  );
} 