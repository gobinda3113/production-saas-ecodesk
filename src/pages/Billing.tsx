import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Icon, Card, Button, Badge, Modal, EmptyState } from "@/components/ui";
import { PLANS, type Plan, type TxStatus } from "@/data/mock";
import { cn } from "@/utils/cn";

const TX_CHIP: Record<TxStatus, string> = {
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  pending: "bg-primary-fixed/40 text-primary",
  failed: "bg-error-container text-error",
};

export default function Billing() {
  const { credits, plan, setPlan, addCredits, transactions, addTransaction, activity, toast } = useStore();
  const [purchase, setPurchase] = useState<Plan | null>(null);

  const used = Math.max(activity.filter((a) => a.status === "replied").length, 13);
  const total = used + credits;
  const pct = total ? Math.round((credits / total) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Billing & Credits — EchoDesk</title>
        <meta name="description" content="Manage your EchoDesk plan, credits, and payment history." />
      </Helmet>
    <DashboardLayout title="Billing">
      <h1 className="font-display text-2xl font-bold">Billing & Credits</h1>
      <p className="text-secondary text-sm mt-1">Manage your plan, wallet, and payment history.</p>

      {/* Wallet */}
      <Card className="p-6 mt-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <Badge className="bg-primary-container/10 text-primary font-label-mono uppercase">
              {plan} Plan
            </Badge>
            <p className="font-display text-5xl font-bold text-primary-container mt-3">{credits}</p>
            <p className="text-secondary text-sm">credits remaining</p>
            <div className="mt-4 max-w-md">
              <div className="h-2 bg-surface-high rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-secondary text-xs mt-1.5">
                {used} credits used this month · {credits} credits remaining
              </p>
            </div>
          </div>
          <Button iconRight="arrow_forward" onClick={() => setPurchase(PLANS.find((p) => p.name === plan) ?? PLANS[1])}>Buy More Credits</Button>
        </div>
      </Card>

      {/* Plans */}
      <h2 className="font-display text-lg font-bold mt-8">Choose a Plan</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
        {PLANS.map((p) => {
          const current = p.name === plan;
          return (
            <Card key={p.id} className={cn("p-6 relative flex flex-col", (p.popular || current) && "border-2 border-primary-container", p.popular && "shadow-xl")}>
              {p.popular && !current && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-label-mono text-[10px] uppercase bg-primary-container text-white px-3 py-1 rounded-full">Most Popular</span>
              )}
              <h3 className="font-display text-lg font-semibold">{p.name}</h3>
              <p className="font-display text-2xl font-bold mt-2">NPR {p.price.toLocaleString()}</p>
              <p className="text-primary-container font-semibold text-sm mt-1">{p.credits.toLocaleString()} credits</p>
              <ul className="mt-4 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-secondary">
                    <Icon name="check_circle" className="text-primary text-[16px] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              {current ? (
                <span className="mt-5 inline-flex items-center justify-center gap-1.5 text-primary font-semibold text-sm bg-primary-container/10 rounded-full py-2.5">
                  <Icon name="check" className="text-[18px]" /> Current Plan
                </span>
              ) : (
                <Button className="mt-5 w-full" variant={p.popular ? "gold" : "outline"} onClick={() => setPurchase(p)}>
                  Select Plan
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Transactions */}
      <div className="flex items-center justify-between mt-8">
        <h2 className="font-display text-lg font-bold">Transaction History</h2>
        <Button variant="outline" icon="download" onClick={() => toast({ type: "success", title: "Export started", desc: "Your CSV is downloading." })}>
          Export CSV
        </Button>
      </div>

      <Card className="mt-4 overflow-hidden">
        {transactions.length === 0 ? (
          <EmptyState icon="receipt_long" title="No transactions yet" desc="Your payment history will appear here." />
        ) : (
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-secondary text-xs uppercase tracking-wider border-b border-outline-variant/15">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Gateway</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-low/50 transition-standard">
                    <td className="px-5 py-3.5">{t.date}</td>
                    <td className="px-5 py-3.5 font-medium">{t.plan}</td>
                    <td className="px-5 py-3.5">NPR {t.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 capitalize">{t.gateway}</td>
                    <td className="px-5 py-3.5"><Badge className={TX_CHIP[t.status]}>{t.status[0].toUpperCase() + t.status.slice(1)}</Badge></td>
                    <td className="px-5 py-3.5 font-mono text-xs text-secondary">{t.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {purchase && (
        <PurchaseModal
          plan={purchase}
          onClose={() => setPurchase(null)}
          onSuccess={(gateway) => {
            addCredits(purchase.credits);
            setPlan(purchase.name);
            addTransaction({
              id: "TXN-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
              date: new Date().toISOString().slice(0, 10),
              plan: purchase.name,
              amount: purchase.price,
              gateway,
              status: "completed",
            });
            setPurchase(null);
            toast({ type: "success", title: "Payment successful!", desc: `${purchase.credits.toLocaleString()} credits added to your account.` });
          }}
        />
      )}
    </DashboardLayout>
    </>
  );
}

function PurchaseModal({ plan, onClose, onSuccess }: { plan: Plan; onClose: () => void; onSuccess: (gateway: "esewa" | "khalti") => void }) {
  const [gateway, setGateway] = useState<"esewa" | "khalti">("esewa");
  const [loading, setLoading] = useState(false);

  const pay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(gateway);
    }, 1400);
  };

  return (
    <Modal open onClose={onClose} title="Complete Purchase" footer={
      <Button className="w-full py-3.5" loading={loading} onClick={pay} iconRight={loading ? undefined : "arrow_forward"}>
        {loading ? "Processing…" : `Pay NPR ${plan.price.toLocaleString()}`}
      </Button>
    }>
      <div className="bg-surface-low rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{plan.name} Plan</span>
          <span className="font-display text-xl font-bold">NPR {plan.price.toLocaleString()}</span>
        </div>
        <p className="text-secondary text-sm mt-1">{plan.credits.toLocaleString()} auto-reply credits</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          {(["esewa", "khalti"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGateway(g)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-standard",
                gateway === g ? "border-primary-container bg-primary-container/5" : "border-outline-variant/30 bg-surface-lowest"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold", g === "esewa" ? "bg-green-600" : "bg-purple-600")}>
                {g === "esewa" ? "e" : "K"}
              </div>
              <span className="font-semibold text-sm capitalize">{g}</span>
              {gateway === g && <Icon name="check_circle" className="text-primary-container text-[18px]" />}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
