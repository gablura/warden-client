"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Required role. If provided, user must have this role. */
  requiredRole?: "admin" | "approver";
}

/**
 * Wraps protected content. Redirects to /sign-in if not authenticated,
 * or to / if authenticated but lacking the required role.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      setIsRedirecting(true);
      router.replace("/sign-in");
      return;
    }
    
    if (requiredRole && user?.role !== requiredRole) {
      setIsRedirecting(true);
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-foreground-muted">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
