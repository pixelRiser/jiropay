export type Zone = "ville" | "hors_ville";

export interface BaremeGuichet {
  montant_frais_defaut: number;
  montant_commission_defaut: number;
}

export function calculerRepartition(montantFacture: number, bareme: BaremeGuichet) {
  const frais = Number(bareme.montant_frais_defaut ?? 0);
  const commission = Math.min(Number(bareme.montant_commission_defaut ?? 0), frais);
  return {
    montantFacture,
    frais,
    total: montantFacture + frais,
    commission,
    partPlateforme: frais - commission,
  };
}

export function ariary(valeur: number | string | null | undefined): string {
  const n = Number(valeur ?? 0);
  return `${new Intl.NumberFormat("fr-FR").format(n)} Ar`;
}

export function moisLisible(valeur: string): string {
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return valeur;
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function moisCourant(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const LIBELLE_METHODE: Record<string, string> = {
  orange_money: "Orange Money",
  mvola: "Mvola",
};

export const LIBELLE_STATUT_FACTURE: Record<string, string> = {
  en_attente: "En attente de paiement",
  paye_plateforme: "Payée sur la plateforme",
  paye_jirama: "Payée à JIRAMA",
  valide: "Validée",
};

export const LIBELLE_STATUT_MM: Record<string, string> = {
  en_attente: "En attente de confirmation",
  confirme: "Confirmé",
  echoue: "Échoué",
};
