import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Request {
  id: string;
  patient_name: string;
  uhid: string;
  blood_group: string;
  product: string;
  units: number;
  urgency: string;
  status: string;
  indication: string;
  clinician: string;
  created_at: string;
}

const urgencyColor: Record<string, string> = {
  emergency: "danger",
  urgent: "warning",
  routine: "info",
};

const statusColor: Record<string, string> = {
  pending_approval: "warning",
  crossmatch_pending: "info",
  ready_to_issue: "success",
  issued: "gray",
  completed: "success",
};

export default function RequestsPage() {
  const { data: requests, loading } = useApi<Request[]>("/data/requests");

  return (
    <div>
      <PageHeader
        title="Transfusion Requests"
        subtitle="All active and recent transfusion requests"
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading requests...</p>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Clinician</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Indication</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests?.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{req.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{req.patient_name}</p>
                      <p className="text-xs text-gray-400">{req.uhid}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger-50 text-xs font-bold text-danger-700">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {req.product} x{req.units}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={urgencyColor[req.urgency] || "gray"}>{req.urgency}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={statusColor[req.status] || "gray"}>
                        {req.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{req.clinician}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{req.created_at}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{req.indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
