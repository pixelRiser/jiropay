import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listeAgents,
  listeGuichetsAdmin,
  approuverAgent,
  rejeterAgent,
  modifierAgent,
  supprimerAgent,
  type AgentDetail,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCheck, Check, X, MoreVertical, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/agents")({
  component: AgentsAdmin,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function badgeStatut(statut: AgentDetail["status"]) {
  if (statut === "approved") return <Badge>Approuvé</Badge>;
  if (statut === "rejected") return <Badge variant="destructive">Rejeté</Badge>;
  return <Badge variant="secondary">En attente</Badge>;
}

function AgentsAdmin() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: listeAgents,
  });
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });

  const [agentEnEdition, setAgentEnEdition] = useState<AgentDetail | null>(null);

  function invalider() {
    queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
    queryClient.invalidateQueries({ queryKey: ["admin-agents-pending"] });
  }

  const approuverMutation = useMutation({
    mutationFn: approuverAgent,
    onSuccess: () => {
      toast.success("Agent approuvé — il peut désormais se connecter.");
      invalider();
    },
  });
  const rejeterMutation = useMutation({
    mutationFn: rejeterAgent,
    onSuccess: () => {
      toast.success("Demande rejetée.");
      invalider();
    },
  });
  const modifierMutation = useMutation({
    mutationFn: (payload: Parameters<typeof modifierAgent>[1]) =>
      modifierAgent(agentEnEdition!.id, payload),
    onSuccess: () => {
      toast.success("Agent mis à jour.");
      invalider();
      setAgentEnEdition(null);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de modifier cet agent.")),
  });
  const supprimerMutation = useMutation({
    mutationFn: supprimerAgent,
    onSuccess: () => {
      toast.success("Agent supprimé.");
      invalider();
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de supprimer cet agent.")),
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
      description: "Ce compte agent ne pourra pas se connecter.",
      confirmLabel: "Rejeter",
      destructif: true,
    });
    if (ok) rejeterMutation.mutate(id);
  }

  async function demanderSuppression(a: AgentDetail) {
    const ok = await confirm({
      titre: `Supprimer ${a.name} ?`,
      description: "Cette action est irréversible — le compte agent sera définitivement supprimé.",
      confirmLabel: "Supprimer",
      destructif: true,
    });
    if (ok) supprimerMutation.mutate(a.id);
  }

  function soumettreModification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    modifierMutation.mutate({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      guichet_id: Number(form.get("guichet_id")),
      status: form.get("status") as AgentDetail["status"],
    });
  }

  const enAttenteCount = agents.filter((a) => a.status === "pending").length;

  return (
    <>
      <PageHeader
        titre="Agents de guichet"
        sousTitre="Tous les agents inscrits, tous statuts confondus."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {agents.length} agent{agents.length !== 1 ? "s" : ""}
            {enAttenteCount > 0 ? ` — ${enAttenteCount} en attente de validation` : ""}
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
              <p className="text-sm font-medium text-foreground">Aucun agent pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Les inscriptions d'agents de guichet apparaîtront ici.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Guichet</TableHead>
                  <TableHead>Inscrit le</TableHead>
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
                    <TableCell>{badgeStatut(a.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {a.status === "pending" ? (
                            <>
                              <DropdownMenuItem onClick={() => demanderApprobation(a.id, a.name)}>
                                <Check className="mr-2 size-4" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => demanderRejet(a.id, a.name)}>
                                <X className="mr-2 size-4" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          <DropdownMenuItem onClick={() => setAgentEnEdition(a)}>
                            <Pencil className="mr-2 size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => demanderSuppression(a)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!agentEnEdition} onOpenChange={(open) => !open && setAgentEnEdition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {agentEnEdition?.name}</DialogTitle>
          </DialogHeader>
          {agentEnEdition ? (
            <form className="space-y-3" onSubmit={soumettreModification}>
              <div className="space-y-1">
                <Label htmlFor="a-name">Nom complet</Label>
                <Input id="a-name" name="name" required defaultValue={agentEnEdition.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-email">Email</Label>
                <Input
                  id="a-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={agentEnEdition.email}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="a-phone">Téléphone</Label>
                <Input
                  id="a-phone"
                  name="phone"
                  required
                  defaultValue={agentEnEdition.phone ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label>Guichet</Label>
                <Select
                  name="guichet_id"
                  defaultValue={agentEnEdition.guichet_id ? String(agentEnEdition.guichet_id) : ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un guichet" />
                  </SelectTrigger>
                  <SelectContent>
                    {guichets.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.nom} — {g.lieu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Statut</Label>
                <Select name="status" defaultValue={agentEnEdition.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={modifierMutation.isPending}>
                Enregistrer les modifications
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
