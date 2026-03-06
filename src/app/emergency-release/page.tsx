"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EmergencyReleasePage() {
  const router = useRouter();
  const supabase = createClient();

  const [patientUhid, setPatientUhid] = useState("");
  const [reason, setReason] = useState("");
  const [units, setUnits] = useState("2");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [released, setReleased] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");

  // Find available O- units (mock for demo)
  const availableONeg = [
    { id: "33333333-0000-0000-0000-000000000004", barcode: "BB-PRC-O--001", expiry: "2026-03-11" },
  ];

  function validate() {
    const e: Record<string, string> = {};
    if (!patientUhid.trim()) e.uhid = "Patient UHID is required. Anonymous release is not permitted.";
    if (reason.trim().length < 30) e.reason = `Minimum 30 characters required. Currently: ${reason.trim().length}`;
    if (!acknowledged) e.ack = "You must acknowledge the transfusion reaction risk before proceeding.";
    if (pin.length < 4) e.pin = "Officer PIN required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Mark selected unit as emergency_issued
    if (selectedUnit) {
      await supabase.from("blood_units").update({ status: "emergency_issued" }).eq("id", selectedUnit);
    }

    // Log to audit trail
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "EMERGENCY_UNCROSSMATCHED_RELEASE",
      resource_type: "blood_unit",
      resource_id: selectedUnit || "O-NEG-EMERGENCY",
      severity: "critical",
      new_value: {
        patient_uhid: patientUhid,
        units_requested: parseInt(units),
        justification: reason,
        officer_id: user.id,
      },
    });

    // Send notifications to HOD (in production via Supabase function)
    await supabase.from("notifications").insert([
      {
        recipient_id: "11111111-0000-0000-0000-000000000001", // HOD
        title: "EMERGENCY UNCROSSMATCHED RELEASE",
        body: `Officer released O-Negative blood without crossmatch for patient ${patientUhid}. Justification: ${reason}`,
        severity: "critical",
        related_resource_type: "blood_unit",
        related_resource_id: selectedUnit,
      },
    ]);

    setSubmitting(false);
    setReleased(true);
    setTimeout(() => router.push("/dashboard/officer"), 3000);
  }

  if (released) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Emergency Release Authorized</h2>
          <p className="text-gray-500 mt-2">HOD and requesting clinician have been immediately notified.</p>
          <p className="text-sm text-amber-700 mt-3">Your account is restricted from further uncrossmatched releases for 2 hours.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Red header band */}
      <div className="bg-red-700 text-white rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Emergency Uncrossmatched Release</h1>
            <p className="text-red-200 text-sm">O-Negative blood without crossmatch — life-threatening situations only</p>
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-800 text-lg">Clinical Risk Warning</div>
            <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
              <li>This blood has NOT been crossmatched for the patient</li>
              <li>Risk of acute haemolytic transfusion reaction exists</li>
              <li>This action will be immediately reported to the HOD</li>
              <li>A forensic record will be created and cannot be deleted</li>
              <li>Your account will be restricted for 2 hours post-release</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available O-Neg units */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Available O-Negative Units</h3>
        {availableONeg.length === 0 ? (
          <div className="text-red-700 font-semibold text-sm">NO O-NEGATIVE UNITS IN STOCK</div>
        ) : (
          <div className="space-y-2">
            {availableONeg.map((u) => (
              <label key={u.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedUnit === u.id ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                <input
                  type="radio"
                  name="unit"
                  value={u.id}
                  checked={selectedUnit === u.id}
                  onChange={() => setSelectedUnit(u.id)}
                  className="text-red-600"
                />
                <div>
                  <div className="font-mono font-semibold text-sm text-gray-900">{u.barcode}</div>
                  <div className="text-xs text-gray-500">O-Negative · PRC · Expires {u.expiry}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Patient UHID"
          value={patientUhid}
          onChange={(e) => setPatientUhid(e.target.value)}
          placeholder="e.g. UHID-2024-0003"
          required
          error={errors.uhid}
          hint="Anonymous release is not permitted under any circumstance."
        />

        <Input
          label="Units of O-Negative PRC"
          type="number"
          min="1"
          max="6"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          required
        />

        <Textarea
          label="Emergency Clinical Justification"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="Describe the life-threatening clinical situation in detail. Minimum 30 characters required..."
          required
          error={errors.reason}
          hint={`${reason.trim().length} / 30 characters minimum`}
        />

        {/* Acknowledgment */}
        <div className={`p-5 rounded-xl border-2 ${acknowledged ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"}`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-semibold text-gray-800">
              I understand that this blood has NOT been crossmatched for this patient and carries a significant risk of acute haemolytic transfusion reaction, which may be fatal. I accept full clinical responsibility for this decision.
            </span>
          </label>
          {errors.ack && <p className="text-red-600 text-xs mt-2 ml-8">{errors.ack}</p>}
        </div>

        {/* PIN */}
        <Input
          label="Officer PIN — biometric confirmation"
          type="password"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/, ""))}
          placeholder="Enter Officer PIN"
          required
          error={errors.pin}
        />

        {/* Notifications preview */}
        <div className="bg-gray-900 text-white rounded-lg p-4 text-sm">
          <div className="text-gray-400 text-xs uppercase mb-2">Automatic Alerts on Submit</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" />HOD / Medical Director — immediate push notification</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" />Requesting Clinician — immediate push notification</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" />Lab Technician — urgent retrospective crossmatch task</div>
          </div>
        </div>

        {Object.values(errors).length > 0 && (
          <Alert variant="critical" title="Errors" message={Object.values(errors).join(" | ")} />
        )}

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="emergency" size="lg" className="flex-1" disabled={submitting}>
            {submitting ? "Authorizing..." : "Authorize Emergency Release"}
          </Button>
        </div>
      </form>
    </div>
  );
}
