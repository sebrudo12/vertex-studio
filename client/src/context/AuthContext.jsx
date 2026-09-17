import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const token = localStorage.getItem("vx_token") || localStorage.getItem("vertex_token");
      if (!token) return false;
      const saved = localStorage.getItem("vx_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") return parsed;
        } catch {}
      }
      // If token exists but vx_user was missing, decode JWT payload
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          if (payload && (payload.id || payload.email)) {
            return {
              id: payload.id,
              email: payload.email,
              name: payload.username || payload.email?.split("@")[0] || "User",
              username: payload.username || payload.email?.split("@")[0] || "User",
              role: payload.role || "customer",
            };
          }
        }
      } catch {}
      return false;
    } catch {
      return false;
    }
  });
  const [settings, setSettings] = useState(null);

  const setUser = (u) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem("vx_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("vx_user");
      }
    } catch (e) {}
  };

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setSettings(data);
        if (data?.accent_color) {
          document.documentElement.style.setProperty("--accent-color", data.accent_color);
        }
      }
    } catch (e) { /* ignore */ }
  };

  const refresh = async () => {
    const token = localStorage.getItem("vx_token") || localStorage.getItem("vertex_token");
    if (!token) {
      setUser(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      if (data && typeof data === "object") {
        if (data.token) {
          localStorage.setItem("vx_token", data.token);
          localStorage.setItem("vertex_token", data.token);
        }
        setUser(data.user || data);
      }
    } catch (e) {
      // ONLY log out if the server explicitly returned HTTP 401 Unauthorized
      // Never log out on connection drop, Render cold start (502/503/504), timeout, or offline mode
      if (e.response && e.response.status === 401) {
        localStorage.removeItem("vx_token");
        localStorage.removeItem("vertex_token");
        localStorage.removeItem("vx_user");
        setUser(false);
      }
    }
  };

  useEffect(() => {
    loadSettings();
    refresh();
  }, []);

  const login = (data, secondArg) => {
    const token = typeof data === "string" ? data : (data?.token || secondArg?.token);
    const rawUser = secondArg || (typeof data === "object" ? (data?.user || data) : null);

    if (token) {
      localStorage.setItem("vx_token", token);
      localStorage.setItem("vertex_token", token);
    }
    if (rawUser) {
      const u = {
        id: rawUser.id,
        email: rawUser.email,
        name: rawUser.name || rawUser.username || "User",
        username: rawUser.username || rawUser.name || "User",
        role: rawUser.role || "customer",
        staff_role: rawUser.staff_role,
        avatar: rawUser.avatar || rawUser.avatar_url || "",
        avatar_url: rawUser.avatar_url || rawUser.avatar || "",
        status: rawUser.status || "active",
      };
      setUser(u);
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) {}
    localStorage.removeItem("vx_token");
    localStorage.removeItem("vertex_token");
    localStorage.removeItem("vx_user");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refresh, settings, reloadSettings: loadSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
