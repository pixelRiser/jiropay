import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword as apiChangePassword,
  forgotPassword as apiForgotPassword,
  login as apiLogin,
  logout as apiLogout,
  me,
  register as apiRegister,
  resendVerification as apiResendVerification,
  resetPassword as apiResetPassword,
  type AuthUser,
} from "./auth-api";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "client" | "agent";
  guichet_id: number;
  numero_abonne_jirama?: string | undefined;
  adresse?: string | undefined;
};

type Ctx = {
  user: AuthUser | null;
  chargement: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  changerMotDePasse: (
    motDePasseActuel: string,
    nouveauMotDePasse: string,
    confirmation: string,
  ) => Promise<void>;
  motDePasseOublie: (email: string) => Promise<{ message: string }>;
  reinitialiserMotDePasse: (
    token: string,
    email: string,
    nouveauMotDePasse: string,
    confirmation: string,
  ) => Promise<{ message: string }>;
  renvoyerVerification: (email: string) => Promise<{ message: string }>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["jiropay-auth-me"],
    queryFn: me,
    retry: false,
  });

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["jiropay-auth-me"] });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) => apiLogin(payload),
    // setQueryData (pas juste invalidate) : la garde de route dans
    // _authenticated/route.tsx lit useAuth().user immédiatement après la
    // navigation post-login — un simple invalidate() ne fait que déclencher
    // un refetch en arrière-plan, pas garanti terminé à temps, ce qui
    // renvoyait l'utilisateur vers /auth juste après une connexion réussie.
    onSuccess: (user) => {
      queryClient.setQueryData(["jiropay-auth-me"], user);
    },
  });
  const login = useCallback(
    async (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => apiRegister(payload),
    onSuccess: invalidateAll,
  });
  const register = useCallback(
    async (payload: RegisterPayload) => registerMutation.mutateAsync(payload),
    [registerMutation],
  );

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: invalidateAll,
  });
  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const changePasswordMutation = useMutation({
    mutationFn: (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => apiChangePassword(payload),
  });
  const changerMotDePasse = useCallback(
    async (motDePasseActuel: string, nouveauMotDePasse: string, confirmation: string) => {
      await changePasswordMutation.mutateAsync({
        current_password: motDePasseActuel,
        password: nouveauMotDePasse,
        password_confirmation: confirmation,
      });
    },
    [changePasswordMutation],
  );

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => apiForgotPassword(email),
  });
  const motDePasseOublie = useCallback(
    (email: string) => forgotPasswordMutation.mutateAsync(email),
    [forgotPasswordMutation],
  );

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => apiResetPassword(payload),
  });
  const reinitialiserMotDePasse = useCallback(
    (token: string, email: string, nouveauMotDePasse: string, confirmation: string) =>
      resetPasswordMutation.mutateAsync({
        token,
        email,
        password: nouveauMotDePasse,
        password_confirmation: confirmation,
      }),
    [resetPasswordMutation],
  );

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => apiResendVerification(email),
  });
  const renvoyerVerification = useCallback(
    (email: string) => resendVerificationMutation.mutateAsync(email),
    [resendVerificationMutation],
  );

  const value = useMemo<Ctx>(
    () => ({
      user: meQuery.data ?? null,
      chargement: meQuery.isLoading,
      login,
      register,
      logout,
      changerMotDePasse,
      motDePasseOublie,
      reinitialiserMotDePasse,
      renvoyerVerification,
    }),
    [
      meQuery.data,
      meQuery.isLoading,
      login,
      register,
      logout,
      changerMotDePasse,
      motDePasseOublie,
      reinitialiserMotDePasse,
      renvoyerVerification,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
