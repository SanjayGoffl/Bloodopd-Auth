import { cn, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, className, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status] || "bg-gray-100 text-gray-800",
        pulse && "animate-pulse",
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
  className?: string;
}

const ROLE_COLORS: Record<string, string> = {
  hod: "bg-purple-100 text-purple-800",
  officer: "bg-indigo-100 text-indigo-800",
  lab_tech: "bg-cyan-100 text-cyan-800",
  clinician: "bg-blue-100 text-blue-800",
  nurse: "bg-pink-100 text-pink-800",
};

const ROLE_LABELS: Record<string, string> = {
  hod: "HOD / Medical Director",
  officer: "Blood Bank Officer",
  lab_tech: "Lab Technician",
  clinician: "Requesting Clinician",
  nurse: "Transfusion Nurse",
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ROLE_COLORS[role] || "bg-gray-100 text-gray-800",
        className
      )}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

interface UrgencyBadgeProps {
  urgency: string;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  const colors: Record<string, string> = {
    routine: "bg-gray-100 text-gray-700",
    urgent: "bg-amber-100 text-amber-800",
    emergency: "bg-red-100 text-red-800 font-bold animate-pulse",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        colors[urgency] || "bg-gray-100 text-gray-700",
        className
      )}
    >
      {urgency.toUpperCase()}
    </span>
  );
}
