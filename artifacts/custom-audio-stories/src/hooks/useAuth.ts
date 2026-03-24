import { authClient } from "../lib/authClient";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  name?: string;
  image?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  openSignIn: () => void;
  openSignUp: () => void;
  logout: () => Promise<void>;
}

let _openModal: ((tab: "signin" | "signup") => void) | null = null;

export function registerAuthModalOpener(fn: (tab: "signin" | "signup") => void) {
  _openModal = fn;
}

export function useAuth(): AuthState {
  const { data: session, isPending } = authClient.useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? null,
        firstName: (session.user as Record<string, unknown>).firstName as string ?? null,
        lastName: (session.user as Record<string, unknown>).lastName as string ?? null,
        profileImageUrl:
          ((session.user as Record<string, unknown>).profileImageUrl as string) ??
          session.user.image ?? null,
        name: session.user.name,
        image: session.user.image,
      }
    : null;

  return {
    user,
    isLoading: isPending,
    isAuthenticated: !!user,
    openSignIn: () => _openModal?.("signin"),
    openSignUp: () => _openModal?.("signup"),
    logout: async () => {
      await authClient.signOut();
      window.location.reload();
    },
  };
}
