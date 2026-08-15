import { useAdminAuth, startAdminLogin } from "./admin-auth";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, Ban, Gamepad2, LogOut, ShieldCheck, Users } from "lucide-react";
import { adminFetch } from "./main";

type Overview = { users: number; games: number; activeSessions: number; bannedUsers: number };
type AdminGame = { id: number; title: string; genre: string; gameUrl: string; androidStoreUrl: string | null; iosStoreUrl: string | null; packageName: string | null; playCount: number };
type Milestone = { id: number; level: number; title: string; rewardAmount: number; currency: string; countryCode: string; isActive: boolean };
type Withdrawal = { id: number; userId: number; amount: number; currencyCode: string; status: string; reviewNote: string | null; createdAt: string; user: { username: string; email: string; countryCode: string | null }; payoutProfile: { method: string; label: string; maskedDetails: string; details: Record<string, string> } };
type SupportMessage = { id: number; userId: number; subject: string; message: string; status: string; createdAt: string; readAt: string | null; user?: { username: string; email: string; countryCode: string | null } };
type AdminUser = {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
  countryCode: string | null;
  balance: number;
  totalEarnings: number;
  gamesPlayed: number;
  bannedAt: string | null;
  banReason: string | null;
  createdAt: string;
};

function SignInGate() {
  return (
    <main className="gate">
      <ShieldCheck size={42} />
      <h1>Rockcity Admin</h1>
      <p>Administrator access is required.</p>
      <button onClick={startAdminLogin}>Sign in</button>
    </main>
  );
}

