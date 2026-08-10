import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/jiropay/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace")({
  component: EspaceClient,
});

function EspaceClient() {
  const { user } = useAuth();

  return (
    <AppShell
      titre="Mon espace"
      sousTitre={user ? `Bienvenue, ${user.name}` : undefined}
      role="client"
    >
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Mes factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucune facture pour l'instant</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Le paiement en ligne de vos factures JIRAMA arrive bientôt sur JIRAMA Pay.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Nom</p>
              <p className="font-medium text-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Téléphone</p>
              <p className="font-medium text-foreground">{user?.phone ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
