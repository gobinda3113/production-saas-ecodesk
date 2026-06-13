import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useStore } from "@/store";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, Button, Toggle, Segmented, Modal, Input } from "@/components/ui";
import { cn } from "@/utils/cn";

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="py-8 border-b border-outline-variant/15 last:border-0">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {desc && <p className="text-secondary text-sm mt-1">{desc}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, plan, toast } = useStore();
  const [business, setBusiness] = useState("Thamel Threads");
  const [notif, setNotif] = useState({ lowCredits: true, disconnect: true, weekly: false });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const apiLocked = plan === "Free Trial" || plan === "Starter";

  return (
    <>
      <Helmet>
        <title>Settings — EchoDesk</title>
        <meta name="description" content="Manage your EchoDesk account settings, notifications, and API access." />
      </Helmet>
    <DashboardLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-secondary text-sm mt-1">Manage your profile, preferences, and account.</p>

        <Card className="mt-6 px-6 divide-y divide-outline-variant/10">
          {/* Profile */}
          <Section title="Profile">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center font-display text-2xl font-bold text-on-secondary-container" aria-hidden="true">TT</div>
              <Button variant="outline" icon="photo_camera" onClick={() => photoInputRef.current?.click()}>Upload Photo</Button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) toast({ type: "success", title: "Photo uploaded", desc: f.name }); }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Business name</label>
              <Input value={business} onChange={(e) => setBusiness(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Contact email</label>
              <Input value="raju@thamelthreads.com" readOnly className="bg-surface-low cursor-not-allowed" />
              <p className="text-secondary text-xs mt-1">Change via admin.</p>
            </div>
            <Button onClick={() => toast({ type: "success", title: "Profile saved" })}>Save Changes</Button>
          </Section>

          {/* Notifications */}
          <Section title="Notification Preferences">
            {([
              ["lowCredits", "Email me when credits drop below 20"],
              ["disconnect", "Email me when a platform disconnects"],
              ["weekly", "Weekly activity summary email"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3.5 bg-surface-low rounded-xl">
                <span className="text-sm">{label}</span>
                <Toggle checked={notif[key]} onChange={(v) => setNotif((n) => ({ ...n, [key]: v }))} label={label} />
              </div>
            ))}
          </Section>

          {/* Appearance */}
          <Section title="Appearance">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <Segmented
                value={theme}
                onChange={(v) => setTheme(v as typeof theme)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System" },
                ]}
              />
            </div>
            <div className="flex items-center justify-between p-3.5 bg-surface-low rounded-xl">
              <span className="text-sm">Language</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">English</span>
                <span className="text-secondary text-xs bg-surface-high px-2 py-0.5 rounded-full">नेपाली — Coming Soon</span>
              </div>
            </div>
          </Section>

          {/* API Access */}
          <Section title="API Access" desc="Push match events to your own systems.">
            <div className={cn("relative", apiLocked && "opacity-50 pointer-events-none")}>
              {apiLocked && (
                <span className="absolute -top-2 right-0 text-xs bg-primary-container text-white px-2.5 py-1 rounded-full font-label-mono z-10">
                  Available on Growth plan
                </span>
              )}
              <label className="block text-sm font-medium mb-1.5">API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-surface-low px-4 py-2.5 rounded-lg truncate">ek_live_8f3a••••••••••••••2c4d</code>
                <Button variant="ghost" icon="content_copy" aria-label="Copy" onClick={() => { navigator.clipboard.writeText("ek_live_8f3a••••••••••••••2c4d"); toast({ type: "success", title: "Copied", desc: "API key copied to clipboard." }); }} />
                <Button variant="outline" onClick={() => toast({ type: "success", title: "API key regenerated", desc: "A new key has been generated." })}>Regenerate</Button>
              </div>
              <a href="https://docs.echodesk.com.np/api" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-2 inline-block">View API Docs →</a>
            </div>
          </Section>

          {/* Danger Zone */}
          <Section title="Danger Zone">
            <div className="border border-error/20 rounded-[14px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">Delete account</p>
                <p className="text-secondary text-xs">Permanently remove your account and all data.</p>
              </div>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>Request Account Deletion</Button>
            </div>
          </Section>
        </Card>
      </div>

      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(false)} title="Delete account?" footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirmDelete(false); toast({ type: "info", title: "Deletion requested", desc: "Our team will contact you within 24h." }); }}>Delete Account</Button>
          </>
        }>
          <p className="text-secondary">
            This will permanently delete your account and all keyword rules. <span className="font-semibold text-error">This cannot be undone.</span>
          </p>
        </Modal>
      )}
    </DashboardLayout>
    </>
  );
}
