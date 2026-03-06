import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: "grid", roles: ["admin", "clinician", "patient"] },
  { label: "Inventory", to: "/inventory", icon: "droplet", roles: ["admin", "clinician"] },
  { label: "Requests", to: "/requests", icon: "clipboard", roles: ["admin", "clinician"] },
  { label: "Issue / Verify", to: "/issue", icon: "check-square", roles: ["admin"] },
  { label: "Emergency Release", to: "/emergency", icon: "alert-triangle", roles: ["admin"] },
  { label: "Bedside Verify", to: "/bedside", icon: "activity", roles: ["clinician"] },
  { label: "Grouping / XM", to: "/grouping", icon: "flask", roles: ["admin", "clinician"] },
  { label: "Monitoring", to: "/monitoring", icon: "heart", roles: ["clinician"] },
  { label: "Adverse Reaction", to: "/adverse", icon: "alert-circle", roles: ["admin", "clinician"] },
  { label: "Audit Trail", to: "/audit", icon: "shield", roles: ["admin"] },
  { label: "Notifications", to: "/notifications", icon: "bell", roles: ["admin", "clinician", "patient"] },
];

// Simple SVG icon set (inline, no dependency)
function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
    droplet: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
    clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6v4H9z",
    "check-square": "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    "alert-triangle": "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    flask: "M9 3h6M12 3v7.4a2 2 0 0 0 .6 1.4l5.4 5.4a2 2 0 0 1 .6 1.4V20a1 1 0 0 1-1 1H6.4a1 1 0 0 1-1-1v-1.4a2 2 0 0 1 .6-1.4l5.4-5.4a2 2 0 0 0 .6-1.4V3",
    heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
    "alert-circle": "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
    "log-out": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d={icons[name] || icons.grid} />
    </svg>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "";

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex h-screen flex-col bg-[#0f172a] text-gray-300 transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
          TX
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-wide">TetherX</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-medium"
                  : "hover:bg-white/5 hover:text-white"
              }`
            }
            title={item.label}
          >
            <Icon name={item.icon} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="mb-2 px-1">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-2xs text-gray-400 truncate">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-brand-600/30 px-2 py-0.5 text-2xs text-brand-300 capitalize">
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          title="Logout"
        >
          <Icon name="log-out" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
