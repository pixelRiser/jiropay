import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceiptText, Wallet, Clock, Smartphone, Store, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/")({
  component: EspaceDashboard,
});

function EspaceDashboard() {
  const { user } = useAuth();
  const heureActuelle = new Date().getHours();
  const salutation =
    heureActuelle < 12 ? "Bonjour" : heureActuelle < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <>
      <PageHeader
        titre={`${salutation}, ${user?.name ?? ""}`}
        sousTitre="Voici un aperçu de votre compte JIRAMA Pay."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Factures en attente</CardTitle>
            <ReceiptText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">
              Aucune facture enregistrée pour l'instant
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Montant total réglé</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0 Ar</p>
            <p className="text-xs text-muted-foreground">Depuis la création de votre compte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dernier paiement</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground">Aucun paiement effectué</p>
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
                  Numéro d'abonné, mois facturé et montant dû — c'est tout ce qu'il faut.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Smartphone className="size-4" />
                </span>
                <p className="text-sm font-medium text-foreground">2. Payez par mobile money</p>
                <p className="text-xs text-muted-foreground">
                  Orange Money ou Mvola, directement depuis votre téléphone.
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
              Le paiement en ligne des factures arrive bientôt sur JIRAMA Pay. Vous serez notifié
              dès qu'il sera disponible pour votre compte.
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
