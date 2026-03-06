import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
