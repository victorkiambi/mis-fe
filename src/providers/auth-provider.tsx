"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { setAuthCookie, removeAuthCookie } from "@/app/login/actions";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setTokenState(storedToken);
    }
    setIsLoading(false);
  }, []);

  const setToken = async (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      await setAuthCookie(newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem("token");
      await removeAuthCookie();
      setTokenState(null);
    }
  };

  const logout = async () => {
    await setToken(null);
    router.push('/login');
  };

  // Don't render children until we've checked localStorage
  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ token, setToken, isLoading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 