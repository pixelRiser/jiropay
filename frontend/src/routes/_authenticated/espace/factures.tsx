import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mesFactures } from "@/lib/jiropay/facture-api";
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
import { ReceiptText, Smartphone, ShieldCheck, Bell, Plus, CreditCard } from "lucide-react";

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

const LIBELLE_METHODE: Record<string, string> = {
  orange_money: "Orange Money",
  mvola: "Mvola",
  airtel_money: "Airtel Money",
};

function FacturesClient() {
  const { data: factures = [], isLoading } = useQuery({
    queryKey: ["mes-factures"],
    queryFn: mesFactures,
  });

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
                Déclarez une facture ou achetez un crédit prépayé pour le régler par Orange Money,
                Mvola ou Airtel Money.
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
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factures.map((f) => {
                  const dernierPaiement = f.paiements[0];
                  const statut = dernierPaiement
                    ? LIBELLE_STATUT_PAIEMENT[dernierPaiement.statut_mobile_money]
                    : null;
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
                      <TableCell>
                        {dernierPaiement ? LIBELLE_METHODE[dernierPaiement.methode] : "—"}
                      </TableCell>
                      <TableCell>
                        {statut ? (
                          <Badge variant={statut.variant}>{statut.label}</Badge>
                        ) : (
                          <Badge variant="secondary">Non payée</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(f.created_at).toLocaleDateString("fr-FR")}</TableCell>
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
              <p className="text-xs text-muted-foreground">Orange Money, Mvola et Airtel Money.</p>
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
