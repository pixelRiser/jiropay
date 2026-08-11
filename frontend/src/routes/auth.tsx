import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/jiropay/auth-store";
import { listeGuichets } from "@/lib/jiropay/auth-api";
import { ApiError } from "@/lib/jiropay/http";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/PasswordInput";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MailCheck } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — JIRAMA Pay" },
      {
        name: "description",
        content: "Connectez-vous ou créez votre compte client ou guichet sur JIRAMA Pay.",
      },
      { property: "og:title", content: "Connexion — JIRAMA Pay" },
      {
        property: "og:description",
        content: "Accédez à votre espace client, guichet ou administrateur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});

function redirectionParRole(role: string) {
  if (role === "admin") return "/admin";
  if (role === "agent") return "/guichet";
  return "/espace";
}

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

function Auth() {
  const navigate = useNavigate();
  const { login, register, renvoyerVerification, motDePasseOublie } = useAuth();
  const [chargement, setChargement] = useState(false);
  const { data: guichets = [] } = useQuery({
    queryKey: ["guichets-publics"],
    queryFn: listeGuichets,
  });
  const [enAttenteVerification, setEnAttenteVerification] = useState<string | null>(null);
  const [renvoiChargement, setRenvoiChargement] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("verified") === "1") {
      toast.success("Email vérifié — vous pouvez vous connecter.");
      window.history.replaceState({}, "", "/auth");
    }
  }, []);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<"client" | "agent">("client");
  const [guichetId, setGuichetId] = useState("");
  const [numero, setNumero] = useState("");

  async function connexion(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    try {
      const user = await login(email, motDePasse);
      navigate({ to: redirectionParRole(user.role) });
    } catch (error) {
      const payload =
        error instanceof ApiError ? (error.payload as { reason_code?: string }) : undefined;
      if (payload?.reason_code === "AGENT_PENDING_APPROVAL") {
        toast.error("Votre compte agent est en attente de validation par un administrateur.");
      } else if (payload?.reason_code === "AGENT_REJECTED") {
        toast.error("Votre demande de compte agent a été rejetée. Contactez l'administrateur.");
      } else if (payload?.reason_code === "EMAIL_NOT_VERIFIED") {
        setEnAttenteVerification(email);
      } else {
        toast.error(messageErreur(error, "Email ou mot de passe incorrect."));
      }
    } finally {
      setChargement(false);
    }
  }

  async function inscription(e: React.FormEvent) {
    e.preventDefault();
    if (!guichetId) {
      toast.error("Choisissez un guichet");
      return;
    }
    setChargement(true);
    try {
      await register({
        name: nom,
        email,
        password: motDePasse,
        phone: telephone,
        role,
        guichet_id: Number(guichetId),
        numero_abonne_jirama: role === "client" ? numero : undefined,
      });
      setEnAttenteVerification(email);
      setMotDePasse("");
      setNom("");
      setTelephone("");
      setNumero("");
      setGuichetId("");
    } catch (error) {
      toast.error(messageErreur(error, "Une erreur est survenue."));
    } finally {
      setChargement(false);
    }
  }

  async function renvoyer() {
    if (!enAttenteVerification) return;
    setRenvoiChargement(true);
    try {
      const res = await renvoyerVerification(enAttenteVerification);
      toast.success(res.message);
    } catch (error) {
      toast.error(messageErreur(error, "Impossible de renvoyer l'email."));
    } finally {
      setRenvoiChargement(false);
    }
  }

  if (enAttenteVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center">
            <BrandMark />
          </div>
          <Card>
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MailCheck className="size-6" />
              </span>
              <CardTitle>Vérifiez votre boîte mail</CardTitle>
              <CardDescription>
                Un email de vérification a été envoyé à{" "}
                <span className="font-medium text-foreground">{enAttenteVerification}</span>.
                Cliquez sur le lien qu'il contient, puis revenez vous connecter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={renvoyer}
                disabled={renvoiChargement}
              >
                Renvoyer l'email de vérification
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setEnAttenteVerification(null)}
              >
                Retour à la connexion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <BrandMark />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Accédez à votre espace client, guichet ou administrateur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="connexion">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connexion">Connexion</TabsTrigger>
                <TabsTrigger value="inscription">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="connexion">
                <form className="space-y-4" onSubmit={connexion}>
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
                    <Label htmlFor="mdp">Mot de passe</Label>
                    <PasswordInput
                      id="mdp"
                      required
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={chargement}>
                    Se connecter
                  </Button>
                  <button
                    type="button"
                    className="block w-full cursor-pointer text-center text-xs text-muted-foreground hover:underline"
                    onClick={async () => {
                      if (!email) {
                        toast.error("Entrez votre email d'abord.");
                        return;
                      }
                      try {
                        const res = await motDePasseOublie(email);
                        toast.success(res.message);
                      } catch (error) {
                        toast.error(messageErreur(error, "Une erreur est survenue."));
                      }
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="inscription">
                <form className="space-y-4" onSubmit={inscription}>
                  <div className="space-y-2">
                    <Label>Je suis</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as "client" | "agent")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Un client JIRAMA</SelectItem>
                        <SelectItem value="agent">Un agent de guichet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom complet</Label>
                    <Input id="nom" required value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tel">Téléphone</Label>
                    <Input
                      id="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{role === "agent" ? "Mon guichet" : "Guichet référent"}</Label>
                    <Select value={guichetId} onValueChange={setGuichetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un guichet" />
                      </SelectTrigger>
                      <SelectContent>
                        {guichets.map((g) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            {g.nom} — {g.lieu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {role === "client" ? (
                      <p className="text-xs text-muted-foreground">
                        Ce rattachement est définitif : seul un administrateur peut le modifier.
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Votre compte sera actif après vérification email et validation par un
                        administrateur.
                      </p>
                    )}
                  </div>
                  {role === "client" ? (
                    <div className="space-y-2">
                      <Label htmlFor="num">Numéro d'abonné JIRAMA</Label>
                      <Input
                        id="num"
                        required
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </div>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="email2">Email</Label>
                    <Input
                      id="email2"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mdp2">Mot de passe</Label>
                    <PasswordInput
                      id="mdp2"
                      required
                      minLength={8}
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={chargement}>
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
