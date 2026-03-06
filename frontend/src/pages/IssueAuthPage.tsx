import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";

interface VerificationState {
  step: number; // 0=input, 1=operator1, 2=operator2, 3=done
  requestId: string;
  operator1: string;
  operator2: string;
}

const MOCK_REQUEST = {
  id: "REQ-002",
  patient: "Fatima Begum",
  uhid: "UHID-2024-0002",
  group: "B+",
  product: "PRC",
  units: 1,
  unitId: "BB-PRC-B+-042",
};

export default function IssueAuthPage() {
  const [state, setState] = useState<VerificationState>({
    step: 0,
    requestId: "",
    operator1: "",
    operator2: "",
  });

  const handleLookup = () => {
    if (state.requestId.trim()) {
      setState((s) => ({ ...s, step: 1 }));
    }
  };

  const handleOp1 = () => {
    if (state.operator1.trim()) {
      setState((s) => ({ ...s, step: 2 }));
    }
  };

  const handleOp2 = () => {
    if (state.operator2.trim() && state.operator2 !== state.operator1) {
      setState((s) => ({ ...s, step: 3 }));
    }
  };

  const reset = () => setState({ step: 0, requestId: "", operator1: "", operator2: "" });

  return (
    <div>
      <PageHeader
        title="Issue Authorization"
        subtitle="Dual-operator verification required before blood product release"
        back
      />

      {state.step === 3 ? (
        <Alert variant="success" className="mb-6">
          <strong>Authorization Complete.</strong> Unit {MOCK_REQUEST.unitId} ({MOCK_REQUEST.product} {MOCK_REQUEST.group})
          verified by {state.operator1} and {state.operator2} for {MOCK_REQUEST.patient}.
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={reset}>Issue Another</Button>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Verification Flow */}
        <Card>
          <CardTitle>Verification Flow</CardTitle>
          <CardDescription>Each step must be completed sequentially</CardDescription>

          <div className="mt-6 space-y-6">
            {/* Step 0: Lookup */}
            <div className={`rounded-lg border p-4 ${state.step === 0 ? "border-brand-300 bg-brand-50/30" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${state.step > 0 ? "bg-medical-600 text-white" : "bg-brand-600 text-white"}`}>
                  {state.step > 0 ? "\u2713" : "1"}
                </span>
                <span className="text-sm font-medium">Lookup Request</span>
              </div>
              {state.step === 0 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. REQ-002"
                    value={state.requestId}
                    onChange={(e) => setState((s) => ({ ...s, requestId: e.target.value }))}
                  />
                  <Button onClick={handleLookup} disabled={!state.requestId.trim()}>Find</Button>
                </div>
              )}
            </div>

            {/* Step 1: Operator 1 */}
            <div className={`rounded-lg border p-4 ${state.step === 1 ? "border-brand-300 bg-brand-50/30" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${state.step > 1 ? "bg-medical-600 text-white" : state.step === 1 ? "bg-brand-600 text-white" : "bg-gray-300 text-white"}`}>
                  {state.step > 1 ? "\u2713" : "2"}
                </span>
                <span className="text-sm font-medium">Operator 1 Verification</span>
              </div>
              {state.step === 1 && (
                <div className="space-y-3">
                  <Alert variant="info">
                    Verify patient identity, blood group, and unit label match. Then sign below.
                  </Alert>
                  <Input
                    label="Operator 1 Name / ID"
                    placeholder="e.g. Officer Rajan"
                    value={state.operator1}
                    onChange={(e) => setState((s) => ({ ...s, operator1: e.target.value }))}
                  />
                  <Button onClick={handleOp1} disabled={!state.operator1.trim()}>Confirm</Button>
                </div>
              )}
            </div>

            {/* Step 2: Operator 2 */}
            <div className={`rounded-lg border p-4 ${state.step === 2 ? "border-brand-300 bg-brand-50/30" : "border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${state.step > 2 ? "bg-medical-600 text-white" : state.step === 2 ? "bg-brand-600 text-white" : "bg-gray-300 text-white"}`}>
                  {state.step > 2 ? "\u2713" : "3"}
                </span>
                <span className="text-sm font-medium">Operator 2 Verification (Independent)</span>
              </div>
              {state.step === 2 && (
                <div className="space-y-3">
                  <Alert variant="warning">
                    A <strong>different</strong> operator must independently verify all details.
                  </Alert>
                  <Input
                    label="Operator 2 Name / ID"
                    placeholder="Must differ from Operator 1"
                    value={state.operator2}
                    onChange={(e) => setState((s) => ({ ...s, operator2: e.target.value }))}
                    error={state.operator2 && state.operator2 === state.operator1 ? "Must be a different operator" : ""}
                  />
                  <Button onClick={handleOp2} disabled={!state.operator2.trim() || state.operator2 === state.operator1}>
                    Authorize Issue
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right: Request Details */}
        {state.step > 0 && (
          <Card>
            <CardTitle>Request Details</CardTitle>
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Request ID</p>
                  <p className="font-mono font-medium">{MOCK_REQUEST.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unit ID</p>
                  <p className="font-mono font-medium">{MOCK_REQUEST.unitId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-medium">{MOCK_REQUEST.patient}</p>
                </div>
                <div>
                  <p className="text-gray-500">UHID</p>
                  <p className="font-mono">{MOCK_REQUEST.uhid}</p>
                </div>
                <div>
                  <p className="text-gray-500">Blood Group</p>
                  <p className="font-bold text-danger-600 text-lg">{MOCK_REQUEST.group}</p>
                </div>
                <div>
                  <p className="text-gray-500">Product</p>
                  <p className="font-medium">{MOCK_REQUEST.product} x{MOCK_REQUEST.units}</p>
                </div>
              </div>

              <div className="rounded-lg bg-medical-50 border border-medical-200 p-4">
                <p className="font-medium text-medical-800">ABO Compatibility: MATCH</p>
                <p className="text-xs text-medical-600 mt-1">
                  Patient {MOCK_REQUEST.group} &larr; Unit {MOCK_REQUEST.group}: Compatible
                </p>
              </div>

              {state.step >= 2 && (
                <div className="flex items-center gap-2">
                  <Badge color="success">Operator 1</Badge>
                  <span className="text-gray-700">{state.operator1} verified</span>
                </div>
              )}
              {state.step >= 3 && (
                <div className="flex items-center gap-2">
                  <Badge color="success">Operator 2</Badge>
                  <span className="text-gray-700">{state.operator2} verified</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
