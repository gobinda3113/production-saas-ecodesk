import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Icon, Card, Button, Badge, Modal } from "@/components/ui";
import { PLATFORM_META, type Platform } from "@/data/mock";

export default function Connections() {
  const { connections, setConnection, toast } = useStore();
  const [confirm, setConfirm] = useState<Platform | null>(null);
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const disconnected = connections.find((c) => !c.connected);

  const handleConnect = (p: Platform) => {
    setConnecting(p);
    setTimeout(() => {
      setConnection(p, {
        connected: true,
        account: p === "tiktok" ? "@thamel.threads" : "Thamel Threads",
        expiresInDays: 60,
      });
      setConnecting(null);
      toast({ type: "success", title: `${PLATFORM_META[p].name} connected!`, desc: "Rules targeting this platform are now active." });
    }, 1200);
  };

  const handleDisconnect = (p: Platform) => {
    setConnection(p, { connected: false, account: null, expiresInDays: null });
    setConfirm(null);
    toast({ type: "info", title: `${PLATFORM_META[p].name} disconnected`, desc: "Rules on this platform are paused." });
  };

  return (
    <>
      <Helmet>
        <title>Connections — EchoDesk</title>
        <meta name="description" content="Connect your Instagram, Facebook, and TikTok accounts to EchoDesk." />
      </Helmet>
    <DashboardLayout title="Connections">
      <h1 className="font-display text-2xl font-bold">Connected Platforms</h1>
      <p className="text-secondary text-sm mt-1">
        Connect your accounts to start receiving and replying to messages.
      </p>

      {disconnected && (
        <div className="mt-6 bg-primary-fixed/20 border border-primary-container/30 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm flex items-center gap-2">
            <Icon name="warning" fill className="text-primary-container" />
            <span><span className="font-semibold">{PLATFORM_META[disconnected.platform].name} is disconnected.</span> Rules targeting {PLATFORM_META[disconnected.platform].name} are paused.</span>
          </p>
          <button onClick={() => handleConnect(disconnected.platform)} className="text-primary font-bold text-sm hover:underline shrink-0">
            Reconnect →
          </button>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {connections.map((c) => {
          const meta = PLATFORM_META[c.platform];
          const expiring = c.connected && c.expiresInDays !== null && c.expiresInDays <= 7;
          return (
            <Card key={c.platform} hover className="p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.chip}`}>
                  <Icon name={meta.icon} className="text-[26px]" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">{meta.name}</p>
                  <p className="text-secondary text-sm">DMs & Comments</p>
                </div>
              </div>

              <div className="md:text-center md:px-6">
                {c.connected ? (
                  <>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
                    </Badge>
                    <p className="text-secondary text-sm mt-1">{c.account}</p>
                    {expiring && (
                      <p className="text-[#D97706] text-xs mt-1 flex items-center gap-1">
                        <Icon name="warning" className="text-[14px]" />
                        Token expires in {c.expiresInDays} days — Reconnect to avoid interruption
                      </p>
                    )}
                  </>
                ) : (
                  <Badge className="bg-error-container text-error">
                    <span className="w-2 h-2 rounded-full bg-error" /> Disconnected
                  </Badge>
                )}
              </div>

              <div className="md:ml-auto">
                {!c.connected ? (
                  <Button loading={connecting === c.platform} onClick={() => handleConnect(c.platform)}>
                    {connecting === c.platform ? "Connecting…" : "Connect"}
                  </Button>
                ) : expiring ? (
                  <Button variant="outline" onClick={() => handleConnect(c.platform)}>Reconnect</Button>
                ) : (
                  <Button variant="danger" onClick={() => setConfirm(c.platform)}>Disconnect</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {confirm && (
        <Modal
          open
          onClose={() => setConfirm(null)}
          title="Disconnect platform?"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDisconnect(confirm)}>Disconnect</Button>
            </>
          }
        >
          <p className="text-secondary">
            Are you sure? This will pause all rules on <span className="font-semibold text-on-background">{PLATFORM_META[confirm].name}</span> until you reconnect.
          </p>
        </Modal>
      )}
    </DashboardLayout>
    </>
  );
}
