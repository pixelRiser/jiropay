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
import { Users } from "lucide-react";

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
      <PageHeader
        titre="Clients"
        sousTitre="L'ensemble des clients inscrits, tous guichets confondus."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucun client pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Les clients apparaîtront ici dès qu'ils s'inscriront eux-mêmes ou seront enregistrés
                par un guichet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>N° abonné JIRAMA</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Guichet référent</TableHead>
                  <TableHead>Inscrit le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.user.name}</TableCell>
                    <TableCell>{c.user.email}</TableCell>
                    <TableCell>{c.user.phone ?? "—"}</TableCell>
                    <TableCell>{c.numero_abonne_jirama}</TableCell>
                    <TableCell>{c.adresse ?? "—"}</TableCell>
                    <TableCell>
                      {c.guichet_referent.nom} — {c.guichet_referent.lieu}
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
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
