import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Smartphone, Store, ShieldCheck, ReceiptText } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JIRAMA Pay — Payez votre facture JIRAMA par Orange Money ou Mvola" },
      {
        name: "description",
        content:
          "Réglez votre facture JIRAMA en ligne ou au guichet avec Orange Money et Mvola. Reçu électronique après validation, commissions automatiques pour les guichets partenaires.",
      },
      { property: "og:title", content: "JIRAMA Pay — Paiement de factures JIRAMA" },
      {
        property: "og:description",
        content:
          "Payez votre facture JIRAMA par mobile money et recevez votre reçu dans votre compte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            JIRAMA Pay
          </span>
          <Button asChild size="sm">
            <Link to="/auth">Se connecter</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            Orange Money · Mvola
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Payez votre facture JIRAMA sans faire la queue
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Saisissez votre numéro de compteur, réglez par mobile money depuis votre téléphone et
            recevez votre reçu électronique dès la validation du paiement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Créer mon compte</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">J'ai déjà un compte</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icone: Smartphone,
              titre: "Paiement mobile money",
              texte: "Orange Money ou Mvola, depuis votre propre téléphone.",
            },
            {
              icone: Store,
              titre: "Réseau de guichets",
              texte: "Un agent peut vous enregistrer et saisir vos informations.",
            },
            {
              icone: ShieldCheck,
              titre: "Paiement JIRAMA vérifié",
              texte: "Chaque règlement est contrôlé et validé par l'administration.",
            },
            {
              icone: ReceiptText,
              titre: "Reçu consultable",
              texte: "Votre reçu reste disponible dans votre compte.",
            },
          ].map((item) => (
            <Card key={item.titre}>
              <CardContent className="pt-6">
                <item.icone className="size-5 text-primary" />
                <h2 className="mt-3 font-medium text-foreground">{item.titre}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.texte}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        JIRAMA Pay — plateforme de paiement de factures
      </footer>
    </div>
  );
}
