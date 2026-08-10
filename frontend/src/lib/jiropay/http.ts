/**
 * Fondations HTTP partagées par les modules API jiropay. jiropay est un
 * compte natif, indépendant — authentifié via une vraie session Sanctum SPA
 * sur son propre domaine (`credentials: "include"` + cookie XSRF-TOKEN
 * envoyé en header sur toute requête mutante).
 */

export class UnauthorizedError extends Error {
  constructor() {
    super("Non authentifié");
    this.name = "UnauthorizedError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let csrfReady: Promise<void> | null = null;

function ensureCsrfCookie(): Promise<void> {
  if (!csrfReady) {
    csrfReady = fetch("/sanctum/csrf-cookie", { credentials: "include" })
      .then(() => undefined)
      .catch(() => {
        csrfReady = null;
      });
  }
  return csrfReady;
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureCsrfCookie();
  const xsrf = readCookie("XSRF-TOKEN");

  // FormData (upload de fichier) : ne jamais fixer Content-Type nous-mêmes —
  // le navigateur doit poser son propre boundary multipart/form-data.
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    throw new UnauthorizedError();
  }

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(body?.message ?? `Erreur ${res.status}`, res.status, body);
  }

  return body as T;
}
