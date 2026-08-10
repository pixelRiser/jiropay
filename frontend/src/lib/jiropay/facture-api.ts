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
  reference_facture: string | null;
  nom_titulaire: string | null;
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
  reference_facture: string;
  montant_du: number;
  nom_titulaire: string;
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

export type StatutResponse = {
  success: boolean;
  correspond: boolean;
  message?: string;
  client?: { nom: string; numero_abonne_jirama: string; adresse: string | null };
  factures_en_attente?: {
    id: number;
    reference_facture: string | null;
    nom_titulaire: string | null;
    montant_du: number;
    created_at: string;
  }[];
};

export async function verifierStatut(payload: {
  reference_client: string;
  numero_compteur: string;
}): Promise<StatutResponse> {
  return apiFetch<StatutResponse>("/api/statut/verifier", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
