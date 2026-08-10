import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listeGuichetsAdmin, agentsEnAttente, listeClients } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, UserCheck, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });
  const { data: clients = [] } = useQuery({ queryKey: ["admin-clients"], queryFn: listeClients });

  return (
    <>
      <PageHeader titre="Tableau de bord" sousTitre="Vue d'ensemble de la plateforme" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/guichets">
          <Card className="cursor-pointer transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">Guichets</CardTitle>
              <Store className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{guichets.length}</p>
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
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}
