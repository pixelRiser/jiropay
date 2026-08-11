import { Link, useLocation } from "@tanstack/react-router";
import { UserMenu } from "@/components/UserMenu";
import { BrandMark } from "@/components/BrandMark";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

interface Props {
  role: "client" | "agent" | "admin";
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ navItems, children }: Props) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
        <div className="flex items-center border-b px-4 py-4">
          <BrandMark height={48} />
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const actif =
              location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  actif ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b bg-card px-8 py-3">
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
