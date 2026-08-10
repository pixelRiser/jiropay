import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { agentsEnAttente, approuverAgent, rejeterAgent } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin/agents")({
  component: AgentsAdmin,
});

function AgentsAdmin() {
  const queryClient = useQueryClient();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });

  const approuverMutation = useMutation({
    mutationFn: approuverAgent,
    onSuccess: () => {
      toast.success("Agent approuvé.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });
  const rejeterMutation = useMutation({
    mutationFn: rejeterAgent,
    onSuccess: () => {
      toast.success("Agent rejeté.");
      queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
    },
  });

  return (
    <>
      <PageHeader titre="Agents en attente de validation" />
      <Card>
        <CardHeader>
          <CardTitle>Demandes en attente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun agent en attente.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Guichet</TableHead>
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
                    <TableCell className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => approuverMutation.mutate(a.id)}>
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejeterMutation.mutate(a.id)}
                      >
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
