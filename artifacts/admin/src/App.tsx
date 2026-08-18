import { useAdminAuth, startAdminLogin } from "./admin-auth";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Activity, Ban, BrainCircuit, ChevronLeft, ChevronRight, Gamepad2, LogOut, MessageSquare, Plus, Search, Send, ShieldCheck, Users, X } from "lucide-react";
import { adminFetch } from "./main";
import { appendIntelligenceExchange, canSendIntelligenceMessage, isOwnerOnlyObservationMode } from "./intelligence";

type Overview = { users: number; games: number; activeSessions: number; bannedUsers: number };
type AdminGame = { id: number; title: string; genre: string; storeUrl: string; gameUrl: string; thumbnailUrl: string; playCount: number };
type AuditArtifact = { id: number; gameId: number; artifactType: string; label: string; sourceUrl: string | null; mimeType: string | null; byteSize: number | null; scanStatus: "registered" | "scanned" | "unsupported" | "failed"; scanEvidence?: { scannedBytes?: number; truncated?: boolean; detectedFormats?: string[]; adSignals?: string[]; progressionSignals?: string[]; placementHints?: string[]; warnings?: string[] } | null; scannedAt: string | null };
type Milestone = { id: number; level: number; title: string; objectiveType: "level" | "unlock" | "merge" | "stage" | "custom"; rewardAmount: number; currency: string; countryCode: string; isActive: boolean };
type Withdrawal = { id: number; userId: number; amount: number; currencyCode: string; status: string; reviewNote: string | null; createdAt: string; user: { username: string; email: string; countryCode: string | null }; payoutProfile: { method: string; label: string; maskedDetails: string; details: Record<string, string> } };
type SupportMessage = { id: number; userId: number; subject: string; message: string; status: string; createdAt: string; readAt: string | null; user?: { username: string; email: string; countryCode: string | null } };
type ActiveSession = { id: number; userId: number; username: string; email: string; gameId: number; gameTitle: string; startedAt: string };
type IntelligenceSignal = { code: string; severity: "info" | "review"; confidence: "high" | "medium"; subject: string; evidence: string; reviewStatus: "needs-owner-review" };
type IntelligenceSummary = { generatedAt: string; ownerOnly: boolean; automaticRestrictions: boolean; users: number; activeLast24Hours: number; inactiveAtLeast12Hours: number; optedOutOfNotifications: number; reengagementRemindersCreated: number; reviewNote: string; signals?: IntelligenceSignal[] };
type IntelligenceAnswer = { question: string; answer: string; ownerOnly: boolean; automaticRestrictions: boolean };
type IntelligenceConversation = { id: number; title: string; createdAt: string; updatedAt: string };
type IntelligenceChatMessage = { id: number; conversationId: number; role: "user" | "assistant"; content: string; createdAt: string };
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
  const [milestoneForm, setMilestoneForm] = useState({ level: "1", objectiveType: "custom", title: "", rewardAmount: "0.10", currency: "USD", countryCode: "US" });
  const [gameForm, setGameForm] = useState({ title: "", description: "", genre: "Arcade", storeUrl: "", creatorName: "Rockcity Studio", rewardPerMinute: "" });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageUserId, setMessageUserId] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageStatus, setMessageStatus] = useState("");
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [operationPanel, setOperationPanel] = useState<"players" | "games" | "active" | "banned" | null>(null);
  const [milestoneWorkspaceOpen, setMilestoneWorkspaceOpen] = useState(false);
  const [intelligence, setIntelligence] = useState<IntelligenceSummary | null>(null);
  const [intelligenceConversations, setIntelligenceConversations] = useState<IntelligenceConversation[]>([]);
  const [selectedIntelligenceConversationId, setSelectedIntelligenceConversationId] = useState<number | null>(null);
  const [selectedAuditGameId, setSelectedAuditGameId] = useState<number | null>(null);
  const [intelligenceMessages, setIntelligenceMessages] = useState<IntelligenceChatMessage[]>([]);
  const [intelligenceQuestion, setIntelligenceQuestion] = useState("");
  const [intelligenceAnswer, setIntelligenceAnswer] = useState<IntelligenceAnswer | null>(null);
  const [intelligenceLoading, setIntelligenceLoading] = useState(false);
  const [intelligenceHistoryLoading, setIntelligenceHistoryLoading] = useState(false);
  const [intelligenceHistoryOpen, setIntelligenceHistoryOpen] = useState(true);
  const [auditArtifacts, setAuditArtifacts] = useState<AuditArtifact[]>([]);
  const [auditArtifactFile, setAuditArtifactFile] = useState<File | null>(null);
  const [auditArtifactLabel, setAuditArtifactLabel] = useState("");
  const [auditArtifactLoading, setAuditArtifactLoading] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextOverview, nextUsers, nextGames, nextWithdrawals, nextSupport, nextActiveSessions, nextIntelligence] = await Promise.all([
        adminFetch<Overview>("/api/admin/overview"),
        adminFetch<AdminUser[]>("/api/admin/users"),
        adminFetch<AdminGame[]>("/api/games"),
        adminFetch<Withdrawal[]>("/api/admin/withdrawals"),
        adminFetch<{ messages: SupportMessage[] }>("/api/admin/support/messages"),
        adminFetch<ActiveSession[]>("/api/admin/active-sessions"),
        adminFetch<IntelligenceSummary>("/api/admin/intelligence/summary"),
      ]);
      setOverview(nextOverview);
      const safeUsers = Array.isArray(nextUsers) ? nextUsers : [];
      const safeGames = Array.isArray(nextGames) ? nextGames : [];
      const safeWithdrawals = Array.isArray(nextWithdrawals) ? nextWithdrawals : [];
      const safeSupportMessages = Array.isArray(nextSupport?.messages) ? nextSupport.messages : [];
      const safeActiveSessions = Array.isArray(nextActiveSessions) ? nextActiveSessions : [];
      setUsers(safeUsers);
      setGames(safeGames);
      setWithdrawals(safeWithdrawals);
      setSupportMessages(safeSupportMessages);
      setActiveSessions(safeActiveSessions);
      setIntelligence(nextIntelligence);
      setSelectedGameId((current) => current ?? safeGames[0]?.id ?? null);
      setSelectedAuditGameId((current) => current ?? safeGames[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIntelligenceConversations = useCallback(async () => {
    setIntelligenceHistoryLoading(true);
    try {
      const conversations = await adminFetch<IntelligenceConversation[]>("/api/admin/intelligence/conversations");
      const safeConversations = Array.isArray(conversations) ? conversations : [];
      setIntelligenceConversations(safeConversations);
      setSelectedIntelligenceConversationId((current) => current ?? safeConversations[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Intelligence history");
    } finally {
      setIntelligenceHistoryLoading(false);
    }
  }, []);

  const createIntelligenceConversation = async () => {
    try {
      const conversation = await adminFetch<IntelligenceConversation>("/api/admin/intelligence/conversations", { method: "POST", body: JSON.stringify({ title: "New conversation" }) });
      setIntelligenceConversations((current) => [conversation, ...current]);
      setSelectedIntelligenceConversationId(conversation.id);
      setIntelligenceMessages([]);
      setIntelligenceAnswer(null);
      setIntelligenceQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start an Intelligence conversation");
    }
  };

  const loadIntelligenceMessages = useCallback(async (conversationId: number) => {
    setIntelligenceHistoryLoading(true);
    try {
      const payload = await adminFetch<{ conversation: IntelligenceConversation; messages: IntelligenceChatMessage[] }>(`/api/admin/intelligence/conversations/${conversationId}/messages`);
      setIntelligenceMessages(Array.isArray(payload.messages) ? payload.messages : []);
      setIntelligenceAnswer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Intelligence conversation");
    } finally {
      setIntelligenceHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      loadAdminData();
      loadIntelligenceConversations();
    }
  }, [isSignedIn, loadAdminData, loadIntelligenceConversations]);

  useEffect(() => {
    if (selectedIntelligenceConversationId && isSignedIn) void loadIntelligenceMessages(selectedIntelligenceConversationId);
  }, [isSignedIn, selectedIntelligenceConversationId, loadIntelligenceMessages]);

  useEffect(() => {
    if (!selectedGameId || !isSignedIn) return;
    adminFetch<Milestone[] | { milestones?: Milestone[] } | null>(`/api/admin/games/${selectedGameId}/milestones`)
      .then((payload) => {
        const nextMilestones = Array.isArray(payload) ? payload : payload && Array.isArray(payload.milestones) ? payload.milestones : [];
        setMilestones(nextMilestones);
      })
      .catch((err) => {
        setMilestones([]);
        setError(err instanceof Error ? err.message : "Unable to load milestones");
      });
  }, [isSignedIn, selectedGameId]);

  useEffect(() => {
    if (!selectedAuditGameId || !isSignedIn) { setAuditArtifacts([]); return; }
    adminFetch<AuditArtifact[]>(`/api/admin/intelligence/games/${selectedAuditGameId}/artifacts`)
      .then((payload) => setAuditArtifacts(Array.isArray(payload) ? payload : []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load audit artifacts"));
  }, [isSignedIn, selectedAuditGameId]);

  if (!isLoaded) return <div className="loading">Loading admin session…</div>;
  if (!isSignedIn) return <><SignInGate />{authError && <div className="error">{authError}<button className="action" onClick={() => void reloadAuth()}>Retry</button></div>}</>;

  const selectedIntelligenceConversation = intelligenceConversations.find((conversation) => conversation.id === selectedIntelligenceConversationId);

  const uploadAuditArtifact = async () => {
    if (!selectedAuditGameId || !auditArtifactFile) return;
    setAuditArtifactLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("artifact", auditArtifactFile);
      form.append("artifactType", "source");
      form.append("label", auditArtifactLabel.trim() || auditArtifactFile.name);
      const created = await adminFetch<AuditArtifact>(`/api/admin/intelligence/games/${selectedAuditGameId}/artifacts`, { method: "POST", body: form });
      setAuditArtifacts((current) => [created, ...current]);
      setAuditArtifactFile(null);
      setAuditArtifactLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload audit artifact");
    } finally {
      setAuditArtifactLoading(false);
    }
  };

  const scanAuditArtifact = async (artifact: AuditArtifact) => {
    if (!selectedAuditGameId) return;
    setAuditArtifactLoading(true);
    setError("");
    try {
      const result = await adminFetch<{ status: AuditArtifact["scanStatus"]; evidence: AuditArtifact["scanEvidence"] }>(`/api/admin/intelligence/games/${selectedAuditGameId}/artifacts/${artifact.id}/scan`, { method: "POST" });
      setAuditArtifacts((current) => current.map((item) => item.id === artifact.id ? { ...item, scanStatus: result.status, scanEvidence: result.evidence, scannedAt: new Date().toISOString() } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to scan audit artifact");
    } finally {
      setAuditArtifactLoading(false);
    }
  };

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

  const askIntelligence = async () => {
    const question = intelligenceQuestion.trim();
    if (!question || !selectedIntelligenceConversationId) return;
    setIntelligenceLoading(true);
    setError("");
    try {
      const answer = await adminFetch<IntelligenceAnswer>(`/api/admin/intelligence/conversations/${selectedIntelligenceConversationId}/messages`, { method: "POST", body: JSON.stringify({ question, gameId: selectedAuditGameId ?? undefined }) });
      const now = new Date().toISOString();
      setIntelligenceMessages((current) => appendIntelligenceExchange(current, question, answer.answer, (role, content) => ({ id: Date.now() + Math.random(), conversationId: selectedIntelligenceConversationId, role, content, createdAt: now })));
      setIntelligenceAnswer(answer);
      setIntelligenceQuestion("");
      await loadIntelligenceConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to ask Rockcity Intelligence");
    } finally {
      setIntelligenceLoading(false);
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
    setError("");
    const reward = Number(gameForm.rewardPerMinute);
    if (!gameForm.title.trim() || !gameForm.description.trim() || !gameForm.storeUrl.trim() || !Number.isFinite(reward) || reward <= 0) {
      setError("Enter the game name, description, Store URL, and a reward per minute greater than zero.");
      return;
    }
    if (!coverImage) {
      setError("Choose a cover image before creating the game offer.");
      return;
    }
    try {
      const payload = new FormData();
      payload.append("title", gameForm.title);
      payload.append("description", gameForm.description);
      payload.append("genre", gameForm.genre);
      payload.append("storeUrl", gameForm.storeUrl);
      payload.append("creatorName", gameForm.creatorName);
      payload.append("rewardPerMinute", gameForm.rewardPerMinute);
      payload.append("coverImage", coverImage);
      const created = await adminFetch<AdminGame>("/api/games", { method: "POST", body: payload });
      if (!created || !Number.isInteger(Number(created.id))) throw new Error("The server returned an invalid game offer response");
      setGames((current) => [created, ...current]);
      setGameForm((current) => ({ ...current, title: "", description: "", storeUrl: "", rewardPerMinute: "" }));
      setCoverImage(null);
      const input = document.getElementById("game-cover-image") as HTMLInputElement | null;
      if (input) input.value = "";
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
      const refreshed = await adminFetch<Milestone[] | { milestones?: Milestone[] } | null>(`/api/admin/games/${selectedGameId}/milestones`);
      const nextMilestones = Array.isArray(refreshed) ? refreshed : refreshed && Array.isArray(refreshed.milestones) ? refreshed.milestones : [];
      setMilestones(nextMilestones);
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

  const deleteGame = async (game: AdminGame) => {
    if (!window.confirm(`Delete ${game.title}? This removes the uploaded offer from Rockcity.`)) return;
    try {
      await adminFetch(`/api/games/${game.id}`, { method: "DELETE" });
      setGames((current) => current.filter((item) => item.id !== game.id));
      if (selectedGameId === game.id) setSelectedGameId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete game");
    }
  };

  const unbanUser = async (id: number) => {
    try {
      await adminFetch(`/api/admin/users/${id}/unban`, { method: "PATCH" });
      await loadAdminData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unban user");
    }
  };

  const selectedGame = games.find((game) => game.id === selectedGameId);
  const visibleUsers = operationPanel === "banned" ? users.filter((account) => account.bannedAt) : users;

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
          <Metric icon={<Users />} label="Players" value={overview?.users ?? "—"} onClick={() => setOperationPanel("players")} />
          <Metric icon={<Gamepad2 />} label="Games" value={overview?.games ?? "—"} onClick={() => setOperationPanel("games")} />
          <Metric icon={<Activity />} label="Active sessions" value={overview?.activeSessions ?? "—"} onClick={() => setOperationPanel("active")} />
          <Metric icon={<Ban />} label="Banned accounts" value={overview?.bannedUsers ?? "—"} onClick={() => setOperationPanel("banned")} />
        </section>
        <section id="intelligence" className="panel intelligence-panel">
          <div className="panel-title"><div><p className="eyebrow">OWNER-ONLY INTELLIGENCE</p><h2><BrainCircuit size={22} /> Rockcity Intelligence</h2></div><span>{isOwnerOnlyObservationMode(intelligence) ? "Observation mode" : "Loading signals…"}</span></div>
          <div className="intelligence-body">
            <div className="intelligence-banner"><div className="intelligence-icon"><BrainCircuit /></div><div><strong>Quiet monitoring for owner review</strong><p>{intelligence?.reviewNote || "Loading activity observations from the Rockcity backend."}</p></div></div>
            <div className="intelligence-metrics"><Metric icon={<Users />} label="Players tracked" value={intelligence?.users ?? "—"} onClick={() => {}} /><Metric icon={<Activity />} label="Active in 24 hours" value={intelligence?.activeLast24Hours ?? "—"} onClick={() => {}} /><Metric icon={<Search />} label="Inactive 12+ hours" value={intelligence?.inactiveAtLeast12Hours ?? "—"} onClick={() => {}} /><Metric icon={<ShieldCheck />} label="Reminders created" value={intelligence?.reengagementRemindersCreated ?? "—"} onClick={() => {}} /></div>
            <div className="intelligence-signals"><div className="intelligence-signals-head"><div><span className="eyebrow">EVIDENCE QUEUE</span><strong>Signals for owner review</strong></div><span>{intelligence?.signals?.length ?? 0} observations</span></div>{intelligence?.signals?.length ? <div className="intelligence-signal-list">{intelligence.signals.slice(0, 12).map((signal, index) => <article className={`intelligence-signal ${signal.severity}`} key={`${signal.code}-${signal.subject}-${index}`}><div><strong>{signal.subject}</strong><small>{signal.code.replaceAll("-", " ")} · {signal.confidence} confidence</small></div><p>{signal.evidence}</p><span>Owner review</span></article>)}</div> : <p className="empty">No deterministic observations require review right now.</p>}</div>
            <div className="intelligence-signals artifact-workspace"><div className="intelligence-signals-head"><div><span className="eyebrow">AUTHORIZED ARTIFACTS</span><strong>Inspect source or manifests</strong><small>Bounded inspection only. Uploaded source and safe archive text can be scanned; APK/IPA code is never executed.</small></div><span>{auditArtifacts.length} registered</span></div><div className="artifact-upload-row"><select aria-label="Artifact game" value={selectedAuditGameId ?? ""} onChange={(event) => setSelectedAuditGameId(event.target.value ? Number(event.target.value) : null)}><option value="">Select a game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title}</option>)}</select><input aria-label="Artifact label" placeholder="Artifact label" value={auditArtifactLabel} onChange={(event) => setAuditArtifactLabel(event.target.value)} /><input aria-label="Artifact file" type="file" accept=".json,.js,.ts,.tsx,.jsx,.xml,.yaml,.yml,.gradle,.properties,.txt,.html,.css,.kt,.java,.cs,.md,.zip,.apk,.aab,application/json,text/plain,application/zip,application/vnd.android.package-archive,application/octet-stream" onChange={(event) => setAuditArtifactFile(event.target.files?.[0] ?? null)} /><button className="refresh" onClick={() => void uploadAuditArtifact()} disabled={!selectedAuditGameId || !auditArtifactFile || auditArtifactLoading}>{auditArtifactLoading ? "Working…" : "Upload artifact"}</button></div>{auditArtifacts.length ? <div className="intelligence-signal-list">{auditArtifacts.map((artifact) => { const evidence = artifact.scanEvidence; return <article className="intelligence-signal" key={artifact.id}><div><strong>{artifact.label}</strong><small>{artifact.scanStatus} · {artifact.mimeType || "source URL"}{artifact.scannedAt ? ` · ${new Date(artifact.scannedAt).toLocaleString()}` : ""}</small></div>{evidence ? <p>{[evidence.detectedFormats?.length ? `Formats: ${evidence.detectedFormats.join(", ")}` : "", evidence.adSignals?.length ? `Ads: ${evidence.adSignals.join(" | ")}` : "", evidence.placementHints?.length ? `Placement hints: ${evidence.placementHints.join(" | ")}` : "", evidence.progressionSignals?.length ? `Progression: ${evidence.progressionSignals.join(" | ")}` : "", ...(evidence.warnings || [])].filter(Boolean).join("\n") || "No supported signals found in the inspected text."}</p> : <p>Not scanned yet. Start a bounded inspection to produce evidence.</p>}<div className="artifact-actions"><button className="action" onClick={() => void scanAuditArtifact(artifact)} disabled={auditArtifactLoading || artifact.scanStatus === "scanned"}>Scan text</button><span>Owner review only · no automatic enforcement</span></div></article>; })}</div> : <p className="empty">No artifacts supplied for this game.</p>}</div>
            <div className="intelligence-chat-shell">
              <aside className={`intelligence-history ${intelligenceHistoryOpen ? "is-open" : "is-collapsed"}`} aria-label="Intelligence conversations">
                <div className="intelligence-history-head"><strong>Conversations</strong><button className="icon-button" onClick={() => void createIntelligenceConversation()} aria-label="Start a new conversation"><Plus size={16} /></button></div>
                {intelligenceHistoryOpen && <div className="intelligence-history-list">{intelligenceHistoryLoading && !intelligenceConversations.length ? <span className="empty">Loading history…</span> : intelligenceConversations.length ? intelligenceConversations.map((conversation) => <button className={`intelligence-history-item ${conversation.id === selectedIntelligenceConversationId ? "selected" : ""}`} key={conversation.id} onClick={() => setSelectedIntelligenceConversationId(conversation.id)}><MessageSquare size={15} /><span>{conversation.title}</span></button>) : <span className="empty">No conversations yet.</span>}</div>}
                <button className="intelligence-history-toggle" onClick={() => setIntelligenceHistoryOpen((open) => !open)}>{intelligenceHistoryOpen ? <><ChevronLeft size={14} /> Hide history</> : <><ChevronRight size={14} /> Show history</>}</button>
              </aside>
              <div className="intelligence-chat-main">
                <div className="intelligence-chat-head"><div><span className="eyebrow">AI ASSISTANT</span><strong>{selectedIntelligenceConversation?.title || "Start a conversation"}</strong></div><button className="refresh compact-refresh" onClick={() => void createIntelligenceConversation()}><Plus size={15} /> New chat</button></div>
                <div className="intelligence-messages" aria-live="polite">{intelligenceMessages.length ? intelligenceMessages.map((message) => <article className={`intelligence-message ${message.role}`} key={message.id}><span>{message.role === "assistant" ? "Rockcity Intelligence" : "You"}</span><p>{message.content}</p></article>) : <div className="intelligence-empty-chat"><BrainCircuit size={28} /><strong>Ask anything about Rockcity activity</strong><p>Try: “Which players have unusual activity this week?” or “Summarise inactive users and what I should review.”</p></div>}</div>
                <div className="intelligence-composer"><label className="intelligence-audit-context">Audit context<select aria-label="Game audit context" value={selectedAuditGameId ?? ""} onChange={(event) => setSelectedAuditGameId(event.target.value ? Number(event.target.value) : null)}><option value="">All Rockcity platform data</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title} · metadata and bounded artifact evidence</option>)}</select></label><textarea id="intelligence-question" aria-label="Ask Rockcity Intelligence" placeholder="Describe the task or ask a question" value={intelligenceQuestion} maxLength={1200} onChange={(event) => setIntelligenceQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void askIntelligence(); } }} /><div className="intelligence-composer-foot"><small>Enter to send · Shift+Enter for a new line</small><button className="send-button" onClick={() => void askIntelligence()} disabled={!canSendIntelligenceMessage(intelligenceQuestion, selectedIntelligenceConversationId, intelligenceLoading)} aria-label="Send question">{intelligenceLoading ? "…" : <Send size={16} />}</button></div></div>
              </div>
            </div>
            {intelligenceAnswer && <div className="intelligence-answer"><span>Latest analysis</span><p>{intelligenceAnswer.answer}</p><small>Owner-only observation. Automatic bans, restrictions, payout holds, and balance changes are disabled.</small></div>}
          </div>
        </section>
        {operationPanel && <section className="detail-panel panel"><div className="panel-title"><div><p className="eyebrow">PLATFORM DETAIL</p><h2>{operationPanel === "players" ? "Registered players" : operationPanel === "games" ? "Uploaded games" : operationPanel === "active" ? "Active sessions" : "Banned accounts"}</h2></div><button className="icon-button" onClick={() => setOperationPanel(null)} aria-label="Close detail"><X size={18} /></button></div>{operationPanel === "active" ? <div className="compact-list">{activeSessions.length ? activeSessions.map((session) => <article className="compact-row" key={session.id}><div><strong>{session.username}</strong><small>{session.email} · {session.gameTitle}</small></div><span>Started {new Date(session.startedAt).toLocaleString()}</span></article>) : <p className="empty">No users are currently playing.</p>}</div> : operationPanel === "games" ? <div className="compact-list">{games.length ? games.map((game) => <article className="compact-row" key={game.id}><div><strong>{game.title}</strong><small>{game.genre} · {game.storeUrl || "No Store URL"}</small></div><button className="action ban" onClick={() => void deleteGame(game)}>Delete</button></article>) : <p className="empty">No uploaded games yet.</p>}</div> : <div className="compact-list">{visibleUsers.length ? visibleUsers.map((account) => <article className="compact-row" key={account.id}><div><strong>{account.username}</strong><small>{account.email} · {account.countryCode || "Country not set"}</small></div>{account.bannedAt ? <button className="action unban" onClick={() => void unbanUser(account.id)}>Unban</button> : <button className="action ban" onClick={() => void banUser(account.id)}>Ban</button>}</article>) : <p className="empty">No accounts in this view.</p>}</div>}</section>}
        <section id="offer-management" className="panel game-panel">
          <div className="panel-title"><div><p className="eyebrow">OFFER MANAGEMENT</p><h2>Upload a game offer</h2></div><span>Store-link APK flow</span></div>
          <div className="upload-grid"><input placeholder="Game title" value={gameForm.title} onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })} /><input placeholder="Creator / studio" value={gameForm.creatorName} onChange={(e) => setGameForm({ ...gameForm, creatorName: e.target.value })} /><input placeholder="Genre" value={gameForm.genre} onChange={(e) => setGameForm({ ...gameForm, genre: e.target.value })} /><label className="file-field">Cover image<input id="game-cover-image" type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} /></label><input placeholder="Store URL (Huawei, Google Play, App Store, etc.)" type="url" value={gameForm.storeUrl} onChange={(e) => setGameForm({ ...gameForm, storeUrl: e.target.value })} /><input placeholder="Reward per minute (required)" type="number" min="0.01" step="0.01" required value={gameForm.rewardPerMinute} onChange={(e) => setGameForm({ ...gameForm, rewardPerMinute: e.target.value })} /><textarea placeholder="Description" value={gameForm.description} onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })} rows={3} /><button className="refresh" onClick={() => void createGame()}>Create game offer</button></div>
          <div id="reward-management" className="panel-title"><div><p className="eyebrow">REWARD MANAGEMENT</p><h2>Games and milestones</h2><p className="helper">Keep the dashboard compact; manage the full reward schedule only when needed.</p></div><span>{games.length} games</span></div>
          <div className="game-controls"><select value={selectedGameId ?? ""} onChange={(event) => setSelectedGameId(Number(event.target.value))}><option value="">Select a game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.title}</option>)}</select>{selectedGameId && <><span>{selectedGame ? `${selectedGame.title} · ${milestones.length} milestones configured` : "Configure reward schedule"}</span><button className="refresh" onClick={() => setMilestoneWorkspaceOpen(true)}>Manage milestones <ChevronRight size={15} /></button></>}</div>
          {milestoneWorkspaceOpen && selectedGameId && <div className="workspace"><div className="workspace-head"><div><p className="eyebrow">MILESTONE WORKSPACE</p><h3>{selectedGame?.title} reward schedule</h3><small>{milestones.length} milestones · grouped for compact administration</small></div><button className="icon-button" onClick={() => setMilestoneWorkspaceOpen(false)} aria-label="Close milestone workspace"><X size={18} /></button></div><div className="milestone-form"><input type="number" min="1" value={milestoneForm.level} onChange={(event) => setMilestoneForm({ ...milestoneForm, level: event.target.value })} placeholder="Order" /><select value={milestoneForm.objectiveType} onChange={(event) => setMilestoneForm({ ...milestoneForm, objectiveType: event.target.value })}><option value="level">Reach level</option><option value="unlock">Unlock location/item</option><option value="merge">Merge target</option><option value="stage">Complete stage</option><option value="custom">Custom objective</option></select><input value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} placeholder="Objective, e.g. Unlock the Garden" /><input type="number" min="0" step="0.01" value={milestoneForm.rewardAmount} onChange={(event) => setMilestoneForm({ ...milestoneForm, rewardAmount: event.target.value })} placeholder="Reward" /><input value={milestoneForm.currency} onChange={(event) => setMilestoneForm({ ...milestoneForm, currency: event.target.value.toUpperCase() })} placeholder="Currency" /><input value={milestoneForm.countryCode} onChange={(event) => setMilestoneForm({ ...milestoneForm, countryCode: event.target.value.toUpperCase() })} placeholder="Country" /><button className="refresh" onClick={createMilestone}>Add milestone</button></div><div className="milestone-list">{milestones.map((milestone) => <div className="milestone" key={milestone.id}><strong>{milestone.objectiveType === "level" ? `Level ${milestone.level}` : milestone.objectiveType === "unlock" ? "Unlock" : milestone.objectiveType === "merge" ? "Merge" : milestone.objectiveType === "stage" ? "Stage" : "Objective"}</strong><span>{milestone.title || `Objective ${milestone.level}`}</span><b>{milestone.currency} {Number(milestone.rewardAmount ?? 0).toFixed(2)}</b><small>{milestone.countryCode}</small></div>)}</div></div>}
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
        <section className="next"><h2>Admin modules</h2><div><a className="module-link" href="#intelligence">Rockcity Intelligence</a><a className="module-link" href="#offer-management">Game uploads and store links</a><a className="module-link" href="#reward-management">Milestone reward schedules</a><a className="module-link" href="#wallet-review">Wallet and payout review</a><a className="module-link module-placeholder-link" href="#audit-log">Audit log <small>Coming soon</small></a></div></section>
        <section id="wallet-review" className="panel"><div className="panel-title"><div><p className="eyebrow">WALLET AND PAYOUT REVIEW</p><h2>Manual withdrawal queue</h2></div><span>{withdrawals.length} requests</span></div><p className="helper">Review each request, manually send the payout outside Rockcity, then mark it paid. Rockcity never sends funds automatically.</p><div className="withdrawal-list">{withdrawals.length ? withdrawals.map((item) => <article className="withdrawal-card" key={item.id}><div><strong>{item.user.username}</strong><small>{item.user.email} · {item.user.countryCode || "Country not set"}</small><p><strong>{item.currencyCode} {Number(item.amount).toFixed(2)}</strong> · {item.payoutProfile.method} · {item.payoutProfile.maskedDetails}</p><div className="payout-details"><small>Account details for manual payout:</small>{Object.entries(item.payoutProfile.details || {}).filter(([, value]) => value).map(([key, value]) => <span key={key}><b>{key.replace(/([A-Z])/g, " $1")}: </b>{value}</span>)}</div><small>{new Date(item.createdAt).toLocaleString()} · {item.status}</small></div><div className="withdrawal-actions">{item.status === "pending" && <button className="refresh" onClick={() => void updateWithdrawalStatus(item.id, "approved")}>Approve</button>}{item.status === "approved" && <button className="refresh" onClick={() => void updateWithdrawalStatus(item.id, "paid")}>Mark paid</button>}{["pending", "approved"].includes(item.status) && <><button className="action" onClick={() => void updateWithdrawalStatus(item.id, "needs_correction")}>Needs correction</button><button className="action ban" onClick={() => void updateWithdrawalStatus(item.id, "rejected")}>Reject</button></>}</div></article>) : <p className="empty">No withdrawal requests yet.</p>}</div></section>
        <section id="audit-log" className="panel module-placeholder"><p className="eyebrow">AUDIT LOG</p><h2>Audit log module</h2><p>This admin destination is reserved for immutable activity history. It is not active yet.</p></section>
      </main>
    </div>
  );
}

function Metric({ icon, label, value, onClick }: { icon: ReactNode; label: string; value: number | string; onClick: () => void }) {
  return <button className="metric metric-button" onClick={onClick} aria-label={`Open ${label}`}><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div><ChevronRight className="metric-arrow" size={18} /></button>;
}
