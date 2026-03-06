import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

export default function EmergencyReleasePage() {
  const [reason, setReason] = useState("");
  const [authorizer, setAuthorizer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [released, setReleased] = useState(false);

  const canRelease = reason.trim().length > 5 && authorizer.trim() && confirmed;

  const handleRelease = () => {
    if (canRelease) setReleased(true);
  };

  return (
    <div>
      <PageHeader
        title="Emergency Uncrossmatched Release"
        subtitle="O-Negative emergency release protocol"
        back
      />

      <Alert variant="danger" className="mb-6">
        <strong>WARNING:</strong> This releases uncrossmatched O-Negative blood. Only use in life-threatening
        emergencies when there is no time for crossmatch. Patient will require post-transfusion crossmatch
        and monitoring.
      </Alert>

      {released ? (
        <Card className="border-2 border-medical-400">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-medical-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-medical-600">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Emergency Release Authorized</h2>
            <p className="mt-2 text-sm text-gray-600">
              Unit <strong className="font-mono">BB-PRC-O--001</strong> (O-Neg PRC) released.
            </p>
            <p className="text-sm text-gray-500">
              Authorized by: {authorizer} &middot; Reason: {reason}
            </p>
            <p className="mt-4 text-xs text-amber-600 font-medium">
              Post-transfusion crossmatch and monitoring are MANDATORY.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setReleased(false)}>
              Start New Release
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Release Details</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-danger-50 border border-danger-200 p-4">
                <p className="text-sm font-semibold text-danger-800">Available O-Neg Units: 2</p>
                <p className="text-xs text-danger-600 mt-1">
                  Unit: BB-PRC-O--001 &middot; Product: PRC &middot; Expiry: 2026-03-20
                </p>
              </div>

              <Input
                label="Clinical Reason / Indication"
                placeholder="e.g. Massive trauma, exsanguinating hemorrhage"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <Input
                label="Authorizing Officer"
                placeholder="Name and designation"
                value={authorizer}
                onChange={(e) => setAuthorizer(e.target.value)}
              />

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-danger-600 focus:ring-danger-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm this is a life-threatening emergency. I accept responsibility for
                  releasing uncrossmatched blood and will ensure post-transfusion crossmatch
                  and monitoring are performed.
                </span>
              </label>

              <Button variant="danger" className="w-full" disabled={!canRelease} onClick={handleRelease}>
                Authorize Emergency Release
              </Button>
            </div>
          </Card>

          <Card>
            <CardTitle>Protocol Checklist</CardTitle>
            <div className="mt-4 space-y-3">
              {[
                "Confirm life-threatening indication exists",
                "No time for standard crossmatch (&lt;15 min needed)",
                "Two qualified operators must verify (dual sign-off)",
                "Document clinical reason in patient record",
                "Post-transfusion crossmatch sample must be drawn",
                "Continuous monitoring for first 15 minutes",
                "Report to blood bank immediately after transfusion",
                "Audit log entry created automatically",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
                    {i + 1}
                  </span>
                  <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
