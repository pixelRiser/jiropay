import { apiFetch } from "./http";

export type Paiement = {
  id: number;
  methode: "orange_money" | "mvola" | "airtel_money";
  montant: number;
  statut_mobile_money: "en_attente" | "confirme" | "echoue";
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
  montant_du: number;
  nom_titulaire?: string;
  numero_compteur?: string;
}): Promise<Facture> {
  const res = await apiFetch<{ success: boolean; data: Facture }>("/api/factures", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function initierPaiement(payload: {
  facture_id: number;
  methode: "orange_money" | "mvola" | "airtel_money";
}): Promise<Paiement> {
  const res = await apiFetch<{ success: boolean; data: Paiement }>("/api/paiements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}
