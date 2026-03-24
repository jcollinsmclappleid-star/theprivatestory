import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface SubthemeItem {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  subthemeId: string;
  subthemeName: string;
  intensity: number | "variable";
  tags: string[];
}

interface GeneratedDraft {
  storyId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  hasAudio: boolean;
  categoryId: string;
  subthemeId: string;
  dna: Record<string, string>;
  status: "draft" | "published" | "skipped";
  scenes?: Array<{ id: number; text: string; heading: string }>;
}

interface GenerationLog {
  event: string;
  data: Record<string, unknown>;
  ts: number;
}

type QueueStatus = "pending" | "generating" | "done" | "error";

interface QueueItem {
  item: SubthemeItem;
  status: QueueStatus;
  draft?: GeneratedDraft;
  logs: GenerationLog[];
  systemPrompt?: string;
  userPrompt?: string;
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [subthemes, setSubthemes] = useState<SubthemeItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<GeneratedDraft[]>([]);
  const [activeView, setActiveView] = useState<"generate" | "review">("generate");
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [storyTexts, setStoryTexts] = useState<Record<string, string>>({});

  const [accessDenied, setAccessDenied] = useState(false);

  // ── Load categories ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/admin/categories`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) { setAccessDenied(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const items: SubthemeItem[] = data.items ?? [];
        setSubthemes(items);
        setQueue(items.map((item) => ({ item, status: "pending", logs: [] })));
      })
      .catch(() => {});
  }, [user]);

  // ── Load existing drafts ───────────────────────────────────────────────────
  const loadDrafts = useCallback(() => {
    if (!user) return;
    fetch(`${API_BASE}/api/admin/library?status=draft`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const normalized: GeneratedDraft[] = (data.stories ?? []).map((s: Record<string, unknown>) => ({
          storyId: (s.storyId ?? s.id) as string,
          title: (s.title ?? "") as string,
          description: (s.description ?? "") as string,
          coverImageUrl: (s.coverImageUrl ?? (s.images as Record<string, unknown>)?.cover ?? "") as string,
          hasAudio: !!(s.audioUrl),
          categoryId: (s.categoryId ?? "") as string,
          subthemeId: (s.subthemeId ?? "") as string,
          dna: (s.dna ?? s.storyDna ?? {}) as Record<string, string>,
          status: (s.status ?? "draft") as "draft" | "published" | "skipped",
          scenes: (s.scenes ?? []) as Array<{ id: number; text: string; heading: string }>,
        }));
        setDrafts(normalized);
      })
      .catch(() => {});
  }, [user]);

  // ── Run generation for one item via SSE ───────────────────────────────────
  const generateOne = useCallback(
    (idx: number): Promise<void> => {
      return new Promise((resolve) => {
        const qItem = queue[idx];
        if (!qItem) return resolve();

        setQueue((q) =>
          q.map((qi, i) => (i === idx ? { ...qi, status: "generating", logs: [] } : qi))
        );
        setSelected(idx);

        const abort = new AbortController();
        abortRef.current = abort;

        fetch(`${API_BASE}/api/admin/generate-one`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            categoryId: qItem.item.categoryId,
            subthemeId: qItem.item.subthemeId,
            intensity: typeof qItem.item.intensity === "number" ? qItem.item.intensity : 3,
          }),
          signal: abort.signal,
        })
          .then(async (res) => {
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return resolve();

            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              const parts = buffer.split("\n\n");
              buffer = parts.pop() ?? "";

              for (const part of parts) {
                const eventLine = part.match(/^event: (.+)$/m)?.[1];
                const dataLine = part.match(/^data: (.+)$/m)?.[1];
                if (!dataLine) continue;

                let parsed: Record<string, unknown> = {};
                try {
                  parsed = JSON.parse(dataLine);
                } catch {
                  continue;
                }

                const log: GenerationLog = { event: eventLine ?? "data", data: parsed, ts: Date.now() };

                setQueue((q) =>
                  q.map((qi, i) => {
                    if (i !== idx) return qi;
                    const updates: Partial<QueueItem> = { logs: [...qi.logs, log] };
                    if (parsed.system_prompt) updates.systemPrompt = parsed.system_prompt as string;
                    if (parsed.user_prompt) updates.userPrompt = parsed.user_prompt as string;
                    if (eventLine === "complete") {
                      updates.status = "done";
                      updates.draft = { ...(parsed as unknown as GeneratedDraft), status: "draft" };
                    }
                    if (eventLine === "error") updates.status = "error";
                    return { ...qi, ...updates };
                  })
                );

                if (eventLine === "complete") {
                  loadDrafts();
                  resolve();
                  return;
                }
                if (eventLine === "error") {
                  resolve();
                  return;
                }
              }
            }
            resolve();
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              setQueue((q) =>
                q.map((qi, i) =>
                  i === idx ? { ...qi, status: "error", logs: [...qi.logs, { event: "error", data: { message: String(err) }, ts: Date.now() }] } : qi
                )
              );
            }
            resolve();
          });
      });
    },
    [queue, loadDrafts]
  );

  // ── Run all pending ────────────────────────────────────────────────────────
  const runAll = useCallback(async () => {
    setIsRunning(true);
    const pendingIndices = queue.map((q, i) => (q.status === "pending" ? i : -1)).filter((i) => i >= 0);
    for (const idx of pendingIndices) {
      if (abortRef.current?.signal.aborted) break;
      await generateOne(idx);
    }
    setIsRunning(false);
  }, [queue, generateOne]);

  const stopAll = () => {
    abortRef.current?.abort();
    setIsRunning(false);
  };

  const updateDraftStatus = async (storyId: string, status: "published" | "skipped") => {
    await fetch(`${API_BASE}/api/admin/stories/${storyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    loadDrafts();
  };

  const clearAllDrafts = async () => {
    await Promise.all(drafts.map((d) =>
      fetch(`${API_BASE}/api/admin/stories/${d.storyId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "skipped" }),
      })
    ));
    loadDrafts();
  };

  // ── Access guard ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60 text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/60 text-sm">Sign in to access admin.</div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="text-white/80 text-sm font-medium">Access denied.</div>
        <div className="text-white/40 text-xs">This page is for admin accounts only.</div>
        <div className="text-white/30 text-xs font-mono">{user.email}</div>
      </div>
    );
  }

  // ── Counts ─────────────────────────────────────────────────────────────────
  const doneCount = queue.filter((q) => q.status === "done").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const selectedItem = selected !== null ? queue[selected] : null;

  return (
    <>
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ── LEFT PANEL — Queue ──────────────────────────────────────────────── */}
      <div className="w-full md:w-80 flex-shrink-0 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-base font-semibold tracking-tight">Admin — Story Engine</h1>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveView("generate")}
                className={`text-xs px-2 py-1 rounded ${activeView === "generate" ? "bg-white/20" : "text-white/50 hover:text-white"}`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveView("review")}
                className={`text-xs px-2 py-1 rounded ${activeView === "review" ? "bg-white/20" : "text-white/50 hover:text-white"}`}
              >
                Review ({drafts.length})
              </button>
            </div>
          </div>
          {activeView === "generate" && (
            <div className="flex items-center gap-2 mt-3">
              <div className="text-xs text-white/50">
                {doneCount}/{queue.length} done
                {errorCount > 0 && <span className="text-red-400 ml-1">· {errorCount} err</span>}
              </div>
              <div className="flex-1" />
              {isRunning ? (
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={stopAll}>
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-7 text-xs bg-rose-600 hover:bg-rose-500 text-white"
                  onClick={runAll}
                  disabled={queue.every((q) => q.status !== "pending")}
                >
                  Run All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Queue list or Review list */}
        {activeView === "generate" ? (
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {queue.length === 0 && (
                <div className="text-white/40 text-xs p-3 text-center">Loading categories…</div>
              )}
              {queue.map((qi, idx) => (
                <div
                  key={`${qi.item.categoryId}-${qi.item.subthemeId}`}
                  className={`rounded-lg transition-colors cursor-pointer ${
                    selected === idx ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <button
                    onClick={() => { setSelected(idx); setActiveView("generate"); }}
                    className="w-full text-left px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{qi.item.categoryIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-white/90">{qi.item.subthemeName}</div>
                        <div className="text-white/40 truncate text-xs">{qi.item.categoryName}</div>
                      </div>
                      <StatusDot status={qi.status} />
                    </div>
                  </button>
                  {selected === idx && (
                    <div className="px-3 pb-2 pt-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); generateOne(idx); }}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs py-1.5 rounded font-medium disabled:opacity-50"
                        disabled={isRunning || qi.status !== "pending"}
                      >
                        {isRunning ? "Generating…" : qi.status === "done" ? "Done" : qi.status === "error" ? "Error" : "Generate"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-white/50">{drafts.length} draft{drafts.length !== 1 ? "s" : ""}</span>
                <button
                  onClick={clearAllDrafts}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear All
                </button>
              </div>
            )}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {drafts.length === 0 && (
                  <div className="text-white/40 text-sm p-6 text-center">No drafts yet. Generate stories first.</div>
                )}
                {drafts.map((draft) => (
                  <button
                    key={draft.storyId}
                    onClick={() => setSelectedDraftId(draft.storyId)}
                    className="w-full text-left border border-white/10 rounded-xl overflow-hidden hover:border-white/30 active:scale-[0.99] transition-all"
                  >
                    {draft.coverImageUrl && (
                      <img
                        src={draft.coverImageUrl}
                        alt={draft.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      <div className="font-semibold text-sm leading-snug mb-1">{draft.title}</div>
                      <div className="text-white/50 text-xs leading-relaxed line-clamp-2">{draft.description}</div>
                      <div className="mt-2 text-xs text-rose-400 font-medium">Tap to read →</div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* ── RIGHT PANEL — Prompt Transparency + Live Log (desktop only) ────── */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden">
        {activeView === "generate" && selectedItem ? (
          <>
            {/* Story header */}
            <div className="px-6 py-4 border-b border-white/10 flex-shrink-0 bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedItem.item.categoryIcon}</span>
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{selectedItem.item.subthemeName}</h2>
                    <div className="text-white/50 text-sm">{selectedItem.item.categoryName}</div>
                  </div>
                </div>
                <StatusBadge status={selectedItem.status} />
              </div>
              {selectedItem.status === "pending" ? (
                <Button
                  size="sm"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium h-8"
                  onClick={() => generateOne(selected!)}
                  disabled={isRunning}
                >
                  {isRunning ? "Generating Story…" : "Generate Story"}
                </Button>
              ) : (
                <div className="text-xs text-white/50 text-center py-2">
                  {selectedItem.status === "done" ? "✓ Generation complete" : selectedItem.status === "error" ? "✗ Generation failed" : "Generating…"}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* Prompt panel */}
              <div className="w-1/2 border-r border-white/10 flex flex-col">
                <div className="px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-widest">
                  Prompt Transparency
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {selectedItem.systemPrompt ? (
                      <>
                        <div>
                          <div className="text-xs font-semibold text-rose-400 mb-2 uppercase tracking-widest">
                            System Prompt
                          </div>
                          <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed bg-white/5 rounded-lg p-3">
                            {selectedItem.systemPrompt}
                          </pre>
                        </div>
                        <Separator className="bg-white/10" />
                        <div>
                          <div className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-widest">
                            User Prompt
                          </div>
                          <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed bg-white/5 rounded-lg p-3">
                            {selectedItem.userPrompt}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div className="text-white/30 text-xs text-center pt-8">
                        Hit "Generate" to see the full prompt used for this story.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Live log + DNA panel */}
              <div className="w-1/2 flex flex-col">
                <div className="px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-widest">
                  Generation Log
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {selectedItem.logs.length === 0 && (
                      <div className="text-white/30 text-xs text-center pt-8">
                        Live events will appear here during generation.
                      </div>
                    )}
                    {selectedItem.logs.map((log, i) => (
                      <LogEntry key={i} log={log} />
                    ))}

                    {/* Draft preview if complete */}
                    {selectedItem.draft && (
                      <div className="mt-4 border border-white/10 rounded-xl overflow-hidden">
                        {selectedItem.draft.coverImageUrl && (
                          <img
                            src={selectedItem.draft.coverImageUrl}
                            alt={selectedItem.draft.title}
                            className="w-full h-40 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <div className="font-semibold mb-1">{selectedItem.draft.title}</div>
                          <div className="text-white/60 text-sm mb-3">{selectedItem.draft.description}</div>
                          {selectedItem.draft.hasAudio && (
                            <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-400 mb-3">
                              ✓ Audio ready
                            </Badge>
                          )}
                          {Object.keys(selectedItem.draft.dna).length > 0 && (
                            <div className="mt-3">
                              <div className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
                                Story DNA
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                {Object.entries(selectedItem.draft.dna)
                                  .filter(([k]) => !["category", "subtheme"].includes(k))
                                  .map(([k, v]) => (
                                    <div key={k} className="bg-white/5 rounded px-2 py-1">
                                      <div className="text-white/40 text-[10px]">{k.replace(/_/g, " ")}</div>
                                      <div className="text-white/80 text-xs truncate">{String(v)}</div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => updateDraftStatus(selectedItem.draft!.storyId, "published")}
                              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm py-2 rounded-lg font-medium"
                            >
                              ✓ Publish
                            </button>
                            <button
                              onClick={() => updateDraftStatus(selectedItem.draft!.storyId, "skipped")}
                              className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 text-sm py-2 rounded-lg"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </>
        ) : activeView === "generate" ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/30">
              <div className="text-4xl mb-3">⚙️</div>
              <div className="text-sm">Select a story from the queue to see its prompt and generation log.</div>
              <div className="text-xs mt-2 text-white/20">
                {queue.length} stories across 18 categories
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/30">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-sm">
                {drafts.length > 0
                  ? "Click a draft on the left to review its full story."
                  : "No drafts yet. Go to Generate tab and run stories."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* ── MODAL — Draft Detail View ────────────────────────────────────────── */}
    {selectedDraftId && drafts.find(d => d.storyId === selectedDraftId) && (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 md:bg-black/80 md:backdrop-blur-sm">
        {(() => {
          const draft = drafts.find(d => d.storyId === selectedDraftId)!;
          return (
            <div className="bg-[#0f0f0f] border-t md:border border-white/20 w-full md:max-w-2xl h-[95vh] md:max-h-[90vh] md:rounded-xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-xl leading-tight mb-1">{draft.title}</h2>
                    <p className="text-white/50 text-sm leading-relaxed">{draft.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDraftId(null)}
                    className="text-white/40 hover:text-white text-2xl flex-shrink-0 -mt-0.5"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Story Text */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-6">
                  {draft.scenes && draft.scenes[0]?.text ? (
                    <p className="text-white/80 leading-loose text-base font-light whitespace-pre-wrap">
                      {draft.scenes[0].text}
                    </p>
                  ) : (
                    <p className="text-white/40 text-center py-12">Story text not available</p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-4 pb-8 md:pb-4 border-t border-white/10 flex-shrink-0 flex gap-3">
                <button
                  onClick={() => {
                    updateDraftStatus(draft.storyId, "published");
                    setSelectedDraftId(null);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm py-3.5 rounded-xl font-semibold transition"
                >
                  ✓ Publish
                </button>
                <button
                  onClick={() => {
                    updateDraftStatus(draft.storyId, "skipped");
                    setSelectedDraftId(null);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 text-sm py-3.5 rounded-xl font-medium transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedDraftId(null)}
                  className="px-5 bg-white/5 hover:bg-white/10 text-white/50 text-sm py-3.5 rounded-xl transition"
                >
                  ←
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    )}
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: QueueStatus }) {
  const map: Record<QueueStatus, string> = {
    pending: "bg-white/20",
    generating: "bg-amber-400 animate-pulse",
    done: "bg-emerald-400",
    error: "bg-red-400",
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[status]}`} />;
}

function StatusBadge({ status }: { status: QueueStatus }) {
  const map: Record<QueueStatus, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "border-white/20 text-white/40" },
    generating: { label: "Generating…", cls: "border-amber-500/40 text-amber-400" },
    done: { label: "Done", cls: "border-emerald-500/40 text-emerald-400" },
    error: { label: "Error", cls: "border-red-500/40 text-red-400" },
  };
  const { label, cls } = map[status];
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {label}
    </Badge>
  );
}

function LogEntry({ log }: { log: GenerationLog }) {
  const phaseLabels: Record<string, string> = {
    prompt_ready: "✓ Prompt ready",
    writing_story: "📝 Writing story (GPT-4o)…",
    story_written: "✓ Story written",
    generating_cover: "🎨 Generating cover…",
    generating_audio: "🎧 Generating audio…",
    saving: "💾 Saving draft…",
  };

  const isComplete = log.event === "complete";
  const isError = log.event === "error";
  const isWarning = log.event === "warning";
  const phase = (log.data.phase as string) ?? "";

  return (
    <div
      className={`text-xs rounded-lg px-3 py-2 font-mono ${
        isComplete
          ? "bg-emerald-900/30 text-emerald-300 border border-emerald-500/20"
          : isError
          ? "bg-red-900/30 text-red-300 border border-red-500/20"
          : isWarning
          ? "bg-amber-900/20 text-amber-300"
          : "bg-white/5 text-white/60"
      }`}
    >
      {isComplete && <span>✓ Complete — {(log.data as any).title ?? ""}</span>}
      {isError && <span>✗ {String(log.data.message ?? "Error")}</span>}
      {isWarning && <span>⚠ {String(log.data.message ?? "Warning")}</span>}
      {!isComplete && !isError && !isWarning && (
        <span>{phaseLabels[phase] ?? `[${log.event}] ${phase}`}</span>
      )}
    </div>
  );
}
