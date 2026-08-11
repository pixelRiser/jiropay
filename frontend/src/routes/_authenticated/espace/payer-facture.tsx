import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { creerFacture, initierPaiement, type Facture } from "@/lib/jiropay/facture-api";
import { ApiError } from "@/lib/jiropay/http";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { MethodesPaiementGoalPay } from "@/components/MethodesPaiementGoalPay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/payer-facture")({
  head: () => ({ meta: [{ title: "Payer une facture — JIRAMA Pay" }] }),
  component: PayerFacture,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function PayerFacture() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [facture, setFacture] = useState<Facture | null>(null);

  const [referenceFacture, setReferenceFacture] = useState("");
  const [montant, setMontant] = useState("");
  const [nomTitulaire, setNomTitulaire] = useState("");

  const creerMutation = useMutation({
    mutationFn: creerFacture,
    onSuccess: (data) => {
      setFacture(data);
      queryClient.invalidateQueries({ queryKey: ["mes-factures"] });
    },
    onError: (error) =>
      toast.error(messageErreur(error, "Impossible d'enregistrer cette facture.")),
  });

  const paiementMutation = useMutation({
    mutationFn: initierPaiement,
    onSuccess: (paiement) => {
      queryClient.invalidateQueries({ queryKey: ["mes-factures"] });
      if (paiement.checkout_url) {
        window.location.href = paiement.checkout_url;
      } else {
        toast.error("GoalPay n'a pas renvoyé de lien de paiement.");
      }
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible d'initier ce paiement.")),
  });

  if (facture) {
    const frais = user?.client?.guichet_referent?.montant_frais_defaut ?? 0;
    const total = facture.montant_du + frais;

    return (
      <>
        <PageHeader
          titre="Payer une facture"
          sousTitre="Vous allez être redirigé vers GoalPay pour choisir Orange Money ou Telma."
        />
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>{facture.reference_facture}</CardTitle>
            <CardDescription>Titulaire : {facture.nom_titulaire}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Montant facture</span>
                <span>{facture.montant_du.toLocaleString("fr-FR")} Ar</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frais de service</span>
                <span>{frais.toLocaleString("fr-FR")} Ar</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold text-foreground">
                <span>Total à payer</span>
                <span>{total.toLocaleString("fr-FR")} Ar</span>
              </div>
            </div>
            <MethodesPaiementGoalPay
              disabled={paiementMutation.isPending}
              onSelect={() => paiementMutation.mutate({ facture_id: facture.id })}
            />
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setFacture(null)}
              disabled={paiementMutation.isPending}
            >
              <ArrowLeft className="mr-2 size-4" />
              Modifier la facture
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titre="Payer une facture"
        sousTitre="Renseignez la référence figurant sur votre facture JIRAMA."
      />
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              creerMutation.mutate({
                type: "facture",
                reference_facture: referenceFacture,
                montant_du: Number(montant),
                nom_titulaire: nomTitulaire,
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="ref">Référence facture</Label>
              <Input
                id="ref"
                required
                placeholder="ex : 106 260 626 103 856"
                value={referenceFacture}
                onChange={(e) => setReferenceFacture(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="titulaire">Nom du titulaire (sur la facture)</Label>
              <Input
                id="titulaire"
                required
                value={nomTitulaire}
                onChange={(e) => setNomTitulaire(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="montant">Montant facture (Ar)</Label>
              <Input
                id="montant"
                type="number"
                required
                min={300}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
              {creerMutation.isPending ? (
                "Enregistrement…"
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Continuer
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
