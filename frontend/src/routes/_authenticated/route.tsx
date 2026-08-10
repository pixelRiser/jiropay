import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/jiropay/auth-store";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const ZONE_PAR_ROLE: Record<string, string> = {
  admin: "/admin",
  agent: "/guichet",
  client: "/espace",
};

function AuthenticatedLayout() {
  const { user, chargement } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (chargement) return;

    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    const zoneAttendue = ZONE_PAR_ROLE[user.role];
    if (zoneAttendue && !location.pathname.startsWith(zoneAttendue)) {
      navigate({ to: zoneAttendue, replace: true });
    }
  }, [user, chargement, location.pathname, navigate]);

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  if (!user) return null;

  return <Outlet />;
}
