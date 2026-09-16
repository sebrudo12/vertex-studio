import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { AuthShell } from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const token = params.get("token") || "";

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password updated. Please sign in.");
      nav("/login");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Invalid or expired token"); }
  };

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>New Password</Label>
          <Input data-testid="reset-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-card border-white/10" />
        </div>
        <Button type="submit" data-testid="reset-submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">Update Password</Button>
        <p className="text-center text-sm text-muted-foreground"><Link to="/login" className="text-white hover:underline">Back to login</Link></p>
      </form>
    </AuthShell>
  );
}
