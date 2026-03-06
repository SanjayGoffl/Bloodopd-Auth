import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function minutesSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

export function hoursUntilExpiry(expiryIso: string) {
  return Math.max(
    0,
    Math.floor((new Date(expiryIso).getTime() - Date.now()) / 3600000)
  );
}

export const STATUS_COLORS: Record<string, string> = {
  requested: "bg-gray-200 text-gray-800",
  sample_received: "bg-blue-100 text-blue-800",
  grouping_complete: "bg-sky-100 text-sky-800",
  crossmatched: "bg-teal-100 text-teal-800",
  dual_verified: "bg-yellow-100 text-yellow-800",
  issued: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-green-700 text-white",
  reaction: "bg-red-600 text-white animate-pulse",
  quarantined: "bg-orange-100 text-orange-800",
  emergency: "bg-red-600 text-white",
  under_investigation: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  sample_received: "Sample Received",
  grouping_complete: "Grouping Complete",
  crossmatched: "Crossmatched",
  dual_verified: "Dual Verified",
  issued: "Issued",
  in_progress: "Transfusion In Progress",
  completed: "Completed",
  reaction: "Reaction — Under Investigation",
  quarantined: "Unit Quarantined",
  emergency: "Emergency Release",
  under_investigation: "Under Investigation",
  cancelled: "Cancelled",
};

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
export const PRODUCT_TYPES = ["PRC", "FFP", "PLT", "CRYO", "WB"] as const;
export const PRODUCT_LABELS: Record<string, string> = {
  PRC: "Packed Red Cells",
  FFP: "Fresh Frozen Plasma",
  PLT: "Platelets",
  CRYO: "Cryoprecipitate",
  WB: "Whole Blood",
};

export function isABOCompatible(patientGroup: string, unitGroup: string): boolean {
  const compat: Record<string, string[]> = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  };
  return compat[patientGroup]?.includes(unitGroup) ?? false;
}
