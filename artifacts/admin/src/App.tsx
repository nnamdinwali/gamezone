import { useAuth, useClerk, useUser } from "@clerk/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, Ban, Gamepad2, LogOut, ShieldCheck, Users } from "lucide-react";
import { adminFetch } from "./main";

type Overview = { users: number; games: number; activeSessions: number; bannedUsers: number };
type AdminUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
  balance: number;
  totalEarnings: number;
  gamesPlayed: number;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
};

function SignInGate() {
  const { openSignIn } = useClerk();
  return (
    <main className="gate">
      <ShieldCheck size={42} />
      <h1>GameZone Admin</h1>
      <p>Administrator access is required.</p>
      <button onClick={() => openSignIn()}>Sign in</button>
    </main>
  );
}

export default function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsers] = await Promise.all([
        adminFetch<Overview>("/api/admin/overview", getToken),
        adminFetch<AdminUser[]>("/api/admin/users", getToken),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn) loadAdminData();
  }, [isSignedIn, loadAdminData]);

  if (!isLoaded) return <div className="loading">Loading admin session…</div>;
  if (!isSignedIn) return <SignInGate />;

  const banUser = async (id: number) => {
    const reason = window.prompt("Reason for this ban:", "Policy violation")?.trim();
    if (!reason) return;
    try {
      await adminFetch(`/api/admin/users/${id}/ban`, getToken, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to ban user");
    }
  };

  const unbanUser = async (id: number) => {
    try {
      await adminFetch(`/api/admin/users/${id}/unban`, getToken, { method: "PATCH" });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unban user");
    }
  };

  return (
    <div className="admin-shell">
      <header className="topbar">
        <div className="brand"><ShieldCheck size={25} /><span>GAMEZONE ADMIN</span></div>
        <div className="account"><span>{user?.primaryEmailAddress?.emailAddress || "Administrator"}</span><button onClick={() => signOut()}><LogOut size={16} /> Sign out</button></div>
      </header>
      <main className="content">
        <div className="heading"><div><p className="eyebrow">CONTROL CENTER</p><h1>Platform operations</h1><p>Manage games, players, bans, rewards, and payout review from a separate administrator surface.</p></div><button className="refresh" onClick={loadAdminData}>Refresh</button></div>
        {error && <div className="error">{error}</div>}
        <section className="metrics">
          <Metric icon={<Users />} label="Players" value={overview?.users ?? "—"} />
          <Metric icon={<Gamepad2 />} label="Games" value={overview?.games ?? "—"} />
          <Metric icon={<Activity />} label="Active sessions" value={overview?.activeSessions ?? "—"} />
          <Metric icon={<Ban />} label="Banned accounts" value={overview?.bannedUsers ?? "—"} />
        </section>
        <section className="panel">
          <div className="panel-title"><div><p className="eyebrow">ACCOUNT MANAGEMENT</p><h2>Users</h2></div><span>{loading ? "Updating…" : `${users.length} records`}</span></div>
          <div className="table-wrap"><table><thead><tr><th>User</th><th>Balance</th><th>Games played</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td><strong>{account.username}</strong><small>{account.email}</small></td><td>${account.balance.toFixed(2)}</td><td>{account.gamesPlayed}</td><td><span className={account.bannedAt ? "status banned" : "status active"}>{account.bannedAt ? "Banned" : "Active"}</span></td><td>{account.bannedAt ? <button className="action unban" onClick={() => unbanUser(account.id)}>Unban</button> : <button className="action ban" onClick={() => banUser(account.id)}>Ban</button>}</td></tr>)}</tbody></table></div>
        </section>
        <section className="next"><h2>Next admin modules</h2><div><span>Game uploads and store links</span><span>Milestone reward schedules</span><span>Wallet and payout review</span><span>Audit log</span></div></section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return <article className="metric"><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></article>;
}
