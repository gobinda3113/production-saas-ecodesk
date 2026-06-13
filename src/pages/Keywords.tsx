import { useMemo, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Icon, Card, Button, Toggle, Modal, Segmented, EmptyState, Input } from "@/components/ui";
import { Sparkline } from "@/components/Toaster";
import { PLATFORM_META, type KeywordRule, type MatchMode, type Platform } from "@/data/mock";
import { matchKeyword } from "@/utils/matcher";
import { cn } from "@/utils/cn";

const PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok"];

const MATCH_BADGE: Record<MatchMode, { label: string; cls: string }> = {
  exact: { label: "Exact Match", cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  contains: { label: "Contains", cls: "bg-secondary-container text-on-secondary-container" },
  all: { label: "All Words", cls: "bg-primary-container/15 text-primary" },
};

const MODE_INFO: Record<MatchMode, string> = {
  exact: "Triggers only if the message exactly matches (case-insensitive).",
  contains: "Triggers if keyword appears anywhere inside the message.",
  all: "Phonetic + substring + fuzzy. Catches typos and Nepali spelling variants.",
};

function emptyRule(): KeywordRule {
  return {
    id: "r" + Date.now(),
    keyword: "",
    matchMode: "all",
    platforms: ["instagram"],
    allPosts: true,
    postUrls: {},
    reply: "",
    hits: 0,
    trend: [0, 0, 0, 0, 0, 0],
    status: "active",
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export default function Keywords() {
  const { rules, saveRule, deleteRule, toggleRule, toast } = useStore();
  const [filter, setFilter] = useState<"all" | Platform>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KeywordRule | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? rules : rules.filter((r) => r.platforms.includes(filter))),
    [rules, filter]
  );

  const openNew = () => {
    setEditing(emptyRule());
    setModalOpen(true);
  };
  const openEdit = (r: KeywordRule) => {
    setEditing({ ...r });
    setModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Keyword Rules — EchoDesk</title>
        <meta name="description" content="Manage your auto-reply keyword rules across all connected platforms." />
      </Helmet>
    <DashboardLayout title="Keywords">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Keywords</h1>
          <p className="text-secondary text-sm mt-1">
            Manage your automated response triggers across all platforms.
          </p>
        </div>
        <Button icon="add" onClick={openNew}>Add Keyword Rule</Button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mt-6">
        {(["all", ...PLATFORMS] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium capitalize transition-standard",
              filter === p
                ? "bg-primary-container text-white"
                : "bg-surface-high text-secondary hover:bg-surface-highest"
            )}
          >
            {p === "all" ? "All" : PLATFORM_META[p].name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6">
          <EmptyState
            icon="monitoring"
            title="No rules yet."
            desc="Create your first keyword rule to start auto-replying to customers."
            action={<Button icon="add" onClick={openNew}>Create your first rule</Button>}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          {filtered.map((r) => {
            const badge = MATCH_BADGE[r.matchMode];
            const isOpen = expanded === r.id;
            return (
              <Card key={r.id} hover className="p-5">
                {/* Row 1 */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-semibold tracking-tight">{r.keyword}</h3>
                    <span className={cn("text-[10px] font-label-mono uppercase tracking-widest px-2 py-1 rounded-lg", badge.cls)}>
                      {badge.label}
                    </span>
                  </div>
                  <Toggle checked={r.status === "active"} onChange={() => toggleRule(r.id)} label={`Toggle ${r.keyword}`} />
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {r.platforms.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 text-secondary bg-surface-low px-2.5 py-1 rounded-lg text-xs">
                      <Icon name={PLATFORM_META[p].icon} className="text-[16px]" />
                      {PLATFORM_META[p].name}
                    </span>
                  ))}
                  {!r.allPosts && Object.values(r.postUrls)[0] && (
                    <a href={Object.values(r.postUrls)[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-primary-container/10 text-primary px-2.5 py-1 rounded-lg text-xs hover:bg-primary-container/20 transition-standard max-w-[160px]">
                      <Icon name="link" className="text-[14px]" />
                      <span className="underline truncate">{Object.values(r.postUrls)[0]}</span>
                    </a>
                  )}
                </div>

                {/* Reply preview */}
                <p className="text-secondary text-sm mt-3 line-clamp-2 bg-surface-low/50 rounded-lg p-2.5">
                  {r.reply}
                </p>

                {/* Row 3 */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/10">
                  <button onClick={() => setExpanded(isOpen ? null : r.id)} className="flex items-center gap-3 group">
                    <div className="text-left">
                      <p className="text-secondary text-xs">Performance</p>
                      <p className="font-display text-lg font-bold text-primary-container">{r.hits} <span className="text-xs font-normal text-secondary">hits</span></p>
                    </div>
                    <Sparkline data={r.trend} />
                    <Icon name="expand_more" className={cn("text-secondary transition-standard", isOpen && "rotate-180")} />
                  </button>
                  <button onClick={() => openEdit(r)} className="text-secondary hover:text-primary transition-standard flex items-center gap-1 text-sm font-medium">
                    <Icon name="edit" className="text-[18px]" /> Edit
                  </button>
                </div>

                {/* Hit timeline */}
                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/10 animate-fade-in">
                    <div className="flex items-end gap-1.5 h-24">
                      {r.trend.concat(r.trend).map((v, i) => {
                        const max = Math.max(...r.trend, 1);
                        return (
                          <div key={i} className="flex-1 bg-primary-container rounded-t" style={{ height: `${Math.max((v / max) * 100, 6)}%`, opacity: 0.5 + (i / 12) * 0.5 }} />
                        );
                      })}
                    </div>
                    <p className="text-secondary text-xs mt-2 text-center">
                      Total {r.hits} hits · avg {Math.round(r.hits / 14)}/day · last 14 days
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {modalOpen && editing && (
        <RuleModal
          rule={editing}
          onClose={() => setModalOpen(false)}
          onSave={(r) => {
            saveRule(r);
            setModalOpen(false);
            toast({ type: "success", title: "Rule saved", desc: `"${r.keyword}" is now ${r.status}.` });
          }}
          onDelete={(id) => {
            setConfirmDelete(id);
            setModalOpen(false);
          }}
          toast={toast}
        />
      )}

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(null)} title="Delete Rule?" footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { deleteRule(confirmDelete); setConfirmDelete(null); toast({ type: "info", title: "Rule deleted" }); }}>Delete</Button>
          </>
        }>
          <p className="text-secondary">This will permanently delete this keyword rule. <span className="font-semibold text-error">This cannot be undone.</span></p>
        </Modal>
      )}
    </DashboardLayout>
    </>
  );
}

/* ── Add / Edit modal ── */
function RuleModal({
  rule,
  onClose,
  onSave,
  onDelete,
  toast,
}: {
  rule: KeywordRule;
  onClose: () => void;
  onSave: (r: KeywordRule) => void;
  onDelete: (id: string) => void;
  toast: (t: { type: "success" | "error" | "info"; title: string; desc?: string }) => void;
}) {
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<KeywordRule>(rule);
  const [testMsg, setTestMsg] = useState("");
  const [errors, setErrors] = useState<{ keyword?: string; reply?: string; platforms?: string }>({});
  const isNew = !rule.keyword;

  const set = <K extends keyof KeywordRule>(k: K, v: KeywordRule[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const togglePlatform = (p: Platform) => {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  };

  const testResult = testMsg ? matchKeyword(testMsg, form.keyword, form.matchMode) : null;

  const submit = () => {
    const errs: typeof errors = {};
    if (!form.keyword.trim()) errs.keyword = "Keyword is required.";
    if (!form.reply.trim()) errs.reply = "Reply message is required.";
    if (form.platforms.length === 0) errs.platforms = "Select at least one platform.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave(form);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? "Add Keyword Rule" : "Edit Keyword Rule"}
      size="xl"
      footer={
        <>
          {!isNew && (
            <Button variant="danger" className="mr-auto" icon="delete" onClick={() => onDelete(form.id)}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>Save Rule</Button>
        </>
      }
    >
      {/* Keyword */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Trigger Keyword</label>
        <Input
          placeholder="e.g. 'Shipping' or 'How much?'"
          value={form.keyword}
          onChange={(e) => set("keyword", e.target.value)}
        />
        {errors.keyword && <p className="text-error text-[13px] mt-1">{errors.keyword}</p>}
      </div>

      {/* Match mode */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Match Mode</label>
        <Segmented
          value={form.matchMode}
          onChange={(v) => set("matchMode", v as MatchMode)}
          options={[
            { value: "exact", label: "Exact Match" },
            { value: "contains", label: "Contains Any" },
            { value: "all", label: "All Words" },
          ]}
        />
        <p className="text-secondary text-[13px] mt-2 flex items-start gap-1.5">
          <Icon name="info" className="text-[16px] shrink-0 mt-0.5" />
          {MODE_INFO[form.matchMode]}
        </p>
      </div>

      {/* Platforms */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Platforms</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-standard border",
                form.platforms.includes(p)
                  ? "bg-primary-container/10 border-primary-container text-primary"
                  : "bg-surface-low border-transparent text-secondary hover:text-on-background"
              )}
            >
              <Icon name={PLATFORM_META[p].icon} className="text-[18px]" />
              {PLATFORM_META[p].name}
            </button>
          ))}
        </div>
        {errors.platforms && <p className="text-error text-[13px] mt-1">{errors.platforms}</p>}
      </div>

      {/* Apply to all posts */}
      <div className="flex items-center justify-between p-3.5 bg-surface-low rounded-xl">
        <div>
          <p className="text-sm font-medium">Apply to all posts</p>
          <p className="text-secondary text-xs">Turn off to target a specific post URL per platform.</p>
        </div>
        <Toggle checked={form.allPosts} onChange={(v) => set("allPosts", v)} label="Apply to all posts" />
      </div>

      {/* Specific posts */}
      {!form.allPosts && (
        <div className="space-y-2.5 animate-fade-in">
          {form.platforms.map((p) => (
            <div key={p}>
              <label className="text-xs text-secondary flex items-center gap-1 mb-1">
                <Icon name={PLATFORM_META[p].icon} className="text-[14px]" /> {PLATFORM_META[p].name} post URL
              </label>
              <Input
                placeholder={`https://${p}.com/p/...`}
                value={form.postUrls[p] ?? ""}
                onChange={(e) => set("postUrls", { ...form.postUrls, [p]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {/* Reply */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Reply Message</label>
        <textarea
          rows={4}
          maxLength={500}
          value={form.reply}
          onChange={(e) => set("reply", e.target.value)}
          placeholder="Namaste! 🙏 Yo product ko price NPR …"
          className="w-full px-4 py-3 rounded-[10px] border border-outline-variant/40 bg-surface-lowest text-on-background placeholder:text-secondary/60 focus-gold transition-standard resize-none"
        />
        <div className="flex justify-between mt-1">
          {errors.reply ? <p className="text-error text-[13px]">{errors.reply}</p> : <span />}
          <p className="text-secondary text-xs">{form.reply.length}/500</p>
        </div>
      </div>

      {/* Media upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Media (optional)</label>
        <button type="button" onClick={() => mediaInputRef.current?.click()} className="w-full border-2 border-dashed border-outline-variant/40 rounded-xl p-8 text-center hover:border-primary-container/40 transition-standard cursor-pointer">
          <Icon name="cloud_upload" className="text-[32px] text-secondary" />
          <p className="text-sm font-medium mt-2">Drop images or click to upload</p>
          <p className="text-secondary text-xs mt-0.5">PNG, JPG or MP4 up to 5MB</p>
        </button>
        <input ref={mediaInputRef} type="file" accept="image/png,image/jpeg,video/mp4" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toast?.({ type: "success", title: "File selected", desc: f.name }); }} />
      </div>

      {/* Live matcher test */}
      <div className="bg-surface-low rounded-xl p-3.5">
        <label className="text-sm font-medium flex items-center gap-1.5">
          <Icon name="science" className="text-[18px] text-primary-container" /> Test the matcher
        </label>
        <Input
          className="mt-2"
          placeholder="Type a sample customer message…"
          value={testMsg}
          onChange={(e) => setTestMsg(e.target.value)}
        />
        {testResult && (
          <p className={cn("text-sm mt-2 font-medium flex items-center gap-1.5", testResult.matched ? "text-green-600" : "text-secondary")}>
            <Icon name={testResult.matched ? "check_circle" : "cancel"} className="text-[18px]" />
            {testResult.matched ? `Match via "${testResult.layer}" layer — reply would fire.` : "No match — no reply, no credit used."}
          </p>
        )}
      </div>
    </Modal>
  );
}
