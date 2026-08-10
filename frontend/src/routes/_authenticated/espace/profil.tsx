import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { FormulaireChangerMotDePasse } from "@/components/FormulaireChangerMotDePasse";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, IdCard, MapPin, Store, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/espace/profil")({
  component: ProfilClient,
});

function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join("");
}

function ProfilClient() {
  const { user } = useAuth();
  if (!user) return null;

  const dateInscription = new Date(user.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader
        titre="Mon profil"
        sousTitre="Vos informations personnelles et vos identifiants JIRAMA."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                  {initiales(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Client JIRAMA Pay
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <dl className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-medium text-foreground">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Téléphone</dt>
                  <dd className="font-medium text-foreground">{user.phone ?? "Non renseigné"}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IdCard className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Numéro d'abonné JIRAMA</dt>
                  <dd className="font-medium text-foreground">
                    {user.client?.numero_abonne_jirama ?? "Non renseigné"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Adresse</dt>
                  <dd className="font-medium text-foreground">
                    {user.client?.adresse ?? "Non renseignée"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Store className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Guichet référent</dt>
                  <dd className="font-medium text-foreground">
                    {user.client?.guichet_referent
                      ? `${user.client.guichet_referent.nom} — ${user.client.guichet_referent.lieu}`
                      : "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Membre depuis</dt>
                  <dd className="font-medium text-foreground">{dateInscription}</dd>
                </div>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Le rattachement à votre guichet référent est définitif — seul un administrateur peut
              le modifier en cas de litige.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Choisissez un mot de passe fort que vous n'utilisez sur aucun autre site.
            </p>
            <FormulaireChangerMotDePasse />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
