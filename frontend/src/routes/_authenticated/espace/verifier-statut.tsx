import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { verifierStatut, type StatutResponse } from "@/lib/jiropay/facture-api";
import { ApiError } from "@/lib/jiropay/http";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/verifier-statut")({
  head: () => ({ meta: [{ title: "Vérifier mon statut — JIRAMA Pay" }] }),
  component: VerifierStatut,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function VerifierStatut() {
  const [referenceClient, setReferenceClient] = useState("");
  const [numeroCompteur, setNumeroCompteur] = useState("");
  const [resultat, setResultat] = useState<StatutResponse | null>(null);

  const verifierMutation = useMutation({
    mutationFn: verifierStatut,
    onSuccess: (data) => setResultat(data),
    onError: (error) => toast.error(messageErreur(error, "Impossible de vérifier ce statut.")),
  });

  if (resultat) {
    return (
      <>
        <PageHeader titre="Statut client" />
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6">
            {resultat.correspond ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Compte vérifié</p>
                    <p className="text-sm text-muted-foreground">{resultat.client?.nom}</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">N° compteur</span>
                    <span className="font-medium text-foreground">
                      {resultat.client?.numero_abonne_jirama}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Adresse</span>
                    <span className="font-medium text-foreground">
                      {resultat.client?.adresse ?? "—"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Factures en attente</p>
                  {resultat.factures_en_attente && resultat.factures_en_attente.length > 0 ? (
                    <div className="space-y-2">
                      {resultat.factures_en_attente.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium text-foreground">{f.reference_facture}</p>
                            <p className="text-xs text-muted-foreground">{f.nom_titulaire}</p>
                          </div>
                          <Badge variant="secondary">
                            {f.montant_du.toLocaleString("fr-FR")} Ar
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune facture en attente.</p>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link to="/espace/payer-facture">Payer une facture</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <XCircle className="size-6" />
                </span>
                <p className="font-medium text-foreground">Aucune correspondance</p>
                <p className="text-sm text-muted-foreground">{resultat.message}</p>
              </div>
            )}
            <Button variant="ghost" className="mt-4 w-full" onClick={() => setResultat(null)}>
              <ArrowLeft className="mr-2 size-4" />
              Nouvelle vérification
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        titre="Vérifier mon statut"
        sousTitre="Confirmez votre identité avant de procéder au paiement."
      />
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              verifierMutation.mutate({
                reference_client: referenceClient,
                numero_compteur: numeroCompteur,
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
            <Button type="submit" className="w-full" disabled={verifierMutation.isPending}>
              {verifierMutation.isPending ? "Vérification…" : "Vérifier"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
