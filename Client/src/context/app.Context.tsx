
import type { AxiosInstance } from "axios";
import axios from "axios";
import { createContext, useContext, useEffect, useState,type ReactNode,} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  analysisCount?: number;
}

    interface AppContextType {
        user: User | null;
        token: string | null;
        loading: boolean;
        api: AxiosInstance;
        login: (
            email: string,
            password: string
        ) => Promise<{ success: boolean; message?: string }>;
        register: (
            name: string,
            email: string,
            password: string
        ) => Promise<{ success: boolean; message?: string }>;
        logout: () => void;
    }

    const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

    // Create the Axios instance once, outside the component.
    const api = axios.create({
    baseURL: BACKEND_URL,
    });

// Attach the saved JWT to requests.
    api.interceptors.request.use((config) => {
        const savedToken = localStorage.getItem("token");

        if (savedToken) {
            config.headers.Authorization = `Bearer ${savedToken}`;
        }

        return config;
    });

    const AppContext = createContext<AppContextType | undefined>(
       undefined
    );

    export function AppProvider({
        children,
        }: {
        children: ReactNode;
        }) {
        const [token, setToken] = useState<string | null>(
            () => localStorage.getItem("token")
        );

        const [user, setUser] = useState<User | null>(null);

        const [loading, setLoading] = useState(
            () => Boolean(localStorage.getItem("token"))
        );

    // Load the logged-in user whenever the token changes.
    useEffect(() => {
        if (!token) {
        return;
        }

        let cancelled = false;

        const loadUser = async () => {
        try {
            const { data } = await api.get("/api/auth/user");

            if (cancelled) return;

            if (data.success) {
            setUser(data.user);
            } else {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            }
        } catch {
            if (cancelled) return;

            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            if (!cancelled) {
            setLoading(false);
            }
        }
        };

        loadUser();

        return () => {
        cancelled = true;
        };
    }, [token]);

    const login = async (
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        try {
        const res = await api.post("/api/auth/login", {
            email,
            password,
        });

        if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            setLoading(true);
            setToken(res.data.token);

            return { success: true };
        }

        return {
            success: false,
            message: res.data.message,
        };
        } catch (error: unknown) {
            let message = "Login failed";

            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || "Login failed";
            }

            return {
                success: false,
                message: message,
            };
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string
    ): Promise<{ success: boolean; message?: string }> => {
        try {
        const res = await api.post("/api/auth/register", {
            name,
            email,
            password,
        });

        if (res.data.success) {
            localStorage.setItem("token", res.data.token);
            setUser(res.data.user);
            setLoading(true);
            setToken(res.data.token);

            return { success: true };
        }

        return {
            success: false,
            message: res.data.message,
        };
        } catch (error: unknown) {
            let message = "Registration failed";

                if (axios.isAxiosError(error)) {
                message =
                error.response?.data?.message ||
                "Registration failed";
            }
        return {
             success: false,
             message,
        };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setLoading(false);
    };

    const value: AppContextType = {
        user,
        token,
        loading,
        api,
        login,
        register,
        logout,
    };

    return (
        <AppContext.Provider value={value}>
        {children}
        </AppContext.Provider>
    );
    }

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
