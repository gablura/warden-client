"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { createWardenClient, type WardenClient } from "@/lib/warden-api";

/**
 * Builds the warden-server client from the current session:
 * Clerk sessions exchange per-org scoped tokens transparently,
 * API-key sessions pass the service key through.
 */
export function useWardenClient(): WardenClient {
  const { getToken, token: serviceToken, user } = useAuth();
  const authMethod = user?.authMethod;

  return useMemo(
    () =>
      createWardenClient({
        getClerkToken: async () => {
          if (authMethod === "api_key") return null;
          return getToken();
        },
        getServiceKey: () => (authMethod === "api_key" ? serviceToken : null),
      }),
    [getToken, serviceToken, authMethod],
  );
}
