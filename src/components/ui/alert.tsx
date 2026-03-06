"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface AlertProps {
  title: string;
  message: string;
  variant?: "info" | "warning" | "critical";
  dismissible?: boolean;
  className?: string;
}

export function Alert({ title, message, variant = "info", dismissible, className }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-4 border",
        {
          "bg-blue-50 border-blue-200 text-blue-900": variant === "info",
          "bg-amber-50 border-amber-200 text-amber-900": variant === "warning",
          "bg-red-50 border-red-200 text-red-900": variant === "critical",
        },
        className
      )}
    >
      <AlertTriangle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", {
        "text-blue-600": variant === "info",
        "text-amber-600": variant === "warning",
        "text-red-600": variant === "critical",
      })} />
      <div className="flex-1">
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-sm mt-0.5 opacity-90">{message}</div>
      </div>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SecurityBlockProps {
  message: string;
  detail?: string;
}

export function SecurityBlock({ message, detail }: SecurityBlockProps) {
  return (
    <div className="fixed inset-0 bg-red-900 flex items-center justify-center z-50">
      <div className="text-center text-white p-8 max-w-lg">
        <div className="text-6xl font-black mb-4">BLOCKED</div>
        <div className="text-2xl font-bold mb-2 uppercase tracking-wide">{message}</div>
        {detail && <div className="text-red-200 mt-2">{detail}</div>}
        <div className="mt-6 text-sm text-red-300">
          This incident has been automatically logged and reported to the HOD.
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-8 px-6 py-3 bg-white text-red-900 font-bold rounded-md hover:bg-red-50 transition-colors"
        >
          Return to Inventory Selection
        </button>
      </div>
    </div>
  );
}
