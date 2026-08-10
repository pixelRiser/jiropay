import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { monGuichet, listeClients } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet, Users, Percent, MapPin, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/guichet/")({
  component: GuichetDashboard,
});

function GuichetDashboard() {
  const { user } = useAuth();
  const { data: guichet } = useQuery({ queryKey: ["mon-guichet"], queryFn: monGuichet });
  const { data: clients = [] } = useQuery({ queryKey: ["mes-clients"], queryFn: listeClients });

  return (
    <>
      <PageHeader
        titre={`Bienvenue, ${user?.name ?? ""}`}
        sousTitre={
          guichet ? `Guichet ${guichet.nom} — ${guichet.lieu}` : "Chargement de votre guichet…"
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Solde de commission</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(guichet?.solde_commission ?? 0).toLocaleString("fr-FR")} Ar
            </p>
            <p className="text-xs text-muted-foreground">Accumulé, non encore reversé</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Clients rattachés</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{clients.length}</p>
            <p className="text-xs text-muted-foreground">Enregistrés à votre guichet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Commission par défaut</CardTitle>
            <Percent className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(guichet?.montant_commission_defaut ?? 0).toLocaleString("fr-FR")} Ar
            </p>
            <p className="text-xs text-muted-foreground">Par paiement client confirmé</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Informations du guichet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{guichet?.lieu}</p>
                <p className="text-xs text-muted-foreground">
                  Zone {guichet?.zone === "ville" ? "ville" : "hors ville"}
                </p>
              </div>
              <Badge
                variant={guichet?.statut === "actif" ? "default" : "secondary"}
                className="ml-auto"
              >
                {guichet?.statut === "actif" ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Frais par défaut</p>
                <p className="font-medium text-foreground">
                  {(guichet?.montant_frais_defaut ?? 0).toLocaleString("fr-FR")} Ar
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commission par défaut</p>
                <p className="font-medium text-foreground">
                  {(guichet?.montant_commission_defaut ?? 0).toLocaleString("fr-FR")} Ar
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Ces montants sont fixés par l'administrateur et s'appliquent à chaque paiement de vos
              clients.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action rapide</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Enregistrez un nouveau client pour votre guichet — il recevra un email pour activer
              son compte et pourra ensuite régler ses factures JIRAMA par mobile money.
            </p>
            <Button asChild>
              <Link to="/guichet/clients">
                <UserPlus className="mr-2 size-4" />
                Enregistrer un client
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
