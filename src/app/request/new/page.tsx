"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PRODUCT_LABELS } from "@/lib/utils";
import { Plus, Info } from "lucide-react";

const INDICATIONS = [
  { value: "surgical_blood_loss", label: "Surgical blood loss" },
  { value: "trauma", label: "Trauma / Haemorrhage" },
  { value: "haematological", label: "Haematological condition" },
  { value: "obstetric_emergency", label: "Obstetric emergency" },
  { value: "chronic_anaemia", label: "Chronic anaemia" },
  { value: "other", label: "Other (specify below)" },
];

const PRODUCTS = Object.entries(PRODUCT_LABELS).map(([value, label]) => ({ value, label }));
const URGENCY_OPTIONS = [
  { value: "routine", label: "Routine — >24 hours" },
  { value: "urgent", label: "Urgent — 4–6 hours" },
  { value: "emergency", label: "Emergency — <30 min (uncrossmatched)" },
];

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [uhid, setUhid] = useState("");
  const [patientData, setPatientData] = useState<{ id: string; full_name: string; blood_group: string; ward: string; bed_number: string } | null>(null);
  const [uhidError, setUhidError] = useState("");
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [productType, setProductType] = useState("PRC");
  const [units, setUnits] = useState("1");
  const [urgency, setUrgency] = useState("routine");
  const [indication, setIndication] = useState("");
  const [indicationNotes, setIndicationNotes] = useState("");
  const [preHb, setPreHb] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [sampleDispatched, setSampleDispatched] = useState(false);
  const [emergencyJustification, setEmergencyJustification] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function lookupPatient() {
    if (!uhid.trim()) return;
    setLoadingPatient(true);
    setUhidError("");
    setPatientData(null);

    const { data, error } = await supabase
      .from("patients")
      .select("id, full_name, blood_group, ward, bed_number")
      .eq("uhid", uhid.trim())
      .single();

    setLoadingPatient(false);
    if (error || !data) {
      setUhidError("Patient not found. Verify the UHID.");
    } else {
      setPatientData(data);
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!patientData) e.uhid = "Look up a valid patient first.";
    if (!indication) e.indication = "Clinical indication is required.";
    if (urgency === "emergency" && emergencyJustification.trim().length < 30)
      e.emergencyJustification = "Minimum 30 characters required for emergency justification.";
    if (productType === "PRC" && !preHb) e.preHb = "Pre-transfusion Hb is required for red cell requests.";
    if (!consentConfirmed) e.consent = "Confirm signed consent exists before submitting.";
    if (!sampleDispatched) e.sample = "Confirm sample has been dispatched to the blood bank.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const payload = {
      patient_id: patientData!.id,
      requesting_clinician_id: user.id,
      product_type: productType,
      units_requested: parseInt(units),
      urgency,
      clinical_indication: indication,
      indication_notes: indicationNotes || null,
      pre_transfusion_hb: preHb ? parseFloat(preHb) : null,
      consent_confirmed: consentConfirmed,
      sample_dispatched: sampleDispatched,
      emergency_justification: urgency === "emergency" ? emergencyJustification : null,
      status: "requested",
    };

    const { error } = await supabase.from("transfusion_requests").insert(payload);
    setSubmitting(false);

    if (error) {
      setErrors({ submit: error.message });
    } else {
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard/clinician"), 2000);
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Request Submitted</h2>
          <p className="text-gray-500 text-sm mt-2">
            Transfusion request submitted successfully. The blood bank has been notified.
          </p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Transfusion Request</h1>
        <p className="text-gray-500 text-sm mt-1">All fields marked * are mandatory before submission.</p>
      </div>

      {urgency === "emergency" && (
        <Alert
          variant="critical"
          title="Emergency Request — This will alert Blood Bank Officer + HOD immediately"
          message="Emergency requests are for life-threatening situations only. Uncrossmatched blood carries a risk of transfusion reaction. A clinical justification of minimum 30 characters is required."
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Lookup */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Patient Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Patient UHID"
                  value={uhid}
                  onChange={(e) => setUhid(e.target.value)}
                  placeholder="e.g. UHID-2024-0001"
                  required
                  error={uhidError || errors.uhid}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), lookupPatient())}
                />
              </div>
              <div className="mt-6">
                <Button type="button" onClick={lookupPatient} disabled={loadingPatient} variant="outline">
                  {loadingPatient ? "Looking up..." : "Look Up"}
                </Button>
              </div>
            </div>

            {patientData && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="font-semibold text-gray-900 ml-2">{patientData.full_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Blood Group:</span>
                    <span className="font-bold text-red-700 ml-2 font-mono">{patientData.blood_group}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ward:</span>
                    <span className="font-semibold text-gray-900 ml-2">{patientData.ward}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bed:</span>
                    <span className="font-semibold text-gray-900 ml-2">{patientData.bed_number}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  Blood group auto-filled from records — cannot be manually overridden
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blood Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Product Type"
                options={PRODUCTS}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                required
              />
              <Input
                label="Units Requested"
                type="number"
                min="1"
                max="10"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                required
                hint={parseInt(units) > 4 ? "More than 4 units — ensure clinical justification covers this." : undefined}
              />
            </div>
            <Select
              label="Urgency"
              options={URGENCY_OPTIONS}
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              required
            />
            {urgency === "emergency" && (
              <Textarea
                label="Emergency Clinical Justification"
                value={emergencyJustification}
                onChange={(e) => setEmergencyJustification(e.target.value)}
                rows={3}
                placeholder="Describe the life-threatening clinical situation requiring uncrossmatched blood..."
                required
                error={errors.emergencyJustification}
                hint={`${emergencyJustification.length}/30 characters minimum`}
              />
            )}
            <Select
              label="Clinical Indication"
              options={INDICATIONS}
              value={indication}
              onChange={(e) => setIndication(e.target.value)}
              required
              placeholder="Select indication..."
              error={errors.indication}
            />
            <Textarea
              label="Clinical Notes (optional)"
              value={indicationNotes}
              onChange={(e) => setIndicationNotes(e.target.value)}
              rows={2}
              placeholder="Additional clinical context..."
            />
            {["PRC", "WB"].includes(productType) && (
              <Input
                label="Pre-transfusion Haemoglobin (g/dL)"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={preHb}
                onChange={(e) => setPreHb(e.target.value)}
                required
                placeholder="e.g. 7.5"
                error={errors.preHb}
              />
            )}
          </CardContent>
        </Card>

        {/* Safety Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Safety Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Signed consent exists</span> — I confirm the patient or guardian has provided signed informed consent for blood transfusion.
                {errors.consent && <span className="block text-red-600 text-xs mt-0.5">{errors.consent}</span>}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sampleDispatched}
                onChange={(e) => setSampleDispatched(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                <span className="font-semibold">Sample dispatched to blood bank</span> — A labelled blood sample for this patient has been sent to the blood bank for grouping and crossmatch.
                {errors.sample && <span className="block text-red-600 text-xs mt-0.5">{errors.sample}</span>}
              </span>
            </label>
          </CardContent>
        </Card>

        {errors.submit && (
          <Alert variant="critical" title="Submission Error" message={errors.submit} />
        )}

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={submitting} className="flex-1">
            {submitting ? "Submitting..." : (
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Submit Transfusion Request
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
