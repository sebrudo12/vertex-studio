import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=loading, false=anon, obj=user
  const [settings, setSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
      if (data?.accent_color) {
        document.documentElement.style.setProperty("--accent-color", data.accent_color);
      }
    } catch (e) { /* ignore */ }
  };

  const refresh = async () => {
    const token = localStorage.getItem("vx_token");
    if (!token) { setUser(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem("vx_token");
      setUser(false);
    }
  };

  useEffect(() => { loadSettings(); refresh(); }, []);

  const login = (data) => {
    if (data.token) localStorage.setItem("vx_token", data.token);
    setUser({ id: data.id, email: data.email, name: data.name, role: data.role, avatar: data.avatar });
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
