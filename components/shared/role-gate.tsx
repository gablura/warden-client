"use client";

import { useAuth } from "@/features/auth/useAuth";

type Role = "owner" | "admin" | "approver" | "viewer";

const ROLE_HIERARCHY: Role[] = ["owner", "admin", "approver", "viewer"];

interface RoleGateProps {
  children: React.ReactNode;
  minRole?: Role;
  fallback?: React.ReactNode;
}

function hasRole(userRole: string | undefined, minRole: Role): boolean {
  if (!userRole) return false;
  const level = ROLE_HIERARCHY.indexOf(userRole as Role);
  const required = ROLE_HIERARCHY.indexOf(minRole);
  return level >= 0 && level <= required;
}

export function RoleGate({ children, minRole = "admin", fallback }: RoleGateProps) {
  const { user } = useAuth();
  if (hasRole(user?.role, minRole)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  return null;
}
