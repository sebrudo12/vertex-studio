import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { AuthShell } from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try { await api.post("/auth/forgot-password", { email }); setSent(true); toast.success("If the email exists, a reset link was sent."); }
    catch { toast.error("Something went wrong"); }
  };

  return (
    <AuthShell title="Reset password" subtitle="Enter your email to receive a reset link.">
      {sent ? (
        <p className="text-sm text-muted-foreground">Check your email (or backend logs in this demo) for the reset link.
          <Link to="/login" className="text-white hover:underline ml-1">Back to login</Link>
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input data-testid="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-card border-white/10" />
          </div>
          <Button type="submit" data-testid="forgot-submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">Send Reset Link</Button>
          <p className="text-center text-sm text-muted-foreground"><Link to="/login" className="text-white hover:underline">Back to login</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
