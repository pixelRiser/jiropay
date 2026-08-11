import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mesPaiementsGuichet } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
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
import { ReceiptText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/guichet/paiements")({
  component: PaiementsGuichet,
});

function libelleEtape(p: {
  statut_mobile_money: "en_attente" | "confirme" | "echoue";
  paiement_jirama: { id: number } | null;
}): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (p.statut_mobile_money === "echoue") return { label: "Échoué", variant: "destructive" };
  if (p.statut_mobile_money === "en_attente") {
    return { label: "En attente de paiement", variant: "secondary" };
  }
  // confirme
  if (p.paiement_jirama) return { label: "Réglé auprès de JIRAMA", variant: "default" };
  return { label: "Confirmé — en attente de traitement admin", variant: "secondary" };
}

function PaiementsGuichet() {
  const { data: paiements = [], isLoading } = useQuery({
    queryKey: ["guichet-paiements"],
    queryFn: mesPaiementsGuichet,
  });

  return (
    <>
      <PageHeader
        titre="Mes demandes de paiement"
        sousTitre="Les paiements de vos clients référés et leur avancement jusqu'au règlement JIRAMA."
      />
      <Card>
        <CardHeader>
          <CardTitle>
            {paiements.length} demande{paiements.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : paiements.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ReceiptText className="size-6" />
              </span>
              <p className="text-sm font-medium text-foreground">Aucune demande pour l'instant</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Les paiements de vos clients référés apparaîtront ici, avec leur avancement jusqu'au
                règlement JIRAMA.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Ma commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paiements.map((p) => {
                  const etape = libelleEtape(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.client.user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {p.facture.type === "carte" ? "Carte" : "Facture"}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.facture.reference_facture ?? "—"}</TableCell>
                      <TableCell>{p.montant.toLocaleString("fr-FR")} Ar</TableCell>
                      <TableCell>
                        {p.montant_commission !== null
                          ? `${p.montant_commission.toLocaleString("fr-FR")} Ar`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={etape.variant}>{etape.label}</Badge>
                      </TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
