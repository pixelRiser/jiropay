import { createFileRoute } from "@tanstack/react-router";
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
import { ReceiptText, Smartphone, ShieldCheck, Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/factures")({
  component: FacturesClient,
});

function FacturesClient() {
  return (
    <>
      <PageHeader
        titre="Mes factures"
        sousTitre="L'historique de vos factures JIRAMA et de leurs paiements apparaîtra ici."
      />

      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois facturé</TableHead>
                <TableHead>Montant dû</TableHead>
                <TableHead>Méthode de paiement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Reçu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <ReceiptText className="size-6" />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      Aucune facture pour l'instant
                    </p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Dès que le paiement en ligne sera activé pour votre compte, vous pourrez
                      déclarer une facture ici et la régler par Orange Money ou Mvola.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
              <p className="text-xs text-muted-foreground">
                Orange Money et Mvola, en toute sécurité.
              </p>
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
