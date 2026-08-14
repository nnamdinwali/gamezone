import { useAuth, useClerk, useUser } from "@clerk/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, Ban, Gamepad2, LogOut, ShieldCheck, Users } from "lucide-react";
import { adminFetch } from "./main";

type Overview = { users: number; games: number; activeSessions: number; bannedUsers: number };
type AdminGame = { id: number; title: string; genre: string; androidStoreUrl: string | null; iosStoreUrl: string | null; playCount: number };
type Milestone = { id: number; level: number; title: string; rewardAmount: number; currency: string; countryCode: string; isActive: boolean };
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
  const [games, setGames] = useState<AdminGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneForm, setMilestoneForm] = useState({ level: "10", title: "Reach level 10", rewardAmount: "0.10", currency: "USD", countryCode: "US" });
  const [gameForm, setGameForm] = useState({ title: "", description: "", genre: "Arcade", thumbnailUrl: "", gameUrl: "https://example.com", androidStoreUrl: "", iosStoreUrl: "", packageName: "", creatorName: "GameZone Studio", rewardPerMinute: "0" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsers, nextGames] = await Promise.all([
        adminFetch<Overview>("/api/admin/overview", getToken),
        adminFetch<AdminUser[]>("/api/admin/users", getToken),
        adminFetch<AdminGame[]>("/api/games", getToken),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setGames(nextGames);
      setSelectedGameId((current) => current ?? nextGames[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isSignedIn) loadAdminData();
  }, [isSignedIn, loadAdminData]);

  useEffect(() => {
    if (!selectedGameId || !isSignedIn) return;
    adminFetch<Milestone[]>(`/api/admin/games/${selectedGameId}/milestones`, getToken)
      .then(setMilestones)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load milestones"));
  }, [getToken, isSignedIn, selectedGameId]);

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

  const createGame = async () => {
    try {
      const created = await adminFetch<AdminGame>("/api/games", getToken, {
        method: "POST",
        body: JSON.stringify({ ...gameForm, rewardPerMinute: Number(gameForm.rewardPerMinute) }),
      });
      setGames((current) => [created, ...current]);
      setSelectedGameId(created.id);
      setGameForm({ ...gameForm, title: "", description: "", thumbnailUrl: "", androidStoreUrl: "", iosStoreUrl: "", packageName: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload game");
    }
  };

  const createMilestone = async () => {
    if (!selectedGameId) return;
    try {
      await adminFetch(`/api/admin/games/${selectedGameId}/milestones`, getToken, {
        method: "POST",
        body: JSON.stringify({
          ...milestoneForm,
          level: Number(milestoneForm.level),
          rewardAmount: Number(milestoneForm.rewardAmount),
        }),
      });
      const refreshed = await adminFetch<Milestone[]>(`/api/admin/games/${selectedGameId}/milestones`, getToken);
      setMilestones(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create milestone");
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
        <section className="panel game-panel">
          <div className="panel-title"><div><p className="eyebrow">OFFER MANAGEMENT</p><h2>Upload a game offer</h2></div><span>Store-link APK flow</span></div>
          <div className="upload-grid"><input placeholder="Game title" value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} /><input placeholder="Creator / studio" value={gameForm.creatorName} onChange={(e) => setGameForm({ ...gameForm, creatorName: e.target.value })} /><input placeholder="Genre" value={gameForm.genre} onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })} /><input placeholder="Thumbnail URL" value={gameForm.thumbnailUrl} onChange={(e) => setGameForm({ ...gameForm, thumbnailUrl: e.target.value })} /><input placeholder="Google Play URL" value={gameForm.androidStoreUrl} onChange={(e) => setGameForm({ ...gameForm, androidStoreUrl: e.target.value })} /><input placeholder="App Store URL" value={gameForm.iosStoreUrl} onChange={(e) => setGameForm({ ...gameForm, iosStoreUrl: e.target.value })} /><input placeholder="Android package name" value={gameForm.packageName} onChange={(e) => setGameForm({ ...gameForm, packageName: e.target.value })} /><input placeholder="Description" value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} /><button className="refresh" onClick={createGame}>Create game offer</button></div>
          <div className="panel-title"><div><p className="eyebrow">REWARD MANAGEMENT</p><h2>Games and milestones</h2></div><span>{games.length} games</span></div>
          <div className="game-controls"><select value={selectedGameId ?? ""} onChange={(event) => setSelectedGameId(Number(event.target.value))}><option value="">Select a game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title}</option>)}</select><span>{selectedGameId ? "Configure reward schedule" : "Choose a game to manage milestones"}</span></div>
          {selectedGameId && <><div className="milestone-form"><input type="number" min="1" value={milestoneForm.level} onChange={(event) => setMilestoneForm({ ...milestoneForm, level: event.target.value })} placeholder="Level" /><input value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} placeholder="Milestone title" /><input type="number" min="0" step="0.01" value={milestoneForm.rewardAmount} onChange={(event) => setMilestoneForm({ ...milestoneForm, rewardAmount: event.target.value })} placeholder="Reward" /><input value={milestoneForm.currency} onChange={(event) => setMilestoneForm({ ...milestoneForm, currency: event.target.value.toUpperCase() })} placeholder="Currency" /><input value={milestoneForm.countryCode} onChange={(event) => setMilestoneForm({ ...milestoneForm, countryCode: event.target.value.toUpperCase() })} placeholder="Country" /><button className="refresh" onClick={createMilestone}>Add milestone</button></div><div className="milestone-list">{milestones.map((milestone) => <div className="milestone" key={milestone.id}><strong>Level {milestone.level}</strong><span>{milestone.title}</span><b>{milestone.currency} {milestone.rewardAmount.toFixed(2)}</b><small>{milestone.countryCode}</small></div>)}</div></>}
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
