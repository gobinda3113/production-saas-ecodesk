import { useState, Fragment, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Icon, Card, Button, Badge, Modal, Input, EmptyState } from "@/components/ui";
import {
  seedClients,
  seedWebhooks,
  seedTransactions,
  PLATFORM_META,
  PLANS,
  type AdminClient,
} from "@/data/mock";
import { cn } from "@/utils/cn";

/* ── Overview ── */
export function AdminOverview() {
  const stats = [
    { label: "Total Clients", value: "512", icon: "group", tint: "text-tertiary bg-tertiary/10" },
    { label: "Triggers Today", value: "8,431", icon: "bolt", tint: "text-primary-container bg-primary-container/10" },
    { label: "Revenue This Month", value: "NPR 184K", icon: "payments", tint: "text-green-600 bg-green-500/10" },
    { label: "Active Connections", value: "1,204", icon: "hub", tint: "text-primary bg-primary/10" },
  ];
  const alerts: { icon: string; label: string; cls: string; to: string }[] = [
    { icon: "schedule", label: "7 tokens expiring in 24h", cls: "bg-primary-fixed/30 text-[#92600a]", to: "/admin/system" },
    { icon: "error", label: "3 failed webhooks", cls: "bg-error-container text-error", to: "/admin/webhooks" },
    { icon: "hourglass_empty", label: "5 pending payments", cls: "bg-primary-fixed/30 text-[#92600a]", to: "/admin/payments" },
  ];
  return (
    <>
      <Helmet>
        <title>Admin Overview — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <DashboardLayout title="Overview" admin>
      <h1 className="font-display text-2xl font-bold">Platform Overview</h1>
      <p className="text-secondary text-sm mt-1">System-wide metrics and alerts.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        {stats.map((s) => (
          <Card key={s.label} hover className="p-5">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", s.tint)}>
              <Icon name={s.icon} className="text-[22px]" />
            </div>
            <p className="font-display text-3xl font-bold mt-4">{s.value}</p>
            <p className="text-secondary text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {alerts.map((a) => (
          <Link key={a.label} to={a.to} className="block group">
            <Card className="p-4 flex items-center gap-3 group-hover:border-primary-container/30 transition-standard">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", a.cls)}>
                <Icon name={a.icon} className="text-[20px]" />
              </div>
              <span className="font-medium text-sm flex-1">{a.label}</span>
              <Icon name="chevron_right" className="text-secondary text-[18px] group-hover:translate-x-1 transition-standard" />
            </Card>
          </Link>
        ))}
      </div>
    </DashboardLayout>
    </>
  );
}

