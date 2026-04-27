import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Flag, Zap, User, RefreshCw, Ban, CheckCircle, BarChart2, Users, BookOpen,
  AlertTriangle, FolderOpen, FileText, Inbox, X, ChevronRight, ShieldAlert
} from "lucide-react";
import { Link } from "wouter";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StoryReport {
  id: number;
  userId: string | null;
  userCode: string | null;
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
  auditFlagged: boolean;
  auditFlaggedAt: string | null;
  auditNote: string | null;
  createdAt: string;
}

interface ModerationEvent {
  id: number;
  userId: string | null;
  userCode: string | null;
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
  auditFlagged: boolean;
  auditFlaggedAt: string | null;
  auditNote: string | null;
  adminNotes: string | null;
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
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function UserCodeBadge({ code, userId }: { code: string | null; userId: string | null }) {
  if (code) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
        <User className="w-2.5 h-2.5" />
        {code}
      </span>
    );
  }
  if (userId) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs bg-white/5 text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full">
        <User className="w-2.5 h-2.5" />
        {userId.slice(0, 8)}…
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground/50">anonymous</span>;
}

// ---------------------------------------------------------------------------
// Input snapshot viewer
// ---------------------------------------------------------------------------

function InputSnapshotView({ data, label = "Input snapshot" }: { data: Record<string, unknown> | null; label?: string }) {
  if (!data) return null;
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && (v as unknown[]).length === 0));
  if (entries.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="bg-black/30 rounded-xl border border-white/10 overflow-hidden">
        {entries.map(([key, value], i) => (
          <div key={key} className={`flex gap-3 px-3 py-2 text-xs ${i > 0 ? "border-t border-white/5" : ""}`}>
            <span className="text-muted-foreground min-w-[120px] flex-shrink-0 font-mono capitalize">
              {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
            </span>
            <span className="text-foreground/90 break-all">
              {Array.isArray(value)
                ? (value as unknown[]).join(", ")
                : typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dispositioning buttons
// ---------------------------------------------------------------------------

function ActionButtons({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (action: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action taken</p>
      <div className="grid grid-cols-1 gap-1.5">
        {VALID_ACTIONS.map((action) => {
          const isSelected = selected === action;
          return (
            <button
              key={action}
              onClick={() => onSelect(isSelected ? "" : action)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                isSelected
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-white/3 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected ? "bg-primary border-primary" : "border-white/20"
              }`}>
                {isSelected && <CheckCircle className="w-2.5 h-2.5 text-black" />}
              </span>
              {action}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusButtons({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  const labels: Record<string, string> = {
    pending: "Pending",
    reviewed: "Reviewed",
    action_taken: "Action taken",
    closed: "Closed",
  };
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
      <div className="flex flex-wrap gap-2">
        {VALID_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selected === s
                ? statusColor(s) + " ring-1 ring-primary/30"
                : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {labels[s] ?? s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit folder section
// ---------------------------------------------------------------------------

function AuditSection({
  auditFlagged,
  auditNote,
  auditFlaggedAt,
  onFlag,
  flagging,
}: {
  auditFlagged: boolean;
  auditNote: string | null;
  auditFlaggedAt: string | null;
  onFlag: (note: string) => void;
  flagging: boolean;
}) {
  const [note, setNote] = useState(auditNote ?? "");
  const [open, setOpen] = useState(!auditFlagged);

  if (auditFlagged) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
          <FolderOpen className="w-3.5 h-3.5" />
          Added to audit folder
          {auditFlaggedAt && <span className="font-normal text-amber-300/60 ml-auto">{fmtDate(auditFlaggedAt)}</span>}
        </div>
        {auditNote && <p className="text-xs text-amber-200/70 italic">{auditNote}</p>}
      </div>
    );
  }

  return (
    <div className="border border-amber-500/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-amber-300/80 hover:text-amber-300 transition-colors bg-amber-500/5 hover:bg-amber-500/10"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        Add to audit folder
        <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-3 pb-3 pt-2 space-y-2 bg-amber-500/5">
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-amber-400/40 transition-colors"
            rows={2}
            placeholder="Audit note (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />
          <Button
            onClick={() => onFlag(note)}
            disabled={flagging}
            size="sm"
            className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 hover:border-amber-500/50"
            variant="outline"
          >
            <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
            {flagging ? "Adding…" : "Add to audit folder"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ban section (used by both Report + Event modals)
// ---------------------------------------------------------------------------

function BanSection({ userId, userCode }: { userId: string | null; userCode: string | null }) {
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [banDone, setBanDone] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  if (!userId) return null;
  if (banDone) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
        <CheckCircle className="w-3.5 h-3.5" />
        User {userCode ?? userId.slice(0, 8)} has been banned.
      </div>
    );
  }

  const handleBan = async () => {
    if (!banReason.trim()) return;
    setBanning(true);
    setBanError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/ban`, {
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
    <div className="border border-destructive/20 rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 bg-destructive/5 flex items-center gap-2">
        <Ban className="w-3.5 h-3.5 text-destructive/70" />
        <span className="text-xs font-semibold text-destructive/80">Ban this user</span>
        {userCode && <UserCodeBadge code={userCode} userId={userId} />}
      </div>
      <div className="px-3 pb-3 pt-2 space-y-2 bg-destructive/3">
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// High-risk section
// ---------------------------------------------------------------------------

function HighRiskSection({ userId, userCode }: { userId: string | null; userCode: string | null }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userId) return null;
  if (done) {
    return (
      <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
        <ShieldAlert className="w-3.5 h-3.5" />
        User {userCode ?? userId.slice(0, 8)} flagged as high risk.
      </div>
    );
  }

  const handleFlag = async () => {
    if (!reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/risk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ score: 80, reason: reason.trim() }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? "Failed to flag user.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-orange-500/20 rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 bg-orange-500/5 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-orange-400/80" />
        <span className="text-xs font-semibold text-orange-400/90">Flag as high risk</span>
        {userCode && <UserCodeBadge code={userCode} userId={userId} />}
      </div>
      <div className="px-3 pb-3 pt-2 space-y-2 bg-orange-500/3">
        <input
          type="text"
          className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-orange-400/40"
          placeholder="Reason (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          onClick={handleFlag}
          disabled={!reason.trim() || saving}
          size="sm"
          className="w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 hover:border-orange-500/50"
          variant="outline"
        >
          <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Saving…" : "Set risk score to high"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report modal
// ---------------------------------------------------------------------------

type ModalTab = "details" | "inputs" | "admin";

function ReportModal({
  report,
  open,
  onClose,
  onUpdate,
}: {
  report: StoryReport;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: StoryReport) => void;
}) {
  const [tab, setTab] = useState<ModalTab>("details");
  const [adminNotes, setAdminNotes] = useState(report.adminNotes ?? "");
  const [status, setStatus] = useState(report.status);
  const [actionTaken, setActionTaken] = useState(report.actionTaken ?? "");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [localAuditFlagged, setLocalAuditFlagged] = useState(report.auditFlagged);
  const [localAuditNote, setLocalAuditNote] = useState(report.auditNote);
  const [localAuditFlaggedAt, setLocalAuditFlaggedAt] = useState(report.auditFlaggedAt);

  const handleSave = async () => {
    setSaving(true);
    setSaveOk(false);
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
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddToAudit = async (note: string) => {
    setFlagging(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/story-reports/${report.id}/add-to-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        const { report: updated } = await res.json();
        onUpdate(updated);
        setLocalAuditFlagged(true);
        setLocalAuditNote(note || null);
        setLocalAuditFlaggedAt(new Date().toISOString());
      }
    } finally {
      setFlagging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-[#0e0e10] border-white/10 p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-4 pt-5 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(status)}`}>
                  {status.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {report.reasonCategory}
                </span>
                {localAuditFlagged && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20 flex items-center gap-1">
                    <FolderOpen className="w-2.5 h-2.5" /> Audit
                  </span>
                )}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                Report #{report.id} · {fmtDate(report.createdAt)}
                {(report.userCode || report.userId) && (
                  <UserCodeBadge code={report.userCode} userId={report.userId} />
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 flex-shrink-0 px-4 mt-3">
          {(["details", "inputs", "admin"] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-4">
            {tab === "details" && (
              <>
                <div className="bg-white/5 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason given</p>
                  <p className="text-sm text-foreground">{report.reason}</p>
                  {report.note && (
                    <p className="text-xs text-foreground/60 italic border-t border-white/5 pt-2">{report.note}</p>
                  )}
                </div>

                {report.storyTitle && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Story</p>
                    <p className="text-sm text-foreground">
                      {report.storyId ? (
                        <Link href={`/story/${report.storyId}`} className="text-primary hover:underline">
                          {report.storyTitle}
                        </Link>
                      ) : report.storyTitle}
                    </p>
                  </div>
                )}

                {report.outputExcerpt && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Story excerpt</p>
                    <p className="text-foreground/70 text-xs leading-relaxed">{report.outputExcerpt}</p>
                  </div>
                )}

                {report.reviewedAt && (
                  <div className="bg-white/5 rounded-xl p-3 text-xs text-muted-foreground">
                    Reviewed by {report.reviewedBy ?? "admin"} on {fmtDate(report.reviewedAt)}
                  </div>
                )}
              </>
            )}

            {tab === "inputs" && (
              <>
                {report.inputSnapshot ? (
                  <InputSnapshotView data={report.inputSnapshot} label="What the user selected" />
                ) : (
                  <div className="text-center py-12 text-muted-foreground/40">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No input snapshot recorded</p>
                  </div>
                )}
              </>
            )}

            {tab === "admin" && (
              <div className="space-y-4">
                <StatusButtons selected={status} onSelect={setStatus} />
                <ActionButtons selected={actionTaken} onSelect={setActionTaken} />

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commentary</p>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                    rows={4}
                    placeholder="Internal notes on this report…"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    maxLength={2000}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
                  {saveOk ? <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Saved</> : saving ? "Saving…" : "Save review"}
                </Button>

                <AuditSection
                  auditFlagged={localAuditFlagged}
                  auditNote={localAuditNote}
                  auditFlaggedAt={localAuditFlaggedAt}
                  onFlag={handleAddToAudit}
                  flagging={flagging}
                />

                <HighRiskSection userId={report.userId} userCode={report.userCode} />
                <BanSection userId={report.userId} userCode={report.userCode} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Event modal
// ---------------------------------------------------------------------------

function EventModal({
  event,
  open,
  onClose,
  onUpdate,
}: {
  event: ModerationEvent;
  open: boolean;
  onClose: () => void;
  onUpdate: (updated: ModerationEvent) => void;
}) {
  const [tab, setTab] = useState<ModalTab>("details");
  const [adminNotes, setAdminNotes] = useState(event.adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [localAuditFlagged, setLocalAuditFlagged] = useState(event.auditFlagged);
  const [localAuditNote, setLocalAuditNote] = useState(event.auditNote);
  const [localAuditFlaggedAt, setLocalAuditFlaggedAt] = useState(event.auditFlaggedAt);

  const handleSaveNotes = async () => {
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch(`${API_BASE}/api/admin/moderation-events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        const { event: updated } = await res.json();
        onUpdate(updated);
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddToAudit = async (note: string) => {
    setFlagging(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/moderation-events/${event.id}/add-to-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        const { event: updated } = await res.json();
        onUpdate(updated);
        setLocalAuditFlagged(true);
        setLocalAuditNote(note || null);
        setLocalAuditFlaggedAt(new Date().toISOString());
      }
    } finally {
      setFlagging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-[#0e0e10] border-white/10 p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-4 pt-5 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-semibold flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColor(event.severity)}`}>
                  {event.severity}
                </span>
                <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  {event.eventType}
                </span>
                {localAuditFlagged && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20 flex items-center gap-1">
                    <FolderOpen className="w-2.5 h-2.5" /> Audit
                  </span>
                )}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                Event #{event.id} · {fmtDate(event.createdAt)}
                {(event.userCode || event.userId) && (
                  <UserCodeBadge code={event.userCode} userId={event.userId} />
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 flex-shrink-0 px-4 mt-3">
          {(["details", "inputs", "admin"] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px capitalize ${
                tab === t
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-4">
            {tab === "details" && (
              <>
                <div className="bg-white/5 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reason</p>
                  <p className="text-sm text-foreground">{event.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-muted-foreground mb-1">Action taken</p>
                    <p className="font-mono text-foreground">{event.actionTaken}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-muted-foreground mb-1">Email sent</p>
                    <p className="text-foreground">{event.emailSent ? "Yes" : "No"}</p>
                  </div>
                </div>

                {event.flagsJson && (
                  <div className="bg-white/5 rounded-xl p-3 text-xs space-y-2">
                    <p className="font-semibold text-muted-foreground uppercase tracking-wider">Flags</p>
                    {(event.flagsJson as any).pattern && (
                      <div>
                        <span className="text-muted-foreground">Pattern: </span>
                        <code className="bg-white/5 px-1.5 py-0.5 rounded text-foreground/80 font-mono break-all">
                          {(event.flagsJson as any).pattern}
                        </code>
                      </div>
                    )}
                    {(event.flagsJson as any).matchedTerms?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(event.flagsJson as any).matchedTerms.map((term: string, idx: number) => (
                          <span key={idx} className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono border border-red-500/30">
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                    {(event.flagsJson as any).source && (
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span className="text-foreground">{(event.flagsJson as any).source}</span>
                      </div>
                    )}
                  </div>
                )}

                {event.outputExcerpt && (
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Output excerpt</p>
                    <p className="text-foreground/70 text-xs leading-relaxed">{event.outputExcerpt}</p>
                  </div>
                )}
              </>
            )}

            {tab === "inputs" && (
              <>
                {event.inputSnapshotJson ? (
                  <InputSnapshotView data={event.inputSnapshotJson} label="What the user submitted" />
                ) : (
                  <div className="text-center py-12 text-muted-foreground/40">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No input snapshot recorded</p>
                  </div>
                )}
              </>
            )}

            {tab === "admin" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commentary</p>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                    rows={4}
                    placeholder="Internal notes on this alert…"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    maxLength={2000}
                  />
                </div>

                <Button onClick={handleSaveNotes} disabled={saving} size="sm" className="w-full">
                  {saveOk ? <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Saved</> : saving ? "Saving…" : "Save notes"}
                </Button>

                <AuditSection
                  auditFlagged={localAuditFlagged}
                  auditNote={localAuditNote}
                  auditFlaggedAt={localAuditFlaggedAt}
                  onFlag={handleAddToAudit}
                  flagging={flagging}
                />

                <HighRiskSection userId={event.userId} userCode={event.userCode} />
                <BanSection userId={event.userId} userCode={event.userCode} />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Reports tab
// ---------------------------------------------------------------------------

function ReportsTab() {
  const [reports, setReports] = useState<StoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selected, setSelected] = useState<StoryReport | null>(null);

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
    if (selected?.id === updated.id) setSelected(updated);
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
        <button onClick={load} className="ml-auto p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-card/40 rounded-xl animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Flag className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No reports{statusFilter ? ` with status "${statusFilter}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <button
              key={r.id}
              className="w-full text-left border border-border/30 rounded-xl p-4 hover:bg-white/3 transition-colors flex items-center gap-3"
              onClick={() => setSelected(r)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(r.status)}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    {r.reasonCategory}
                  </span>
                  <UserCodeBadge code={r.userCode} userId={r.userId} />
                  {r.auditFlagged && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <FolderOpen className="w-2.5 h-2.5 inline" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-1">{r.reason}</p>
                {r.storyTitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">"{r.storyTitle}"</p>}
              </div>
              <div className="text-xs text-muted-foreground/50 flex-shrink-0 mr-1">
                {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <ReportModal
          report={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
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
  const [selected, setSelected] = useState<ModerationEvent | null>(null);

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

  const handleUpdate = (updated: ModerationEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selected?.id === updated.id) setSelected(updated);
  };

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
        <button onClick={load} className="ml-auto p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-card/40 rounded-xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No moderation events{severityFilter ? ` with severity "${severityFilter}"` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <button
              key={ev.id}
              className="w-full text-left border border-border/30 rounded-xl p-4 hover:bg-white/3 transition-colors flex items-center gap-3"
              onClick={() => setSelected(ev)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${severityColor(ev.severity)}`}>
                    {ev.severity}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    {ev.eventType}
                  </span>
                  <UserCodeBadge code={ev.userCode} userId={ev.userId} />
                  {ev.auditFlagged && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      <FolderOpen className="w-2.5 h-2.5 inline" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-1">{ev.reason}</p>
              </div>
              <div className="text-xs text-muted-foreground/50 flex-shrink-0 mr-1">
                {new Date(ev.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <EventModal
          event={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats tab
// ---------------------------------------------------------------------------

interface AdminStats {
  users: { total: number; free: number; monthly: number; annual: number };
  stories: { today: number; week: number; month: number; total: number };
  moderation: { pendingReports: number; eventsLast30Days: number };
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      const d = await r.json();
      setStats(d);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-card/40 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-destructive/50" />
        <p className="text-sm text-muted-foreground mb-3">Failed to load stats</p>
        <Button variant="outline" size="sm" onClick={load}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Users</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Users className="w-4 h-4 text-primary" />} label="Total users" value={stats.users.total} />
          <StatCard icon={<Users className="w-4 h-4 text-primary" />} label="Monthly subscribers" value={stats.users.monthly} />
          <StatCard icon={<Users className="w-4 h-4 text-primary" />} label="Annual subscribers" value={stats.users.annual} />
          <StatCard icon={<User className="w-4 h-4 text-muted-foreground" />} label="Free accounts" value={stats.users.free} />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Story Generation</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="Today" value={stats.stories.today} />
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="This week" value={stats.stories.week} />
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="This month" value={stats.stories.month} />
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} label="Total" value={stats.stories.total} />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Moderation</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<Flag className="w-4 h-4 text-yellow-400" />} label="Pending reports" value={stats.moderation.pendingReports} />
          <StatCard icon={<Zap className="w-4 h-4 text-orange-400" />} label="Events (30 days)" value={stats.moderation.eventsLast30Days} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Tab = "reports" | "events" | "stats";

export default function AdminModeration() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("reports");

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
            <Flag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Moderation</h1>
            <p className="text-xs text-muted-foreground">Trust & safety dashboard</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white/3 rounded-xl p-1 border border-white/10">
          {([
            { id: "reports", icon: <Inbox className="w-3.5 h-3.5" />, label: "Reports" },
            { id: "events", icon: <Zap className="w-3.5 h-3.5" />, label: "Alerts" },
            { id: "stats", icon: <BarChart2 className="w-3.5 h-3.5" />, label: "Stats" },
          ] as { id: Tab; icon: React.ReactNode; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === id
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "reports" && <ReportsTab />}
        {tab === "events" && <EventsTab />}
        {tab === "stats" && <StatsTab />}
      </div>
    </div>
  );
}
