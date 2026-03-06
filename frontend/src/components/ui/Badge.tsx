import type { ReactNode } from "react";

const colorMap: Record<string, string> = {
  info: "bg-brand-100 text-brand-800",
  success: "bg-medical-100 text-medical-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-danger-100 text-danger-800",
  gray: "bg-gray-100 text-gray-700",
};

interface BadgeProps {
  color?: string;
  children: ReactNode;
  className?: string;
}

export default function Badge({ color = "gray", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  );
}
