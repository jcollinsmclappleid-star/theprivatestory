import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import QRCode from "qrcode";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AdminView = "moderation" | "security" | "audit" | "users";

interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
  subscriptionPlan: "free" | "monthly" | "annual" | "immersive";
  subscriptionStatus: string | null;
  addonStoriesRemaining: number;
  isBanned: boolean | null;
  createdAt: string | null;
}

interface AuditLogEntry {
  id: number;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

function UsersPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});
  const [grantLoading, setGrantLoading] = useState<string | null>(null);
  const [grantFeedback, setGrantFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const search = async () => {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/search?q=${encodeURIComponent(query.trim())}`, { credentials: "include" });
      const data = await res.json() as { users?: AdminUser[] };
      setResults(data.users ?? []);
    } finally {
      setSearching(false);
    }
  };

  const grantCredits = async (userId: string) => {
    const amount = parseInt(creditAmounts[userId] ?? "0", 10);
    if (!amount || amount < 1) return;
    setGrantLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/add-credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount }),
      });
      const data = await res.json() as { ok?: boolean; addonStoriesRemaining?: number; error?: string };
      if (data.ok) {
        setGrantFeedback(prev => ({ ...prev, [userId]: { ok: true, msg: `Done — ${data.addonStoriesRemaining} credits total` } }));
        setResults(prev => prev.map(u => u.id === userId ? { ...u, addonStoriesRemaining: data.addonStoriesRemaining ?? u.addonStoriesRemaining } : u));
        setCreditAmounts(prev => ({ ...prev, [userId]: "" }));
      } else {
        setGrantFeedback(prev => ({ ...prev, [userId]: { ok: false, msg: data.error ?? "Failed" } }));
      }
    } finally {
      setGrantLoading(null);
    }
  };

  const planBadge = (plan: string) => {
    if (plan === "monthly") return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">Monthly</span>;
    if (plan === "annual") return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">Annual</span>;
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/40">Free</span>;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
        <h2 className="font-semibold text-base mb-4">User Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search by email or name…"
            className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50"
          />
          <button
            onClick={search}
            disabled={searching || query.trim().length < 2}
            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition disabled:opacity-40"
          >
            {searching ? "…" : "Search"}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {results.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm">
            {query.length > 0 ? "No users found" : "Enter an email or name to search"}
          </div>
        )}
        {results.map((user) => (
          <div key={user.id} className="rounded-xl border border-white/10 bg-white/3 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-medium text-sm text-white truncate">{user.email ?? "(no email)"}</div>
                {user.name && <div className="text-xs text-white/40 mt-0.5">{user.name}</div>}
                <div className="flex items-center gap-2 mt-1.5">
                  {planBadge(user.subscriptionPlan)}
                  {user.isBanned && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">Banned</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-white/30">Credits</div>
                <div className="text-lg font-bold text-white/80">{user.addonStoriesRemaining}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                max="500"
                value={creditAmounts[user.id] ?? ""}
                onChange={(e) => setCreditAmounts(prev => ({ ...prev, [user.id]: e.target.value }))}
                placeholder="Credits to add"
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-400/40"
              />
              <button
                onClick={() => grantCredits(user.id)}
                disabled={grantLoading === user.id || !parseInt(creditAmounts[user.id] ?? "0")}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold hover:bg-blue-500/30 transition disabled:opacity-40"
              >
                {grantLoading === user.id ? "Adding…" : "Add Credits"}
              </button>
              {grantFeedback[user.id] && (
                <span className={`text-xs ${grantFeedback[user.id].ok ? "text-emerald-400" : "text-red-400"}`}>
                  {grantFeedback[user.id].msg}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function tabClass(active: boolean, accent?: string) {
  if (active && accent) return accent;
  if (active) return "bg-white/20 text-white";
  return "text-white/50 hover:text-white";
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>("moderation");
  const [accessDenied, setAccessDenied] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [flaggedItems, setFlaggedItems] = useState<Array<Record<string, unknown>>>([]);
  const [csamReports, setCsamReports] = useState<Array<Record<string, unknown>>>([]);
  const [userReports, setUserReports] = useState<Array<Record<string, unknown>>>([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});

  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean | null>(null);
  const [twoFaVerifiedSession, setTwoFaVerifiedSession] = useState(false);
  const [twoFaSetupStep, setTwoFaSetupStep] = useState<"idle" | "password" | "qr" | "verify" | "done">("idle");
  const [twoFaPassword, setTwoFaPassword] = useState("");
  const [twoFaTotpUri, setTwoFaTotpUri] = useState("");
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState<string[]>([]);
  const [twoFaVerifyCode, setTwoFaVerifyCode] = useState("");
  const [twoFaQrDataUrl, setTwoFaQrDataUrl] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/api/admin/2fa/status`, { credentials: "include" })
      .then(async (r) => {
        if (r.status === 403) {
          const body = await r.json().catch(() => ({}));
          if (body.code === "ADMIN_2FA_REQUIRED") {
            setActiveView("security");
          } else {
            setAccessDenied(true);
          }
          return;
        }
        if (!r.ok) {
          setAccessDenied(true);
          return;
        }
        const data = await r.json();
        setTwoFaEnabled(data.twoFactorEnabled ?? false);
        setTwoFaVerifiedSession(data.twoFactorVerifiedThisSession ?? false);
      })
      .catch(() => setAccessDenied(true))
      .finally(() => setAuthChecked(true));
  }, [user?.id]);

  const loadModeration = useCallback(async () => {
    setModerationLoading(true);
    try {
      const [flaggedRes, reportsRes, csamRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/moderation/flagged`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/reports`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/moderation/csam-reports`, { credentials: "include" }),
      ]);
      if (flaggedRes.ok) setFlaggedItems(await flaggedRes.json());
      if (reportsRes.ok) setUserReports(await reportsRes.json());
      if (csamRes.ok) setCsamReports(await csamRes.json());
    } finally {
      setModerationLoading(false);
    }
  }, []);

  const loadAuditLog = useCallback(async () => {
    setAuditLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/audit-log`, { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setAuditEntries(data.entries ?? []);
      }
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === "moderation") loadModeration();
    if (activeView === "audit") loadAuditLog();
  }, [activeView, loadModeration, loadAuditLog]);

  useEffect(() => {
    if (activeView !== "security") return;
    fetch(`${API_BASE}/api/admin/2fa/status`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setTwoFaEnabled(data.twoFactorEnabled ?? false);
        setTwoFaVerifiedSession(data.twoFactorVerifiedThisSession ?? false);
        if (data.twoFactorEnabled) setTwoFaSetupStep("done");
        else setTwoFaSetupStep("idle");
      })
      .catch(() => {});
  }, [activeView]);

  useEffect(() => {
    if (!twoFaTotpUri) { setTwoFaQrDataUrl(""); return; }
    QRCode.toDataURL(twoFaTotpUri, { margin: 1, width: 220 })
      .then(setTwoFaQrDataUrl)
      .catch(() => setTwoFaQrDataUrl(""));
  }, [twoFaTotpUri]);

  const fileReport = useCallback(async (contentBlockId: string, reportedTo: "ncmec" | "iwf" | "other") => {
    setReportingId(contentBlockId);
    try {
      await fetch(`${API_BASE}/api/admin/moderation/csam-report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentBlockId, reportedTo, notes: reportNotes[contentBlockId] ?? "" }),
      });
      await loadModeration();
    } finally {
      setReportingId(null);
    }
  }, [loadModeration, reportNotes]);

  const twoFaStartSetup = useCallback(async () => {
    setTwoFaError("");
    setTwoFaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/two-factor/enable`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: twoFaPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setTwoFaError(data.message ?? "Failed to enable 2FA."); return; }
      setTwoFaTotpUri(data.totpURI ?? "");
      setTwoFaBackupCodes(data.backupCodes ?? []);
      setTwoFaSetupStep("qr");
    } catch {
      setTwoFaError("Network error. Please try again.");
    } finally {
      setTwoFaLoading(false);
    }
  }, [twoFaPassword]);

  const twoFaVerifyEnrollment = useCallback(async () => {
    setTwoFaError("");
    setTwoFaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/two-factor/verify-totp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaVerifyCode }),
      });
      const data = await res.json();
      if (!res.ok) { setTwoFaError(data.message ?? "Invalid code. Please try again."); return; }
      setTwoFaEnabled(true);
      setTwoFaSetupStep("done");
    } catch {
      setTwoFaError("Network error. Please try again.");
    } finally {
      setTwoFaLoading(false);
    }
  }, [twoFaVerifyCode]);

  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white/50 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="text-white/60 text-sm">Sign in to access admin.</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] gap-3">
        <div className="text-white/80 text-sm font-medium">Access denied.</div>
        <div className="text-white/40 text-xs font-mono">{user.email}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <header className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <h1 className="text-base font-semibold tracking-tight mb-3">Admin</h1>
        <div className="flex gap-1 overflow-x-auto pb-1 flex-nowrap">
          <button type="button" onClick={() => setActiveView("moderation")} className={`text-xs px-2 py-1 rounded whitespace-nowrap ${tabClass(activeView === "moderation", "bg-red-500/30 text-red-300")}`}>
            Moderation
          </button>
          <a href="/admin/moderation" className="text-xs px-2 py-1 rounded whitespace-nowrap text-white/50 hover:text-white bg-orange-500/10 border border-orange-500/20">
            Reports
          </a>
          <button type="button" onClick={() => setActiveView("security")} className={`text-xs px-2 py-1 rounded whitespace-nowrap ${tabClass(activeView === "security", "bg-emerald-500/30 text-emerald-300")}`}>
            Security
          </button>
          <button type="button" onClick={() => setActiveView("audit")} className={`text-xs px-2 py-1 rounded whitespace-nowrap ${tabClass(activeView === "audit", "bg-amber-500/30 text-amber-300")}`}>
            Audit
          </button>
          <button type="button" onClick={() => setActiveView("users")} className={`text-xs px-2 py-1 rounded whitespace-nowrap ${tabClass(activeView === "users", "bg-blue-500/30 text-blue-300")}`}>
            Users
          </button>
        </div>
      </header>

      {activeView === "users" && <UsersPanel />}

      {activeView === "moderation" && (
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-6 max-w-3xl">
            {moderationLoading && <div className="text-white/40 text-xs text-center py-6">Loading…</div>}

            <section>
              <div className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-2">Flagged Content Events</div>
              {!moderationLoading && flaggedItems.length === 0 && (
                <div className="text-white/30 text-xs text-center py-4">No flagged events</div>
              )}
              {flaggedItems.map((item) => {
                const id = String(item.id ?? "");
                const alreadyReported = csamReports.some((r) => String(r.contentBlockId) === id);
                return (
                  <div key={id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2 mb-2">
                    <div className="text-xs text-white/70">{String(item.blockReason ?? item.blockSource ?? "Unknown reason")}</div>
                    <div className="text-[10px] text-white/30 font-mono">ID: {id}</div>
                    {!alreadyReported && (
                      <div className="flex gap-1">
                        <button type="button" onClick={() => fileReport(id, "ncmec")} disabled={reportingId === id} className="text-[10px] px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50">
                          Report to NCMEC
                        </button>
                        <button type="button" onClick={() => fileReport(id, "iwf")} disabled={reportingId === id} className="text-[10px] px-2 py-1 rounded bg-orange-700 hover:bg-orange-600 text-white disabled:opacity-50">
                          Report to IWF
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            <section>
              <div className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">User-Submitted Reports</div>
              {!moderationLoading && userReports.length === 0 && (
                <div className="text-white/30 text-xs text-center py-4">No user reports</div>
              )}
              {userReports.map((r) => (
                <div key={String(r.id)} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 mb-2 text-xs text-white/70">
                  #{String(r.id)} · {String(r.category ?? "unknown")}
                  {r.notes ? <div className="mt-1 text-white/50">{String(r.notes)}</div> : null}
                </div>
              ))}
            </section>

            <button type="button" onClick={loadModeration} className="w-full text-xs text-white/40 hover:text-white py-2 border border-white/10 rounded-lg">
              ↺ Refresh
            </button>
          </div>
        </ScrollArea>
      )}

      {activeView === "security" && (
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 max-w-md mx-auto space-y-4">
            <div className={`rounded-xl p-3 flex items-center gap-3 ${twoFaEnabled ? "bg-emerald-900/30 border border-emerald-500/30" : "bg-amber-900/30 border border-amber-500/30"}`}>
              <span className="text-xl">{twoFaEnabled ? "✅" : "⚠️"}</span>
              <div>
                <div className={`text-sm font-semibold ${twoFaEnabled ? "text-emerald-200" : "text-amber-200"}`}>
                  {twoFaEnabled ? "Two-factor authentication is enabled" : "Two-factor authentication is not set up"}
                </div>
                <div className="text-xs text-white/50 mt-0.5">
                  {twoFaEnabled
                    ? twoFaVerifiedSession
                      ? "This session was verified via TOTP."
                      : "Log out and sign in with your authenticator app to fully access admin routes."
                    : "Set up an authenticator app to protect your admin account."}
                </div>
              </div>
            </div>

            {twoFaSetupStep === "idle" && !twoFaEnabled && (
              <button type="button" onClick={() => setTwoFaSetupStep("password")} className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold">
                Set up 2FA →
              </button>
            )}

            {twoFaSetupStep === "password" && (
              <div className="space-y-3">
                <input
                  type="password"
                  value={twoFaPassword}
                  onChange={(e) => setTwoFaPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full rounded-xl bg-white/10 border border-white/10 text-sm text-white px-4 py-2.5 placeholder-white/30 focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => { if (e.key === "Enter") twoFaStartSetup(); }}
                />
                {twoFaError && <div className="text-red-400 text-xs">{twoFaError}</div>}
                <button type="button" onClick={twoFaStartSetup} disabled={twoFaLoading || !twoFaPassword} className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">
                  {twoFaLoading ? "…" : "Continue"}
                </button>
              </div>
            )}

            {twoFaSetupStep === "qr" && twoFaTotpUri && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-xl">
                    {twoFaQrDataUrl ? (
                      <img src={twoFaQrDataUrl} alt="2FA QR code" width={220} height={220} className="block" />
                    ) : (
                      <div className="w-[220px] h-[220px] flex items-center justify-center text-gray-400 text-xs">Generating QR…</div>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => setTwoFaSetupStep("verify")} className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold">
                  I've scanned it — Continue →
                </button>
              </div>
            )}

            {twoFaSetupStep === "verify" && (
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFaVerifyCode}
                  onChange={(e) => setTwoFaVerifyCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center rounded-xl bg-white/10 border border-white/10 text-2xl tracking-[0.5em] text-white px-4 py-3 placeholder-white/20 focus:outline-none focus:border-emerald-500"
                />
                {twoFaError && <div className="text-red-400 text-xs text-center">{twoFaError}</div>}
                <button type="button" onClick={twoFaVerifyEnrollment} disabled={twoFaLoading || twoFaVerifyCode.length !== 6} className="w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50">
                  {twoFaLoading ? "Verifying…" : "Confirm"}
                </button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {activeView === "audit" && (
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6 space-y-2 max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-amber-300 text-xs font-semibold uppercase tracking-widest">Admin Audit Log</div>
              <button type="button" onClick={loadAuditLog} className="text-xs text-white/40 hover:text-white">↺ Refresh</button>
            </div>
            {auditLoading && <div className="text-white/40 text-xs text-center py-6">Loading…</div>}
            {!auditLoading && auditEntries.length === 0 && (
              <div className="text-white/30 text-xs text-center py-6">No audit log entries yet</div>
            )}
            {auditEntries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-amber-500/10 bg-white/5 p-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-300">{entry.action}</span>
                  <span className="text-[10px] text-white/30">{new Date(entry.createdAt).toLocaleString("en-GB")}</span>
                </div>
                <div className="text-[10px] text-white/40 font-mono">{entry.targetType} #{entry.targetId}</div>
                {entry.actorEmail && <div className="text-[10px] text-white/30">by {entry.actorEmail}</div>}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
