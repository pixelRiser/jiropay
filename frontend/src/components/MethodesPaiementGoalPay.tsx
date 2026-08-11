import { ShieldCheck } from "lucide-react";

/**
 * GoalPay ne prend pas de paramètre "méthode" à la création de la commande —
 * le choix Orange Money / Telma se fait sur la page GoalPay elle-même. Les
 * deux logos déclenchent donc la même action (création du paiement +
 * redirection vers checkout_url) ; ils servent à rassurer visuellement le
 * client sur les moyens acceptés, pas à présélectionner un opérateur.
 */
export function MethodesPaiementGoalPay({
  onSelect,
  disabled,
}: {
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={onSelect}
          className="flex cursor-pointer items-center justify-center rounded-lg border bg-white p-4 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src="/logos/mvola.png" alt="Mvola" className="h-8 object-contain" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSelect}
          className="flex cursor-pointer items-center justify-center rounded-lg border bg-white p-4 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <img src="/logos/orange-money.png" alt="Orange Money" className="h-8 object-contain" />
        </button>
      </div>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        {disabled ? "Redirection en cours…" : "Paiement sécurisé via GoalPay"}
      </p>
    </div>
  );
}
