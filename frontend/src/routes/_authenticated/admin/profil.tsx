import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/jiropay/auth-store";
import { PageHeader } from "@/components/PageHeader";
import { FormulaireChangerMotDePasse } from "@/components/FormulaireChangerMotDePasse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/profil")({
  component: ProfilAdmin,
});

function ProfilAdmin() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader titre="Mon profil" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Nom</p>
              <p className="font-medium text-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
            <FormulaireChangerMotDePasse />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
