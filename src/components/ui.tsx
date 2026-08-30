import { useEffect, useRef, useState } from "react";
import type { ReactNode, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";
import { X, Search, ChevronLeft, ChevronRight, Inbox, AlertTriangle } from "lucide-react";
import { cx, initials } from "../lib/core";

/* ---------- Link ---------- */
export function Link({ to, className, children, onClick }: { to: string; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <a href={"#" + to} className={className} onClick={onClick}>{children}</a>
  );
}

/* ---------- Logo ---------- */
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill={dark ? "#0c2242" : "#0c2242"} />
        <path d="M8 9l8 14 8-14h-4.6L16 15.4 12.6 9H8z" fill="#17a97c" />
        <circle cx="16" cy="8" r="2.2" fill="#e9b44c" />
      </svg>
      {!compact && (
        <span className={cx("font-display font-bold text-[1.15rem] tracking-tight leading-none", dark ? "text-white" : "text-ink")}>
          Edu<span className="text-em-600">Vanta</span>
        </span>
      )}
    </span>
  );
}

/* ---------- Button ---------- */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "dark" | "outline" | "ghost" | "danger" | "soft" | "gold";
  size?: "sm" | "md" | "lg";
};
export function Button({ variant = "primary", size = "md", className, children, ...rest }: BtnProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer",
        size === "sm" && "text-[0.8rem] px-3 h-8",
        size === "md" && "text-[0.875rem] px-4 h-10",
        size === "lg" && "text-[0.95rem] px-6 h-12",
        variant === "primary" && "bg-em-600 text-white hover:bg-em-700 shadow-sm shadow-em-600/20",
        variant === "dark" && "bg-navy-900 text-white hover:bg-navy-800 shadow-sm",
        variant === "outline" && "border border-line bg-card text-ink hover:border-em-500 hover:text-em-700",
        variant === "ghost" && "text-mute hover:text-ink hover:bg-ink/5",
        variant === "danger" && "bg-danger-600 text-white hover:bg-[#a03c30]",
        variant === "soft" && "bg-em-50 text-em-700 hover:bg-em-100 border border-em-200/60",
        variant === "gold" && "bg-gold-500 text-navy-950 hover:bg-gold-600 hover:text-white",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */
export function Badge({ tone = "slate", children, className }: { tone?: "emerald" | "navy" | "gold" | "red" | "amber" | "slate" | "outline"; children: ReactNode; className?: string }) {
  return (
    <span className={cx(
      "inline-flex items-center gap-1.5 text-[0.72rem] font-semibold px-2.5 py-1 rounded-md leading-none",
      tone === "emerald" && "bg-em-100 text-em-700",
      tone === "navy" && "bg-navy-100 text-navy-800",
      tone === "gold" && "bg-gold-100 text-gold-600",
      tone === "red" && "bg-danger-100 text-danger-600",
      tone === "amber" && "bg-warn-100 text-warn-600",
      tone === "slate" && "bg-ink/6 text-mute",
      tone === "outline" && "border border-line text-mute",
      className
    )}>{children}</span>
  );
}
export const statusTone = (s: string) =>
  s === "Paid" || s === "Approved" || s === "Active" || s === "Completed" || s === "Present" || s === "Returned" || s === "Enrolled" || s === "Submitted" ? "emerald"
    : s === "Pending" || s === "Scheduled" || s === "Received" || s === "In Review" || s === "Late" ? "amber"
    : s === "Overdue" || s === "Rejected" || s === "Absent" || s === "Inactive" ? "red"
    : "navy";

/* ---------- Card / Stat ---------- */
export function Card({ className, children, hover }: { className?: string; children: ReactNode; hover?: boolean }) {
  return (
    <div className={cx("bg-card border border-line rounded-xl", hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy-900/8 hover:border-em-200", className)}>
      {children}
    </div>
  );
}
export function Stat({ label, value, sub, icon, tone = "emerald" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; tone?: "emerald" | "navy" | "gold" | "red" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.78rem] font-semibold text-mute uppercase tracking-wide">{label}</p>
          <p className="font-display text-[1.7rem] font-bold mt-1.5 leading-none tnum">{value}</p>
          {sub && <div className="text-[0.78rem] text-mute mt-2">{sub}</div>}
        </div>
        {icon && (
          <span className={cx("shrink-0 w-10 h-10 rounded-lg grid place-items-center",
            tone === "emerald" && "bg-em-100 text-em-700", tone === "navy" && "bg-navy-100 text-navy-800",
            tone === "gold" && "bg-gold-100 text-gold-600", tone === "red" && "bg-danger-100 text-danger-600")}>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ---------- Forms ---------- */
export function Field({ label, error, children, hint, className }: { label?: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      {label && <span className="block text-[0.8rem] font-semibold mb-1.5">{label}</span>}
      {children}
      {hint && !error && <span className="block text-[0.72rem] text-mute mt-1">{hint}</span>}
      {error && <span className="block text-[0.72rem] font-semibold text-danger-600 mt-1">{error}</span>}
    </label>
  );
}
const ctl = "w-full h-10 px-3.5 rounded-lg border border-line bg-card text-[0.9rem] text-ink placeholder:text-mute/70 transition-colors focus:border-em-500 focus:outline-none focus:ring-2 focus:ring-em-500/25";
export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cx(ctl, invalid && "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20", className)} {...rest} />;
}
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(ctl, "cursor-pointer appearance-none pr-9 bg-no-repeat bg-[right_0.7rem_center] bg-[length:1rem] bg-[url('data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%235d6b80%22%20stroke-width=%222%22%3E%3Cpath%20d=%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')]", className)} {...rest}>{children}</select>;
}
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(ctl, "h-auto min-h-[96px] py-2.5 resize-y", className)} {...rest} />;
}
export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cx("relative", className)}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute pointer-events-none" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cx(ctl, "pl-9")} aria-label={placeholder} />
    </div>
  );
}
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label ?? "toggle"} onClick={() => onChange(!on)}
      className={cx("relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer", on ? "bg-em-600" : "bg-ink/15")}>
      <span className={cx("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

/* ---------- Modal / Confirm ---------- */
export function Modal({ open, onClose, title, children, footer, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy-950/55 anim-fade-in" onClick={onClose} />
      <div className={cx("relative bg-card border border-line rounded-2xl shadow-2xl shadow-navy-950/25 w-full anim-pop flex flex-col max-h-[88vh]", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="w-8 h-8 grid place-items-center rounded-lg text-mute hover:text-ink hover:bg-ink/5 cursor-pointer transition-colors"><X className="w-4.5 h-4.5" /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-line flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
export function Confirm({ open, onClose, onYes, title, body, yesLabel = "Confirm", danger }: { open: boolean; onClose: () => void; onYes: () => void; title: string; body: string; yesLabel?: string; danger?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={
      <span className="inline-flex items-center gap-2"><AlertTriangle className={cx("w-5 h-5", danger ? "text-danger-600" : "text-gold-600")} />{title}</span>
    } footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={() => { onYes(); onClose(); }}>{yesLabel}</Button>
      </>
    }>
      <p className="text-[0.92rem] text-mute leading-relaxed">{body}</p>
    </Modal>
  );
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, active, onChange, className }: { tabs: { id: string; label: string; badge?: number }[]; active: string; onChange: (id: string) => void; className?: string }) {
  return (
    <div className={cx("flex gap-1 p-1 bg-ink/4 rounded-lg w-fit max-w-full overflow-x-auto", className)} role="tablist">
      {tabs.map((tb) => (
        <button key={tb.id} role="tab" aria-selected={active === tb.id} onClick={() => onChange(tb.id)}
          className={cx("px-3.5 h-8.5 rounded-md text-[0.82rem] font-semibold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5",
            active === tb.id ? "bg-card text-ink shadow-sm" : "text-mute hover:text-ink")}>
          {tb.label}
          {tb.badge !== undefined && tb.badge > 0 && <span className="text-[0.65rem] font-bold bg-em-100 text-em-700 rounded px-1.5 py-0.5">{tb.badge}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Data table ---------- */
export interface Col<T> { key: string; label: ReactNode; render?: (row: T) => ReactNode; className?: string; hideSm?: boolean; }
export function DataTable<T>({ cols, rows, keyOf, onRow, empty }: { cols: Col<T>[]; rows: T[]; keyOf: (r: T) => string; onRow?: (r: T) => void; empty?: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-[0.86rem] min-w-[640px]">
        <thead>
          <tr className="text-left border-b border-line bg-paper/60">
            {cols.map((c) => (
              <th key={c.key} className={cx("px-4 py-3 text-[0.72rem] font-bold uppercase tracking-wider text-mute whitespace-nowrap", c.hideSm && "hidden md:table-cell", c.className)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={cols.length} className="px-4 py-14">{empty ?? <EmptyState title="Nothing here yet" body="Try adjusting your filters or add a new record." />}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={keyOf(r)} onClick={onRow ? () => onRow(r) : undefined}
              className={cx("border-b border-line/60 last:border-0 transition-colors", onRow && "cursor-pointer hover:bg-em-50/60")}>
              {cols.map((c) => (
                <td key={c.key} className={cx("px-4 py-3 align-middle", c.hideSm && "hidden md:table-cell", c.className)}>
                  {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Pagination({ page, pages, onPage, total, shown }: { page: number; pages: number; onPage: (p: number) => void; total: number; shown: number }) {
  if (pages <= 1) return <p className="text-[0.78rem] text-mute mt-3">Showing {shown} of {total} records</p>;
  return (
    <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
      <p className="text-[0.78rem] text-mute">Showing {shown} of {total} records</p>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className="w-8 h-8 grid place-items-center rounded-lg border border-line disabled:opacity-40 hover:bg-ink/5 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).slice(0, 7).map((p) => (
          <button key={p} onClick={() => onPage(p)} className={cx("w-8 h-8 rounded-lg text-[0.8rem] font-semibold cursor-pointer transition-colors", p === page ? "bg-navy-900 text-white" : "hover:bg-ink/5 text-mute")}>{p}</button>
        ))}
        <button disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page" className="w-8 h-8 grid place-items-center rounded-lg border border-line disabled:opacity-40 hover:bg-ink/5 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
export function usePaged<T>(items: T[], per = 8) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / per));
  const cur = Math.min(page, pages);
  return { page: cur, pages, slice: items.slice((cur - 1) * per, cur * per), setPage, total: items.length, shown: Math.min(per, items.slice((cur - 1) * per).length) };
}

/* ---------- Empty state ---------- */
export function EmptyState({ title, body, action, icon }: { title: string; body?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="w-12 h-12 mx-auto rounded-xl bg-ink/5 text-mute grid place-items-center mb-3">{icon ?? <Inbox className="w-5 h-5" />}</div>
      <p className="font-display font-bold">{title}</p>
      {body && <p className="text-[0.83rem] text-mute mt-1 max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Avatar / Ring / Progress ---------- */
export function Avatar({ name, color, size = 36, className }: { name: string; color?: string; size?: number; className?: string }) {
  return (
    <span className={cx("inline-grid place-items-center rounded-full font-bold text-white shrink-0", className)}
      style={{ width: size, height: size, background: color ?? "#1b4276", fontSize: size * 0.36 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
export function Ring({ pct, size = 64, stroke = 6, color = "#0e8563", label }: { pct: number; size?: number; stroke?: number; color?: string; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid place-items-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-ink/10" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (Math.min(100, Math.max(0, pct)) / 100) * c} style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display font-bold" style={{ fontSize: size * 0.22 }}>
        {label ?? `${Math.round(pct)}%`}
      </span>
    </span>
  );
}
export function Progress({ pct, tone = "emerald", className }: { pct: number; tone?: "emerald" | "navy" | "gold" | "red"; className?: string }) {
  return (
    <span className={cx("block h-1.5 rounded-full bg-ink/8 overflow-hidden", className)}>
      <span className={cx("block h-full rounded-full transition-all duration-700",
        tone === "emerald" && "bg-em-500", tone === "navy" && "bg-navy-700", tone === "gold" && "bg-gold-500", tone === "red" && "bg-danger-600")}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </span>
  );
}

/* ---------- Reveal + Counter ---------- */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("rv-in"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cx("rv", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
export function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1100;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="tnum">{prefix}{n.toLocaleString("en-US")}{suffix}</span>;
}

/* ---------- Breadcrumbs ---------- */
export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[0.8rem] text-mute min-w-0">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5 min-w-0">
          {i > 0 && <span className="text-mute/50">/</span>}
          {it.to ? <Link to={it.to} className="hover:text-em-700 transition-colors truncate">{it.label}</Link> : <span className="text-ink font-semibold truncate">{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ---------- Section heading (public) ---------- */
export function SectionHead({ kicker, title, body, center }: { kicker: string; title: string; body?: string; center?: boolean }) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      <p className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-em-700">
        <span className="w-6 h-px bg-em-600 inline-block" aria-hidden="true" />{kicker}
      </p>
      <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mt-3 leading-[1.08]">{title}</h2>
      {body && <p className="text-mute text-[1.02rem] leading-relaxed mt-4">{body}</p>}
    </div>
  );
}
