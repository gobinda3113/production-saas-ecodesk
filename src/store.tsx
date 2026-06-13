import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  seedRules,
  seedActivity,
  seedConnections,
  seedTransactions,
  type KeywordRule,
  type ActivityItem,
  type Connection,
  type Transaction,
} from "@/data/mock";

export type Role = "client" | "admin";
export type Theme = "light" | "dark" | "system";

export interface ToastMsg {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  desc?: string;
}

interface Store {
  // auth
  role: Role | null;
  login: (role: Role) => void;
  logout: () => void;

  // theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;

  // toasts
  toasts: ToastMsg[];
  toast: (t: Omit<ToastMsg, "id">) => void;
  dismissToast: (id: string) => void;

  // domain
  credits: number;
  addCredits: (n: number) => void;
  plan: string;
  setPlan: (p: string) => void;

  rules: KeywordRule[];
  saveRule: (r: KeywordRule) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;

  activity: ActivityItem[];
  addActivity: (a: ActivityItem) => void;
  connections: Connection[];
  setConnection: (p: Connection["platform"], conn: Partial<Connection>) => void;

  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
}

const Ctx = createContext<Store | null>(null);

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem("echodesk-theme");
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {}
  return "light";
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [theme, setThemeState] = useState<Theme>(loadTheme);
  const [isDark, setIsDark] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [credits, setCredits] = useState(87);
  const [plan, setPlan] = useState("Starter");
  const [rules, setRules] = useState<KeywordRule[]>(seedRules);
  const [activity, setActivity] = useState<ActivityItem[]>(seedActivity);
  const [connections, setConnections] = useState<Connection[]>(seedConnections);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);

  // theme application
  useEffect(() => {
    const apply = () => {
      const sysDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = theme === "dark" || (theme === "system" && sysDark);
      document.documentElement.classList.toggle("dark", dark);
      setIsDark(dark);
    };
    apply();
    try { localStorage.setItem("echodesk-theme", theme); } catch {}
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const login = useCallback((r: Role) => setRole(r), []);
  const logout = useCallback(() => setRole(null), []);

  const toast = useCallback((t: Omit<ToastMsg, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);
  const dismissToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)),
    []
  );

  const addCredits = useCallback((n: number) => setCredits((c) => c + n), []);

  const saveRule = useCallback((r: KeywordRule) => {
    setRules((prev) => {
      const exists = prev.some((x) => x.id === r.id);
      return exists ? prev.map((x) => (x.id === r.id ? r : x)) : [r, ...prev];
    });
  }, []);
  const deleteRule = useCallback(
    (id: string) => setRules((prev) => prev.filter((x) => x.id !== id)),
    []
  );
  const toggleRule = useCallback((id: string) => {
    setRules((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, status: x.status === "active" ? "inactive" : "active" }
          : x
      )
    );
  }, []);

  const addActivity = useCallback(
    (a: ActivityItem) => setActivity((prev) => [a, ...prev]),
    []
  );

  const setConnection = useCallback(
    (p: Connection["platform"], conn: Partial<Connection>) => {
      setConnections((prev) =>
        prev.map((c) => (c.platform === p ? { ...c, ...conn } : c))
      );
    },
    []
  );

  const addTransaction = useCallback(
    (t: Transaction) => setTransactions((prev) => [t, ...prev]),
    []
  );

  return (
    <Ctx.Provider
      value={{
        role,
        login,
        logout,
        theme,
        setTheme,
        isDark,
        toasts,
        toast,
        dismissToast,
        credits,
        addCredits,
        plan,
        setPlan,
        rules,
        saveRule,
        deleteRule,
        toggleRule,
        activity,
        addActivity,
        connections,
        setConnection,
        transactions,
        addTransaction,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
