import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthDiscordCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { setUser } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const token = params.get("token");
    const err = params.get("error");
    if (err || !token) {
      toast.error(err ? `Discord error: ${decodeURIComponent(err)}` : "Discord login failed. Please try again.");
      nav("/login", { replace: true });
      return;
    }

    const role = params.get("role") || "customer";
    const name = params.get("name") || "User";
    const email = params.get("email") || "";
    const avatar = params.get("avatar") || "";

    localStorage.setItem("vx_token", token);
    localStorage.setItem("vertex_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const initialUser = { name, username: name, role, email, avatar };
    setUser(initialUser);
    toast.success(`Welcome back, ${name}!`);
    nav(role === "admin" ? "/admin" : "/dashboard", { replace: true });

    // Sync full profile in background
    api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (data && typeof data === "object") {
          setUser(data.user || data);
        }
      })
      .catch((e) => {
        console.warn("Background profile sync note:", e.message);
      });
  }, [params, nav, setUser]);

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70 mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Signing you in with Discord...</p>
      </div>
    </div>
  );
}
