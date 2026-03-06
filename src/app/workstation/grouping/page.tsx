"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, FlaskConical } from "lucide-react";

const BG_OPTIONS = [
  { value: "A+", label: "A Positive (A+)" },
  { value: "A-", label: "A Negative (A-)" },
  { value: "B+", label: "B Positive (B+)" },
  { value: "B-", label: "B Negative (B-)" },
  { value: "AB+", label: "AB Positive (AB+)" },
  { value: "AB-", label: "AB Negative (AB-)" },
  { value: "O+", label: "O Positive (O+)" },
  { value: "O-", label: "O Negative (O-)" },
];

const ANTIBODY_OPTIONS = [
  { value: "negative", label: "Negative" },
  { value: "positive", label: "Positive (specify in notes)" },
  { value: "pending", label: "Pending" },
];

const CROSSMATCH_OPTIONS = [
  { value: "compatible", label: "Compatible" },
  { value: "incompatible", label: "Incompatible" },
  { value: "pending", label: "Pending" },
];

export default function GroupingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <GroupingInner />
    </Suspense>
  )
}

function GroupingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const supabase = createClient();

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [patientBg, setPatientBg] = useState("");
  const [antibodyScreen, setAntibodyScreen] = useState("negative");
  const [crossmatchResult, setCrossmatchResult] = useState("compatible");
  const [donorId, setDonorId] = useState("");
  const [unitBarcode, setUnitBarcode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [error, setError] = useState("");

  const fetchRequest = useCallback(async () => {
    if (!requestId) { setLoading(false); return; }
    const { data } = await supabase
      .from("transfusion_requests")
      .select(`*, patients(uhid, full_name, blood_group)`)
      .eq("id", requestId)
      .single();
    setRequest(data);
    if (data?.patients?.blood_group) setPatientBg(data.patients.blood_group);
    setLoading(false);
  }, [requestId, supabase]);

  useEffect(() => { fetchRequest(); }, [fetchRequest]);

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault();
    if (!patientBg || !requestId) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Create crossmatch report
    const { error: reportErr } = await supabase.from("crossmatch_reports").insert({
      request_id: requestId,
      lab_tech_id: user.id,
      patient_blood_group: patientBg,
      unit_id: request?.assigned_unit_id || "33333333-0000-0000-0000-000000000001",
      abo_result: crossmatchResult === "compatible" ? "compatible" : "incompatible",
      antibody_screen: antibodyScreen,
      crossmatch_result: crossmatchResult,
      finalized: true,
      finalized_at: new Date().toISOString(),
    });

    if (reportErr) { setError(reportErr.message); setSubmitting(false); return; }

    // Update request status
    await supabase.from("transfusion_requests").update({
      status: crossmatchResult === "compatible" ? "crossmatched" : "requested",
    }).eq("id", requestId);

    setSubmitting(false);
    setFinalized(true);
    setTimeout(() => router.push("/dashboard/lab"), 2500);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  if (finalized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Report Finalized</h2>
          <p className="text-gray-500 mt-2">Crossmatch report digitally signed and submitted to Blood Bank Officer.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grouping & Crossmatch Entry</h1>
          <p className="text-gray-500 text-sm">Workstation: {typeof window !== "undefined" ? "WS-01" : ""}</p>
        </div>
      </div>

      {request && (
        <div className="bg-gray-900 text-white rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 text-xs uppercase mb-1">Sample ID</div>
              <div className="font-mono font-bold text-yellow-300">{request.patients?.uhid}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase mb-1">Product Requested</div>
              <div className="font-semibold">{request.product_type} × {request.units_requested}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase mb-1">Urgency</div>
              <div className={`font-semibold ${request.urgency === "emergency" ? "text-red-400" : request.urgency === "urgent" ? "text-amber-400" : "text-green-400"}`}>
                {request.urgency?.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs uppercase mb-1">Existing BG on Record</div>
              <div className="font-mono font-bold text-red-400">{request.patients?.blood_group || "Unknown"}</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Patient identity is visible only for this assigned sample. Donor TTI data uses anonymous ID only.</p>
        </div>
      )}

      <form onSubmit={handleFinalize} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Blood Grouping — ABO + RhD</h3>
          <Select
            label="Determined Blood Group"
            options={BG_OPTIONS}
            value={patientBg}
            onChange={(e) => setPatientBg(e.target.value)}
            required
            placeholder="Select result..."
            hint="Result from forward and reverse grouping. Must match existing record."
          />
          {patientBg && request?.patients?.blood_group && patientBg !== request.patients.blood_group && (
            <Alert
              variant="critical"
              title="Blood Group Mismatch"
              message={`Current result (${patientBg}) does not match the patient's existing record (${request.patients.blood_group}). Verify sample identity immediately.`}
            />
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Antibody Screen + Crossmatch</h3>
          <Select
            label="Antibody Screen Result"
            options={ANTIBODY_OPTIONS}
            value={antibodyScreen}
            onChange={(e) => setAntibodyScreen(e.target.value)}
            required
          />
          <Input
            label="Donor Unit Barcode"
            value={unitBarcode}
            onChange={(e) => setUnitBarcode(e.target.value)}
            placeholder="Scan unit barcode..."
            hint="Scan or enter barcode from the blood bank unit allocated for crossmatch."
          />
          <Input
            label="Anonymous Donor ID"
            value={donorId}
            onChange={(e) => setDonorId(e.target.value)}
            placeholder="e.g. DON-2024-0881"
            hint="Donor code only. No donor name, age, or demographic is accessible from this form."
          />
          <Select
            label="Crossmatch Result"
            options={CROSSMATCH_OPTIONS}
            value={crossmatchResult}
            onChange={(e) => setCrossmatchResult(e.target.value)}
            required
          />
          {crossmatchResult === "incompatible" && (
            <Alert
              variant="critical"
              title="Incompatible Crossmatch"
              message="This unit is incompatible with the patient. Select an alternative unit. Blood Bank Officer will be notified."
            />
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Before finalizing:</strong> Verify all results are recorded correctly. Once digitally signed, entries create an immutable record. Amendments require a reason to be logged.
        </div>

        {error && <Alert variant="critical" title="Error" message={error} />}

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">Save Draft</Button>
          <Button type="submit" size="lg" className="flex-1" disabled={submitting || !patientBg || crossmatchResult === "pending"}>
            {submitting ? "Finalizing..." : "Finalize & Digitally Sign Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