export default function App() {
  const { isLoaded, isSignedIn, user, signOut, error: authError, reload: reloadAuth } = useAdminAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [games, setGames] = useState<AdminGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneForm, setMilestoneForm] = useState({ level: "10", title: "Reach level 10", rewardAmount: "0.10", currency: "USD", countryCode: "US" });
  const [gameForm, setGameForm] = useState({ title: "", description: "", genre: "Arcade", thumbnailUrl: "", gameUrl: "", androidStoreUrl: "", iosStoreUrl: "", packageName: "", creatorName: "Rockcity Studio", rewardPerMinute: "0.05" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageUserId, setMessageUserId] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsers, nextGames, nextWithdrawals, nextSupport] = await Promise.all([
        adminFetch<Overview>("/api/admin/overview"),
        adminFetch<AdminUser[]>("/api/admin/users"),
        adminFetch<AdminGame[]>("/api/games"),
        adminFetch<Withdrawal[]>("/api/admin/withdrawals"),
        adminFetch<{ messages: SupportMessage[] }>("/api/admin/support/messages"),
      ]);
      setOverview(nextOverview);
      setUsers(nextUsers);
      setGames(nextGames);
      setWithdrawals(nextWithdrawals);
      setSupportMessages(nextSupport.messages);
      setSelectedGameId((current) => current ?? nextGames[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) loadAdminData();
  }, [isSignedIn, loadAdminData]);

  useEffect(() => {
    if (!selectedGameId || !isSignedIn) return;
    adminFetch<Milestone[]>(`/api/admin/games/${selectedGameId}/milestones`)
      .then(setMilestones)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load milestones"));
  }, [isSignedIn, selectedGameId]);

  if (!isLoaded) return <div className="loading">Loading admin session…</div>;
  if (!isSignedIn) return <><SignInGate />{authError && <div className="error">{authError}<button className="action" onClick={() => void reloadAuth()}>Retry</button></div>}</>;

  const sendMessage = async () => {
    const userId = Number(messageUserId);
    if (!Number.isInteger(userId) || userId <= 0 || !messageTitle.trim() || !messageBody.trim()) {
      setMessageStatus("Choose a user and provide both a title and message.");
      return;
    }
    setMessageStatus("Sending…");
    try {
      await adminFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ userId, title: messageTitle.trim(), message: messageBody.trim() }),
      });
      setMessageTitle("");
      setMessageBody("");
      setMessageStatus("Message sent. It will appear in the selected user’s bell.");
    } catch (err) {
      setMessageStatus(err instanceof Error ? err.message : "Unable to send message");
    }
  };

  const banUser = async (id: number) => {
    const reason = window.prompt("Reason for this ban:", "Policy violation")?.trim();
    if (!reason) return;
    try {
      await adminFetch(`/api/admin/users/${id}/ban`, {
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
      const created = await adminFetch<AdminGame>("/api/games", {
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
      await adminFetch(`/api/admin/games/${selectedGameId}/milestones`, {
        method: "POST",
        body: JSON.stringify({
          ...milestoneForm,
          level: Number(milestoneForm.level),
          rewardAmount: Number(milestoneForm.rewardAmount),
        }),
      });
      const refreshed = await adminFetch<Milestone[]>(`/api/admin/games/${selectedGameId}/milestones`);
      setMilestones(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create milestone");
    }
  };

  const updateWithdrawalStatus = async (id: number, status: string) => {
    const note = status === "needs_correction" || status === "rejected" ? window.prompt("Optional note for the player:", "") ?? "" : "";
    try {
      await adminFetch(`/api/admin/withdrawals/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) });
      await loadAdminData();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update withdrawal"); }
  };

  const markSupportRead = async (id: number) => {
    try { await adminFetch(`/api/admin/support/messages/${id}/read`, { method: "PATCH" }); setSupportMessages((current) => current.map((message) => message.id === id ? { ...message, status: "read", readAt: new Date().toISOString() } : message)); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to update support message"); }
  };

  const unbanUser = async (id: number) => {
    try {
      await adminFetch(`/api/admin/users/${id}/unban`, { method: "PATCH" });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unban user");
    }
  };

  return (
    <div className="admin-shell">
      <header className="topbar">
        <div className="brand"><ShieldCheck size={25} /><span>ROCKCITY ADMIN</span></div>
        <div className="account"><span>{user?.email || "Administrator"}</span><button onClick={() => void signOut()}><LogOut size={16} /> Sign out</button></div>
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
        <section id="offer-management" className="panel game-panel">
          <div className="panel-title"><div><p className="eyebrow">OFFER MANAGEMENT</p><h2>Upload a game offer</h2></div><span>Store-link APK flow</span></div>
          <div className="upload-grid"><input placeholder="Game title" value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} /><input placeholder="Creator / studio" value={gameForm.creatorName} onChange={(e) => setGameForm({ ...gameForm, creatorName: e.target.value })} /><input placeholder="Genre" value={gameForm.genre} onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })} /><input placeholder="Thumbnail URL (direct image)" type="url" value={gameForm.thumbnailUrl} onChange={(e) => setGameForm({ ...gameForm, thumbnailUrl: e.target.value })} /><input placeholder="Playable Game URL" type="url" value={gameForm.gameUrl} onChange={(e) => setGameForm({ ...gameForm, gameUrl: e.target.value })} /><input placeholder="Google Play URL" type="url" value={gameForm.androidStoreUrl} onChange={(e) => setGameForm({ ...gameForm, androidStoreUrl: e.target.value })} /><input placeholder="App Store URL" type="url" value={gameForm.iosStoreUrl} onChange={(e) => setGameForm({ ...gameForm, iosStoreUrl: e.target.value })} /><input placeholder="Android package name" value={gameForm.packageName} onChange={(e) => setGameForm({ ...gameForm, packageName: e.target.value })} /><input placeholder="Reward per minute" type="number" min="0" step="0.01" value={gameForm.rewardPerMinute} onChange={(e) => setGameForm({ ...gameForm, rewardPerMinute: e.target.value })} /><input placeholder="Description" value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} /><button className="refresh" onClick={createGame}>Create game offer</button></div>
          <div id="reward-management" className="panel-title"><div><p className="eyebrow">REWARD MANAGEMENT</p><h2>Games and milestones</h2></div><span>{games.length} games</span></div>
          <div className="game-controls"><select value={selectedGameId ?? ""} onChange={(event) => setSelectedGameId(Number(event.target.value))}><option value="">Select a game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title}</option>)}</select><span>{selectedGameId ? "Configure reward schedule" : "Choose a game to manage milestones"}</span></div>
          {selectedGameId && <><div className="milestone-form"><input type="number" min="1" value={milestoneForm.level} onChange={(event) => setMilestoneForm({ ...milestoneForm, level: event.target.value })} placeholder="Level" /><input value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} placeholder="Milestone title" /><input type="number" min="0" step="0.01" value={milestoneForm.rewardAmount} onChange={(event) => setMilestoneForm({ ...milestoneForm, rewardAmount: event.target.value })} placeholder="Reward" /><input value={milestoneForm.currency} onChange={(event) => setMilestoneForm({ ...milestoneForm, currency: event.target.value.toUpperCase() })} placeholder="Currency" /><input value={milestoneForm.countryCode} onChange={(event) => setMilestoneForm({ ...milestoneForm, countryCode: event.target.value.toUpperCase() })} placeholder="Country" /><button className="refresh" onClick={createMilestone}>Add milestone</button></div><div className="milestone-list">{milestones.map((milestone) => <div className="milestone" key={milestone.id}><strong>Level {milestone.level}</strong><span>{milestone.title}</span><b>{milestone.currency} {milestone.rewardAmount.toFixed(2)}</b><small>{milestone.countryCode}</small></div>)}</div></>}
        </section>
        <section className="panel">
          <div className="panel-title"><div><p className="eyebrow">ACCOUNT MANAGEMENT</p><h2>Users</h2></div><span>{loading ? "Updating…" : `${users.length} records`}</span></div>
          <div className="table-wrap"><table><thead><tr><th>User</th><th>Country</th><th>Balance</th><th>Games played</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map((account) => <tr key={account.id}><td><strong>{account.username}</strong><small>{account.email}</small></td><td><strong>{account.countryCode ?? "Not set"}</strong><small>{account.countryCode ? "Profile country" : "Awaiting player preference"}</small></td><td>${account.balance.toFixed(2)}</td><td>{account.gamesPlayed}</td><td><span className={account.bannedAt ? "status banned" : "status active"}>{account.bannedAt ? "Banned" : "Active"}</span></td><td>{account.bannedAt ? <button className="action unban" onClick={() => unbanUser(account.id)}>Unban</button> : <button className="action ban" onClick={() => banUser(account.id)}>Ban</button>}</td></tr>)}</tbody></table></div>
        </section>
        <section id="user-communication" className="panel">
          <div className="panel-title"><div><p className="eyebrow">USER COMMUNICATION</p><h2>Message a user</h2></div><span>Delivered to the player bell</span></div>
          <div className="upload-grid">
            <select value={messageUserId} onChange={(event) => setMessageUserId(event.target.value)}><option value="">Select a user</option>{users.map((account) => <option key={account.id} value={account.id}>{account.username} · {account.email}</option>)}</select>
            <input placeholder="Notification title" value={messageTitle} onChange={(event) => setMessageTitle(event.target.value)} />
            <textarea placeholder="Write a message for this user" value={messageBody} onChange={(event) => setMessageBody(event.target.value)} rows={4} />
            <button className="refresh" onClick={() => void sendMessage()}>Send notification</button>
          </div>
          {messageStatus && <div className={messageStatus.startsWith("Message sent") ? "success" : "error"}>{messageStatus}</div>}
        </section>
        <section id="support-inbox" className="panel"><div className="panel-title"><div><p className="eyebrow">PLAYER SUPPORT</p><h2>Support inbox</h2></div><span>{supportMessages.filter((message) => message.status === "open").length} open</span></div><p className="helper">Players send messages from their profile. Read them here, then reply using the existing Message a user notification form above.</p><div className="withdrawal-list">{supportMessages.length ? supportMessages.map((message) => <article className="withdrawal-card" key={message.id}><div><strong>{message.subject}</strong><small>{message.user?.username || "Player"} · {message.user?.email || ""} · {new Date(message.createdAt).toLocaleString()}</small><p>{message.message}</p><small>Status: {message.status}</small></div><div className="withdrawal-actions">{message.status === "open" && <button className="refresh" onClick={() => void markSupportRead(message.id)}>Mark read</button>}{message.status !== "closed" && <button className="action" onClick={() => { setMessageUserId(String(message.userId)); setMessageTitle(`Re: ${message.subject}`); document.getElementById("user-communication")?.scrollIntoView({ behavior: "smooth" }); }}>Reply above</button>}</div></article>) : <p className="empty">No player support messages yet.</p>}</div></section>
        <section className="next"><h2>Admin modules</h2><div><a className="module-link" href="#offer-management">Game uploads and store links</a><a className="module-link" href="#reward-management">Milestone reward schedules</a><a className="module-link" href="#wallet-review">Wallet and payout review</a><a className="module-link module-placeholder-link" href="#audit-log">Audit log <small>Coming soon</small></a></div></section>
        <section id="wallet-review" className="panel"><div className="panel-title"><div><p className="eyebrow">WALLET AND PAYOUT REVIEW</p><h2>Manual withdrawal queue</h2></div><span>{withdrawals.length} requests</span></div><p className="helper">Review each request, manually send the payout outside Rockcity, then mark it paid. Rockcity never sends funds automatically.</p><div className="withdrawal-list">{withdrawals.length ? withdrawals.map((item) => <article className="withdrawal-card" key={item.id}><div><strong>{item.user.username}</strong><small>{item.user.email} · {item.user.countryCode || "Country not set"}</small><p><strong>{item.currencyCode} {Number(item.amount).toFixed(2)}</strong> · {item.payoutProfile.method} · {item.payoutProfile.maskedDetails}</p><div className="payout-details"><small>Account details for manual payout:</small>{Object.entries(item.payoutProfile.details || {}).filter(([, value]) => value).map(([key, value]) => <span key={key}><b>{key.replace(/([A-Z])/g, " $1")}: </b>{value}</span>)}</div><small>{new Date(item.createdAt).toLocaleString()} · {item.status}</small></div><div className="withdrawal-actions">{item.status === "pending" && <button className="refresh" onClick={() => void updateWithdrawalStatus(item.id, "approved")}>Approve</button>}{item.status === "approved" && <button className="refresh" onClick={() => void updateWithdrawalStatus(item.id, "paid")}>Mark paid</button>}{["pending", "approved"].includes(item.status) && <><button className="action" onClick={() => void updateWithdrawalStatus(item.id, "needs_correction")}>Needs correction</button><button className="action ban" onClick={() => void updateWithdrawalStatus(item.id, "rejected")}>Reject</button></>}</div></article>) : <p className="empty">No withdrawal requests yet.</p>}</div></section>
        <section id="audit-log" className="panel module-placeholder"><p className="eyebrow">AUDIT LOG</p><h2>Audit log module</h2><p>This admin destination is reserved for immutable activity history. It is not active yet.</p></section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return <article className="metric"><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></article>;
}
