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
