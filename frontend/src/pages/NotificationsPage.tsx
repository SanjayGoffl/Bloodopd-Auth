import { useApi } from "@/hooks/useApi";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Notification {
  id: number;
  title: string;
  body: string;
  severity: string;
  read: boolean;
  time: string;
}

const severityColor: Record<string, string> = {
  critical: "danger",
  warning: "warning",
  info: "info",
};

const severityIcon: Record<string, string> = {
  critical: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01",
  warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 16v-4M12 8h.01",
};

export default function NotificationsPage() {
  const { data: notifications, loading } = useApi<Notification[]>("/data/notifications");

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts, warnings, and system messages"
      />

      {loading ? (
        <p className="text-sm text-gray-400">Loading notifications...</p>
      ) : (
        <div className="space-y-3">
          {notifications?.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start gap-4 ${!n.read ? "border-l-4 border-l-brand-500" : "opacity-70"}`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                n.severity === "critical" ? "bg-danger-100" :
                n.severity === "warning" ? "bg-amber-100" : "bg-brand-100"
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={
                    n.severity === "critical" ? "text-danger-600" :
                    n.severity === "warning" ? "text-amber-600" : "text-brand-600"
                  }
                >
                  <path d={severityIcon[n.severity] || severityIcon.info} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                  <Badge color={severityColor[n.severity] || "gray"}>{n.severity}</Badge>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-brand-500" />
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>
                <p className="mt-1 text-xs text-gray-400">{n.time}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
