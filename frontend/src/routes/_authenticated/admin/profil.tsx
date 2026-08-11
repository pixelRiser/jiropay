import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/jiropay/auth-store";
import {
  listeGuichetsAdmin,
  agentsEnAttente,
  listeClients,
  modifierMonProfil,
} from "@/lib/jiropay/admin-api";
import { ApiError } from "@/lib/jiropay/http";
import { PageHeader } from "@/components/PageHeader";
import { FormulaireChangerMotDePasse } from "@/components/FormulaireChangerMotDePasse";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, ShieldCheck, CalendarDays, Store, Users, Pencil } from "lucide-react";

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

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
  const queryClient = useQueryClient();
  const [dialogEditionOuvert, setDialogEditionOuvert] = useState(false);
  const { data: guichets = [] } = useQuery({
    queryKey: ["admin-guichets"],
    queryFn: listeGuichetsAdmin,
  });
  const { data: agents = [] } = useQuery({
    queryKey: ["admin-agents-pending"],
    queryFn: agentsEnAttente,
  });
  const { data: clients = [] } = useQuery({ queryKey: ["admin-clients"], queryFn: listeClients });

  const modifierMutation = useMutation({
    mutationFn: modifierMonProfil,
    onSuccess: () => {
      toast.success("Profil mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["jiropay-auth-me"] });
      setDialogEditionOuvert(false);
    },
    onError: (error) => toast.error(messageErreur(error, "Impossible de mettre à jour le profil.")),
  });

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    modifierMutation.mutate({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
    });
  }

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
            <div className="flex items-center justify-between gap-4">
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
              <Dialog open={dialogEditionOuvert} onOpenChange={setDialogEditionOuvert}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 size-4" />
                    Modifier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier mon profil</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-3" onSubmit={soumettre}>
                    <div className="space-y-1">
                      <Label htmlFor="p-name">Nom complet</Label>
                      <Input id="p-name" name="name" required defaultValue={user.name} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p-email">Email</Label>
                      <Input
                        id="p-email"
                        name="email"
                        type="email"
                        required
                        defaultValue={user.email}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="p-phone">Téléphone</Label>
                      <Input id="p-phone" name="phone" required defaultValue={user.phone ?? ""} />
                    </div>
                    <Button type="submit" className="w-full" disabled={modifierMutation.isPending}>
                      Enregistrer
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
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
