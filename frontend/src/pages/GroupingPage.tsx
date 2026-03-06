import { useState, type FormEvent } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle, CardDescription } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";

const ABO_COMPAT: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function GroupingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    requestId: "REQ-001",
    patientGroup: "A+",
    donorGroup: "A+",
    technique: "Gel Card",
    result: "",
    technicianId: "",
  });

  const compatible = ABO_COMPAT[form.donorGroup]?.includes(form.patientGroup) ?? false;

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <PageHeader
        title="Grouping & Crossmatch"
        subtitle="ABO/Rh typing and crossmatch compatibility testing"
        back
      />

      {submitted ? (
        <Alert variant={compatible ? "success" : "danger"} className="mb-6">
          <strong>Crossmatch Result: {compatible ? "COMPATIBLE" : "INCOMPATIBLE"}</strong>
          <br />
          Patient {form.patientGroup} vs Donor {form.donorGroup} — {form.technique} technique.
          {!compatible && " DO NOT ISSUE. Repeat testing and select compatible unit."}
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
              New Crossmatch
            </Button>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Crossmatch Form</CardTitle>
          <CardDescription>Enter patient and donor blood group data</CardDescription>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              label="Request ID"
              value={form.requestId}
              onChange={(e) => update("requestId", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Patient Blood Group</label>
                <select
                  className="input"
                  value={form.patientGroup}
                  onChange={(e) => update("patientGroup", e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Donor Unit Blood Group</label>
                <select
                  className="input"
                  value={form.donorGroup}
                  onChange={(e) => update("donorGroup", e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live compatibility indicator */}
            <div className={`rounded-lg border-2 p-4 text-center ${
              compatible
                ? "border-medical-400 bg-medical-50"
                : "border-danger-400 bg-danger-50"
            }`}>
              <p className={`text-lg font-bold ${compatible ? "text-medical-700" : "text-danger-700"}`}>
                {compatible ? "COMPATIBLE" : "INCOMPATIBLE"}
              </p>
              <p className={`text-xs mt-1 ${compatible ? "text-medical-600" : "text-danger-600"}`}>
                Donor {form.donorGroup} &rarr; Patient {form.patientGroup}
              </p>
            </div>

            <div>
              <label className="label">Technique</label>
              <select
                className="input"
                value={form.technique}
                onChange={(e) => update("technique", e.target.value)}
              >
                <option>Gel Card</option>
                <option>Tube (IS)</option>
                <option>Tube (AHG)</option>
                <option>Electronic Crossmatch</option>
              </select>
            </div>

            <div>
              <label className="label">Result / Observations</label>
              <textarea
                className="input min-h-[60px]"
                placeholder="No agglutination, compatible at all phases..."
                value={form.result}
                onChange={(e) => update("result", e.target.value)}
              />
            </div>

            <Input
              label="Technician ID"
              placeholder="e.g. Anita Sharma"
              value={form.technicianId}
              onChange={(e) => update("technicianId", e.target.value)}
            />

            <Button type="submit" className="w-full">
              Finalize Crossmatch
            </Button>
          </form>
        </Card>

        {/* ABO Compatibility Matrix */}
        <Card>
          <CardTitle>ABO Compatibility Matrix</CardTitle>
          <CardDescription>Donor (row) can give to recipient (column)</CardDescription>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-gray-500">Donor \ Recip.</th>
                  {BLOOD_GROUPS.map((g) => (
                    <th key={g} className="p-2 text-center font-bold">{g}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map((donor) => (
                  <tr key={donor} className="border-b">
                    <td className="p-2 font-bold text-danger-700">{donor}</td>
                    {BLOOD_GROUPS.map((recip) => {
                      const ok = ABO_COMPAT[donor]?.includes(recip);
                      const isSelected = donor === form.donorGroup && recip === form.patientGroup;
                      return (
                        <td key={recip} className="p-2 text-center">
                          <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                            isSelected
                              ? ok ? "bg-medical-600 text-white ring-2 ring-medical-300" : "bg-danger-600 text-white ring-2 ring-danger-300"
                              : ok ? "bg-medical-100 text-medical-700" : "bg-gray-100 text-gray-400"
                          }`}>
                            {ok ? "\u2713" : "\u2717"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Badge color="success">Compatible</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge color="gray">Incompatible</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
