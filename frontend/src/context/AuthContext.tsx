import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiMfaVerify,
  setTokens,
  loadTokens,
  clearTokens,
  apiFetch,
} from "@/api/client";

interface User {
  email: string;
  name: string;
  role: string;
  department: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  mfaPending: { email: string; role: string } | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    mfaPending: null,
  });

  // On mount, check for existing tokens
  useEffect(() => {
    const t = loadTokens();
    if (t?.access_token) {
      apiFetch<User>("/auth/me")
        .then((user) => setState({ user, loading: false, mfaPending: null }))
        .catch(() => {
          clearTokens();
          setState({ user: null, loading: false, mfaPending: null });
        });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    if (data.mfa_required) {
      setState((s) => ({
        ...s,
        mfaPending: { email, role: data.role },
      }));
      return;
    }
    setTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    const user = await apiFetch<User>("/auth/me");
    setState({ user, loading: false, mfaPending: null });
  }, []);

  const verifyMfa = useCallback(
    async (code: string) => {
      if (!state.mfaPending) throw new Error("No MFA session");
      const data = await apiMfaVerify(state.mfaPending.email, code);
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      const user = await apiFetch<User>("/auth/me");
      setState({ user, loading: false, mfaPending: null });
    },
    [state.mfaPending]
  );

  const logout = useCallback(() => {
    clearTokens();
    setState({ user: null, loading: false, mfaPending: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, verifyMfa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
