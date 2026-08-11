import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell, type NavItem } from "@/components/DashboardShell";
import { LayoutDashboard, Store, UserCheck, Users, User, ReceiptText, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", to: "/admin", icon: LayoutDashboard },
  { label: "Guichets", to: "/admin/guichets", icon: Store },
  { label: "Agents en attente", to: "/admin/agents", icon: UserCheck },
  { label: "Clients", to: "/admin/clients", icon: Users },
  { label: "Paiements JIRAMA", to: "/admin/paiements", icon: ReceiptText },
  { label: "Commissions", to: "/admin/commissions", icon: Wallet },
  { label: "Mon profil", to: "/admin/profil", icon: User },
];

function AdminLayout() {
  return (
    <DashboardShell role="admin" navItems={NAV_ITEMS}>
      <Outlet />
    </DashboardShell>
  );
}
