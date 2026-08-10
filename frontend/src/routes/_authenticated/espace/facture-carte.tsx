import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { creerFacture, initierPaiement, type Facture } from "@/lib/jiropay/facture-api";
import { ApiError } from "@/lib/jiropay/http";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CreditCard, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/facture-carte")({
  head: () => ({ meta: [{ title: "Acheter facture carte — JIRAMA Pay" }] }),
  component: FactureCarte,
});

const METHODES: {
  valeur: "orange_money" | "mvola" | "airtel_money";
  label: string;
  couleur: string;
}[] = [
  { valeur: "mvola", label: "Mvola", couleur: "bg-[#f7941d] text-white" },
  { valeur: "orange_money", label: "Orange Money", couleur: "bg-[#ff7900] text-white" },
  { valeur: "airtel_money", label: "Airtel Money", couleur: "bg-[#e2231a] text-white" },
];

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
  const [facture, setFacture] = useState<Facture | null>(null);
  const [paiementInitie, setPaiementInitie] = useState(false);

  const [referenceClient, setReferenceClient] = useState("");
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
    onSuccess: () => {
      setPaiementInitie(true);
      queryClient.invalidateQueries({ queryKey: ["mes-factures"] });
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible d'initier ce paiement.")),
  });

  if (paiementInitie && facture) {
    return (
      <>
        <PageHeader titre="Acheter facture carte" />
        <Card className="mx-auto max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="size-7" />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Achat en attente de confirmation
            </h2>
            <p className="text-sm text-muted-foreground">
              Votre demande de crédit pour le compteur <strong>{facture.numero_compteur}</strong> (
              {facture.montant_du.toLocaleString("fr-FR")} Ar) a été enregistrée. Suivez les
              instructions envoyées par votre opérateur mobile money pour confirmer la transaction —
              votre code de rechargement sera disponible dans votre compte après validation.
            </p>
            <Button asChild className="mt-2">
              <Link to="/espace/factures">Voir mes factures</Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (facture) {
    return (
      <>
        <PageHeader
          titre="Acheter facture carte"
          sousTitre="Choisissez votre méthode de paiement."
        />
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Compteur {facture.numero_compteur}</CardTitle>
            <CardDescription>
              Référence client : {facture.reference_facture} — Montant :{" "}
              {facture.montant_du.toLocaleString("fr-FR")} Ar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {METHODES.map((m) => (
              <button
                key={m.valeur}
                type="button"
                disabled={paiementMutation.isPending}
                onClick={() =>
                  paiementMutation.mutate({ facture_id: facture.id, methode: m.valeur })
                }
                className={`flex w-full cursor-pointer items-center justify-center rounded-lg py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${m.couleur}`}
              >
                {m.label}
              </button>
            ))}
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
