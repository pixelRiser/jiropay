import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  listeGuichetsAdmin,
  creerGuichet,
  majGuichet,
  detailGuichet,
  supprimerGuichet,
  type GuichetDetail,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { useConfirm } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Store, Pencil, Plus, MoreVertical, Eye, Trash2, Wallet } from "lucide-react";

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

export const Route = createFileRoute("/_authenticated/admin/guichets")({
  component: GuichetsAdmin,
});

function GuichetsAdmin() {
  const queryClient = useQueryClient();
  const { data: guichets = [], isLoading } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const confirm = useConfirm();
  const [dialogCreationOuvert, setDialogCreationOuvert] = useState(false);
  const [guichetEnEdition, setGuichetEnEdition] = useState<GuichetDetail | null>(null);
  const [guichetIdEnDetail, setGuichetIdEnDetail] = useState<number | null>(null);

  const { data: detail, isLoading: detailEnChargement } = useQuery({
    queryKey: ["admin-guichet-detail", guichetIdEnDetail],
    queryFn: () => detailGuichet(guichetIdEnDetail!),
    enabled: guichetIdEnDetail !== null,
  });

  const supprimerMutation = useMutation({
    mutationFn: supprimerGuichet,
    onSuccess: () => {
      toast.success("Guichet supprimé.");
      queryClient.invalidateQueries({ queryKey: ["admin-guichets"] });
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de supprimer ce guichet.")),
  });

  async function demanderSuppression(g: GuichetDetail) {
    const ok = await confirm({
      titre: `Supprimer ${g.nom} ?`,
      description:
        "Cette action est irréversible. Impossible si ce guichet a des clients, agents, paiements ou commissions rattachés — désactivez-le plutôt dans ce cas.",
      confirmLabel: "Supprimer",
      destructif: true,
    });
    if (ok) supprimerMutation.mutate(g.id);
  }

  const [nom, setNom] = useState("");
  const [lieu, setLieu] = useState("");
  const [zone, setZone] = useState<"ville" | "hors_ville">("ville");
  const [fraisDefaut, setFraisDefaut] = useState("200");
  const [commissionDefaut, setCommissionDefaut] = useState("200");

  const creerMutation = useMutation({
    mutationFn: creerGuichet,
    onSuccess: () => {
      toast.success("Guichet créé.");
      queryClient.invalidateQueries({ queryKey: ["admin-guichets"] });
      setNom("");
      setLieu("");
      setDialogCreationOuvert(false);
    },
    onError: () => toast.error("Impossible de créer le guichet."),
  });

  const majMutation = useMutation({
    mutationFn: (payload: Parameters<typeof majGuichet>[1]) =>
      majGuichet(guichetEnEdition!.id, payload),
    onSuccess: () => {
      toast.success("Guichet mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-guichets"] });
      setGuichetEnEdition(null);
    },
    onError: () => toast.error("Impossible de mettre à jour ce guichet."),
  });

  return (
    <>
      <PageHeader
        titre="Guichets"
        sousTitre="Le réseau de points de collecte partenaires de JIRAMA Pay."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {guichets.length} guichet{guichets.length !== 1 ? "s" : ""}
          </CardTitle>
          <Dialog open={dialogCreationOuvert} onOpenChange={setDialogCreationOuvert}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                Nouveau guichet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau guichet</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  creerMutation.mutate({
                    nom,
                    lieu,
                    zone,
                    montant_frais_defaut: Number(fraisDefaut),
                    montant_commission_defaut: Number(commissionDefaut),
                  });
                }}
              >
                <div className="space-y-1">
                  <Label htmlFor="g-nom">Nom</Label>
                  <Input id="g-nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-lieu">Lieu</Label>
                  <Input
                    id="g-lieu"
                    required
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Zone</Label>
                  <Select
                    value={zone}
                    onValueChange={(v) => {
                      const zoneChoisie = v as "ville" | "hors_ville";
                      setZone(zoneChoisie);
                      // Pré-remplit les valeurs par défaut du cahier des charges
                      // (200/200 en ville, 500/400 hors ville) — l'admin peut
                      // toujours les ajuster manuellement ensuite.
                      if (zoneChoisie === "ville") {
                        setFraisDefaut("200");
                        setCommissionDefaut("200");
                      } else {
                        setFraisDefaut("500");
                        setCommissionDefaut("400");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ville">Ville (frais 200 Ar)</SelectItem>
                      <SelectItem value="hors_ville">Hors ville (frais 500 Ar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-frais">Frais par défaut (Ar)</Label>
                  <Input
                    id="g-frais"
                    type="number"
                    required
                    value={fraisDefaut}
                    onChange={(e) => setFraisDefaut(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pré-rempli selon la zone, ajustable au besoin.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="g-comm">Commission par défaut (Ar)</Label>
                  <Input
                    id="g-comm"
                    type="number"
                    required
                    value={commissionDefaut}
                    onChange={(e) => setCommissionDefaut(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Part reversée au guichet sur les frais — ce qui reste va à la plateforme.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
                  Créer le guichet
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : guichets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucun guichet pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Créez le premier guichet du réseau pour permettre à des agents de s'y inscrire.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Frais</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guichets.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.nom}</TableCell>
                    <TableCell>{g.lieu}</TableCell>
                    <TableCell>{g.zone === "ville" ? "Ville" : "Hors ville"}</TableCell>
                    <TableCell>
                      <Badge variant={g.statut === "actif" ? "default" : "secondary"}>
                        {g.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>{g.montant_frais_defaut.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell>{g.montant_commission_defaut.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell>{g.clients_count ?? 0}</TableCell>
                    <TableCell>{g.solde_commission.toLocaleString("fr-FR")} Ar</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setGuichetIdEnDetail(g.id)}>
                            <Eye className="mr-2 size-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setGuichetEnEdition(g)}>
                            <Pencil className="mr-2 size-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => demanderSuppression(g)}
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

      <Dialog
        open={guichetEnEdition !== null}
        onOpenChange={(open) => !open && setGuichetEnEdition(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier {guichetEnEdition?.nom}</DialogTitle>
          </DialogHeader>
          {guichetEnEdition ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                majMutation.mutate({
                  nom: String(form.get("nom")),
                  lieu: String(form.get("lieu")),
                  zone: form.get("zone") as "ville" | "hors_ville",
                  statut: form.get("statut") as "actif" | "inactif",
                  montant_frais_defaut: Number(form.get("frais")),
                  montant_commission_defaut: Number(form.get("commission")),
                });
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="e-nom">Nom</Label>
                <Input id="e-nom" name="nom" required defaultValue={guichetEnEdition.nom} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-lieu">Lieu</Label>
                <Input id="e-lieu" name="lieu" required defaultValue={guichetEnEdition.lieu} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Zone</Label>
                  <Select name="zone" defaultValue={guichetEnEdition.zone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ville">Ville</SelectItem>
                      <SelectItem value="hors_ville">Hors ville</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Statut</Label>
                  <Select name="statut" defaultValue={guichetEnEdition.statut}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="e-frais">Frais par défaut (Ar)</Label>
                  <Input
                    id="e-frais"
                    name="frais"
                    type="number"
                    required
                    defaultValue={guichetEnEdition.montant_frais_defaut}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="e-comm">Commission par défaut (Ar)</Label>
                  <Input
                    id="e-comm"
                    name="commission"
                    type="number"
                    required
                    defaultValue={guichetEnEdition.montant_commission_defaut}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={majMutation.isPending}>
                Enregistrer les modifications
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={guichetIdEnDetail !== null}
        onOpenChange={(open) => !open && setGuichetIdEnDetail(null)}
      >
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.nom ?? "Détail du guichet"}</DialogTitle>
            <DialogDescription>{detail?.lieu}</DialogDescription>
          </DialogHeader>
          {detailEnChargement ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : detail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Clients</p>
                  <p className="text-lg font-semibold">{detail.clients_count ?? 0}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Agents</p>
                  <p className="text-lg font-semibold">{detail.agents.length}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Solde</p>
                  <p className="text-lg font-semibold">
                    {detail.solde_commission.toLocaleString("fr-FR")} Ar
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <Badge variant={detail.statut === "actif" ? "default" : "secondary"}>
                    {detail.statut}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Agents rattachés</h3>
                {detail.agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun agent pour l'instant.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {detail.agents.map((a) => (
                      <li key={a.id} className="flex items-center justify-between">
                        <span>
                          {a.name} — {a.email}
                        </span>
                        <Badge variant="outline">{a.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Clients récents ({detail.clients.length})
                </h3>
                {detail.clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun client pour l'instant.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {detail.clients.map((c) => (
                      <li key={c.id}>
                        {c.user.name} — {c.user.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Wallet className="size-4" />
                  Commissions récentes ({detail.commissions.length})
                </h3>
                {detail.commissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune commission pour l'instant.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {detail.commissions.map((c) => (
                      <li key={c.id} className="flex items-center justify-between">
                        <span>{c.paiement.client.user.name}</span>
                        <span className="font-medium">
                          {c.montant_commission.toLocaleString("fr-FR")} Ar
                        </span>
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
