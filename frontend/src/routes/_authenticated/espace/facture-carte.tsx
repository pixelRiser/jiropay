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
import { CreditCard, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/facture-carte")({
  head: () => ({ meta: [{ title: "Acheter facture carte — JIRAMA Pay" }] }),
  component: FactureCarte,
});

const MONTANTS_RAPIDES = [5000, 10000, 20000, 50000];

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function FactureCarte() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [facture, setFacture] = useState<Facture | null>(null);

  const [referenceClient, setReferenceClient] = useState("");
  const [nomTitulaire, setNomTitulaire] = useState("");
  const [numeroCompteur, setNumeroCompteur] = useState("");
  const [montant, setMontant] = useState("");

  const creerMutation = useMutation({
    mutationFn: creerFacture,
    onSuccess: (data) => {
      setFacture(data);
      queryClient.invalidateQueries({ queryKey: ["mes-factures"] });
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible d'enregistrer cet achat.")),
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
          titre="Acheter facture carte"
          sousTitre="Vous allez être redirigé vers GoalPay pour choisir Orange Money ou Telma."
        />
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Compteur {facture.numero_compteur}</CardTitle>
            <CardDescription>
              Titulaire : {facture.nom_titulaire} — Référence client : {facture.reference_facture}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Montant du crédit</span>
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
              Modifier
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titre="Acheter facture carte"
        sousTitre="Rechargez un compteur prépayé JIRAMA, comme un crédit téléphonique."
      />
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              creerMutation.mutate({
                type: "carte",
                reference_facture: referenceClient,
                nom_titulaire: nomTitulaire,
                numero_compteur: numeroCompteur,
                montant_du: Number(montant),
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="ref-client">Référence client</Label>
              <Input
                id="ref-client"
                required
                placeholder="ex : 10611453112E"
                value={referenceClient}
                onChange={(e) => setReferenceClient(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="titulaire-carte">Nom du titulaire (sur la facture)</Label>
              <Input
                id="titulaire-carte"
                required
                value={nomTitulaire}
                onChange={(e) => setNomTitulaire(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="compteur">N° compteur</Label>
              <Input
                id="compteur"
                required
                placeholder="ex : 23230242945"
                value={numeroCompteur}
                onChange={(e) => setNumeroCompteur(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="montant">Montant du crédit (Ar)</Label>
              <Input
                id="montant"
                type="number"
                required
                min={300}
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {MONTANTS_RAPIDES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMontant(String(m))}
                    className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {m.toLocaleString("fr-FR")} Ar
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={creerMutation.isPending}>
              {creerMutation.isPending ? (
                "Enregistrement…"
              ) : (
                <>
                  <CreditCard className="mr-2 size-4" />
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
