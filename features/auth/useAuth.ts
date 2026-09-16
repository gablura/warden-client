"use client";

import { useContext } from "react";
import { AuthContext, type User } from "./AuthProvider";

interface UseAuthReturn {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithApiKey: (apiKey: string) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signOut: () => void;
  getToken: () => Promise<string | null>;
}

export function useAuth(): UseAuthReturn {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return {
    ...ctx,
  };
}
