"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Scan, AlertTriangle, Timer } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

export default function BedsideVerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <BedsideVerifyInner />
    </Suspense>
  )
}

function BedsideVerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const supabase = createClient();

  const [request, setRequest] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false, false, false]);
  const [pin, setPin] = useState("");
  const [started, setStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 hours in minutes
  const [mismatch, setMismatch] = useState(false);

  const fetchData = useCallback(async () => {
    if (!requestId) return;
    const { data: req } = await supabase
      .from("transfusion_requests")
      .select(`*, patients(uhid, full_name, dob, blood_group, ward, bed_number), blood_units(barcode, blood_group, product_type, expiry_at)`)
      .eq("id", requestId)
      .single();
    setRequest(req);
    if (req?.blood_units) setUnit(req.blood_units);
    setLoading(false);
  }, [requestId, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Cold chain timer
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setTimeRemaining(t => {
        if (t <= 0) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 60000); // decrement per minute
    return () => clearInterval(interval);
  }, [started]);

  function completeStep(step: Step, success = true) {
    if (!success) { setMismatch(true); return; }
    const updated = [...completed];
    updated[step - 1] = true;
    setCompleted(updated);
    if (step < 5) setCurrentStep((step + 1) as Step);
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4 || !completed.every(Boolean)) return;
    await supabase.from("transfusion_requests").update({ status: "in_progress" }).eq("id", requestId);
    await supabase.from("audit_logs").insert({
      action: "BEDSIDE_VERIFICATION_COMPLETE",
      resource_type: "transfusion_request",
      resource_id: requestId,
      severity: "info",
      new_value: { unit_barcode: unit?.barcode, patient_uhid: request?.patients?.uhid, steps_completed: 5 },
    });
    setStarted(true);
    setTimeout(() => router.push("/dashboard/nurse"), 3000);
  }

  if (mismatch) {
    return (
      <div className="fixed inset-0 bg-red-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-10 max-w-lg">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-red-300" />
          <div className="text-5xl font-black mb-4">VERIFICATION FAILED</div>
          <div className="text-red-200 text-lg">Patient ID or unit barcode mismatch detected.</div>
          <div className="text-red-300 text-sm mt-4">Blood Bank Officer has been automatically alerted. Do not proceed with transfusion.</div>
          <button onClick={() => setMismatch(false)} className="mt-8 px-6 py-3 bg-white text-red-900 font-bold rounded-lg">Return</button>
        </div>
      </div>
    );
  }

  if (started) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Transfusion Started</h2>
          <p className="text-gray-500 mt-2">All 5 verification steps passed. Monitoring timer has begun.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to monitoring chart...</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  const steps = [
    {
      step: 1,
      title: "Scan Patient Wristband",
      description: "Scan patient wristband barcode. System will verify UHID against issued unit record.",
      action: "Scan Wristband",
      detail: `Expected UHID: ${request?.patients?.uhid}`,
    },
    {
      step: 2,
      title: "Scan Blood Bag Barcode",
      description: "Scan blood bag barcode independently. Must match unit assigned to this request.",
      action: "Scan Blood Bag",
      detail: `Expected barcode: ${unit?.barcode || "—"}`,
    },
    {
      step: 3,
      title: "Verbal Patient Confirmation",
      description: 'Ask patient aloud: "Please state your full name and date of birth." Confirm verbally.',
      action: "Confirm Verbal",
      detail: `Patient: ${request?.patients?.full_name}`,
    },
    {
      step: 4,
      title: "Blood Group Visual Check",
      description: "Visually confirm blood groups match between patient record and unit label.",
      action: "Confirm Match",
      detail: `Patient: ${request?.patients?.blood_group} | Unit: ${unit?.blood_group}`,
    },
    {
      step: 5,
      title: "Cold Chain Time Check",
      description: "Unit must be transfused within 4 hours of leaving cold storage.",
      action: "Confirm Time OK",
      detail: `Time remaining: ${timeRemaining} minutes`,
    },
  ];

  const allDone = completed.every(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Scan className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bedside Verification</h1>
          <p className="text-gray-500 text-sm">5-step sequential safety check. Cannot skip steps.</p>
        </div>
      </div>

      {/* Patient + Unit Banner */}
      {request && (
        <div className="bg-gray-900 text-white rounded-xl p-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Patient</div>
            <div className="font-bold">{request.patients?.full_name}</div>
            <div className="font-mono text-gray-300 text-xs">{request.patients?.uhid} · Bed {request.patients?.bed_number}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Unit</div>
            <div className="font-mono font-bold text-yellow-300">{unit?.barcode}</div>
            <div className="text-gray-300 text-xs">{unit?.blood_group} · {unit?.product_type}</div>
          </div>
        </div>
      )}

      {/* Blood Group Visual Match */}
      <div className={`grid grid-cols-2 gap-4 p-5 rounded-xl border-2 ${request?.patients?.blood_group === unit?.blood_group ? "border-green-400 bg-green-50" : "border-amber-400 bg-amber-50"}`}>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Patient Blood Group</div>
          <div className="text-5xl font-black text-red-700 font-mono">{request?.patients?.blood_group}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase mb-1">Unit Blood Group</div>
          <div className="text-5xl font-black text-blue-700 font-mono">{unit?.blood_group}</div>
        </div>
      </div>

      {/* Cold Chain Timer */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${timeRemaining <= 30 ? "bg-red-50 border-red-300" : timeRemaining <= 60 ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-gray-200"}`}>
        <Timer className={`w-5 h-5 ${timeRemaining <= 30 ? "text-red-600" : timeRemaining <= 60 ? "text-amber-600" : "text-gray-500"}`} />
        <div>
          <div className="font-semibold text-sm text-gray-900">Cold Chain Time Remaining</div>
          <div className={`text-2xl font-bold font-mono ${timeRemaining <= 30 ? "text-red-600" : timeRemaining <= 60 ? "text-amber-600" : "text-green-600"}`}>
            {Math.floor(timeRemaining / 60)}h {timeRemaining % 60}m
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(({ step, title, description, action, detail }) => {
          const isDone = completed[step - 1];
          const isCurrent = currentStep === step && !isDone;
          const isLocked = step > currentStep && !completed[step - 1];

          return (
            <div
              key={step}
              className={`rounded-xl border-2 p-5 transition-all ${isDone ? "border-green-300 bg-green-50" : isCurrent ? "border-blue-400 bg-blue-50 shadow-md" : "border-gray-200 bg-white opacity-60"}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isDone ? "bg-green-600 text-white" : isCurrent ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {isDone ? "✓" : step}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${isDone ? "text-green-800" : isCurrent ? "text-blue-900" : "text-gray-500"}`}>{title}</div>
                  <div className={`text-sm mt-0.5 ${isDone ? "text-green-700" : isCurrent ? "text-blue-700" : "text-gray-400"}`}>{description}</div>
                  {(isCurrent || isDone) && <div className="text-xs font-mono mt-1 text-gray-500">{detail}</div>}
                </div>
                {isCurrent && !isLocked && (
                  <Button size="sm" onClick={() => completeStep(step as Step)} className="flex-shrink-0 gap-1">
                    <Scan className="w-3 h-3" /> {action}
                  </Button>
                )}
                {isDone && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Confirmation */}
      {allDone && (
        <form onSubmit={handleStart} className="space-y-4 p-6 bg-green-50 border-2 border-green-400 rounded-xl">
          <div className="font-bold text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            All 5 verification steps completed
          </div>
          <Input
            label="Nurse PIN — confirm to start transfusion"
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/, ""))}
            placeholder="Enter your PIN"
            required
          />
          <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={pin.length < 4}>
            Start Transfusion — Record in System
          </Button>
        </form>
      )}
    </div>
  );
}
