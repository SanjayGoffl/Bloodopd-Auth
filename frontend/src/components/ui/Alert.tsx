import type { ReactNode } from "react";

const styles: Record<string, string> = {
  info: "bg-brand-50 border-brand-200 text-brand-800",
  success: "bg-medical-50 border-medical-200 text-medical-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  danger: "bg-danger-50 border-danger-200 text-danger-800",
};

interface AlertProps {
  variant?: string;
  children: ReactNode;
  className?: string;
}

export default function Alert({ variant = "info", children, className = "" }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[variant] || styles.info} ${className}`}>
      {children}
    </div>
  );
}
