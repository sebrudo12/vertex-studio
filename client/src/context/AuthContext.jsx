import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const saved = localStorage.getItem("vx_user");
      const token = localStorage.getItem("vx_token");
      if (token && saved) return JSON.parse(saved);
      if (!token) return false;
      return null;
    } catch {
      return null;
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
    const token = localStorage.getItem("vx_token");
    if (!token) { setUser(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      if (data && typeof data === "object") {
        setUser(data.user || data);
      }
    } catch (e) {
      console.warn("Auth refresh warning:", e.response?.data || e.message);
      if (e.response?.status === 401) {
        localStorage.removeItem("vx_token");
        setUser(false);
      }
    }
  };

  useEffect(() => { loadSettings(); refresh(); }, []);

  const login = (data) => {
    if (data.token) localStorage.setItem("vx_token", data.token);
    const u = { id: data.id, email: data.email, name: data.name, role: data.role, avatar: data.avatar };
    setUser(u);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (e) {}
    localStorage.removeItem("vx_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refresh, settings, reloadSettings: loadSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
