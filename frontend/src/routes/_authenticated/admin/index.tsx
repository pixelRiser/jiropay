import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { listeGuichetsAdmin, agentsEnAttente, listeClients } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, UserCheck, Users, Wallet, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });
  const { data: clients = [] } = useQuery({ queryKey: ["admin-clients"], queryFn: listeClients });

  const soldeTotal = guichets.reduce((total, g) => total + g.solde_commission, 0);
  const guichetsActifs = guichets.filter((g) => g.statut === "actif").length;

  return (
    <>
      <PageHeader
        titre={`Bienvenue, ${user?.name ?? ""}`}
        sousTitre="Vue d'ensemble de la plateforme JIRAMA Pay."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/guichets">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Guichets</CardTitle>
              <Store className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{guichets.length}</p>
              <p className="text-xs text-muted-foreground">
                {guichetsActifs} actif{guichetsActifs !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/agents">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Agents en attente</CardTitle>
              <UserCheck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">
                {agents.length > 0 ? "Validation requise" : "Aucune demande"}
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/clients">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Clients</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Tous guichets confondus</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Commissions cumulées</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{soldeTotal.toLocaleString("fr-FR")} Ar</p>
            <p className="text-xs text-muted-foreground">Tous guichets, non reversées</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Guichets par solde de commission</CardTitle>
          </CardHeader>
          <CardContent>
            {guichets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun guichet créé pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {[...guichets]
                  .sort((a, b) => b.solde_commission - a.solde_commission)
                  .slice(0, 5)
                  .map((g) => (
                    <div key={g.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-foreground">{g.nom}</p>
                        <p className="text-xs text-muted-foreground">{g.lieu}</p>
                      </div>
                      <p className="font-medium text-foreground">
                        {g.solde_commission.toLocaleString("fr-FR")} Ar
                      </p>
                    </div>
                  ))}
              </div>
            )}
            <Link
              to="/admin/guichets"
              className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Voir tous les guichets
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes d'agents en attente</CardTitle>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune demande en attente de validation.
              </p>
            ) : (
              <div className="space-y-3">
                {agents.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.guichet ? a.guichet.nom : "—"}
                      </p>
                    </div>
                    <Badge variant="secondary">En attente</Badge>
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/admin/agents"
              className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Gérer les demandes
              <ArrowRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
