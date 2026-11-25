
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  authAPI,
  type User,
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("townexpress_token")
  );

  const [loading, setLoading] = useState(true);

  // ============================================
  // RESTORE AUTHENTICATED USER
  // ============================================

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (mounted) {
          setUser(currentUser);

          console.log("RESTORED USER:", currentUser);
          console.log("RESTORED ROLE:", currentUser.role);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        localStorage.removeItem("townexpress_token");

        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    loadUser();

    return () => {
      mounted = false;
    };
  }, [token]);

  // ============================================
  // AXIOS AUTH INTERCEPTOR
  // ============================================

  useEffect(() => {
    const interceptor = authAPI.interceptors.request.use(
      (config) => {
        const savedToken = localStorage.getItem(
          "townexpress_token"
        );

        if (savedToken) {
          config.headers.Authorization = `Bearer ${savedToken}`;
        }

        return config;
      }
    );

    return () => {
      authAPI.interceptors.request.eject(interceptor);
    };
  }, []);

  // ============================================
  // LOGIN
  // ============================================

  async function login(
    email: string,
    password: string
  ): Promise<User> {
    const result = await loginUser(email, password);

    localStorage.setItem("townexpress_token", result.token);

    setToken(result.token);
    setUser(result.user);

    console.log("LOGGED IN USER:", result.user);
    console.log("USER ROLE:", result.user.role);

    return result.user;
  }

  // ============================================
  // REGISTER
  // ============================================

  async function register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<void> {
    const result = await registerUser(data);

    localStorage.setItem("townexpress_token", result.token);

    setToken(result.token);
    setUser(result.user);

    console.log("REGISTERED USER:", result.user);
    console.log("REGISTERED ROLE:", result.user.role);
  }

  // ============================================
  // UPDATE USER
  // ============================================

  function updateUser(updatedUser: User) {
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, ...updatedUser }
        : updatedUser
    );
  }

  // ============================================
  // LOGOUT
  // ============================================

  function logout() {
    localStorage.removeItem("townexpress_token");

    setToken(null);
    setUser(null);
  }

  // ============================================
  // PROVIDER
  // ============================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// CUSTOM AUTH HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
