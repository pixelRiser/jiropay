import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { FormulaireChangerMotDePasse } from "@/components/FormulaireChangerMotDePasse";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Store, MapPin, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/guichet/profil")({
  component: ProfilGuichet,
});

function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join("");
}

function ProfilGuichet() {
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
        sousTitre="Vos informations personnelles et celles de votre guichet."
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
                  Agent de guichet
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
                <Store className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Guichet</dt>
                  <dd className="font-medium text-foreground">
                    {user.guichet ? user.guichet.nom : "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Lieu</dt>
                  <dd className="font-medium text-foreground">{user.guichet?.lieu ?? "—"}</dd>
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
