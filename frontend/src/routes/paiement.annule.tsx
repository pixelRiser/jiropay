import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleSlash, Zap } from "lucide-react";

export const Route = createFileRoute("/paiement/annule")({
  head: () => ({ meta: [{ title: "Paiement annulé — JIRAMA Pay" }] }),
  component: PaiementAnnule,
});

function PaiementAnnule() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          JIRAMA Pay
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <CircleSlash className="size-7" />
            </span>
            <CardTitle>Paiement annulé</CardTitle>
            <CardDescription>
              Vous avez quitté la page GoalPay avant la fin du paiement. Aucun montant n'a été
              débité — vous pouvez relancer le paiement à tout moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/espace/factures">Retourner à mes factures</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
