import { useAuth } from "@/providers/auth-provider";
import { createApiClient } from "@/lib/api-client";
import { useMemo } from "react";

export function useApi() {
  const { token } = useAuth();
  
  return useMemo(() => createApiClient(token), [token]);
} 