/* ── Clients ── */
export function AdminClients() {
  const { toast } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "disabled" | "trial">("all");
  const [clients, setClients] = useState(seedClients);
  const [drawer, setDrawer] = useState<AdminClient | null>(null);
  const [topUp, setTopUp] = useState(false);
  const [amount, setAmount] = useState("");
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [changePlan, setChangePlan] = useState(false);

  const list = clients.filter((c) => {
    const matchSearch = c.business.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true : filter === "trial" ? c.trial : c.status === filter;
    return matchSearch && matchFilter;
  });

  const toggleStatus = useCallback(() => {
    if (!drawer) return;
    const newStatus = drawer.status === "active" ? "disabled" : "active";
    setClients((prev) => prev.map((c) => c.id === drawer.id ? { ...c, status: newStatus } : c));
    setDrawer((prev) => prev ? { ...prev, status: newStatus } : null);
    setConfirmDisable(false);
    toast({ type: "success", title: newStatus === "active" ? "Account enabled" : "Account disabled", desc: `${drawer.business} is now ${newStatus}.` });
  }, [drawer, toast]);

  return (
    <>
      <Helmet>
        <title>Admin Clients — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <DashboardLayout title="Clients" admin>
      <h1 className="font-display text-2xl font-bold">Client Accounts</h1>
      <p className="text-secondary text-sm mt-1">Manage all merchant accounts.</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]" />
          <Input className="pl-10 rounded-full" placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "disabled", "trial"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-full text-sm font-medium capitalize transition-standard", filter === f ? "bg-primary-container text-white" : "bg-surface-high text-secondary hover:bg-surface-highest")}>
              {f === "trial" ? "Free Trial" : f}
            </button>
          ))}
        </div>
      </div>

      <Card className="mt-5 overflow-hidden">
        {list.length === 0 ? (
          <EmptyState icon="search_off" title="No clients found." desc="Try a different search term or filter." />
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="text-left text-secondary text-xs uppercase tracking-wider border-b border-outline-variant/15">
                  {["Business", "Email", "Plan", "Credits", "Platforms", "Last Active", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-low/50 transition-standard">
                    <td className="px-4 py-3.5 font-medium">{c.business}</td>
                    <td className="px-4 py-3.5 text-secondary">{c.email}</td>
                    <td className="px-4 py-3.5"><span className="font-label-mono text-[11px] bg-surface-high px-2 py-1 rounded-full">{c.plan}</span></td>
                    <td className="px-4 py-3.5">{c.credits.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {c.platforms.map((p) => <Icon key={p} name={PLATFORM_META[p].icon} className="text-[18px] text-secondary" />)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-secondary">{c.lastActive}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={c.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-error-container text-error"}>
                        {c.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5"><Button variant="ghost" onClick={() => setDrawer(c)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-inverse-surface/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawer(null)}>
          <div className="w-full max-w-[480px] bg-surface-lowest h-full overflow-y-auto scroll-thin border-l border-outline-variant/20 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/15 sticky top-0 bg-surface-lowest z-10">
              <h2 className="font-display text-lg font-semibold">{drawer.business}</h2>
              <button onClick={() => setDrawer(null)} aria-label="Close" className="p-1.5 rounded-full hover:bg-surface-low"><Icon name="close" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider">Profile</p>
                <p className="text-sm mt-1">{drawer.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-label-mono text-[11px] bg-surface-high px-2 py-1 rounded-full">{drawer.plan}</span>
                  <Badge className={drawer.status === "active" ? "bg-green-100 text-green-700" : "bg-error-container text-error"}>{drawer.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider mb-2">Platforms</p>
                <div className="flex gap-3">
                  {(["instagram", "facebook", "tiktok"] as const).map((p) => (
                    <span key={p} className="flex items-center gap-1.5 text-sm">
                      <span className={cn("w-2 h-2 rounded-full", drawer.platforms.includes(p) ? "bg-green-500" : "bg-outline-variant")} />
                      {PLATFORM_META[p].name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider mb-2">Credit Usage</p>
                <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: "64%" }} />
                </div>
                <p className="text-secondary text-xs mt-1.5">{drawer.credits.toLocaleString()} credits remaining</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={() => setTopUp(true)}>Top Up Credits</Button>
                <Button variant="outline" onClick={() => setChangePlan(true)}>Change Plan</Button>
                <Button variant="outline" icon="webhook" onClick={() => toast({ type: "info", title: "Webhook Logs", desc: `Showing logs for ${drawer.business}.` })}>Webhook Logs</Button>
                {drawer.status === "active" ? (
                  <Button variant="danger" onClick={() => setConfirmDisable(true)}>Disable Account</Button>
                ) : (
                  <Button variant="gold" icon="check" onClick={toggleStatus}>Enable Account</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {topUp && (
        <Modal open onClose={() => setTopUp(false)} title="Top Up Credits" footer={
          <>
            <Button variant="ghost" onClick={() => setTopUp(false)}>Cancel</Button>
            <Button onClick={() => { setTopUp(false); toast({ type: "success", title: "Credits added", desc: `${amount || 0} credits added to ${drawer?.business}.` }); setAmount(""); }}>Confirm</Button>
          </>
        }>
          <label className="block text-sm font-medium mb-1.5">Credit amount</label>
          <Input type="number" placeholder="e.g. 500" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Modal>
      )}

      {confirmDisable && (
        <Modal open onClose={() => setConfirmDisable(false)} title="Disable Account" footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDisable(false)}>Cancel</Button>
            <Button variant="danger" onClick={toggleStatus}>Disable {drawer?.business}</Button>
          </>
        }>
          <p className="text-secondary">This will pause all keyword rules and platform connections for <span className="font-semibold text-on-background">{drawer?.business}</span>. They can be re-enabled later.</p>
        </Modal>
      )}

      {changePlan && drawer && (
        <Modal open onClose={() => setChangePlan(false)} title="Change Plan" footer={
          <>
            <Button variant="ghost" onClick={() => setChangePlan(false)}>Cancel</Button>
          </>
        }>
          <p className="text-secondary mb-4">Select a new plan for <span className="font-semibold text-on-background">{drawer.business}</span>:</p>
          <div className="space-y-2">
            {PLANS.map((p) => (
              <button key={p.id} type="button" onClick={() => { setClients((prev) => prev.map((c) => c.id === drawer.id ? { ...c, plan: p.name } : c)); setDrawer({ ...drawer, plan: p.name }); setChangePlan(false); toast({ type: "success", title: "Plan changed", desc: `${drawer.business} moved to ${p.name}.` }); }} className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-low hover:bg-surface-high transition-standard">
                <span className="font-medium">{p.name}</span>
                <span className="text-secondary text-sm">NPR {p.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </DashboardLayout>
    </>
  );
}

/* ── Payments ── */
export function AdminPayments() {
  const { toast } = useStore();
  return (
    <>
      <Helmet>
        <title>Admin Payments — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <DashboardLayout title="Payments" admin>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Payments</h1>
          <p className="text-secondary text-sm mt-1">All transactions across clients.</p>
        </div>
        <Button variant="outline" icon="download" onClick={() => toast({ type: "success", title: "Export started", desc: "Payment CSV is being generated." })}>Export CSV</Button>
      </div>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-secondary text-xs uppercase tracking-wider border-b border-outline-variant/15">
                {["Client", "Amount", "Credits", "Gateway", "Status", "Date", "Transaction ID"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {seedTransactions.map((t, i) => (
                <tr key={t.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-low/50 transition-standard">
                  <td className="px-4 py-3.5 font-medium">{seedClients[i % seedClients.length].business}</td>
                  <td className="px-4 py-3.5">NPR {t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5">{PLANS.find((p) => p.name === t.plan)?.credits.toLocaleString() ?? "—"}</td>
                  <td className="px-4 py-3.5 capitalize">{t.gateway}</td>
                  <td className="px-4 py-3.5"><Badge className={t.status === "completed" ? "bg-green-100 text-green-700" : t.status === "failed" ? "bg-error-container text-error" : "bg-primary-fixed/40 text-primary"}>{t.status}</Badge></td>
                  <td className="px-4 py-3.5 text-secondary">{t.date}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-secondary">{t.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
    </>
  );
}

/* ── Webhooks ── */
export function AdminWebhooks() {
  const { toast } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const statusChip = { matched: "bg-green-100 text-green-700", no_match: "bg-secondary-container text-on-secondary-container", error: "bg-error-container text-error" } as const;
  return (
    <>
      <Helmet>
        <title>Admin Webhooks — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <DashboardLayout title="Webhooks" admin>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Webhook Audit Log</h1>
          <p className="text-secondary text-sm mt-1">Every inbound event and match result.</p>
        </div>
        <Button variant="outline" icon="download" onClick={() => toast({ type: "success", title: "Export started", desc: "Webhook CSV is being generated." })}>Export CSV</Button>
      </div>
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="text-left text-secondary text-xs uppercase tracking-wider border-b border-outline-variant/15">
                {["Client", "Platform", "Event", "Message Preview", "Keyword", "Status", "Time", "Timestamp"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {seedWebhooks.map((w) => (
                <Fragment key={w.id}>
                  <tr className="border-b border-outline-variant/10 hover:bg-surface-low/50 transition-standard cursor-pointer" onClick={() => setExpanded(expanded === w.id ? null : w.id)}>
                    <td className="px-4 py-3.5 font-medium">{w.client}</td>
                    <td className="px-4 py-3.5 capitalize">{PLATFORM_META[w.platform].name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">{w.event}</td>
                    <td className="px-4 py-3.5 text-secondary max-w-[220px] truncate">{w.preview}</td>
                    <td className="px-4 py-3.5">{w.keyword ?? "—"}</td>
                    <td className="px-4 py-3.5"><Badge className={statusChip[w.status]}>{w.status}</Badge></td>
                    <td className="px-4 py-3.5 font-mono text-xs">{w.ms}ms</td>
                    <td className="px-4 py-3.5 text-secondary text-xs">{w.at}</td>
                  </tr>
                  {expanded === w.id && (
                    <tr>
                      <td colSpan={8} className="px-4 pb-4 bg-surface-low/30">
                        <pre className="bg-surface-low font-mono text-xs rounded-lg p-4 overflow-x-auto scroll-thin mt-2">
{JSON.stringify({ client: w.client, platform: w.platform, event: w.event, message: w.preview, matched_keyword: w.keyword, status: w.status, processing_ms: w.ms, received_at: w.at }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
    </>
  );
}

/* ── System ── */
export function AdminSystem() {
  const { toast } = useStore();
  const [failedCount, setFailedCount] = useState(3);
  const queue = [
    { label: "Waiting", value: 24, cls: "text-secondary" },
    { label: "Active", value: 6, cls: "text-tertiary" },
    { label: "Completed", value: "184,902", cls: "text-green-600" },
    { label: "Failed", value: failedCount, cls: "text-error" },
  ];
  const oauth = [
    { p: "instagram", valid: true, expiry: "2026-08-12" },
    { p: "facebook", valid: true, expiry: "2026-08-12" },
    { p: "tiktok", valid: false, expiry: "2026-02-01" },
  ] as const;
  return (
    <>
      <Helmet>
        <title>Admin System — EchoDesk</title>
        <meta name="robots" content="noindex" />
      </Helmet>
    <DashboardLayout title="System" admin>
      <h1 className="font-display text-2xl font-bold">System Health</h1>
      <p className="text-secondary text-sm mt-1">Queue, integrations, and maintenance.</p>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-bold flex items-center gap-2"><Icon name="queue" className="text-primary-container" /> Queue Health (BullMQ)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          {queue.map((q) => (
            <div key={q.label} className="bg-surface-low rounded-xl p-4 text-center">
              <p className={cn("font-display text-3xl font-bold", q.cls)}>{q.value}</p>
              <p className="text-secondary text-xs uppercase tracking-wider mt-1">{q.label}</p>
            </div>
          ))}
        </div>
        <Button variant="danger" className="mt-5" icon="delete_sweep" onClick={() => { setFailedCount(0); toast({ type: "success", title: "Failed jobs cleared", desc: "All failed jobs removed from the queue." }); }}>
          Clear Failed Jobs
        </Button>
      </Card>

      <Card className="p-6 mt-6">
        <h2 className="font-display font-bold flex items-center gap-2"><Icon name="key" className="text-primary-container" /> Platform OAuth Apps</h2>
        <div className="mt-5 space-y-3">
          {oauth.map((o) => (
            <div key={o.p} className="flex items-center justify-between p-3.5 bg-surface-low rounded-xl">
              <span className="flex items-center gap-2 font-medium"><Icon name={PLATFORM_META[o.p].icon} className="text-[20px]" /> {PLATFORM_META[o.p].name}</span>
              <div className="flex items-center gap-3">
                <span className="text-secondary text-xs">Expires {o.expiry}</span>
                <Badge className={o.valid ? "bg-green-100 text-green-700" : "bg-error-container text-error"}>{o.valid ? "Valid" : "Expired"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
    </>
  );
}
