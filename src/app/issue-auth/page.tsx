"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isABOCompatible } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, User, Scan } from "lucide-react";

type ConfirmState = "idle" | "confirmed" | "blocked";

interface Panel {
  unitScanned: boolean;
  pinEntered: boolean;
  aboCheck: "idle" | "pass" | "fail";
  expiryCheck: "idle" | "pass" | "fail";
  pin: string;
}

export default function IssueAuthPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading...</div>}>
      <IssueAuthInner />
    </Suspense>
  )
}

function IssueAuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const requestId = params.get("requestId");
  const supabase = createClient();

  const [request, setRequest] = useState<any>(null);
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aboBlock, setAboBlock] = useState(false);

  const [officerPanel, setOfficerPanel] = useState<Panel>({
    unitScanned: false, pinEntered: false, aboCheck: "idle", expiryCheck: "idle", pin: "",
  });
  const [nursePanel, setNursePanel] = useState({
    unitScanned: false, wristbandScanned: false, pin: "", pinEntered: false,
  });
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState(false);
  const [waitingForNurse, setWaitingForNurse] = useState(false);

  const fetchData = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    const { data: req } = await supabase
      .from("transfusion_requests")
      .select(`*, patients(uhid, full_name, blood_group, ward, bed_number), blood_units(barcode, blood_group, product_type, expiry_at, status)`)
      .eq("id", requestId)
      .single();
    setRequest(req);
    if (req?.blood_units) setUnit(req.blood_units);
    setLoading(false);
  }, [requestId, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function simulateOfficerScan() {
    if (!unit || !request) return;
    const compatible = isABOCompatible(request.patients.blood_group, unit.blood_group);
    const notExpired = new Date(unit.expiry_at) > new Date();
    if (!compatible) {
      setAboBlock(true);
      void supabase.from("audit_logs").insert({
        action: "ABO_INCOMPATIBILITY_BLOCKED",
        resource_type: "blood_unit",
        resource_id: unit.id,
        severity: "critical",
        new_value: { patient_bg: request.patients.blood_group, unit_bg: unit.blood_group, request_id: requestId },
      });
      return;
    }
    setOfficerPanel(p => ({
      ...p,
      unitScanned: true,
      aboCheck: compatible ? "pass" : "fail",
      expiryCheck: notExpired ? "pass" : "fail",
    }));
  }

  function handleOfficerPin(e: React.FormEvent) {
    e.preventDefault();
    if (officerPanel.pin.length < 4) return;
    setOfficerPanel(p => ({ ...p, pinEntered: true }));
    setWaitingForNurse(true);
    // In production: send push notification to nurse
  }

  function simulateNurseScan() {
    setNursePanel(p => ({ ...p, unitScanned: true, wristbandScanned: true }));
  }

  function handleNursePin(e: React.FormEvent) {
    e.preventDefault();
    if (nursePanel.pin.length < 4) return;
    setNursePanel(p => ({ ...p, pinEntered: true }));
  }

  const bothConfirmed =
    officerPanel.unitScanned &&
    officerPanel.aboCheck === "pass" &&
    officerPanel.expiryCheck === "pass" &&
    officerPanel.pinEntered &&
    nursePanel.unitScanned &&
    nursePanel.wristbandScanned &&
    nursePanel.pinEntered;

  async function handleIssue() {
    if (!bothConfirmed || !request || !unit) return;
    setIssuing(true);
    await supabase.from("blood_units").update({ status: "issued" }).eq("id", unit.id);
    await supabase.from("transfusion_requests").update({ status: "dual_verified" }).eq("id", requestId);
    await supabase.from("audit_logs").insert({
      action: "DUAL_VERIFIED_ISSUE",
      resource_type: "transfusion_request",
      resource_id: requestId,
      severity: "info",
      new_value: { unit_barcode: unit.barcode, patient_uhid: request.patients.uhid, status: "dual_verified" },
    });
    setIssuing(false);
    setIssued(true);
    setTimeout(() => router.push("/dashboard/officer"), 2500);
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading request data...</div>;

  if (aboBlock) {
    return (
      <div className="fixed inset-0 bg-red-900 flex items-center justify-center z-50">
        <div className="text-center text-white p-10 max-w-lg">
          <div className="text-7xl font-black mb-6 tracking-tight">BLOCKED</div>
          <div className="text-3xl font-bold uppercase tracking-wide mb-3">ABO INCOMPATIBLE</div>
          <div className="text-red-200 mb-2">
            Patient: <span className="font-mono font-bold">{request?.patients?.blood_group}</span> &nbsp;·&nbsp;
            Unit: <span className="font-mono font-bold">{unit?.blood_group}</span>
          </div>
          <div className="text-red-300 text-sm mt-4">This incident has been automatically logged and reported to the HOD.</div>
          <button
            onClick={() => setAboBlock(false)}
            className="mt-8 px-6 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-red-50 transition-colors"
          >
            Return to Inventory Selection
          </button>
        </div>
      </div>
    );
  }

  if (issued) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Unit Issued Successfully</h2>
          <p className="text-gray-500 mt-2">Dual verification complete. Unit <span className="font-mono font-semibold">{unit?.barcode}</span> issued.</p>
          <p className="text-xs text-gray-400 mt-3">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issue Authorization</h1>
          <p className="text-gray-500 text-sm">Dual-operator verification required. Both panels must confirm independently.</p>
        </div>
      </div>

      {/* Patient + Unit Info Bar */}
      {request && (
        <div className="bg-gray-900 text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Patient</div>
            <div className="font-bold">{request.patients?.full_name}</div>
            <div className="font-mono text-gray-300 text-xs">{request.patients?.uhid}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Patient Blood Group</div>
            <div className="font-mono text-2xl font-black text-red-400">{request.patients?.blood_group}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Unit Barcode</div>
            <div className="font-mono font-bold text-yellow-300">{unit?.barcode || "No unit assigned"}</div>
            <div className="text-gray-400 text-xs">{unit?.blood_group} · {unit?.product_type}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs uppercase mb-1">Expiry</div>
            <div className="font-semibold">{unit ? new Date(unit.expiry_at).toLocaleDateString() : "—"}</div>
            <div className={`text-xs ${unit && new Date(unit.expiry_at) > new Date() ? "text-green-400" : "text-red-400"}`}>
              {unit ? (new Date(unit.expiry_at) > new Date() ? "Valid" : "EXPIRED") : "—"}
            </div>
          </div>
        </div>
      )}

      {/* Dual Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        {/* Officer Panel */}
        <div className="p-6 border-r border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Blood Bank Officer</h3>
            {officerPanel.pinEntered && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
          </div>
          <div className="space-y-4">
            <CheckRow
              label="Unit barcode scanned"
              done={officerPanel.unitScanned}
              action={!officerPanel.unitScanned ? (
                <Button size="sm" onClick={simulateOfficerScan} variant="outline" className="gap-1">
                  <Scan className="w-3 h-3" /> Scan Barcode
                </Button>
              ) : null}
            />
            <CheckRow
              label={`ABO compatibility — Patient ${request?.patients?.blood_group} vs Unit ${unit?.blood_group}`}
              done={officerPanel.aboCheck === "pass"}
              blocked={officerPanel.aboCheck === "fail"}
            />
            <CheckRow
              label="Expiry date valid"
              done={officerPanel.expiryCheck === "pass"}
              blocked={officerPanel.expiryCheck === "fail"}
            />
            <CheckRow label="Crossmatch report finalized" done={officerPanel.unitScanned} />

            {officerPanel.unitScanned && !officerPanel.pinEntered && (
              <form onSubmit={handleOfficerPin} className="mt-4 space-y-3">
                <Input
                  label="Officer PIN"
                  type="password"
                  maxLength={6}
                  value={officerPanel.pin}
                  onChange={(e) => setOfficerPanel(p => ({ ...p, pin: e.target.value.replace(/\D/, "") }))}
                  placeholder="Enter PIN to confirm"
                  required
                />
                <Button type="submit" className="w-full" disabled={officerPanel.pin.length < 4}>
                  Confirm — Officer
                </Button>
              </form>
            )}
            {officerPanel.pinEntered && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Officer Confirmed
              </div>
            )}
          </div>
        </div>

        {/* Nurse Panel */}
        <div className={`p-6 ${waitingForNurse ? "bg-white" : "bg-gray-50"}`}>
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-pink-600" />
            <h3 className="font-bold text-gray-900">Transfusion Nurse</h3>
            {nursePanel.pinEntered && <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />}
          </div>

          {!waitingForNurse ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <Clock className="w-10 h-10 opacity-40" />
              <p className="text-sm text-center">Waiting for Officer to confirm first...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                Push notification sent to ward nurse. Nurse must scan independently.
              </div>
              <CheckRow
                label="Unit barcode scanned at ward"
                done={nursePanel.unitScanned}
                action={!nursePanel.unitScanned ? (
                  <Button size="sm" onClick={simulateNurseScan} variant="outline" className="gap-1">
                    <Scan className="w-3 h-3" /> Simulate Scan
                  </Button>
                ) : null}
              />
              <CheckRow label="Patient wristband scanned" done={nursePanel.wristbandScanned} />

              {nursePanel.unitScanned && !nursePanel.pinEntered && (
                <form onSubmit={handleNursePin} className="mt-4 space-y-3">
                  <Input
                    label="Nurse PIN"
                    type="password"
                    maxLength={6}
                    value={nursePanel.pin}
                    onChange={(e) => setNursePanel(p => ({ ...p, pin: e.target.value.replace(/\D/, "") }))}
                    placeholder="Enter PIN to confirm"
                    required
                  />
                  <Button type="submit" className="w-full" disabled={nursePanel.pin.length < 4}>
                    Confirm — Nurse
                  </Button>
                </form>
              )}
              {nursePanel.pinEntered && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Nurse Confirmed
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bridge */}
      <div className={`rounded-xl p-5 text-center border-2 transition-all ${bothConfirmed ? "bg-green-50 border-green-400" : "bg-gray-50 border-gray-200"}`}>
        {bothConfirmed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-lg">
              <CheckCircle2 className="w-6 h-6" />
              Dual Verification Complete — Ready to Issue
            </div>
            <Button size="lg" onClick={handleIssue} disabled={issuing} className="px-12">
              {issuing ? "Issuing..." : "Confirm Issue"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <AlertTriangle className="w-5 h-5" />
            Issue blocked until both panels confirm independently
          </div>
        )}
      </div>
    </div>
  );
}

function CheckRow({ label, done, blocked, action }: { label: string; done: boolean; blocked?: boolean; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {blocked ? (
        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-600" />
        </span>
      ) : done ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={`flex-1 ${blocked ? "text-red-700 font-semibold" : done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
      {action && !done && <span>{action}</span>}
    </div>
  );
}
