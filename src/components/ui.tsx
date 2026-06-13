import {
  type ReactNode,
  type ButtonHTMLAttributes,
  useEffect,
} from "react";
import { cn } from "@/utils/cn";

/* ── Icon ── */
export function Icon({
  name,
  className,
  fill,
}: {
  name: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", fill && "ms-fill", className)}
    >
      {name}
    </span>
  );
}

/* ── Button ── */
type Variant = "gold" | "outline" | "ghost" | "danger";
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  icon?: string;
  iconRight?: string;
  children?: ReactNode;
}
export function Button({
  variant = "gold",
  loading,
  icon,
  iconRight,
  className,
  children,
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-sm transition-standard disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
  const variants: Record<Variant, string> = {
    gold: "bg-primary-container text-white gold-glow px-5 py-2.5",
    outline:
      "border border-outline-variant/60 text-on-background hover:bg-surface-low px-5 py-2.5",
    ghost: "text-secondary hover:text-primary hover:bg-surface-low px-4 py-2.5",
    danger:
      "border border-error text-error hover:bg-error-container/30 px-5 py-2.5",
  };
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Icon name="progress_activity" className="animate-spin text-[18px]" />
      ) : (
        icon && <Icon name={icon} className="text-[18px]" />
      )}
      {children}
      {iconRight && !loading && <Icon name={iconRight} className="text-[18px]" />}
    </button>
  );
}

/* ── Card ── */
export function Card({
  className,
  children,
  hover,
  ...rest
}: { className?: string; children: ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-lowest rounded-[14px] border border-black/8 dark:border-white/8",
        hover &&
          "transition-standard hover:border-primary-container/30 hover:scale-[1.01]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ── Badge ── */
export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold",
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </span>
  );
}

/* ── Toggle switch ── */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2",
        checked ? "bg-primary-container" : "bg-surface-highest"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-standard",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

/* ── Input ── */
export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 rounded-[10px] border border-outline-variant/40 bg-surface-lowest text-on-background placeholder:text-secondary/60 focus-gold transition-standard",
        className
      )}
      {...rest}
    />
  );
}

/* ── Modal / Sheet ── */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const maxW = { md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }[size];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-inverse-surface/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-surface-lowest w-full shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[92vh]",
          "rounded-t-[20px] sm:rounded-[14px] animate-sheet-up sm:animate-scale-in",
          maxW
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-secondary hover:bg-surface-low transition-standard"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto scroll-thin p-6 space-y-5">{children}</div>
        {footer && (
          <div className="bg-surface-low px-6 py-4 flex justify-end gap-3 border-t border-outline-variant/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Segmented control ── */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-surface-low p-1 rounded-xl gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-standard",
            value === o.value
              ? "bg-surface-lowest text-primary font-bold shadow-sm"
              : "text-secondary hover:text-on-background"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Skeleton ── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-surface-high rounded-lg", className)}
    />
  );
}

/* ── Empty state ── */
export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: string;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center mb-4">
        <Icon name={icon} className="text-[32px] text-primary-container" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="text-secondary text-sm mt-1 max-w-sm">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
