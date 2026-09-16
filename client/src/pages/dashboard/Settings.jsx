import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold text-lg mb-4">Profile</h2>
        <div className="space-y-4">
          <div><Label>Name</Label><Input data-testid="settings-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 bg-[#0b0b10] border-white/10" /></div>
          <div><Label>Email</Label><Input value={user?.email || ""} disabled className="mt-1.5 bg-[#0b0b10] border-white/10 opacity-60" /></div>
          <Button data-testid="settings-save" onClick={() => toast.success("Profile saved")} className="bg-white text-black hover:bg-white/90 font-semibold">Save Changes</Button>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card p-6">
        <h2 className="font-display font-bold text-lg mb-2">Account</h2>
        <p className="text-sm text-muted-foreground">Role: <span className="text-white capitalize">{user?.role}</span></p>
      </div>
    </div>
  );
}
