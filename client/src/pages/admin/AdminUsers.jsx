import { useEffect, useState } from "react";
import { Search, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  const load = (search = "") => api.get("/admin/users", { params: search ? { search } : {} }).then((r) => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    await api.post(`/admin/users/${id}/${action}`);
    toast.success(action === "suspend" ? "User suspended" : "User restored");
    load(q);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="font-display font-black text-2xl">Users</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input data-testid="user-search" placeholder="Search users..." value={q}
            onChange={(e) => { setQ(e.target.value); load(e.target.value); }} className="pl-9 bg-card border-white/10" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted-foreground"><tr>
            <th className="text-left font-medium px-4 py-3">User</th>
            <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Role</th>
            <th className="text-left font-medium px-4 py-3">Orders</th>
            <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Licenses</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-right font-medium px-4 py-3">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-white/10">
            {users.map((u) => (
              <tr key={u.id} data-testid={`admin-user-${u.id}`}>
                <td className="px-4 py-3"><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                <td className="px-4 py-3 hidden md:table-cell capitalize">{u.role}</td>
                <td className="px-4 py-3">{u.orders}</td>
                <td className="px-4 py-3 hidden sm:table-cell">{u.licenses}</td>
                <td className="px-4 py-3"><span className={u.status === "suspended" ? "text-red-400 text-xs" : "text-emerald-300 text-xs"}>{u.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {u.status === "suspended" ? (
                    <Button size="sm" variant="outline" onClick={() => act(u.id, "restore")} data-testid={`restore-${u.id}`} className="border-white/15 hover:bg-white/5"><RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore</Button>
                  ) : u.role !== "admin" && (
                    <Button size="sm" variant="outline" onClick={() => act(u.id, "suspend")} data-testid={`suspend-${u.id}`} className="border-white/15 hover:bg-white/5 text-red-400"><Ban className="h-3.5 w-3.5 mr-1" /> Suspend</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
