import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Icon, Card, Badge, Button, EmptyState, Modal } from "@/components/ui";
import { PLATFORM_META } from "@/data/mock";
import { cn } from "@/utils/cn";

const STATUS_CHIP = {
  replied: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  no_match: "bg-secondary-container text-on-secondary-container",
  error: "bg-error-container text-error",
} as const;
const STATUS_DOT = { replied: "#16a34a", no_match: "#5f5e5e", error: "#ba1a1a" } as const;
const STATUS_LABEL = { replied: "Replied", no_match: "No Match", error: "Error" } as const;

export default function Dashboard() {
  const { activity, rules, credits, connections, toast } = useStore();
  const [chatOpen, setChatOpen] = useState(false);
  const activeRules = rules.filter((r) => r.status === "active").length;
  const totalHits = rules.reduce((s, r) => s + r.hits, 0);
  const connected = connections.filter((c) => c.connected).length;
  const lowCredits = credits <= 0;

  const stats = [
    { label: "Total Triggers", value: totalHits.toLocaleString(), icon: "bolt", tint: "text-primary-container bg-primary-container/10", note: "+12% vs last week", noteColor: "text-green-600" },
    { label: "Active Rules", value: activeRules, icon: "rule", tint: "text-tertiary bg-tertiary/10", note: "Active", noteColor: "text-secondary" },
    { label: "Credits Left", value: credits, icon: "account_balance_wallet", tint: "text-primary bg-primary/10", note: "Refill", noteColor: "text-primary", link: "/billing" },
    { label: "Platforms", value: `${connected}/3`, icon: "hub", tint: "text-green-600 bg-green-500/10", note: "Healthy", noteColor: "text-green-600" },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard — EchoDesk</title>
        <meta name="description" content="View your auto-reply dashboard, stats, and recent activity." />
      </Helmet>
    <DashboardLayout title="Dashboard">
      {lowCredits && (
        <Card className="border-2 border-primary-container bg-primary-container/5 p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0">
              <Icon name="warning" fill className="text-primary-container text-[24px]" />
            </div>
            <p className="text-sm">
              <span className="font-semibold">You've used all 5 free triggers.</span> Upgrade to keep your
              automated replies running smoothly.
            </p>
          </div>
          <Link to="/billing">
            <Button iconRight="arrow_forward">Upgrade Now</Button>
          </Link>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} hover className="p-5">
            <div className="flex items-start justify-between">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", s.tint)}>
                <Icon name={s.icon} className="text-[22px]" />
              </div>
              {s.link ? (
                <Link to={s.link} className={cn("text-[13px] font-semibold hover:underline", s.noteColor)}>{s.note}</Link>
              ) : (
                <span className={cn("text-[13px] font-medium", s.noteColor)}>{s.note}</span>
              )}
            </div>
            <p className="font-display text-3xl font-bold mt-4">{s.value}</p>
            <p className="text-secondary text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Activity + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <Card className="lg:col-span-2 flex flex-col h-[500px]">
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/10">
            <h2 className="font-display font-bold">Recent Activity</h2>
            <Link to="/keywords" className="text-primary text-sm hover:underline">View All</Link>
          </div>
          {activity.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No activity yet"
              desc="Add your first keyword rule to get started."
              action={<Link to="/keywords"><Button icon="add">Add Rule</Button></Link>}
            />
          ) : (
            <div className="flex-1 overflow-y-auto scroll-thin p-3 space-y-2">
              {activity.map((a) => {
                const meta = PLATFORM_META[a.platform];
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-surface-low/60 rounded-xl hover:bg-surface-low transition-standard">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", meta.chip)}>
                        <Icon name={meta.icon} className="text-[20px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.message}</p>
                        {a.keyword && (
                          <span className="inline-block mt-1 text-[11px] font-semibold bg-primary-container/10 text-primary px-2 py-0.5 rounded-full">
                            {a.keyword}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={STATUS_CHIP[a.status]} dot={STATUS_DOT[a.status]}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                      <p className="text-secondary text-[11px] mt-1">{a.at}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <h2 className="font-display font-bold">Quick Actions</h2>
          {[
            { to: "/keywords", icon: "add", label: "Add Keyword", desc: "Create a new rule", tint: "bg-primary-container/10 text-primary-container", hover: "group-hover:bg-primary-container" },
            { to: "/connections", icon: "hub", label: "Connect Platform", desc: "Link an account", tint: "bg-tertiary/10 text-tertiary", hover: "group-hover:bg-tertiary" },
            { to: "/billing", icon: "bolt", label: "Buy Credits", desc: "Top up your wallet", tint: "bg-primary/10 text-primary", hover: "group-hover:bg-primary" },
          ].map((q) => (
            <Link key={q.label} to={q.to} className="group block">
              <Card hover className="p-4 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-standard group-hover:text-white", q.tint, q.hover)}>
                  <Icon name={q.icon} className="text-[22px]" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{q.label}</p>
                  <p className="text-secondary text-xs">{q.desc}</p>
                </div>
                <Icon name="chevron_right" className="text-secondary ml-auto" />
              </Card>
            </Link>
          ))}

          <Card className="p-5 bg-surface-high relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary/5" />
            <Icon name="support_agent" className="text-primary-container text-[28px]" />
            <p className="font-semibold mt-2">Need a hand?</p>
            <p className="text-secondary text-sm mt-1">Our team replies in minutes during business hours.</p>
            <button onClick={() => setChatOpen(true)} className="text-primary font-semibold text-sm mt-3 inline-flex items-center gap-1 group">
              Start Chat <Icon name="arrow_forward" className="text-[16px] group-hover:translate-x-1 transition-standard" />
            </button>
          </Card>
        </div>
      </div>
      {chatOpen && (
        <Modal open onClose={() => setChatOpen(false)} title="Live Chat" footer={
          <Button onClick={() => { setChatOpen(false); toast({ type: "info", title: "Chat session ended" }); }}>Close Chat</Button>
        }>
          <p className="text-secondary">Our support team is available Mon–Sat, 9 AM – 6 PM NPT.</p>
          <div className="bg-surface-low rounded-xl p-4 space-y-3">
            <div className="bg-surface-lowest rounded-lg p-3 text-sm max-w-[80%]">Namaste! How can we help you today? 🙏</div>
            <div className="bg-primary-container/10 rounded-lg p-3 text-sm max-w-[80%] ml-auto">I need help with setting up auto-reply.</div>
            <div className="bg-surface-lowest rounded-lg p-3 text-sm max-w-[80%]">Sure! Go to Automations → Add Keyword Rule. What keyword do you want to track?</div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
    </>
  );
}
