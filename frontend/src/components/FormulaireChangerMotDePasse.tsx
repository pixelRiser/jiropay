import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/jiropay/auth-store";
import { ApiError } from "@/lib/jiropay/http";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/PasswordInput";

function messageErreur(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const payload = error.payload as
      { message?: string; errors?: Record<string, string[]> } | undefined;
    const premiereErreurChamp = payload?.errors ? Object.values(payload.errors)[0]?.[0] : undefined;
    return premiereErreurChamp ?? payload?.message ?? error.message ?? fallback;
  }
  return fallback;
}

export function FormulaireChangerMotDePasse() {
  const { changerMotDePasse } = useAuth();
  const [chargement, setChargement] = useState(false);
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (nouveau !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setChargement(true);
    try {
      await changerMotDePasse(actuel, nouveau, confirmation);
      toast.success("Mot de passe mis à jour.");
      setActuel("");
      setNouveau("");
      setConfirmation("");
    } catch (error) {
      toast.error(messageErreur(error, "Impossible de changer le mot de passe."));
    } finally {
      setChargement(false);
    }
  }

  return (
    <form className="max-w-sm space-y-3" onSubmit={envoyer}>
      <div className="space-y-1">
        <Label htmlFor="mdp-actuel">Mot de passe actuel</Label>
        <PasswordInput
          id="mdp-actuel"
          required
          value={actuel}
          onChange={(e) => setActuel(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="mdp-nouveau">Nouveau mot de passe</Label>
        <PasswordInput
          id="mdp-nouveau"
          required
          minLength={8}
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="mdp-confirmation">Confirmer le nouveau mot de passe</Label>
        <PasswordInput
          id="mdp-confirmation"
          required
          minLength={8}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={chargement}>
        Mettre à jour le mot de passe
      </Button>
    </form>
  );
}
