import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { mesFactures } from "@/lib/jiropay/facture-api";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ReceiptText,
  Wallet,
  Clock,
  Smartphone,
  Store,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/")({
  component: EspaceDashboard,
});

function EspaceDashboard() {
  const { user } = useAuth();
  const { data: factures = [] } = useQuery({ queryKey: ["mes-factures"], queryFn: mesFactures });
  const heureActuelle = new Date().getHours();
  const salutation =
    heureActuelle < 12 ? "Bonjour" : heureActuelle < 18 ? "Bon après-midi" : "Bonsoir";

  const facturesEnAttente = factures.filter((f) => f.statut === "en_attente").length;
  const paiementsConfirmes = factures
    .flatMap((f) => f.paiements)
    .filter((p) => p.statut_mobile_money === "confirme");
  const montantTotalRegle = paiementsConfirmes.reduce((total, p) => total + p.montant, 0);
  const dernierPaiement = factures
    .flatMap((f) => f.paiements)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <>
      <PageHeader
        titre={`${salutation}, ${user?.name ?? ""}`}
        sousTitre="Voici un aperçu de votre compte JIRAMA Pay."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/espace/payer-facture">
          <Card className="h-full cursor-pointer border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ReceiptText className="size-6" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Payer une facture</p>
                <p className="text-sm text-muted-foreground">
                  Référence facture, montant et titulaire
                </p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/espace/facture-carte">
          <Card className="h-full cursor-pointer transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-4 pt-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <CreditCard className="size-6" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Acheter facture carte</p>
                <p className="text-sm text-muted-foreground">Référence client et n° de compteur</p>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Factures en attente</CardTitle>
            <ReceiptText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{facturesEnAttente}</p>
            <p className="text-xs text-muted-foreground">
              {facturesEnAttente === 0 ? "Aucune facture enregistrée pour l'instant" : "À régler"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Montant total réglé</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{montantTotalRegle.toLocaleString("fr-FR")} Ar</p>
            <p className="text-xs text-muted-foreground">Depuis la création de votre compte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dernier paiement</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dernierPaiement ? `${dernierPaiement.montant.toLocaleString("fr-FR")} Ar` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {dernierPaiement
                ? new Date(dernierPaiement.created_at).toLocaleDateString("fr-FR")
                : "Aucun paiement effectué"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Comment fonctionne JIRAMA Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ReceiptText className="size-4" />
                </span>
                <p className="text-sm font-medium text-foreground">1. Déclarez votre facture</p>
                <p className="text-xs text-muted-foreground">
                  Référence facture, montant dû et nom du titulaire du compteur.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="size-4" />
                </span>
                <p className="text-sm font-medium text-foreground">2. Payez par mobile money</p>
                <p className="text-xs text-muted-foreground">
                  Orange Money, Mvola ou Airtel Money, depuis votre téléphone.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </span>
                <p className="text-sm font-medium text-foreground">3. Recevez votre reçu</p>
                <p className="text-xs text-muted-foreground">
                  Après validation par notre équipe, votre reçu électronique arrive dans votre
                  compte.
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              La confirmation automatique du paiement mobile money arrive bientôt — votre paiement
              reste "en attente" jusqu'à validation.
            </p>
            <Button asChild variant="outline" className="mt-3">
              <Link to="/espace/factures">Voir mes factures</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Votre guichet référent</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.client?.guichet_referent ? (
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Store className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {user.client.guichet_referent.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.client.guichet_referent.lieu}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ce guichet est votre point de contact privilégié — il a inscrit votre compte et
                    perçoit une commission sur vos paiements.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun guichet référent trouvé.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
