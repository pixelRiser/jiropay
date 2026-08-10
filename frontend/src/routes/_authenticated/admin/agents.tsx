import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentsEnAttente, approuverAgent, rejeterAgent } from "@/lib/jiropay/admin-api";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/agents")({
  component: AgentsAdmin,
});

function AgentsAdmin() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });

  const approuverMutation = useMutation({
    mutationFn: approuverAgent,
    onSuccess: () => {
      toast.success("Agent approuvé — il peut désormais se connecter.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });
  const rejeterMutation = useMutation({
    mutationFn: rejeterAgent,
    onSuccess: () => {
      toast.success("Demande rejetée.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });

  async function demanderApprobation(id: number, nom: string) {
    const ok = await confirm({
      titre: `Approuver ${nom} ?`,
      description:
        "Cet agent pourra se connecter et accéder aux clients de son guichet dès la validation.",
      confirmLabel: "Approuver",
    });
    if (ok) approuverMutation.mutate(id);
  }

  async function demanderRejet(id: number, nom: string) {
    const ok = await confirm({
      titre: `Rejeter la demande de ${nom} ?`,
      description:
        "Ce compte agent ne pourra pas se connecter. Cette action peut être annulée manuellement plus tard.",
      confirmLabel: "Rejeter",
      destructif: true,
    });
    if (ok) rejeterMutation.mutate(id);
  }

  return (
    <>
      <PageHeader
        titre="Agents en attente de validation"
        sousTitre="Les agents s'inscrivent librement en choisissant leur guichet — vous validez leur accès ici."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {agents.length} demande{agents.length !== 1 ? "s" : ""} en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <UserCheck className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucune demande en attente</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Les nouvelles inscriptions d'agents de guichet apparaîtront ici, en attente de votre
                validation.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Guichet demandé</TableHead>
                  <TableHead>Demandé le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.phone}</TableCell>
                    <TableCell>
                      {a.guichet ? `${a.guichet.nom} — ${a.guichet.lieu}` : "—"}
                    </TableCell>
                    <TableCell>{new Date(a.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">En attente</Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => demanderApprobation(a.id, a.name)}>
                        <Check className="mr-1 size-4" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => demanderRejet(a.id, a.name)}
                      >
                        <X className="mr-1 size-4" />
                        Rejeter
                      </Button>
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
