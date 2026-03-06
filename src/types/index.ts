export type UserRole =
  | "hod"
  | "officer"
  | "lab_tech"
  | "clinician"
  | "nurse";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  ward?: string;
  workstation?: string;
  department?: string;
  is_active: boolean;
}

export interface Patient {
  id: string;
  uhid: string;
  full_name: string;
  dob: string;
  blood_group: string;
  ward: string;
  bed_number: string;
  attending_doctor_id?: string;
}

export type TransfusionStatus =
  | "requested"
  | "sample_received"
  | "grouping_complete"
  | "crossmatched"
  | "dual_verified"
  | "issued"
  | "in_progress"
  | "completed"
  | "reaction"
  | "quarantined"
  | "under_investigation"
  | "cancelled";

export type UrgencyLevel = "routine" | "urgent" | "emergency";
export type ProductType = "PRC" | "FFP" | "PLT" | "CRYO" | "WB";

export interface TransfusionRequest {
  id: string;
  patient_id: string;
  patient?: Patient;
  requesting_clinician_id: string;
  clinician?: UserProfile;
  product_type: ProductType;
  units_requested: number;
  urgency: UrgencyLevel;
  clinical_indication: string;
  indication_notes?: string;
  pre_transfusion_hb?: number;
  consent_confirmed: boolean;
  sample_dispatched: boolean;
  status: TransfusionStatus;
  assigned_lab_tech_id?: string;
  assigned_unit_id?: string;
  crossmatch_report_id?: string;
  created_at: string;
  updated_at: string;
  emergency_justification?: string;
}

export interface BloodUnit {
  id: string;
  barcode: string;
  blood_group: string;
  product_type: ProductType;
  donor_id?: string;
  collected_at: string;
  expiry_at: string;
  storage_location: string;
  temperature_ok: boolean;
  status: "available" | "reserved" | "issued" | "quarantined" | "discarded" | "emergency_issued";
  reserved_for_request_id?: string;
}

export interface CrossmatchReport {
  id: string;
  request_id: string;
  lab_tech_id: string;
  lab_tech?: UserProfile;
  patient_blood_group: string;
  unit_id: string;
  unit?: BloodUnit;
  abo_result: "compatible" | "incompatible";
  antibody_screen: "negative" | "positive" | "pending";
  crossmatch_result: "compatible" | "incompatible" | "pending";
  finalized: boolean;
  finalized_at?: string;
  created_at: string;
}

export interface IssueAuthorization {
  id: string;
  request_id: string;
  unit_id: string;
  officer_id: string;
  nurse_id?: string;
  officer_confirmed_at?: string;
  nurse_confirmed_at?: string;
  officer_pin_hash?: string;
  nurse_pin_hash?: string;
  patient_wristband_scanned: boolean;
  unit_barcode_scanned_officer: boolean;
  unit_barcode_scanned_nurse: boolean;
  abo_check_passed: boolean;
  expiry_check_passed: boolean;
  status: "pending_officer" | "pending_nurse" | "dual_confirmed" | "blocked" | "issued";
  created_at: string;
  issued_at?: string;
}

export interface TransfusionMonitoring {
  id: string;
  request_id: string;
  nurse_id: string;
  transfusion_started_at: string;
  vitals: VitalEntry[];
  completed_at?: string;
  reaction_reported: boolean;
}

export interface VitalEntry {
  time_minutes: number;
  bp_systolic: number;
  bp_diastolic: number;
  pulse: number;
  spo2: number;
  temperature: number;
  recorded_at: string;
}

export interface AdverseReaction {
  id: string;
  request_id: string;
  unit_id: string;
  nurse_id: string;
  reaction_types: string[];
  onset_minutes: number;
  volume_transfused_ml: number;
  stop_transfusion_at: string;
  immediate_actions: string[];
  notes?: string;
  investigation_status: "open" | "under_investigation" | "closed";
  created_at: string;
}

export interface InventoryCount {
  blood_group: string;
  product_type: ProductType;
  available: number;
  reserved: number;
  expiring_48h: number;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user?: UserProfile;
  action: string;
  resource_type: string;
  resource_id: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  severity: "info" | "warning" | "critical";
}
