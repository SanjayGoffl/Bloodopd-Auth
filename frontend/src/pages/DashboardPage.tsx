import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import ClinicianDashboard from "./ClinicianDashboard";
import PatientDashboard from "./PatientDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "clinician":
      return <ClinicianDashboard />;
    case "patient":
      return <PatientDashboard />;
    default:
      return <ClinicianDashboard />;
  }
}
