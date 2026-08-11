import { apiFetch } from "./http";

export type Paiement = {
  id: number;
  methode: "orange_money" | "mvola" | "airtel_money" | null;
  montant: number;
  checkout_url: string | null;
  statut_mobile_money: "en_attente" | "confirme" | "echoue";
  erreur_gateway: string | null;
  created_at: string;
};

export type Facture = {
  id: number;
  type: "facture" | "carte";
  reference_facture: string | null;
  nom_titulaire: string | null;
  numero_compteur: string | null;
  montant_du: number;
  statut: "en_attente" | "paye_plateforme" | "paye_jirama" | "valide";
  created_at: string;
  paiements: Paiement[];
};

export async function mesFactures(): Promise<Facture[]> {
  const res = await apiFetch<{ success: boolean; data: Facture[] }>("/api/factures");
  return res.data;
}

export async function creerFacture(payload: {
  type: "facture" | "carte";
  reference_facture: string;
  nom_titulaire: string;
  montant_du: number;
  numero_compteur?: string;
}): Promise<Facture> {
  const res = await apiFetch<{ success: boolean; data: Facture }>("/api/factures", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function initierPaiement(payload: { facture_id: number }): Promise<Paiement> {
  const res = await apiFetch<{ success: boolean; data: Paiement }>("/api/paiements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
