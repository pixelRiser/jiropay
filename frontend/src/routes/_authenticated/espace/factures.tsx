import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { mesFactures, supprimerFacture, type Facture } from "@/lib/jiropay/facture-api";
import { ApiError } from "@/lib/jiropay/http";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ReceiptText,
  Smartphone,
  ShieldCheck,
  Bell,
  Plus,
  CreditCard,
  Download,
  Trash2,
  RotateCcw,
  MoreVertical,
  Eye,
} from "lucide-react";

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

export const Route = createFileRoute("/_authenticated/espace/factures")({
  component: FacturesClient,
});

const LIBELLE_STATUT_PAIEMENT: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" }
> = {
  en_attente: { label: "En attente", variant: "secondary" },
  confirme: { label: "Confirmé", variant: "default" },
  echoue: { label: "Échoué", variant: "destructive" },
};

function FacturesClient() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [factureApercu, setFactureApercu] = useState<Facture | null>(null);
  const { data: factures = [], isLoading } = useQuery({
    queryKey: ["mes-factures"],
    queryFn: mesFactures,
  });

  const supprimerMutation = useMutation({
    mutationFn: supprimerFacture,
    onSuccess: () => {
      toast.success("Facture supprimée.");
      queryClient.invalidateQueries({ queryKey: ["mes-factures"] });
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de supprimer cette facture.")),
  });

  async function handleSupprimer(factureId: number, reference: string | null) {
    const ok = await confirm({
      titre: "Supprimer cette facture ?",
      description: `La facture ${reference ?? ""} sera définitivement supprimée. Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      destructif: true,
    });
    if (!ok) return;
    supprimerMutation.mutate(factureId);
  }

  return (
    <>
      <PageHeader
        titre="Mes factures"
        sousTitre="L'historique de vos factures et achats de crédit JIRAMA."
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique</CardTitle>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/espace/facture-carte">
                <CreditCard className="mr-2 size-4" />
                Facture carte
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/espace/payer-facture">
                <Plus className="mr-2 size-4" />
                Payer une facture
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chargement…</p>
          ) : factures.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucune facture pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Déclarez une facture ou achetez un crédit prépayé pour le régler avec GoalPay
                (Orange Money ou Telma).
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titulaire / Compteur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Reçu</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factures.map((f) => {
                  const dernierPaiement = f.paiements[0];
                  const statut = dernierPaiement
                    ? LIBELLE_STATUT_PAIEMENT[dernierPaiement.statut_mobile_money]
                    : null;
                  const estConfirme = dernierPaiement?.statut_mobile_money === "confirme";
                  const recuDisponible = f.statut === "paye_jirama";
                  return (
                    <TableRow key={f.id}>
                      <TableCell>
                        <Badge variant="outline">{f.type === "carte" ? "Carte" : "Facture"}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{f.reference_facture ?? "—"}</TableCell>
                      <TableCell>
                        {f.type === "carte" ? f.numero_compteur : f.nom_titulaire}
                      </TableCell>
                      <TableCell>{f.montant_du.toLocaleString("fr-FR")} Ar</TableCell>
                      <TableCell>{dernierPaiement ? "GoalPay" : "—"}</TableCell>
                      <TableCell>
                        {statut ? (
                          <Badge variant={statut.variant}>{statut.label}</Badge>
                        ) : (
                          <Badge variant="secondary">Non payée</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(f.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        {recuDisponible ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={`/api/factures/${f.id}/recu`} target="_blank" rel="noreferrer">
                              <Download className="mr-2 size-4" />
                              Télécharger
                            </a>
                          </Button>
                        ) : estConfirme ? (
                          <span className="text-xs text-muted-foreground">En cours…</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFactureApercu(f)}>
                              <Eye className="mr-2 size-4" />
                              Aperçu
                            </DropdownMenuItem>
                            {!estConfirme ? (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={
                                      f.type === "carte"
                                        ? "/espace/facture-carte"
                                        : "/espace/payer-facture"
                                    }
                                    search={{ reprendre: f.id }}
                                    className="cursor-pointer"
                                  >
                                    <RotateCcw className="mr-2 size-4" />
                                    Reprendre le paiement
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  disabled={supprimerMutation.isPending}
                                  onClick={() => handleSupprimer(f.id, f.reference_facture)}
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-3 pt-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Smartphone className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Paiement mobile money</p>
              <p className="text-xs text-muted-foreground">Avec GoalPay : Orange Money et Telma.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 pt-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Paiement vérifié</p>
              <p className="text-xs text-muted-foreground">
                Chaque règlement est contrôlé avant validation.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 pt-6">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="size-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Rappels automatiques</p>
              <p className="text-xs text-muted-foreground">
                Vous serez averti si une facture n'a pas été réglée ce mois-ci.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!factureApercu} onOpenChange={(open) => !open && setFactureApercu(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {factureApercu?.type === "carte" ? "Carte prépayée" : "Facture"} —{" "}
              {factureApercu?.reference_facture ?? "—"}
            </DialogTitle>
            <DialogDescription>
              {factureApercu?.type === "carte"
                ? `Compteur ${factureApercu?.numero_compteur ?? "—"}`
                : `Titulaire : ${factureApercu?.nom_titulaire ?? "—"}`}
            </DialogDescription>
          </DialogHeader>
          {factureApercu ? (
            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Facture déclarée</h3>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Référence facture</dt>
                    <dd className="font-medium">{factureApercu.reference_facture ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {factureApercu.type === "carte" ? "N° compteur" : "Titulaire"}
                    </dt>
                    <dd className="font-medium">
                      {factureApercu.type === "carte"
                        ? (factureApercu.numero_compteur ?? "—")
                        : (factureApercu.nom_titulaire ?? "—")}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Montant dû</dt>
                    <dd className="font-medium">
                      {factureApercu.montant_du.toLocaleString("fr-FR")} Ar
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Statut facture</dt>
                    <dd className="font-medium">{factureApercu.statut}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Déclarée le</dt>
                    <dd className="font-medium">
                      {new Date(factureApercu.created_at).toLocaleString("fr-FR")}
                    </dd>
                  </div>
                </dl>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Historique des paiements ({factureApercu.paiements.length})
                </h3>
                {factureApercu.paiements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune tentative de paiement.</p>
                ) : (
                  <div className="space-y-3">
                    {factureApercu.paiements.map((p) => {
                      const statut = LIBELLE_STATUT_PAIEMENT[p.statut_mobile_money];
                      return (
                        <div key={p.id} className="rounded-lg border p-3 text-sm">
                          <div className="mb-2 flex items-center justify-between">
                            <Badge variant={statut?.variant ?? "secondary"}>
                              {statut?.label ?? p.statut_mobile_money}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(p.date_paiement ?? p.created_at).toLocaleString("fr-FR")}
                            </span>
                          </div>
                          <dl className="space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">
                                Référence paiement (GoalPay)
                              </dt>
                              <dd className="font-medium">{p.reference_mobile_money ?? "—"}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Montant payé (frais inclus)</dt>
                              <dd className="font-medium">
                                {p.montant.toLocaleString("fr-FR")} Ar
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Méthode</dt>
                              <dd className="font-medium">
                                {p.methode === "mvola"
                                  ? "Mvola"
                                  : p.methode === "orange_money"
                                    ? "Orange Money"
                                    : (p.methode ?? "—")}
                              </dd>
                            </div>
                            {p.erreur_gateway ? (
                              <div className="flex justify-between">
                                <dt className="text-muted-foreground">Détail</dt>
                                <dd className="font-medium text-destructive">{p.erreur_gateway}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
