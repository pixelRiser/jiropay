import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, Users, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/guichet")({
  component: GuichetLayout,
});

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", to: "/guichet", icon: LayoutDashboard },
  { label: "Mes clients", to: "/guichet/clients", icon: Users },
  { label: "Mon profil", to: "/guichet/profil", icon: User },
];

function GuichetLayout() {
  return (
    <DashboardShell role="agent" navItems={NAV_ITEMS}>
      <Outlet />
    </DashboardShell>
  );
}
