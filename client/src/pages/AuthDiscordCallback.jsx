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
      toast.error("Discord login failed. Please try again.");
      nav("/login", { replace: true });
      return;
    }
    localStorage.setItem("vx_token", token);
    api.get("/auth/me")
      .then(({ data }) => {
        setUser(data);
        toast.success(`Welcome, ${data.name}`);
        nav(data.role === "admin" ? "/admin" : "/dashboard", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("vx_token");
        toast.error("Session could not be established.");
        nav("/login", { replace: true });
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
