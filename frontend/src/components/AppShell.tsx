import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface Props {
  titre: string;
  sousTitre?: string | undefined;
  role?: string | undefined;
  children: React.ReactNode;
}

const LIBELLE_ROLE: Record<string, string> = {
  client: "Espace client",
  agent: "Espace guichet",
  admin: "Espace administrateur",
};

export function AppShell({ titre, sousTitre, role, children }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  async function deconnexion() {
    await logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            JIRAMA Pay
            {role ? (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {LIBELLE_ROLE[role]}
              </span>
            ) : null}
          </Link>
          <Button variant="outline" size="sm" onClick={deconnexion}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{titre}</h1>
          {sousTitre ? <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
