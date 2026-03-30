import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flag, Zap, User, ChevronDown, ChevronUp, RefreshCw, Ban, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryReport {
  id: number;
  userId: string | null;
  storyId: string | null;
  storyTitle: string | null;
  reason: string;
  reasonCategory: string;
  note: string | null;
  inputSnapshot: Record<string, unknown> | null;
  outputExcerpt: string | null;
  status: string;
  adminNotes: string | null;
  actionTaken: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface ModerationEvent {
  id: number;
  userId: string | null;
  storyId: string | null;
  requestId: string | null;
  eventType: string;
  severity: string;
  reason: string;
  flagsJson: Record<string, unknown> | null;
  inputSnapshotJson: Record<string, unknown> | null;
  outputExcerpt: string | null;
  actionTaken: string;
  emailSent: boolean;
  linkedReportId: number | null;
  createdAt: string;
}

const VALID_STATUSES = ["pending", "reviewed", "action_taken", "closed"] as const;
const VALID_ACTIONS = [
  "No issue found",
  "Story removed",
  "Story regenerated",
  "User warned",
  "User restricted",
  "Closed with no further action",
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function severityColor(severity: string) {
  if (severity === "critical") return "bg-red-500/20 text-red-300 border-red-500/30";
  if (severity === "high") return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  if (severity === "medium") return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  return "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

function statusColor(status: string) {
  if (status === "pending") return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (status === "action_taken") return "bg-green-500/20 text-green-300 border-green-500/30";
  if (status === "reviewed") return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  return "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Report detail panel
// ---------------------------------------------------------------------------

function ReportDetailPanel({
  report,
  onUpdate,
}: {
  report: StoryReport;
  onUpdate: (updated: StoryReport) => void;
}) {
  const [adminNotes, setAdminNotes] = useState(report.adminNotes ?? "");
  const [status, setStatus] = useState(report.status);
  const [actionTaken, setActionTaken] = useState(report.actionTaken ?? "");
  const [saving, setSaving] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [banDone, setBanDone] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/story-reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes, actionTaken: actionTaken || undefined }),
      });
      if (res.ok) {
        const { report: updated } = await res.json();
        onUpdate(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async () => {
    if (!report.userId || !banReason.trim()) return;
    setBanning(true);
    setBanError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${report.userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: banReason.trim() }),
      });
      if (res.ok) {
        setBanDone(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setBanError(body?.error ?? "Failed to ban user.");
      }
    } finally {
      setBanning(false);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Report ID</p>
          <p className="font-mono text-foreground">#{report.id}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Submitted</p>
          <p className="text-foreground">{fmtDate(report.createdAt)}</p>
        </div>
        {report.userId && (
          <div className="bg-white/5 rounded-xl p-3 col-span-2">
            <p className="text-muted-foreground mb-1">User ID</p>
            <p className="font-mono text-foreground break-all">{report.userId}</p>
          </div>
        )}
        {report.storyTitle && (
          <div className="bg-white/5 rounded-xl p-3 col-span-2">
            <p className="text-muted-foreground mb-1">Story</p>
            <p className="text-foreground">
              {report.storyId ? (
                <Link href={`/story/${report.storyId}`} className="text-primary hover:underline">
                  {report.storyTitle}
                </Link>
              ) : (
                report.storyTitle
              )}
            </p>
          </div>
        )}
      </div>

      {/* What the user reported */}
      <div className="bg-white/5 rounded-xl p-3 space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium">Category</p>
        <p className="text-foreground">{report.reasonCategory}</p>
        <p className="text-xs text-muted-foreground font-medium mt-2">Reason given</p>
        <p className="text-foreground">{report.reason}</p>
        {report.note && (
          <>
            <p className="text-xs text-muted-foreground font-medium mt-2">Additional note</p>
            <p className="text-foreground/80 italic">{report.note}</p>
          </>
        )}
      </div>

      {/* Output excerpt */}
      {report.outputExcerpt && (
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1.5">Story excerpt (first 500 chars)</p>
          <p className="text-foreground/70 text-xs leading-relaxed line-clamp-6">{report.outputExcerpt}</p>
        </div>
      )}

      {/* Input snapshot */}
      {report.inputSnapshot && (
        <details className="bg-white/5 rounded-xl p-3">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none">
            Input snapshot (what the user selected)
          </summary>
          <pre className="mt-2 text-xs text-foreground/70 overflow-auto max-h-40 whitespace-pre-wrap">
            {JSON.stringify(report.inputSnapshot, null, 2)}
          </pre>
        </details>
      )}

      {/* Admin review */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Admin Notes</p>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/40 transition-colors"
          rows={3}
          placeholder="Internal notes for this report…"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-[#0e0e10]">
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Action taken</p>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-primary/40"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
          >
            <option value="" className="bg-[#0e0e10]">— select —</option>
            {VALID_ACTIONS.map((a) => (
              <option key={a} value={a} className="bg-[#0e0e10]">
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
        {saving ? "Saving…" : "Save review"}
      </Button>

      {/* Ban section */}
      {report.userId && !banDone && (
        <div className="border border-destructive/20 rounded-xl p-3 space-y-2 mt-2">
          <p className="text-xs font-medium text-destructive/80 flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5" /> Ban this user
          </p>
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-destructive/40"
            placeholder="Reason for ban (required)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            maxLength={300}
          />
          {banError && <p className="text-xs text-destructive">{banError}</p>}
          <Button
            onClick={handleBan}
            disabled={!banReason.trim() || banning}
            size="sm"
            variant="destructive"
            className="w-full"
          >
            {banning ? "Banning…" : "Ban user"}
          </Button>
        </div>
      )}
      {banDone && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-xl p-3">
          <CheckCircle className="w-3.5 h-3.5" />
          User has been banned. They will see an error if they attempt to generate.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Moderation event detail panel
// ---------------------------------------------------------------------------

function EventDetailPanel({ event }: { event: ModerationEvent }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Event ID</p>
          <p className="font-mono text-foreground">#{event.id}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">When</p>
          <p className="text-foreground">{fmtDate(event.createdAt)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Type</p>
          <p className="text-foreground font-mono text-xs">{event.eventType}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-muted-foreground mb-1">Action taken</p>
          <p className="text-foreground font-mono text-xs">{event.actionTaken}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3">
        <p className="text-xs text-muted-foreground font-medium mb-1">Reason</p>
        <p className="text-foreground">{event.reason}</p>
      </div>

      {event.userId && (
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1">User ID</p>
          <p className="font-mono text-xs text-foreground break-all">{event.userId}</p>
        </div>
      )}

      {event.outputExcerpt && (
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1.5">Output excerpt</p>
          <p className="text-foreground/70 text-xs leading-relaxed">{event.outputExcerpt}</p>
        </div>
      )}

      {event.inputSnapshotJson && (
        <details className="bg-white/5 rounded-xl p-3">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none">
            Input snapshot
          </summary>
          <pre className="mt-2 text-xs text-foreground/70 overflow-auto max-h-40 whitespace-pre-wrap">
            {JSON.stringify(event.inputSnapshotJson, null, 2)}
          </pre>
        </details>
      )}

      {event.flagsJson && (
        <details className="bg-white/5 rounded-xl p-3">
          <summary className="text-xs text-muted-foreground cursor-pointer select-none">
            Flags JSON
          </summary>
          <pre className="mt-2 text-xs text-foreground/70 overflow-auto max-h-40 whitespace-pre-wrap">
            {JSON.stringify(event.flagsJson, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports tab
// ---------------------------------------------------------------------------

function ReportsTab() {
  const [reports, setReports] = useState<StoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`${API_BASE}/api/admin/story-reports${qs}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { reports: [] })
      .then(({ reports }) => setReports(reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = (updated: StoryReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {["", "pending", "reviewed", "action_taken", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "" ? "All" : s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="ml-auto p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-card/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Flag className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No reports{statusFilter ? ` with status "${statusFilter}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.id}
              className="border border-border/30 rounded-xl overflow-hidden"
            >
              {/* Row */}
              <button
                className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {r.reasonCategory}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-1">{r.reason}</p>
                  {r.storyTitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      "{r.storyTitle}"
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground/50 text-right flex-shrink-0 mr-1">
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
                {expandedId === r.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Detail */}
              {expandedId === r.id && (
                <div className="border-t border-border/20 p-4 bg-black/20">
                  <ReportDetailPanel report={r} onUpdate={handleUpdate} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Events tab
// ---------------------------------------------------------------------------

function EventsTab() {
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const qs = severityFilter ? `?severity=${severityFilter}` : "";
    fetch(`${API_BASE}/api/admin/moderation-events${qs}`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : { events: [] })
      .then(({ events }) => setEvents(events ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [severityFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {["", "critical", "high", "medium", "low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                severityFilter === s
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "" ? "All" : s}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="ml-auto p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-card/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No moderation events{severityFilter ? ` with severity "${severityFilter}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="border border-border/30 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpandedId(expandedId === ev.id ? null : ev.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColor(ev.severity)}`}>
                      {ev.severity}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {ev.eventType}
                    </span>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {ev.actionTaken}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-1">{ev.reason}</p>
                </div>
                <div className="text-xs text-muted-foreground/50 flex-shrink-0 mr-1">
                  {new Date(ev.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </div>
                {expandedId === ev.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {expandedId === ev.id && (
                <div className="border-t border-border/20 p-4 bg-black/20">
                  <EventDetailPanel event={ev} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

type ModerationTab = "reports" | "events";

export default function AdminModeration() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<ModerationTab>("reports");
  const [accessDenied, setAccessDenied] = useState(false);
  const [checked, setChecked] = useState(false);

  // Server-side admin check — same pattern as Admin.tsx
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/api/admin/story-reports?limit=1`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setAccessDenied(true);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [user?.id]);

  if (isLoading || (!checked && user?.id)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!user || accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-destructive font-medium">Access denied.</p>
          <Link href="/" className="text-sm text-primary hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Flag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Moderation</h1>
            <p className="text-xs text-muted-foreground">Story reports and auto-moderation events</p>
          </div>
          <Link href="/admin" className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to Admin
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
          {(["reports", "events"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                tab === t
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "reports" ? <Flag className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              {t === "reports" ? "User Reports" : "Auto-flagged Events"}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "reports" ? <ReportsTab /> : <EventsTab />}
      </div>
    </div>
  );
}
