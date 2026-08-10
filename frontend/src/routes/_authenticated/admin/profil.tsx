import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/jiropay/auth-store";
import { listeGuichetsAdmin, agentsEnAttente, listeClients } from "@/lib/jiropay/admin-api";
import { PageHeader } from "@/components/PageHeader";
import { FormulaireChangerMotDePasse } from "@/components/FormulaireChangerMotDePasse";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, ShieldCheck, CalendarDays, Store, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/profil")({
  component: ProfilAdmin,
});

function initiales(nom: string): string {
  return nom
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join("");
}

function ProfilAdmin() {
  const { user } = useAuth();
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });
  const { data: clients = [] } = useQuery({ queryKey: ["admin-clients"], queryFn: listeClients });

  if (!user) return null;

  const dateInscription = new Date(user.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader titre="Mon profil" sousTitre="Votre compte administrateur JIRAMA Pay." />

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
                  <ShieldCheck className="mr-1 size-3" />
                  Administrateur
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
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-xs text-muted-foreground">Administrateur depuis</dt>
                  <dd className="font-medium text-foreground">{dateInscription}</dd>
                </div>
              </div>
            </dl>

            <Separator className="my-4" />
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Portée de votre accès
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-muted-foreground" />
                <span>{guichets.length} guichets</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span>{clients.length} clients</span>
              </div>
            </div>
            {agents.length > 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {agents.length} demande{agents.length !== 1 ? "s" : ""} d'agent en attente de votre
                validation.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              En tant qu'administrateur, votre compte a accès à l'ensemble de la plateforme —
              choisissez un mot de passe fort et ne le partagez jamais.
            </p>
            <FormulaireChangerMotDePasse />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
