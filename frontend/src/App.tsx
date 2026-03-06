import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppShell from "@/components/layout/AppShell";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import RequestsPage from "@/pages/RequestsPage";
import AuditTrailPage from "@/pages/AuditTrailPage";
import NotificationsPage from "@/pages/NotificationsPage";
import IssueAuthPage from "@/pages/IssueAuthPage";
import EmergencyReleasePage from "@/pages/EmergencyReleasePage";
import BedsideVerifyPage from "@/pages/BedsideVerifyPage";
import AdverseReactionPage from "@/pages/AdverseReactionPage";
import GroupingPage from "@/pages/GroupingPage";
import MonitoringPage from "@/pages/MonitoringPage";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <span className="text-sm text-gray-500">Loading TetherX...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="audit" element={<AuditTrailPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="issue" element={<IssueAuthPage />} />
        <Route path="emergency" element={<EmergencyReleasePage />} />
        <Route path="bedside" element={<BedsideVerifyPage />} />
        <Route path="adverse" element={<AdverseReactionPage />} />
        <Route path="grouping" element={<GroupingPage />} />
        <Route path="monitoring" element={<MonitoringPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
