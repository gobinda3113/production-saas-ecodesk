import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { Icon } from "@/components/ui";
import { cn } from "@/utils/cn";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const clientNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/keywords", label: "Automations", icon: "rule" },
  { to: "/connections", label: "Connections", icon: "hub" },
  { to: "/billing", label: "Billing", icon: "account_balance_wallet" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: "monitoring" },
  { to: "/admin/clients", label: "Clients", icon: "group" },
  { to: "/admin/payments", label: "Payments", icon: "payments" },
  { to: "/admin/webhooks", label: "Webhooks", icon: "webhook" },
  { to: "/admin/system", label: "System", icon: "dns" },
];

export function DashboardLayout({
  title,
  children,
  admin,
}: {
  title: string;
  children: ReactNode;
  admin?: boolean;
}) {
  const { credits, logout, toast } = useStore();
  const navigate = useNavigate();
  const nav = admin ? adminNav : clientNav;
  const mobileNav = admin ? adminNav : clientNav;

  const handleLogout = () => {
    logout();
    toast({ type: "info", title: "Logged out", desc: "See you soon!" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Sidebar (desktop / tablet) ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-[64px] lg:w-[240px] flex-col bg-surface-lowest border-r border-outline-variant/20">
        <div className="px-4 lg:px-6 py-5 flex items-center gap-2.5 border-b border-outline-variant/10">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
            <Icon name="graphic_eq" className="text-white text-[20px]" />
          </div>
          <div className="hidden lg:block">
            <p className="font-display font-extrabold text-primary leading-none">EchoDesk</p>
            <p className="text-secondary text-[11px] opacity-70 mt-0.5">
              {admin ? "Super Admin" : "Premium Merchant"}
            </p>
          </div>
        </div>

        {admin && (
          <div className="px-6 pt-4 hidden lg:block">
            <span className="font-label-mono bg-primary-container text-white rounded-full px-3 py-1 text-[10px] uppercase">
              Admin Console
            </span>
          </div>
        )}

        <nav className="flex-1 px-2 lg:px-3 py-4 space-y-1 overflow-y-auto scroll-thin">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-standard justify-center lg:justify-start",
                  isActive
                    ? "bg-primary-container/10 text-primary font-bold border-l-4 border-primary lg:pl-2"
                    : "text-secondary hover:bg-surface-low hover:lg:translate-x-1"
                )
              }
            >
              <Icon name={item.icon} className="text-[22px]" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2 lg:px-3 py-4 border-t border-outline-variant/10 space-y-2">
          {!admin && (
            <NavLink
              to="/billing"
              className="flex items-center gap-2 justify-center bg-primary-container text-white rounded-full px-3 py-2.5 text-sm font-semibold gold-glow"
            >
              <Icon name="rocket_launch" className="text-[18px]" />
              <span className="hidden lg:inline">Upgrade Plan</span>
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-secondary hover:text-error transition-standard justify-center lg:justify-start"
          >
            <Icon name="logout" className="text-[22px]" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="md:ml-[64px] lg:ml-[240px] flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
          <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
            <h1 className="font-display text-lg sm:text-xl font-semibold truncate">{title}</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              {!admin && (
                <NavLink
                  to="/billing"
                  className="flex items-center gap-2 bg-surface-low rounded-full border border-outline-variant/30 pl-3 pr-1.5 py-2 sm:py-1.5 text-sm transition-standard hover:border-primary-container/40 min-h-[44px]"
                >
                  <Icon name="bolt" className="text-primary-container text-[18px]" />
                  <span className="font-semibold">{credits}</span>
                  <span className="text-secondary hidden sm:inline">credits</span>
                  <span className="h-4 w-px bg-outline-variant/40 mx-0.5 hidden sm:block" />
                  <span className="hidden sm:inline text-primary font-semibold text-[13px] pr-1">
                    Add
                  </span>
                </NavLink>
              )}
              <button
                aria-label="Notifications"
                className="relative p-2.5 rounded-full hover:bg-surface-low transition-standard min-h-[44px] min-w-[44px] flex items-center justify-center"
                onClick={() => toast({ type: "info", title: "No new notifications", desc: "All caught up!" })}
              >
                <Icon name="notifications" className="text-secondary text-[22px]" />
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-error border-2 border-surface" aria-label="Unread notifications" />
              </button>
              <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-sm">
                {admin ? "SA" : "TT"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-lowest border-t border-outline-variant/20 grid grid-cols-5 safe-area-bottom">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-standard min-h-[56px] justify-center",
                isActive ? "text-primary" : "text-secondary"
              )
            }
          >
            <Icon name={item.icon} className="text-[24px]" />
            <span>{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
