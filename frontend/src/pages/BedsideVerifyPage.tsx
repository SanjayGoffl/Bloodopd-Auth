import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import ProgressBar from "@/components/ui/ProgressBar";

const STEPS = [
  {
    title: "Patient Identification",
    description: "Verbally confirm patient name, DOB, and UHID. Match wristband.",
    field: "patient_confirmed",
  },
  {
    title: "Blood Group Verification",
    description: "Verify patient blood group matches the unit label.",
    field: "group_verified",
  },
  {
    title: "Unit Label Check",
    description: "Check unit ID, product type, expiry date, and integrity of the bag.",
    field: "unit_checked",
  },
  {
    title: "Compatibility Report",
    description: "Verify crossmatch report is compatible and signed.",
    field: "compat_verified",
  },
  {
    title: "Consent & Vitals Baseline",
    description: "Confirm informed consent. Record baseline vitals (Temp, BP, HR, SpO2).",
    field: "consent_vitals",
  },
];

export default function BedsideVerifyPage() {
  const [current, setCurrent] = useState(0);
  const [checks, setChecks] = useState<boolean[]>(new Array(STEPS.length).fill(false));
  const [nurseId, setNurseId] = useState("");
  const [complete, setComplete] = useState(false);

  const progress = (checks.filter(Boolean).length / STEPS.length) * 100;

  const confirmStep = () => {
    const updated = [...checks];
    updated[current] = true;
    setChecks(updated);

    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    }
  };

  const finalize = () => {
    if (checks.every(Boolean) && nurseId.trim()) {
      setComplete(true);
    }
  };

  const allDone = checks.every(Boolean);

  return (
    <div>
      <PageHeader
        title="Bedside Verification"
        subtitle="5-step sequential verification before transfusion"
        back
      />

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Verification Progress</span>
          <span className="font-medium">{checks.filter(Boolean).length} / {STEPS.length}</span>
        </div>
        <ProgressBar value={progress} color={allDone ? "bg-medical-500" : "bg-brand-600"} />
      </div>

      {complete ? (
        <Alert variant="success" className="mb-6">
          <strong>Bedside Verification Complete.</strong> All 5 checks passed. Verified by {nurseId}.
          Transfusion may proceed. Monitor vitals every 15 minutes for the first hour.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => { setComplete(false); setCurrent(0); setChecks(new Array(5).fill(false)); setNurseId(""); }}>
              Start New Verification
            </Button>
          </div>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Steps sidebar */}
          <div className="space-y-2 lg:col-span-1">
            {STEPS.map((step, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  i === current
                    ? "border-brand-300 bg-brand-50"
                    : checks[i]
                    ? "border-medical-200 bg-medical-50/50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  checks[i]
                    ? "bg-medical-600 text-white"
                    : i === current
                    ? "bg-brand-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {checks[i] ? "\u2713" : i + 1}
                </span>
                <span className={checks[i] ? "text-medical-700 font-medium" : i === current ? "text-brand-700 font-medium" : "text-gray-600"}>
                  {step.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active step detail */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {current + 1}
              </span>
              <CardTitle>{STEPS[current].title}</CardTitle>
            </div>
            <p className="text-sm text-gray-600 mb-6">{STEPS[current].description}</p>

            {/* Mock patient data for reference */}
            <div className="rounded-lg bg-gray-50 border p-4 mb-6 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Patient:</span> <span className="font-medium">Fatima Begum</span></div>
                <div><span className="text-gray-500">UHID:</span> <span className="font-mono">UHID-2024-0002</span></div>
                <div><span className="text-gray-500">Blood Group:</span> <span className="font-bold text-danger-600">B+</span></div>
                <div><span className="text-gray-500">Unit:</span> <span className="font-mono">BB-PRC-B+-042</span></div>
              </div>
            </div>

            {checks[current] ? (
              <Alert variant="success">Step verified successfully.</Alert>
            ) : (
              <Button onClick={confirmStep}>
                Confirm &amp; {current < STEPS.length - 1 ? "Next Step" : "Complete Check"}
              </Button>
            )}

            {allDone && !complete && (
              <div className="mt-6 space-y-3 border-t pt-4">
                <Input
                  label="Nurse / Verifier ID"
                  placeholder="e.g. Nurse Kavitha"
                  value={nurseId}
                  onChange={(e) => setNurseId(e.target.value)}
                />
                <Button className="w-full" onClick={finalize} disabled={!nurseId.trim()}>
                  Finalize Bedside Verification
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
