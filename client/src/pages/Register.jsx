import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      toast.success("Account created");
      nav("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Registration failed");
    } finally { setLoading(false); }
  };

  const discord = async () => {
    try { const { data } = await api.get("/auth/discord/login"); window.location.href = data.url; }
    catch { toast.error("Discord unavailable"); }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Vertex Studio and start building.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input data-testid="register-name" required value={form.name} onChange={set("name")} className="mt-1.5 bg-card border-white/10" />
        </div>
        <div>
          <Label>Email</Label>
          <Input data-testid="register-email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5 bg-card border-white/10" />
        </div>
        <div>
          <Label>Password</Label>
          <Input data-testid="register-password" type="password" required minLength={6} value={form.password} onChange={set("password")} className="mt-1.5 bg-card border-white/10" />
        </div>
        <Button type="submit" disabled={loading} data-testid="register-submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-white/10" /> OR <div className="h-px flex-1 bg-white/10" /></div>
      <Button type="button" onClick={discord} data-testid="discord-register" variant="outline" className="w-full h-11 border-white/15 hover:bg-white/5">
        Continue with Discord
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" data-testid="to-login" className="text-white hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
