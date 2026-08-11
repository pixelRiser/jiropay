import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap } from "lucide-react";

export const Route = createFileRoute("/paiement/succes")({
  head: () => ({ meta: [{ title: "Paiement effectué — JIRAMA Pay" }] }),
  component: PaiementSucces,
});

function PaiementSucces() {
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
            <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </span>
            <CardTitle>Paiement effectué</CardTitle>
            <CardDescription>
              Merci — votre transaction GoalPay a été acceptée. La confirmation définitive de votre
              facture peut prendre quelques instants pendant que nous la traitons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/espace/factures">Voir mes factures</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
