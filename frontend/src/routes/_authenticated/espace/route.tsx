import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, ReceiptText, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace")({
  component: EspaceLayout,
});

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", to: "/espace", icon: LayoutDashboard },
  { label: "Mes factures", to: "/espace/factures", icon: ReceiptText },
  { label: "Mon profil", to: "/espace/profil", icon: User },
];

function EspaceLayout() {
  return (
    <DashboardShell role="client" navItems={NAV_ITEMS}>
      <Outlet />
    </DashboardShell>
  );
}
