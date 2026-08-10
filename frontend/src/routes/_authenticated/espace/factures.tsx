import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ReceiptText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/factures")({
  component: FacturesClient,
});

function FacturesClient() {
  return (
    <>
      <PageHeader titre="Mes factures" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ReceiptText className="size-6" />
          </span>
          <p className="text-sm font-medium text-foreground">Aucune facture pour l'instant</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Le paiement en ligne de vos factures JIRAMA arrive bientôt sur JIRAMA Pay.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
