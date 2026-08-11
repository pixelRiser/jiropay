import { apiFetch } from "./http";

export type GuichetDetail = {
  id: number;
  nom: string;
  lieu: string;
  statut: "actif" | "inactif";
  zone: "ville" | "hors_ville";
  montant_frais_defaut: number;
  montant_commission_defaut: number;
  solde_commission: number;
  clients_count?: number;
};

export type AgentEnAttente = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  guichet_id: number | null;
  created_at: string;
  guichet: { id: number; nom: string; lieu: string } | null;
};

export type ClientDetail = {
  id: number;
  user_id: number;
  adresse: string | null;
  numero_abonne_jirama: string;
  guichet_referent_id: number;
  created_at: string;
  user: { id: number; name: string; email: string; phone: string | null };
  guichet_referent: { id: number; nom: string; lieu: string };
};

export async function monGuichet(): Promise<GuichetDetail> {
  const res = await apiFetch<{ success: boolean; data: GuichetDetail }>("/api/mon-guichet");
  return res.data;
}

export async function listeGuichetsAdmin(): Promise<GuichetDetail[]> {
  const res = await apiFetch<{ success: boolean; data: GuichetDetail[] }>("/api/admin/guichets");
  return res.data;
}

export async function creerGuichet(payload: {
  nom: string;
  lieu: string;
  zone: "ville" | "hors_ville";
  montant_frais_defaut: number;
  montant_commission_defaut: number;
}): Promise<GuichetDetail> {
  const res = await apiFetch<{ success: boolean; data: GuichetDetail }>("/api/admin/guichets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function majGuichet(
  id: number,
  payload: Partial<{
    nom: string;
    lieu: string;
    zone: "ville" | "hors_ville";
    statut: "actif" | "inactif";
    montant_frais_defaut: number;
    montant_commission_defaut: number;
  }>,
): Promise<GuichetDetail> {
  const res = await apiFetch<{ success: boolean; data: GuichetDetail }>(
    `/api/admin/guichets/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
  return res.data;
}

export async function agentsEnAttente(): Promise<AgentEnAttente[]> {
  const res = await apiFetch<{ success: boolean; data: AgentEnAttente[] }>(
    "/api/admin/agents/pending",
  );
  return res.data;
}

export async function approuverAgent(id: number): Promise<void> {
  await apiFetch(`/api/admin/agents/${id}/approve`, { method: "POST" });
}

export async function rejeterAgent(id: number): Promise<void> {
  await apiFetch(`/api/admin/agents/${id}/reject`, { method: "POST" });
}

export async function listeClients(): Promise<ClientDetail[]> {
  const res = await apiFetch<{ success: boolean; data: ClientDetail[] }>("/api/clients");
  return res.data;
}

export async function creerClient(payload: {
  name: string;
  email: string;
  phone: string;
  numero_abonne_jirama: string;
  adresse?: string;
  guichet_id?: number;
}): Promise<void> {
  await apiFetch("/api/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PaiementEnAttenteTicket = {
  id: number;
  montant: number;
  date_paiement: string | null;
  facture: {
    id: number;
    type: "facture" | "carte";
    reference_facture: string | null;
    nom_titulaire: string | null;
    numero_compteur: string | null;
    montant_du: number;
  };
  client: {
    user: { id: number; name: string; email: string };
  };
};

export type TicketJiramaPayload = {
  numero_ticket?: string | undefined;
  date_operation: string;
  nom_client: string;
  // type 'facture'
  ref_client?: string | undefined;
  ref_facture?: string | undefined;
  mois_facture?: string | undefined;
  montant_facture?: number | undefined;
  // type 'carte'
  installation?: string | undefined;
  commune_code?: string | undefined;
  compteur?: string | undefined;
  type_prepaye?: string | undefined;
  quantite_achetee?: string | undefined;
  mont_cons?: number | undefined;
  prime_fixe?: number | undefined;
  redevance?: number | undefined;
  total_jirama?: number | undefined;
  taxe_comm?: number | undefined;
  sur_taxe_comm?: number | undefined;
  fne?: number | undefined;
  tva?: number | undefined;
  total_taxes?: number | undefined;
  jeton?: string | undefined;
  // commun paiement
  a_payer: number;
  methode_paiement_libelle: string;
  ref_transaction: string;
  numero_payeur: string;
  operateur: string;
  id_interne?: string | undefined;
  frais_jirakaiky?: number | undefined;
  frais_operateur?: number | undefined;
};

export async function paiementsEnAttenteTicket(): Promise<PaiementEnAttenteTicket[]> {
  const res = await apiFetch<{ success: boolean; data: PaiementEnAttenteTicket[] }>(
    "/api/admin/paiements-jirama/en-attente",
  );
  return res.data;
}

export async function creerTicketJirama(
  paiementId: number,
  payload: TicketJiramaPayload,
): Promise<void> {
  await apiFetch(`/api/admin/paiements/${paiementId}/ticket-jirama`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
