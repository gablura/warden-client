"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/features/auth/useAuth";
import { useAgentDetail, useSetPolicy, useSetAllowlist, useApplyPendingPolicy } from "@/features/agent-registry/hooks";
import { AgentPassport } from "@/features/agent-registry/components/agent-passport";
import { getApiErrorMessage } from "@/lib/handle-api-error";

export default function AgentDetailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const address = (params?.address as string) ?? "";

  const { data, isLoading } = useAgentDetail(address);
  // Use the agent's organizationId for cache invalidation to match the list query key
  const orgId = data?.agent?.organizationId ?? "";
  const setPolicy = useSetPolicy(orgId);
  const setAllowlist = useSetAllowlist(orgId);
  const applyPendingPolicy = useApplyPendingPolicy(orgId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/sign-in");
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading agent...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!data?.agent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Agent</h1>
          <p className="mt-1 text-sm text-foreground-secondary">Agent not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          ← Back
        </button>
      </div>
      <AgentPassport
        agent={data.agent}
        recentPayments={data.recentPayments.data}
        allowlist={data.allowlist}
        onPolicySubmit={(input) => setPolicy.mutate(input)}
        policySubmitting={setPolicy.isPending}
        onAllowlistSubmit={(input) => setAllowlist.mutate(input)}
        allowlistSubmitting={setAllowlist.isPending}
        allowlistError={setAllowlist.isError ? getApiErrorMessage(setAllowlist.error) : null}
        onApplyPending={(addr: string) => applyPendingPolicy.mutate(addr)}
        applyPendingSubmitting={applyPendingPolicy.isPending}
      />
    </div>
  );
}
