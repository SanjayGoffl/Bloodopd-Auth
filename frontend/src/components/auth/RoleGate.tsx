import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface RoleGateProps {
  allowed: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only if the current user's role is in the allowed list. */
export default function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();
  if (!user || !allowed.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
