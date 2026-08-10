import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/jiropay/auth-store";
import { ApiError } from "@/lib/jiropay/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
  head: () => ({
    meta: [{ title: "Définir un mot de passe — JIRAMA Pay" }],
  }),
  component: ReinitialiserMotDePasse,
});

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function ReinitialiserMotDePasse() {
  const navigate = useNavigate();
  const { reinitialiserMotDePasse } = useAuth();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [chargement, setChargement] = useState(false);
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setEmail(params.get("email") ?? "");
  }, []);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (motDePasse !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setChargement(true);
    try {
      const res = await reinitialiserMotDePasse(token, email, motDePasse, confirmation);
      toast.success(res.message);
      setTermine(true);
      setTimeout(() => navigate({ to: "/auth" }), 1500);
    } catch (error) {
      toast.error(messageErreur(error, "Ce lien est invalide ou a expiré."));
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          JIRAMA Pay
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Définir votre mot de passe</CardTitle>
            <CardDescription>
              Choisissez un mot de passe pour activer votre compte{" "}
              {email ? <span className="font-medium">{email}</span> : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {termine ? (
              <p className="text-sm text-muted-foreground">
                Mot de passe défini — redirection vers la connexion…
              </p>
            ) : (
              <form className="space-y-4" onSubmit={envoyer}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdp">Nouveau mot de passe</Label>
                  <PasswordInput
                    id="mdp"
                    required
                    minLength={8}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mdp2">Confirmer le mot de passe</Label>
                  <PasswordInput
                    id="mdp2"
                    required
                    minLength={8}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={chargement || !token}>
                  Activer mon compte
                </Button>
                {!token ? (
                  <p className="text-center text-xs text-destructive">
                    Lien invalide — utilisez le lien reçu par email.
                  </p>
                ) : null}
                <Link
                  to="/auth"
                  className="block text-center text-xs text-muted-foreground hover:underline"
                >
                  Retour à la connexion
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
