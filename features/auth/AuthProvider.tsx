"use client";

import { createContext, useCallback, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { validateAuthConfig } from "@/lib/auth-config";
import { markApiKeySession, clearApiKeySession } from "@/lib/api-key-session";

export interface User {
  id: string;
  email: string;
  label?: string;
  role: string;
  walletAddress?: string;
  orgId?: string;
  orgRole?: string;
  authMethod: "clerk" | "api_key";
  memberships?: Array<{
    org: { id: string; name: string; slug: string; verified: boolean };
    role: string;
  }>;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  signInWithApiKey: (apiKey: string) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signOut: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_KEY_KEY = "warden_api_key";
const USER_KEY = "warden_user";

function readStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_KEY);
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKeyState, setApiKeyState] = useState<AuthState>(() => {
    const key = readStoredApiKey();
    const user = readStoredUser();
    if (key && user?.authMethod === "api_key") {
      return { token: key, user, isLoading: false };
    }
    return { token: null, user: null, isLoading: false };
  });

  // Validate auth configuration on mount
  useEffect(() => {
    const config = validateAuthConfig();
    if (!config.isValid) {
      console.error("Authentication configuration errors:", config.errors);
    }
    if (config.warnings.length > 0) {
      console.warn("Authentication configuration warnings:", config.warnings);
    }
  }, []);

  // Clerk hooks
  const { isSignedIn: clerkSignedIn, getToken: getClerkToken } = useClerkAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

  // Middleware-visible session hint for API-key logins. While an API key is
  // held, keep the cookie present — including on first mount of a restored
  // localStorage session, where the browser may have dropped the cookie
  // while localStorage survived (without this refresh, that mismatch would
  // bounce /dashboard → /sign-in → /dashboard in a loop).
  useEffect(() => {
    if (apiKeyState.token) markApiKeySession();
  }, [apiKeyState.token]);

  // For Clerk users, fetch the real profile from the server to get the
  // org-specific role (not hardcoded "viewer").
  const [clerkProfile, setClerkProfile] = useState<{ role: string; memberships: Array<{ org: { id: string; name: string; slug: string; verified: boolean }; role: string }> } | null>(null);

  useEffect(() => {
    if (!clerkSignedIn || !clerkUser || !clerkLoaded) {
      setClerkProfile(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const token = await getClerkToken();
        if (!token || cancelled) return;
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const profile = await res.json();
        setClerkProfile({
          role: profile.memberships?.[0]?.role ?? "viewer",
          memberships: profile.memberships ?? [],
        });
      } catch {
        // ignore — will use default "viewer"
      }
    })();
    return () => { cancelled = true; };
  }, [clerkSignedIn, clerkUser, clerkLoaded, getClerkToken]);

  // Derive the current user from Clerk or API key
  const user: User | null = (() => {
    // Clerk user takes precedence when signed in
    if (clerkSignedIn && clerkUser) {
      return {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        label: clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0],
        role: clerkProfile?.role ?? "viewer",
        authMethod: "clerk",
        memberships: clerkProfile?.memberships,
      };
    }
    // Fall back to API key user
    return apiKeyState.user;
  })();

  // Clear API key state when Clerk signs in
  useEffect(() => {
    if (clerkSignedIn && apiKeyState.token) {
      // Clear API key state when user signs in with Clerk — including the
      // middleware hint, so the cookie never outlives the credentials it
      // hints at.
      localStorage.removeItem(API_KEY_KEY);
      localStorage.removeItem(USER_KEY);
      clearApiKeySession();
      setApiKeyState({ token: null, user: null, isLoading: false });
    }
  }, [clerkSignedIn]);

  const isAuthenticated = clerkSignedIn || !!apiKeyState.token;
  const isLoading = !clerkLoaded || apiKeyState.isLoading;

  const signInWithApiKey = useCallback(async (apiKey: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    
    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { ok: false, error: errorData.error || errorData.message || "Invalid API key" };
      }

      const profile = await res.json();
      const newUser: User = {
        id: profile.id,
        email: profile.email ?? profile.label,
        label: profile.label,
        role: profile.role ?? "viewer",
        walletAddress: profile.walletAddress,
        authMethod: "api_key",
      };

      localStorage.setItem(API_KEY_KEY, apiKey);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      // The redirect to /dashboard goes through the middleware, which cannot
      // see localStorage — drop the hint cookie BEFORE navigating, or the
      // middleware bounces the login straight back to /sign-in.
      markApiKeySession();
      setApiKeyState({ token: apiKey, user: newUser, isLoading: false });
      return { ok: true, user: newUser };
    } catch (error) {
      console.error("API key sign-in error:", error);
      return { ok: false, error: "Network error. Please check your connection." };
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(API_KEY_KEY);
    localStorage.removeItem(USER_KEY);
    clearApiKeySession();
    setApiKeyState({ token: null, user: null, isLoading: false });
    // Note: Clerk sign-out is handled by the layout component
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    // Clerk token takes precedence
    if (clerkSignedIn && getClerkToken) {
      try {
        const token = await getClerkToken();
        return token;
      } catch (error) {
        console.error("Failed to get Clerk token:", error);
        // Fall back to API key if Clerk token fails
        return apiKeyState.token;
      }
    }
    // Fall back to API key
    return apiKeyState.token;
  }, [clerkSignedIn, getClerkToken, apiKeyState.token]);

  return (
    <AuthContext.Provider value={{ token: apiKeyState.token, user, isLoading, isAuthenticated, signInWithApiKey, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
