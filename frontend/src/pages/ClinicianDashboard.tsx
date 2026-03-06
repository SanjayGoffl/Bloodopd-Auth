import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card, { CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Link } from "react-router-dom";

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

interface Stats {
  total_requests: number;
  completed: number;
  pending_crossmatch: number;
  ready_to_issue: number;
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

export default function ClinicianDashboard() {
  const { user } = useAuth();
  const { data: stats, loading: statsLoading } = useApi<Stats>("/data/stats");
  const { data: requests, loading: reqLoading } = useApi<Request[]>("/data/requests");

  return (
    <div>
      <PageHeader
        title={`Hello, ${user?.name?.split(" ")[0] || "Doctor"}`}
        subtitle={user?.department || "Clinical Dashboard"}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {[
          { label: "Active Requests", value: stats?.total_requests, bg: "bg-brand-50", color: "text-brand-600" },
          { label: "Completed", value: stats?.completed, bg: "bg-medical-50", color: "text-medical-600" },
          { label: "Pending XM", value: stats?.pending_crossmatch, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Ready to Issue", value: stats?.ready_to_issue, bg: "bg-teal-50", color: "text-teal-600" },
        ].map((card) => (
          <Card key={card.label} className="text-center">
            <span className={`text-2xl font-bold ${card.color}`}>
              {statsLoading ? "-" : card.value ?? 0}
            </span>
            <p className="mt-1 text-xs text-gray-500">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link to="/requests" className="btn btn-primary btn-sm">View All Requests</Link>
        <Link to="/bedside" className="btn btn-outline btn-sm">Bedside Verification</Link>
        <Link to="/monitoring" className="btn btn-outline btn-sm">Monitor Vitals</Link>
        <Link to="/adverse" className="btn btn-danger btn-sm">Report Adverse Reaction</Link>
      </div>

      {/* Active Requests Table */}
      <Card>
        <CardTitle>Active Transfusion Requests</CardTitle>
        {reqLoading ? (
          <p className="mt-4 text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Group</th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Urgency</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Indication</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests?.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-mono text-xs">{req.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{req.patient_name}</p>
                      <p className="text-xs text-gray-400">{req.uhid}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger-50 text-xs font-bold text-danger-700">
                        {req.blood_group}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{req.product} x{req.units}</td>
                    <td className="py-3 pr-4">
                      <Badge color={urgencyColor[req.urgency] || "gray"}>{req.urgency}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge color={statusColor[req.status] || "gray"}>
                        {req.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-500 max-w-[200px] truncate">{req.indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
