import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mesFactures, supprimerFacture } from "@/lib/jiropay/facture-api";
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
  ReceiptText,
  Smartphone,
  ShieldCheck,
  Bell,
  Plus,
  CreditCard,
  Download,
  Trash2,
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
                        {estConfirme ? (
                          <Button asChild size="sm" variant="outline">
                            <a href={`/api/factures/${f.id}/recu`} target="_blank" rel="noreferrer">
                              <Download className="mr-2 size-4" />
                              Télécharger
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {estConfirme ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={supprimerMutation.isPending}
                            onClick={() => handleSupprimer(f.id, f.reference_facture)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Supprimer
                          </Button>
                        )}
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
    </>
  );
}
