import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/paiement/echec")({
  head: () => ({ meta: [{ title: "Paiement échoué — JIRAMA Pay" }] }),
  component: PaiementEchec,
});

function PaiementEchec() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <BrandMark />
        </div>
        <Card>
          <CardHeader className="items-center text-center">
            <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="size-7" />
            </span>
            <CardTitle>Paiement échoué</CardTitle>
            <CardDescription>
              Votre transaction GoalPay n'a pas abouti (fonds insuffisants ou refus de l'opérateur).
              Aucun montant n'a été débité côté JiroPay — vous pouvez réessayer.
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
