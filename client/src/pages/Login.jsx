import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function DiscordButton() {
  const go = async () => {
    try { const { data } = await api.get("/auth/discord/login"); window.location.href = data.url; }
    catch { toast.error("Discord login unavailable"); }
  };
  return (
    <Button type="button" onClick={go} data-testid="discord-login" variant="outline"
      className="w-full h-11 border-white/15 hover:bg-white/5">
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.369A19.79 19.79 0 0016.558 3c-.2.36-.43.85-.59 1.24a18.27 18.27 0 00-5.93 0C9.87 3.85 9.63 3.36 9.43 3a19.74 19.74 0 00-3.76 1.37C2.9 8.05 2.2 11.64 2.53 15.18a19.9 19.9 0 006.06 3.07c.49-.67.93-1.38 1.3-2.13-.71-.27-1.39-.6-2.03-.99.17-.13.34-.26.5-.4a14.2 14.2 0 0012.28 0c.16.14.33.27.5.4-.64.39-1.32.72-2.03.99.37.75.81 1.46 1.3 2.13a19.86 19.86 0 006.06-3.07c.39-4.11-.67-7.67-2.9-10.81zM9.68 13.4c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.09 2.15 2.4 0 1.32-.95 2.4-2.15 2.4zm4.64 0c-1.18 0-2.15-1.08-2.15-2.4s.95-2.4 2.15-2.4c1.2 0 2.17 1.09 2.15 2.4 0 1.32-.94 2.4-2.15 2.4z"/></svg>
      Continue with Discord
    </Button>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 radial-glow" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 glass p-8">
        <h1 className="font-display font-black text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground mb-6">{subtitle}</p>
        {children}
      </motion.div>
    </div>
  );
}

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data);
      toast.success("Welcome back");
      nav(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to access your Vertex dashboard.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-card border-white/10" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-white">Forgot?</Link>
          </div>
          <Input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-card border-white/10" />
        </div>
        <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" /></div>
      <DiscordButton />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account? <Link to="/register" data-testid="to-register" className="text-white hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}
