"use client";

import { UserProfile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { RoleBadge } from "@/components/ui/badge";
import {
  Droplets,
  LayoutDashboard,
  Plus,
  ClipboardList,
  FileText,
  FlaskConical,
  TestTube2,
  Package,
  CheckSquare,
  Archive,
  Database,
  Inbox,
  Link2,
  ShieldCheck,
  AlertTriangle,
  UserX,
  Syringe,
  Activity,
  AlertOctagon,
  BarChart3,
  Search,
  Users,
  Download,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  clinician: [
    { href: "/dashboard/clinician", label: "My Requests", icon: ClipboardList },
    { href: "/request/new", label: "New Request", icon: Plus },
    { href: "/dashboard/clinician/history", label: "Transfusion History", icon: Archive },
    { href: "/dashboard/clinician/consent", label: "Consent Forms", icon: FileText },
  ],
  lab_tech: [
    { href: "/dashboard/lab", label: "Workstation Queue", icon: FlaskConical },
    { href: "/workstation/grouping", label: "Grouping & Crossmatch", icon: TestTube2 },
    { href: "/workstation/reagents", label: "Reagent / Equipment Log", icon: Package },
    { href: "/workstation/reports", label: "Finalized Reports", icon: CheckSquare },
  ],
  officer: [
    { href: "/dashboard/officer", label: "Inventory", icon: Database },
    { href: "/dashboard/officer/requests", label: "Active Requests", icon: Inbox },
    { href: "/dashboard/officer/assign", label: "Assign to Lab", icon: Link2 },
    { href: "/issue-auth", label: "Issue Authorization", icon: ShieldCheck },
    { href: "/emergency-release", label: "Emergency Release", icon: AlertTriangle },
    { href: "/dashboard/officer/donors", label: "Donor Registry", icon: Users },
    { href: "/dashboard/officer/deferral", label: "Donor Deferral", icon: UserX },
  ],
  nurse: [
    { href: "/dashboard/nurse", label: "Active Transfusions", icon: Syringe },
    { href: "/bedside-verify", label: "Bedside Verification", icon: ShieldCheck },
    { href: "/dashboard/nurse/monitoring", label: "Monitoring Charts", icon: Activity },
    { href: "/adverse-reaction", label: "Report Adverse Reaction", icon: AlertOctagon },
  ],
  hod: [
    { href: "/dashboard/hod", label: "Haemovigilance", icon: BarChart3 },
    { href: "/audit-trail", label: "Audit Trail", icon: Search },
    { href: "/dashboard/hod/staff", label: "Staff Monitor", icon: Users },
    { href: "/dashboard/hod/analytics", label: "Inventory Analytics", icon: BarChart3 },
    { href: "/dashboard/hod/reports", label: "National Reports", icon: Download },
  ],
};

interface SidebarProps {
  user: UserProfile;
  notificationCount?: number;
}

export function Sidebar({ user, notificationCount = 0 }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navItems = NAV_ITEMS[user.role] || [];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-600">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold leading-none">TetherX Blood Bank</div>
          <div className="text-xs text-gray-400 mt-0.5">Safety System</div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.full_name}</div>
            <RoleBadge role={user.role} className="mt-0.5" />
          </div>
        </div>
        {user.ward && (
          <div className="mt-2 text-xs text-gray-400">Ward: {user.ward}</div>
        )}
        {user.workstation && (
          <div className="mt-1 text-xs text-gray-400">Workstation: {user.workstation}</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
          {notificationCount > 0 && (
            <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
