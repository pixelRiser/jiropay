import { apiFetch } from "./http";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "client" | "agent" | "admin";
  phone: string | null;
  guichet_id: number | null;
  status: "pending" | "approved" | "rejected";
};

export type Guichet = { id: number; nom: string; lieu: string };

export async function me(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: AuthUser }>("/api/auth/me");
    return res.data;
  } catch {
    return null;
  }
}

export async function listeGuichets(): Promise<Guichet[]> {
  const res = await apiFetch<{ success: boolean; data: Guichet[] }>("/api/public/guichets");
  return res.data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "client" | "agent";
  guichet_id: number;
  numero_abonne_jirama?: string | undefined;
  adresse?: string | undefined;
}): Promise<{ message: string }> {
  // Ne connecte jamais automatiquement — le compte doit d'abord être vérifié
  // par email (et, pour un agent, approuvé par un admin) avant de se connecter.
  return apiFetch<{ success: boolean; message: string }>("/api/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }): Promise<AuthUser> {
  const res = await apiFetch<{ success: boolean; data: AuthUser }>("/api/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await apiFetch("/api/logout", { method: "POST" });
}

export async function changePassword(payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiFetch("/api/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/api/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/api/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ success: boolean; message: string }>("/api/email/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
