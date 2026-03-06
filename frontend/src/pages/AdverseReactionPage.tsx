import { useState, type FormEvent } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

const REACTION_TYPES = [
  "Febrile Non-Hemolytic",
  "Allergic / Urticarial",
  "Acute Hemolytic",
  "Anaphylactic",
  "TRALI (Transfusion-Related Acute Lung Injury)",
  "TACO (Transfusion-Associated Circulatory Overload)",
  "Bacterial Contamination / Septic",
  "Delayed Hemolytic",
  "Other",
];

const SEVERITY_LEVELS = ["Mild", "Moderate", "Severe", "Life-threatening"];

export default function AdverseReactionPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    requestId: "",
    reactionType: "",
    severity: "",
    symptoms: "",
    actionsTaken: "",
    reporter: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const canSubmit =
    form.requestId && form.reactionType && form.severity && form.symptoms && form.reporter;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (canSubmit) setSubmitted(true);
  };

  return (
    <div>
      <PageHeader
        title="Adverse Reaction Report"
        subtitle="Report and document transfusion reactions"
        back
      />

      <Alert variant="danger" className="mb-6">
        <strong>STOP THE TRANSFUSION IMMEDIATELY</strong> if an adverse reaction is suspected.
        Maintain IV access, notify the attending physician, and complete this report.
      </Alert>

      {submitted ? (
        <Card className="border-2 border-danger-300">
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger-100">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger-600">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Adverse Reaction Reported</h2>
            <p className="mt-2 text-sm text-gray-600">
              {form.reactionType} ({form.severity}) reported for <strong>{form.requestId}</strong> by {form.reporter}.
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Audit log entry created. Blood bank and hemovigilance team notified.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => { setSubmitted(false); setForm({ requestId: "", reactionType: "", severity: "", symptoms: "", actionsTaken: "", reporter: "" }); }}>
              Submit Another Report
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardTitle>Reaction Details</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  label="Request / Transfusion ID"
                  placeholder="e.g. REQ-004"
                  value={form.requestId}
                  onChange={(e) => update("requestId", e.target.value)}
                  required
                />

                <div>
                  <label className="label">Reaction Type</label>
                  <select
                    className="input"
                    value={form.reactionType}
                    onChange={(e) => update("reactionType", e.target.value)}
                    required
                  >
                    <option value="">Select reaction type...</option>
                    {REACTION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Severity</label>
                  <div className="flex flex-wrap gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => update("severity", level)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                          form.severity === level
                            ? level === "Life-threatening"
                              ? "border-danger-500 bg-danger-50 text-danger-700"
                              : level === "Severe"
                              ? "border-amber-500 bg-amber-50 text-amber-700"
                              : "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label">Symptoms / Signs</label>
                  <textarea
                    className="input min-h-[80px]"
                    placeholder="Describe symptoms: fever, rigors, rash, dyspnea, hypotension..."
                    value={form.symptoms}
                    onChange={(e) => update("symptoms", e.target.value)}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Actions & Reporter</CardTitle>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="label">Actions Taken</label>
                  <textarea
                    className="input min-h-[80px]"
                    placeholder="Transfusion stopped, IV NS started, antipyretics given..."
                    value={form.actionsTaken}
                    onChange={(e) => update("actionsTaken", e.target.value)}
                  />
                </div>

                <Input
                  label="Reporter Name / ID"
                  placeholder="e.g. Nurse Kavitha"
                  value={form.reporter}
                  onChange={(e) => update("reporter", e.target.value)}
                  required
                />

                <div className="rounded-lg bg-gray-50 border p-4 text-sm space-y-2">
                  <p className="font-medium text-gray-900">Immediate Actions Reminder:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>1. Stop transfusion immediately</li>
                    <li>2. Maintain IV access with normal saline</li>
                    <li>3. Check vitals: Temp, BP, HR, SpO2, RR</li>
                    <li>4. Notify attending physician</li>
                    <li>5. Send blood unit + new sample to blood bank</li>
                    <li>6. Complete this form</li>
                  </ul>
                </div>

                <Button type="submit" variant="danger" className="w-full" disabled={!canSubmit}>
                  Submit Adverse Reaction Report
                </Button>
              </div>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
