import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { JSX, ReactNode } from "react";

import { setUnauthorizedHandler } from "./api";
import { i18n } from "./i18n";
import { authClient } from "./auth-client";
import { readSetting, writeSetting } from "./flags";
import { clearQueryCache } from "./query-client";

/**
 * - `loading`: the stored session is still being read.
 * - `signedIn`: a valid session exists.
 * - `signedOut`: no session; show onboarding (first launch) or the sign-in screen.
 */
export type AuthStatus = "loading" | "signedIn" | "signedOut";

const ONBOARDED_SETTING = "onboarded";

interface AuthGate {
  status: AuthStatus;
  /** True once the user has finished (or skipped) the first-launch onboarding. */
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  /** Ends the session and returns to the sign-in screen. */
  signOut: () => Promise<{ error: string | null }>;
}

const AuthGateContext = createContext<AuthGate | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }): JSX.Element {
  const { data: session, isPending } = authClient.useSession();
  const [hasOnboarded, setHasOnboarded] = useState(() => readSetting(ONBOARDED_SETTING) === "1");

  const userId = session?.user.id ?? null;

  // Drop cached data when the user signs out so the next user never sees it.
  useEffect(() => {
    if (!userId && !isPending) void clearQueryCache();
  }, [userId, isPending]);

  // A 401 from the API means the session is gone: end it so the app returns to sign-in.
  useEffect(() => {
    setUnauthorizedHandler(() => void authClient.signOut().catch(() => undefined));
    return () => setUnauthorizedHandler(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    writeSetting(ONBOARDED_SETTING, "1");
    setHasOnboarded(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await authClient.signOut();
      if (error) return { error: error.message ?? i18n.t("errors.signOut") };
    } catch {
      return { error: i18n.t("errors.network") };
    }
    return { error: null };
  }, []);

  const status: AuthStatus = session ? "signedIn" : isPending ? "loading" : "signedOut";
  const value = useMemo(
    () => ({ status, hasOnboarded, completeOnboarding, signOut }),
    [status, hasOnboarded, completeOnboarding, signOut]
  );

  return <AuthGateContext value={value}>{children}</AuthGateContext>;
}

export function useAuthGate(): AuthGate {
  const value = use(AuthGateContext);
  if (!value) throw new Error("useAuthGate must be used inside AuthGateProvider");
  return value;
}
