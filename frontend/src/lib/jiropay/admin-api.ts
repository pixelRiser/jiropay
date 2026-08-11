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
  adresse?: string | undefined;
  guichet_id?: number | undefined;
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

export async function reassignerGuichetClient(clientId: number, guichetId: number): Promise<void> {
  await apiFetch(`/api/admin/clients/${clientId}/guichet`, {
    method: "PATCH",
    body: JSON.stringify({ guichet_id: guichetId }),
  });
}

export type CommissionDetail = {
  id: number;
  montant_facture: number;
  montant_frais: number;
  part_plateforme: number;
  montant_commission: number;
  statut: "creditee" | "reversee";
  created_at: string;
  guichet: { id: number; nom: string; lieu: string };
  paiement: {
    id: number;
    facture: { id: number; type: "facture" | "carte"; reference_facture: string | null };
    client: { user: { id: number; name: string; email: string } };
  };
};

export type CommissionsResponse = {
  data: CommissionDetail[];
  total_creditee: number;
  solde_par_guichet: { id: number; nom: string; lieu: string; solde_commission: number }[];
};

export async function listeCommissions(): Promise<CommissionsResponse> {
  const res = await apiFetch<{ success: boolean } & CommissionsResponse>("/api/admin/commissions");
  return {
    data: res.data,
    total_creditee: res.total_creditee,
    solde_par_guichet: res.solde_par_guichet,
  };
}

export type PaiementGuichet = {
  id: number;
  montant: number;
  montant_commission: number | null;
  statut_mobile_money: "en_attente" | "confirme" | "echoue";
  date_paiement: string | null;
  created_at: string;
  facture: { id: number; type: "facture" | "carte"; reference_facture: string | null };
  client: { user: { id: number; name: string; email: string } };
  paiement_jirama: { id: number; date_saisie: string } | null;
};

export async function mesPaiementsGuichet(): Promise<PaiementGuichet[]> {
  const res = await apiFetch<{ success: boolean; data: PaiementGuichet[] }>("/api/mes-paiements");
  return res.data;
}

// --- Guichets : détail + suppression ---

export type GuichetDetailComplet = GuichetDetail & {
  agents: { id: number; name: string; email: string; phone: string | null; status: string }[];
  clients: { id: number; user: { id: number; name: string; email: string }; created_at: string }[];
  commissions: {
    id: number;
    montant_commission: number;
    statut: "creditee" | "reversee";
    created_at: string;
    paiement: { client: { user: { name: string } } };
  }[];
};

export async function detailGuichet(id: number): Promise<GuichetDetailComplet> {
  const res = await apiFetch<{ success: boolean; data: GuichetDetailComplet }>(
    `/api/admin/guichets/${id}`,
  );
  return res.data;
}

export async function supprimerGuichet(id: number): Promise<void> {
  await apiFetch(`/api/admin/guichets/${id}`, { method: "DELETE" });
}

// --- Clients : détail, modification, création, suppression ---

export type ClientDetailComplet = ClientDetail & {
  factures: { id: number; type: string; montant_du: number; statut: string; created_at: string }[];
  paiements: {
    id: number;
    montant: number;
    statut_mobile_money: string;
    created_at: string;
    facture: { type: string; reference_facture: string | null };
  }[];
};

export async function detailClient(id: number): Promise<ClientDetailComplet> {
  const res = await apiFetch<{ success: boolean; data: ClientDetailComplet }>(
    `/api/admin/clients/${id}`,
  );
  return res.data;
}

export async function modifierClient(
  id: number,
  payload: Partial<{
    name: string;
    email: string;
    phone: string;
    numero_abonne_jirama: string;
    adresse: string;
  }>,
): Promise<void> {
  await apiFetch(`/api/admin/clients/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function supprimerClient(id: number): Promise<void> {
  await apiFetch(`/api/admin/clients/${id}`, { method: "DELETE" });
}

// --- Agents : liste complète, détail, modification, suppression ---

export type AgentDetail = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  guichet_id: number | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  guichet: { id: number; nom: string; lieu: string } | null;
};

export async function listeAgents(): Promise<AgentDetail[]> {
  const res = await apiFetch<{ success: boolean; data: AgentDetail[] }>("/api/admin/agents");
  return res.data;
}

export async function modifierAgent(
  id: number,
  payload: Partial<{
    name: string;
    email: string;
    phone: string;
    guichet_id: number;
    status: "pending" | "approved" | "rejected";
  }>,
): Promise<void> {
  await apiFetch(`/api/admin/agents/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function supprimerAgent(id: number): Promise<void> {
  await apiFetch(`/api/admin/agents/${id}`, { method: "DELETE" });
}

// --- Paiements (admin, vue complète) ---

export type PaiementAdminDetail = {
  id: number;
  montant: number;
  montant_frais: number | null;
  montant_commission: number | null;
  methode: "orange_money" | "mvola";
  statut_mobile_money: "en_attente" | "confirme" | "echoue";
  date_paiement: string | null;
  created_at: string;
  facture: {
    id: number;
    type: "facture" | "carte";
    reference_facture: string | null;
    montant_du: number;
  };
  client: { user: { id: number; name: string; email: string } };
  guichet_referent: { id: number; nom: string; lieu: string };
  paiement_jirama: { id: number; date_saisie: string } | null;
  commission: { id: number; montant_commission: number } | null;
};

export async function listePaiementsAdmin(): Promise<PaiementAdminDetail[]> {
  const res = await apiFetch<{ success: boolean; data: PaiementAdminDetail[] }>(
    "/api/admin/paiements",
  );
  return res.data;
}

export async function corrigerStatutPaiement(
  id: number,
  statut: "confirme" | "echoue",
): Promise<void> {
  await apiFetch(`/api/admin/paiements/${id}/statut`, {
    method: "PATCH",
    body: JSON.stringify({ statut_mobile_money: statut }),
  });
}

export async function supprimerPaiement(id: number): Promise<void> {
  await apiFetch(`/api/admin/paiements/${id}`, { method: "DELETE" });
}

// --- Commissions : reverser ---

export async function reverserCommission(id: number): Promise<void> {
  await apiFetch(`/api/admin/commissions/${id}/reverser`, { method: "POST" });
}

// --- Profil (tous rôles) ---

export async function modifierMonProfil(
  payload: Partial<{
    name: string;
    email: string;
    phone: string;
  }>,
): Promise<void> {
  await apiFetch("/api/profil", { method: "PATCH", body: JSON.stringify(payload) });
}
