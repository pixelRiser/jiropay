import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listeClients,
  listeGuichetsAdmin,
  reassignerGuichetClient,
  detailClient,
  modifierClient,
  supprimerClient,
  creerClient,
  type ClientDetail,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeftRight, MoreVertical, Eye, Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: ClientsAdmin,
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

function ClientsAdmin() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["admin-clients"],
    queryFn: listeClients,
  });
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });

  const [clientEnReassignation, setClientEnReassignation] = useState<ClientDetail | null>(null);
  const [nouveauGuichetId, setNouveauGuichetId] = useState<string>("");
  const [clientEnEdition, setClientEnEdition] = useState<ClientDetail | null>(null);
  const [clientIdEnDetail, setClientIdEnDetail] = useState<number | null>(null);
  const [dialogCreationOuvert, setDialogCreationOuvert] = useState(false);

  const { data: detail, isLoading: detailEnChargement } = useQuery({
    queryKey: ["admin-client-detail", clientIdEnDetail],
    queryFn: () => detailClient(clientIdEnDetail!),
    enabled: clientIdEnDetail !== null,
  });

  const reassignerMutation = useMutation({
    mutationFn: (payload: { clientId: number; guichetId: number }) =>
      reassignerGuichetClient(payload.clientId, payload.guichetId),
    onSuccess: () => {
      toast.success("Guichet référent modifié.");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setClientEnReassignation(null);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de modifier le guichet.")),
  });

  const modifierMutation = useMutation({
    mutationFn: (payload: Parameters<typeof modifierClient>[1]) =>
      modifierClient(clientEnEdition!.id, payload),
    onSuccess: () => {
      toast.success("Client mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setClientEnEdition(null);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de modifier ce client.")),
  });

  const supprimerMutation = useMutation({
    mutationFn: supprimerClient,
    onSuccess: () => {
      toast.success("Client supprimé.");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de supprimer ce client.")),
  });

  const creerMutation = useMutation({
    mutationFn: creerClient,
    onSuccess: () => {
      toast.success("Client enregistré — un email d'activation lui a été envoyé.");
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      setDialogCreationOuvert(false);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de créer ce client.")),
  });

  function ouvrirReassignation(client: ClientDetail) {
    setClientEnReassignation(client);
    setNouveauGuichetId(String(client.guichet_referent_id));
  }

  async function confirmerReassignation() {
    if (!clientEnReassignation) return;
    const guichetId = Number(nouveauGuichetId);
    const guichet = guichets.find((g) => g.id === guichetId);
    const ok = await confirm({
      titre: "Changer le guichet référent ?",
      description: `${clientEnReassignation.user.name} sera rattaché à ${guichet?.nom ?? "ce guichet"} — ses commissions futures iront à ce guichet. Réservé aux cas de litige.`,
      confirmLabel: "Confirmer le changement",
      destructif: true,
    });
    if (!ok) return;
    reassignerMutation.mutate({ clientId: clientEnReassignation.id, guichetId });
  }

  async function demanderSuppression(c: ClientDetail) {
    const ok = await confirm({
      titre: `Supprimer ${c.user.name} ?`,
      description:
        "Cette action est irréversible. Impossible si ce client a des factures ou paiements enregistrés.",
      confirmLabel: "Supprimer",
      destructif: true,
    });
    if (ok) supprimerMutation.mutate(c.id);
  }

  function soumettreModification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    modifierMutation.mutate({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      numero_abonne_jirama: String(form.get("numero_abonne_jirama")),
      adresse: String(form.get("adresse") ?? ""),
    });
  }

  function soumettreCreation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    creerMutation.mutate({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      numero_abonne_jirama: String(form.get("numero_abonne_jirama")),
      adresse: String(form.get("adresse") ?? "") || undefined,
      guichet_id: Number(form.get("guichet_id")),
    });
  }

  return (
    <>
      <PageHeader
        titre="Clients"
        sousTitre="L'ensemble des clients inscrits, tous guichets confondus."
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </CardTitle>
          <Dialog open={dialogCreationOuvert} onOpenChange={setDialogCreationOuvert}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
                <DialogDescription>
                  Le client reçoit un email pour définir son mot de passe et activer son compte.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-3" onSubmit={soumettreCreation}>
                <div className="space-y-1">
                  <Label htmlFor="c-name">Nom complet</Label>
                  <Input id="c-name" name="name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-email">Email</Label>
                  <Input id="c-email" name="email" type="email" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-phone">Téléphone</Label>
                  <Input id="c-phone" name="phone" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-numero">N° abonné JIRAMA</Label>
                  <Input id="c-numero" name="numero_abonne_jirama" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-adresse">Adresse (facultatif)</Label>
                  <Input id="c-adresse" name="adresse" />
                </div>
                <div className="space-y-1">
                  <Label>Guichet référent</Label>
                  <Select name="guichet_id" required>
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
                <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
                  Créer le client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setClientIdEnDetail(c.id)}>
                            <Eye className="mr-2 size-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setClientEnEdition(c)}>
                            <Pencil className="mr-2 size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => ouvrirReassignation(c)}>
                            <ArrowLeftRight className="mr-2 size-4" />
                            Réassigner le guichet
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => demanderSuppression(c)}
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

      {/* Réassignation guichet */}
      <Dialog
        open={!!clientEnReassignation}
        onOpenChange={(open) => !open && setClientEnReassignation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réassigner {clientEnReassignation?.user.name}</DialogTitle>
            <DialogDescription>
              Change le guichet référent de ce client — réservé aux cas de litige. Les commissions
              déjà créditées restent au guichet d'origine ; seules les futures iront au nouveau
              guichet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={nouveauGuichetId} onValueChange={setNouveauGuichetId}>
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
            <Button
              className="w-full"
              disabled={reassignerMutation.isPending}
              onClick={confirmerReassignation}
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modification infos client */}
      <Dialog open={!!clientEnEdition} onOpenChange={(open) => !open && setClientEnEdition(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {clientEnEdition?.user.name}</DialogTitle>
          </DialogHeader>
          {clientEnEdition ? (
            <form className="space-y-3" onSubmit={soumettreModification}>
              <div className="space-y-1">
                <Label htmlFor="e-name">Nom complet</Label>
                <Input id="e-name" name="name" required defaultValue={clientEnEdition.user.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-email">Email</Label>
                <Input
                  id="e-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={clientEnEdition.user.email}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-phone">Téléphone</Label>
                <Input
                  id="e-phone"
                  name="phone"
                  required
                  defaultValue={clientEnEdition.user.phone ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-numero">N° abonné JIRAMA</Label>
                <Input
                  id="e-numero"
                  name="numero_abonne_jirama"
                  required
                  defaultValue={clientEnEdition.numero_abonne_jirama}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-adresse">Adresse</Label>
                <Input id="e-adresse" name="adresse" defaultValue={clientEnEdition.adresse ?? ""} />
              </div>
              <Button type="submit" className="w-full" disabled={modifierMutation.isPending}>
                Enregistrer les modifications
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Détail client */}
      <Dialog
        open={clientIdEnDetail !== null}
        onOpenChange={(open) => !open && setClientIdEnDetail(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.user.name ?? "Détail du client"}</DialogTitle>
            <DialogDescription>{detail?.user.email}</DialogDescription>
          </DialogHeader>
          {detailEnChargement ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : detail ? (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Factures ({detail.factures.length})
                </h3>
                {detail.factures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune facture pour l'instant.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {detail.factures.map((f) => (
                      <li key={f.id} className="flex items-center justify-between">
                        <span>
                          {f.type === "carte" ? "Carte" : "Facture"} —{" "}
                          {new Date(f.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{f.montant_du.toLocaleString("fr-FR")} Ar</span>
                          <Badge variant="outline">{f.statut}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Paiements ({detail.paiements.length})
                </h3>
                {detail.paiements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun paiement pour l'instant.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {detail.paiements.map((p) => (
                      <li key={p.id} className="flex items-center justify-between">
                        <span>
                          {p.facture.type === "carte" ? "Carte" : "Facture"} —{" "}
                          {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>{p.montant.toLocaleString("fr-FR")} Ar</span>
                          <Badge
                            variant={p.statut_mobile_money === "confirme" ? "default" : "secondary"}
                          >
                            {p.statut_mobile_money}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
