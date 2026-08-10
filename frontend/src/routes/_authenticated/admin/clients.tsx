import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listeClients } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: ClientsAdmin,
});

function ClientsAdmin() {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: listeClients,
  });

  return (
    <>
      <PageHeader titre="Clients" sousTitre="Tous guichets confondus" />
      <Card>
        <CardHeader>
          <CardTitle>Tous les clients</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun client pour l'instant.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>N° abonné JIRAMA</TableHead>
                  <TableHead>Guichet référent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.user.name}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.numero_abonne_jirama}</TableCell>
                    <TableCell>
                      {c.guichet_referent.nom} — {c.guichet_referent.lieu}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
