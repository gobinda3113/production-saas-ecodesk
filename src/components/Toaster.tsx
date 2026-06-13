import { useStore } from "@/store";
import { Icon } from "@/components/ui";
import { cn } from "@/utils/cn";

const cfg = {
  success: { border: "border-primary-container", icon: "check_circle", color: "text-primary-container" },
  error: { border: "border-error", icon: "error", color: "text-error" },
  info: { border: "border-tertiary", icon: "info", color: "text-tertiary" },
} as const;

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 w-[calc(100vw-2rem)] sm:w-[340px]">
      {toasts.slice(0, 3).map((t) => {
        const c = cfg[t.type];
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "relative bg-surface-lowest border-l-4 rounded-[10px] shadow-md p-4 flex items-start gap-3 overflow-hidden animate-toast-in",
              c.border
            )}
          >
            <Icon name={c.icon} className={cn("text-[20px] mt-0.5", c.color)} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t.title}</p>
              {t.desc && <p className="text-secondary text-[13px] mt-0.5">{t.desc}</p>}
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss"
              className="text-secondary hover:text-on-background transition-standard"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
            <span
              className="absolute bottom-0 left-0 h-0.5 bg-primary-container/60"
              style={{ animation: "shrink 4s linear forwards" }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── Sparkline (bars) ── */
export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn("flex items-end gap-0.5 h-7", className)}>
      {data.map((v, i) => (
        <span
          key={i}
          className="w-1.5 rounded-sm bg-primary-container"
          style={{
            height: `${Math.max((v / max) * 100, 8)}%`,
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
}
