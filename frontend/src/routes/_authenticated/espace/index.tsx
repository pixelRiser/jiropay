import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/")({
  component: EspaceDashboard,
});

function EspaceDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader
        titre="Tableau de bord"
        sousTitre={user ? `Bienvenue, ${user.name}` : undefined}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Factures en attente</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-sm text-muted-foreground">
              Le paiement en ligne de vos factures JIRAMA arrive bientôt.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/espace/factures">
              <ReceiptText className="mr-2 size-4" />
              Voir mes factures
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
