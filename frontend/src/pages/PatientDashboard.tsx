import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const MOCK_HISTORY = [
  { id: "TXN-001", date: "2026-02-20", product: "PRC 2U (A+)", outcome: "Completed", notes: "No adverse reactions" },
  { id: "TXN-002", date: "2026-01-10", product: "FFP 1U (A+)", outcome: "Completed", notes: "Mild urticaria — managed" },
];

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Patient"}`}
        subtitle="Patient Portal"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
              {user?.name?.charAt(0) || "P"}
            </div>
            <h3 className="text-base font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <Badge color="info" className="mt-2">Patient</Badge>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">UHID</span>
              <span className="font-medium">UHID-2024-0005</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Blood Group</span>
              <span className="font-bold text-danger-600">A+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ward</span>
              <span className="font-medium">General-3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Attending Dr.</span>
              <span className="font-medium">Dr. Priya Nair</span>
            </div>
          </div>
        </Card>

        {/* Info cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfusion History */}
          <Card>
            <CardTitle>Transfusion History</CardTitle>
            <CardDescription>Your past transfusion records</CardDescription>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4">ID</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4">Outcome</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {MOCK_HISTORY.map((h) => (
                    <tr key={h.id}>
                      <td className="py-3 pr-4 font-mono text-xs">{h.id}</td>
                      <td className="py-3 pr-4">{h.date}</td>
                      <td className="py-3 pr-4">{h.product}</td>
                      <td className="py-3 pr-4">
                        <Badge color="success">{h.outcome}</Badge>
                      </td>
                      <td className="py-3 text-gray-500">{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Consent */}
          <Card>
            <CardTitle>Informed Consent</CardTitle>
            <CardDescription>Your transfusion consent status</CardDescription>
            <div className="mt-4 flex items-center gap-3 rounded-lg bg-medical-50 border border-medical-200 p-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-medical-600 shrink-0">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <div>
                <p className="text-sm font-medium text-medical-800">Consent obtained</p>
                <p className="text-xs text-medical-600">
                  Signed on 2026-02-18 by Ramesh Kumar, witnessed by Nurse Kavitha
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
