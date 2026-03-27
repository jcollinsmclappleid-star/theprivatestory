import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, type RefObject } from "react";
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
  status: "draft" | "published" | "skipped" | "failed";
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

interface SeriesCatalogItem {
  id: string;
  title: string;
  description: string;
  mood: string;
  tags: string[];
  episodeCount: number;
  dbStatus: "not_generated" | "pending" | "generating" | "published" | "error";
  coverImage: string;
}

interface SeriesGenerationState {
  status: "idle" | "generating" | "complete" | "error";
  currentEpisode: number;
  totalEpisodes: number;
  logs: string[];
  episodesComplete: { episodeId: string; title: string; coverImage: string; episode: number }[];
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [subthemes, setSubthemes] = useState<SubthemeItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<GeneratedDraft[]>([]);
  const [activeView, setActiveView] = useState<"generate" | "review" | "series" | "chat" | "moderation">("generate");
  const [flaggedItems, setFlaggedItems] = useState<Array<Record<string, unknown>>>([]);
  const [csamReports, setCsamReports] = useState<Array<Record<string, unknown>>>([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [storyTexts, setStoryTexts] = useState<Record<string, string>>({});

  const [accessDenied, setAccessDenied] = useState(false);
  const categoriesLoadedRef = useRef(false);

  const [seriesCatalog, setSeriesCatalog] = useState<SeriesCatalogItem[]>([]);
  const [seriesGenState, setSeriesGenState] = useState<Record<string, SeriesGenerationState>>({});
  const seriesAbortRef = useRef<AbortController | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatAbortRef = useRef<AbortController | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // ── Load categories — only once when user first authenticates ─────────────
  useEffect(() => {
    if (!user?.id || categoriesLoadedRef.current) return;
    categoriesLoadedRef.current = true;
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
  }, [user?.id]);

  // ── Load moderation data when switching to moderation tab ──────────────────
  const loadModeration = useCallback(async () => {
    setModerationLoading(true);
    try {
      const [flaggedRes, reportsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/moderation/flagged`, { credentials: "include" }),
        fetch(`${API_BASE}/api/admin/moderation/csam-reports`, { credentials: "include" }),
      ]);
      if (flaggedRes.ok) setFlaggedItems(await flaggedRes.json());
      if (reportsRes.ok) setCsamReports(await reportsRes.json());
    } catch {
      // ignore fetch errors
    } finally {
      setModerationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeView === "moderation") loadModeration();
  }, [activeView, loadModeration]);

  const fileReport = useCallback(async (contentBlockId: string, reportedTo: "ncmec" | "iwf" | "other") => {
    setReportingId(contentBlockId);
    try {
      const res = await fetch(`${API_BASE}/api/admin/moderation/csam-report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentBlockId, reportedTo, notes: reportNotes[contentBlockId] ?? "" }),
      });
      if (res.ok) {
        await loadModeration();
        setReportNotes((prev) => ({ ...prev, [contentBlockId]: "" }));
      }
    } finally {
      setReportingId(null);
    }
  }, [loadModeration, reportNotes]);

  // ── Load series catalog when switching to series tab ───────────────────────
  const loadSeriesCatalog = useCallback(() => {
    if (!user?.id) return;
    fetch(`${API_BASE}/api/admin/series-catalog`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setSeriesCatalog(data.catalog ?? []);
      })
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (activeView === "series") loadSeriesCatalog();
  }, [activeView, loadSeriesCatalog]);

  // ── Generate a full series via SSE ─────────────────────────────────────────
  const generateSeries = useCallback((seriesKey: string, totalEpisodes: number) => {
    seriesAbortRef.current?.abort();
    const abort = new AbortController();
    seriesAbortRef.current = abort;

    setSeriesGenState((prev) => ({
      ...prev,
      [seriesKey]: { status: "generating", currentEpisode: 0, totalEpisodes, logs: [], episodesComplete: [] },
    }));

    fetch(`${API_BASE}/api/admin/generate-series`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ seriesKey }),
      signal: abort.signal,
    })
      .then(async (res) => {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;
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
            try { parsed = JSON.parse(dataLine); } catch { continue; }
            const msg = parsed.message as string ?? "";
            const ep = parsed.episode as number | undefined;
            if (eventLine === "progress") {
              setSeriesGenState((prev) => ({
                ...prev,
                [seriesKey]: {
                  ...prev[seriesKey],
                  currentEpisode: ep ?? prev[seriesKey]?.currentEpisode ?? 0,
                  logs: [...(prev[seriesKey]?.logs ?? []), msg],
                  ...(parsed.episodeId ? {
                    episodesComplete: [
                      ...(prev[seriesKey]?.episodesComplete ?? []),
                      { episodeId: parsed.episodeId as string, title: parsed.title as string, coverImage: parsed.coverImage as string, episode: ep ?? 0 },
                    ],
                  } : {}),
                },
              }));
            } else if (eventLine === "complete") {
              setSeriesGenState((prev) => ({
                ...prev,
                [seriesKey]: { ...prev[seriesKey], status: "complete", logs: [...(prev[seriesKey]?.logs ?? []), msg] },
              }));
              loadSeriesCatalog();
            } else if (eventLine === "error") {
              setSeriesGenState((prev) => ({
                ...prev,
                [seriesKey]: { ...prev[seriesKey], status: "error", error: parsed.error as string },
              }));
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setSeriesGenState((prev) => ({
            ...prev,
            [seriesKey]: { ...prev[seriesKey], status: "error", error: String(err) },
          }));
        }
      });
  }, [loadSeriesCatalog]);

  // ── Load existing drafts ───────────────────────────────────────────────────
  const loadDrafts = useCallback(() => {
    if (!user?.id) return;
    Promise.all([
      fetch(`${API_BASE}/api/admin/library?status=draft`, { credentials: "include" }).then(r => r.json()),
      fetch(`${API_BASE}/api/admin/library?status=failed`, { credentials: "include" }).then(r => r.json()),
    ]).then(([draftData, failedData]) => {
        const normalize = (stories: Record<string, unknown>[]) => stories.map((s) => ({
          storyId: (s.storyId ?? s.id) as string,
          title: (s.title ?? "") as string,
          description: (s.description ?? "") as string,
          coverImageUrl: (s.coverImageUrl ?? (s.images as Record<string, unknown>)?.cover ?? "") as string,
          hasAudio: !!(s.audioUrl),
          categoryId: (s.categoryId ?? "") as string,
          subthemeId: (s.subthemeId ?? "") as string,
          dna: (s.dna ?? s.storyDna ?? {}) as Record<string, string>,
          status: (s.status ?? "draft") as "draft" | "published" | "skipped" | "failed",
          scenes: (s.scenes ?? []) as Array<{ id: number; text: string; heading: string }>,
        }));
        const failed = normalize(failedData.stories ?? []);
        const drafts = normalize(draftData.stories ?? []);
        setDrafts([...failed, ...drafts]);
      })
      .catch(() => {});
  }, [user?.id]);

  // ── Load drafts when switching to the review tab ───────────────────────────
  useEffect(() => {
    if (activeView === "review") loadDrafts();
  }, [activeView, loadDrafts]);

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

  const regenerateFailed = useCallback(async (draft: GeneratedDraft) => {
    await fetch(`${API_BASE}/api/admin/stories/${draft.storyId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "skipped" }),
    });
    setSelectedDraftId(null);
    loadDrafts();
    const idx = queue.findIndex(
      (q) => q.item.categoryId === draft.categoryId && q.item.subthemeId === draft.subthemeId
    );
    if (idx !== -1) {
      setActiveView("generate");
      setSelected(idx);
      setQueue((q) => q.map((qi, i) => i === idx ? { ...qi, status: "pending", logs: [] } : qi));
      setTimeout(() => generateOne(idx), 100);
    } else {
      setActiveView("generate");
    }
  }, [queue, generateOne, loadDrafts]);

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

  // ── Chat: auto-scroll to bottom when messages change ─────────────────────
  useLayoutEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ── Chat: send message and stream response ────────────────────────────────
  const sendChatMessage = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isChatStreaming) return;
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const withUser = [...chatMessages, userMsg];
    setChatMessages([...withUser, { role: "assistant", content: "" }]);
    setChatInput("");
    setIsChatStreaming(true);

    chatAbortRef.current?.abort();
    const abort = new AbortController();
    chatAbortRef.current = abort;

    try {
      const res = await fetch(`${API_BASE}/api/admin/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: withUser }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Request failed");
        throw new Error(`Server error ${res.status}: ${errText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No readable stream");
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const dataLine = part.match(/^data: (.+)$/m)?.[1];
          if (!dataLine || dataLine === "[DONE]") continue;
          try {
            const parsed = JSON.parse(dataLine);
            if (parsed.text) {
              setChatMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last?.role === "assistant") {
                  msgs[msgs.length - 1] = { ...last, content: last.content + parsed.text };
                }
                return msgs;
              });
            }
            if (parsed.error) {
              setChatMessages((prev) => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last?.role === "assistant") {
                  msgs[msgs.length - 1] = { ...last, content: `Error: ${parsed.error}` };
                }
                return msgs;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setChatMessages((prev) => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last?.role === "assistant") {
            msgs[msgs.length - 1] = { ...last, content: "Sorry, something went wrong. Please try again." };
          }
          return msgs;
        });
      }
    } finally {
      setIsChatStreaming(false);
      setTimeout(() => chatInputRef.current?.focus(), 50);
    }
  }, [chatInput, chatMessages, isChatStreaming]);

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
              <button
                onClick={() => setActiveView("series")}
                className={`text-xs px-2 py-1 rounded ${activeView === "series" ? "bg-[#c9a227]/30 text-[#c9a227]" : "text-white/50 hover:text-white"}`}
              >
                Series
              </button>
              <button
                onClick={() => setActiveView("chat")}
                className={`text-xs px-2 py-1 rounded ${activeView === "chat" ? "bg-violet-500/30 text-violet-300" : "text-white/50 hover:text-white"}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveView("moderation")}
                className={`text-xs px-2 py-1 rounded ${activeView === "moderation" ? "bg-red-500/30 text-red-300" : "text-white/50 hover:text-white"}`}
              >
                Moderation
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

        {/* Queue list / Series list / Review list / Chat (mobile) */}
        {activeView === "chat" ? (
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            isStreaming={isChatStreaming}
            scrollRef={chatScrollRef}
            inputRef={chatInputRef}
            onInputChange={setChatInput}
            onSend={sendChatMessage}
            onClear={() => { chatAbortRef.current?.abort(); setChatMessages([]); }}
            className="flex md:hidden flex-col flex-1 overflow-hidden"
          />
        ) : activeView === "generate" ? (
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
                    <div className="px-3 pb-2 pt-0 space-y-1.5">
                      {qi.status === "error" && (() => {
                        const errLog = [...qi.logs].reverse().find(l => l.event === "error");
                        const msg = errLog?.data?.message as string | undefined;
                        return msg ? (
                          <div className="text-red-400 text-xs bg-red-950/40 rounded px-2 py-1.5 leading-snug break-words">
                            {msg}
                          </div>
                        ) : null;
                      })()}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (qi.status === "error") {
                            setQueue(q => q.map((item, i) => i === idx ? { ...item, status: "pending", logs: [] } : item));
                            await new Promise(r => setTimeout(r, 50));
                            generateOne(idx);
                          } else {
                            generateOne(idx);
                          }
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs py-1.5 rounded font-medium disabled:opacity-50"
                        disabled={isRunning || (qi.status !== "pending" && qi.status !== "error")}
                      >
                        {qi.status === "generating" ? "Generating…" : qi.status === "done" ? "✓ Done" : qi.status === "error" ? "↺ Retry" : "Generate"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : activeView === "series" ? (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {seriesCatalog.length === 0 && (
                <div className="text-white/40 text-xs p-4 text-center">Loading series catalog…</div>
              )}
              {seriesCatalog.map((s) => {
                const gen = seriesGenState[s.id];
                const isGenerating = gen?.status === "generating";
                const isComplete = s.dbStatus === "published" || gen?.status === "complete";
                const hasError = gen?.status === "error";
                return (
                  <div key={s.id} className={`rounded-xl border p-3 space-y-2 ${isComplete ? "border-[#c9a227]/30 bg-[#c9a227]/5" : hasError ? "border-red-500/30" : "border-white/10 bg-white/5"}`}>
                    {s.coverImage && (
                      <img src={s.coverImage} alt={s.title} className="w-full h-24 object-cover rounded-lg" />
                    )}
                    <div>
                      <div className="font-medium text-sm text-white/90">{s.title}</div>
                      <div className="text-white/40 text-xs mt-0.5 line-clamp-2">{s.description}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    {isGenerating && gen && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#c9a227]">Episode {gen.currentEpisode}/{gen.totalEpisodes}</span>
                          <span className="text-white/40">{Math.round((gen.currentEpisode / gen.totalEpisodes) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <div className="bg-[#c9a227] h-1 rounded-full transition-all" style={{ width: `${(gen.currentEpisode / gen.totalEpisodes) * 100}%` }} />
                        </div>
                        <div className="text-[10px] text-white/40 line-clamp-1">{gen.logs[gen.logs.length - 1] ?? ""}</div>
                      </div>
                    )}
                    {hasError && (
                      <div className="text-red-400 text-xs">{gen?.error ?? "Generation failed"}</div>
                    )}
                    <button
                      onClick={() => generateSeries(s.id, s.episodeCount)}
                      disabled={isGenerating}
                      className={`w-full text-xs py-2 rounded-lg font-medium transition ${
                        isComplete
                          ? "bg-[#c9a227]/20 text-[#c9a227] hover:bg-[#c9a227]/30"
                          : hasError
                          ? "bg-red-700 hover:bg-red-600 text-white"
                          : isGenerating
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-[#c9a227] hover:bg-[#c9a227]/80 text-black"
                      }`}
                    >
                      {isGenerating ? `Generating episode ${gen?.currentEpisode ?? 0}/${gen?.totalEpisodes ?? s.episodeCount}…` : isComplete ? "✓ Complete — Regenerate?" : hasError ? "↺ Retry" : `Generate ${s.episodeCount} Episodes`}
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : activeView === "moderation" ? (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {moderationLoading && (
                <div className="text-white/40 text-xs text-center py-6">Loading…</div>
              )}

              <div>
                <div className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-2">Flagged Content Events</div>
                {!moderationLoading && flaggedItems.length === 0 && (
                  <div className="text-white/30 text-xs text-center py-4">No flagged events</div>
                )}
                {flaggedItems.map((item) => {
                  const id = String(item.id ?? "");
                  const isReporting = reportingId === id;
                  const alreadyReported = csamReports.some((r) => String(r.contentBlockId) === id);
                  return (
                    <div key={id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2 mb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-white/40 font-mono mb-0.5">ID: {id}</div>
                          <div className="text-xs text-white/70">{String(item.blockReason ?? item.blockSource ?? "Unknown reason")}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">{String(item.blockSource ?? "")}</div>
                          <div className="text-[10px] text-white/30 mt-1">{item.createdAt ? new Date(String(item.createdAt)).toLocaleString() : ""}</div>
                        </div>
                        {alreadyReported && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex-shrink-0">Reported</span>
                        )}
                      </div>
                      {item.inputHash && (
                        <div className="text-[10px] text-white/30 font-mono bg-black/20 rounded p-2 truncate">
                          hash: {String(item.inputHash)}
                        </div>
                      )}
                      {!alreadyReported && (
                        <div className="space-y-1.5">
                          <textarea
                            placeholder="Notes (optional)"
                            value={reportNotes[id] ?? ""}
                            onChange={(e) => setReportNotes((prev) => ({ ...prev, [id]: e.target.value }))}
                            className="w-full text-[10px] bg-black/30 border border-white/10 rounded p-1.5 text-white/60 placeholder:text-white/20 resize-none"
                            rows={2}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => fileReport(id, "ncmec")}
                              disabled={isReporting}
                              className="text-[10px] px-2 py-1 rounded bg-red-700 hover:bg-red-600 text-white disabled:opacity-50"
                            >
                              {isReporting ? "…" : "Report to NCMEC"}
                            </button>
                            <button
                              onClick={() => fileReport(id, "iwf")}
                              disabled={isReporting}
                              className="text-[10px] px-2 py-1 rounded bg-orange-700 hover:bg-orange-600 text-white disabled:opacity-50"
                            >
                              {isReporting ? "…" : "Report to IWF"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-2">Filed Reports</div>
                {!moderationLoading && csamReports.length === 0 && (
                  <div className="text-white/30 text-xs text-center py-4">No reports filed</div>
                )}
                {csamReports.map((r) => (
                  <div key={String(r.id)} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 mb-2">
                    <div className="text-[10px] text-white/40 font-mono">Block ID: {String(r.contentBlockId)}</div>
                    <div className="text-xs text-amber-300 mt-0.5">Reported to: {String(r.reportedTo).toUpperCase()}</div>
                    <div className="text-[10px] text-white/40">{r.reportedAt ? new Date(String(r.reportedAt)).toLocaleString() : ""}</div>
                    {r.notes && <div className="text-[10px] text-white/30 mt-1">{String(r.notes)}</div>}
                  </div>
                ))}
              </div>

              <button
                onClick={loadModeration}
                className="w-full text-xs text-white/40 hover:text-white py-2 border border-white/10 rounded-lg"
              >
                ↺ Refresh
              </button>
            </div>
          </ScrollArea>
        ) : (
          <>
            {drafts.length > 0 && (
              <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <span className="text-xs text-white/50">
                {drafts.filter(d => d.status !== "failed").length} draft{drafts.filter(d => d.status !== "failed").length !== 1 ? "s" : ""}
                {drafts.filter(d => d.status === "failed").length > 0 && (
                  <span className="text-red-400 ml-2">· {drafts.filter(d => d.status === "failed").length} failed</span>
                )}
              </span>
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
                    className={`w-full text-left rounded-xl overflow-hidden active:scale-[0.99] transition-all border ${
                      draft.status === "failed"
                        ? "border-red-500/40 hover:border-red-400/60"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    {draft.coverImageUrl && (
                      <img
                        src={draft.coverImageUrl}
                        alt={draft.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-3">
                      {draft.status === "failed" && (
                        <div className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mb-1">
                          ✗ Generation failed — needs retry
                        </div>
                      )}
                      <div className="font-semibold text-sm leading-snug mb-1">{draft.title}</div>
                      <div className="text-white/50 text-xs leading-relaxed line-clamp-2">{draft.description}</div>
                      {draft.status !== "failed" && (
                        <div className="mt-2 text-xs text-rose-400 font-medium">Tap to read →</div>
                      )}
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
        {activeView === "chat" ? (
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            isStreaming={isChatStreaming}
            scrollRef={chatScrollRef}
            inputRef={chatInputRef}
            onInputChange={setChatInput}
            onSend={sendChatMessage}
            onClear={() => { chatAbortRef.current?.abort(); setChatMessages([]); }}
          />
        ) : activeView === "generate" && selectedItem ? (
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
        ) : activeView === "series" ? (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-widest flex-shrink-0">
              Series Generation Log
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                {(() => {
                  const activeGen = Object.entries(seriesGenState).find(([, s]) => s.status === "generating" || (s.episodesComplete && s.episodesComplete.length > 0));
                  if (!activeGen) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="text-4xl mb-3">🎬</div>
                        <div className="text-white/30 text-sm">Select a series and click Generate to start.</div>
                        <div className="text-white/20 text-xs mt-2">Each series generates 5 episodes of 10-12 min each.</div>
                      </div>
                    );
                  }
                  const [seriesKey, gen] = activeGen;
                  const catalog = seriesCatalog.find(s => s.id === seriesKey);
                  return (
                    <div className="space-y-4">
                      {catalog && (
                        <div className="flex items-center gap-3">
                          {catalog.coverImage && (
                            <img src={catalog.coverImage} alt={catalog.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-semibold text-white/90">{catalog.title}</div>
                            <div className={`text-xs font-medium mt-0.5 ${gen.status === "complete" ? "text-[#c9a227]" : gen.status === "error" ? "text-red-400" : "text-white/40"}`}>
                              {gen.status === "generating" ? `Generating episode ${gen.currentEpisode} of ${gen.totalEpisodes}…` : gen.status === "complete" ? "✓ All episodes complete" : "Generation failed"}
                            </div>
                          </div>
                        </div>
                      )}
                      {gen.status === "generating" && (
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                          <div className="bg-[#c9a227] h-1.5 rounded-full transition-all" style={{ width: `${((gen.currentEpisode - 1) / gen.totalEpisodes) * 100}%` }} />
                        </div>
                      )}
                      {/* Episodes complete */}
                      {gen.episodesComplete && gen.episodesComplete.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">Completed Episodes</div>
                          {gen.episodesComplete.map((ep) => (
                            <div key={ep.episodeId} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                              {ep.coverImage && (
                                <img src={ep.coverImage} alt={ep.title} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white/90 truncate">{ep.title}</div>
                                <div className="text-xs text-white/40">Episode {ep.episode}</div>
                              </div>
                              <span className="text-[#c9a227] text-xs font-medium flex-shrink-0">✓</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Log feed */}
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-white/40 uppercase tracking-widest">Live Log</div>
                        <div className="bg-black/30 rounded-lg p-3 space-y-1 max-h-64 overflow-y-auto">
                          {gen.logs.map((log, i) => (
                            <div key={i} className="text-xs text-white/60 font-mono leading-snug">{log}</div>
                          ))}
                          {gen.logs.length === 0 && (
                            <div className="text-white/30 text-xs text-center py-3">Waiting for events…</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ScrollArea>
          </div>
        ) : activeView === "moderation" ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white/30 max-w-xs">
              <div className="text-4xl mb-3">🛡️</div>
              <div className="text-sm mb-2">Moderation queue</div>
              <div className="text-xs text-white/20">
                Review flagged events and file CSAM reports to NCMEC or IWF from the left panel. Reports are logged permanently.
              </div>
            </div>
          </div>
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
                  {draft.status === "failed" ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">✗</div>
                      <div className="text-red-400 font-semibold mb-2">Generation Failed</div>
                      <div className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                        This story did not generate successfully. Go to the <strong className="text-white/60">Generate tab</strong>, find this category, and tap Retry to generate a new version.
                      </div>
                      <div className="mt-4 text-white/30 text-xs">
                        {draft.title}
                      </div>
                    </div>
                  ) : draft.scenes && draft.scenes[0]?.text ? (
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
                {draft.status === "failed" ? (
                  <>
                    <button
                      onClick={() => regenerateFailed(draft)}
                      className="flex-1 bg-rose-700 hover:bg-rose-600 text-white text-sm py-3.5 rounded-xl font-semibold transition"
                    >
                      ↻ Regenerate
                    </button>
                    <button
                      onClick={() => {
                        updateDraftStatus(draft.storyId, "skipped");
                        setSelectedDraftId(null);
                      }}
                      className="flex-1 bg-white/8 hover:bg-white/12 text-white/50 text-sm py-3.5 rounded-xl font-medium transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedDraftId(null)}
                      className="px-5 bg-white/5 hover:bg-white/10 text-white/50 text-sm py-3.5 rounded-xl transition"
                    >
                      ←
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const rendered = parts.map((p, pi) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={pi}>{p.slice(2, -2)}</strong>;
      }
      if (p.startsWith("*") && p.endsWith("*")) {
        return <em key={pi}>{p.slice(1, -1)}</em>;
      }
      return p;
    });
    nodes.push(<span key={i}>{rendered}</span>);
    if (i < lines.length - 1) nodes.push(<br key={`br-${i}`} />);
  }
  return nodes;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  isStreaming: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClear: () => void;
  className?: string;
}

function ChatPanel({
  messages,
  input,
  isStreaming,
  scrollRef,
  inputRef,
  onInputChange,
  onSend,
  onClear,
  className = "flex flex-col flex-1 overflow-hidden",
}: ChatPanelProps) {
  return (
    <div className={className}>
      {/* Header bar */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <div className="text-xs font-medium text-violet-300 uppercase tracking-widest">
          Story Engine Chat
        </div>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-white/30 hover:text-white/60 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <div className="text-3xl">✦</div>
            <div className="text-white/30 text-sm max-w-xs leading-relaxed">
              Ask anything about the series arcs, episode structure, characters, or writing rules.
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                "What's the arc for Midnight Authority?",
                "What makes Episode 3 different from Ep 1?",
                "Describe Naomi Clarke",
                "What are the banned words?",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => onInputChange(hint)}
                  className="text-xs bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 px-3 py-1.5 rounded-full transition border border-white/10"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isStreamingThis = isLast && msg.role === "assistant" && isStreaming;
          return (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#c9a227]/20 text-[#f0d080] rounded-br-sm"
                    : "bg-white/10 text-white/80 rounded-bl-sm"
                }`}
              >
                {msg.content ? (
                  <span>{renderMarkdown(msg.content)}</span>
                ) : (
                  isStreamingThis && (
                    <span className="inline-block w-2 h-4 bg-violet-400 opacity-80 animate-pulse rounded-sm" />
                  )
                )}
                {isStreamingThis && msg.content && (
                  <span className="inline-block w-1.5 h-3.5 bg-violet-400 opacity-80 animate-pulse rounded-sm ml-0.5 align-middle" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-white/10 p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Ask about series, episodes, characters, writing rules… (Enter to send)"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-violet-500/50 disabled:opacity-50 leading-snug"
            style={{ minHeight: "40px", maxHeight: "120px", overflowY: "auto" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isStreaming}
            className="flex-shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2.5 rounded-xl transition h-10"
          >
            {isStreaming ? "…" : "Send"}
          </button>
        </div>
        <div className="text-[10px] text-white/20 mt-1.5 text-right">
          Shift+Enter for newline
        </div>
      </div>
    </div>
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
