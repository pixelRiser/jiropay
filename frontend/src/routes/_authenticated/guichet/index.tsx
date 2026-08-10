import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { monGuichet } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/guichet/")({
  component: GuichetDashboard,
});

function GuichetDashboard() {
  const { data: guichet } = useQuery({ queryKey: ["mon-guichet"], queryFn: monGuichet });

  return (
    <>
      <PageHeader
        titre={guichet ? `Guichet ${guichet.nom}` : "Tableau de bord"}
        sousTitre={guichet?.lieu}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Solde de commission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(guichet?.solde_commission ?? 0).toLocaleString("fr-FR")} Ar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Clients rattachés</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{guichet?.clients_count ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
