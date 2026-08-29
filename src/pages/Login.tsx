import { useState } from "react";
import { ShieldCheck, Users, GraduationCap, Wallet, Briefcase, Baby, KeyRound, ArrowRight, RotateCcw, Eye, EyeOff } from "lucide-react";
import { Logo, Button, Field, Input, Link } from "../components/ui";
import { useApp, useToast, roleLabel } from "../lib/store";
import { users } from "../lib/data";
import { navigate } from "../lib/store";
import { cx } from "../lib/core";
import type { User } from "../lib/core";

const ROLE_ICONS: Record<string, typeof ShieldCheck> = {
  superadmin: ShieldCheck, principal: Briefcase, teacher: Users,
  accountant: Wallet, student: GraduationCap, parent: Baby,
};

export function LoginPage() {
  const { login, resetDemo } = useApp();
  const { push } = useToast();
  const [email, setEmail] = useState("admin@eduvanta.edu");
  const [password, setPassword] = useState("admin123");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { setErr("Enter both email and password."); return; }
    setBusy(true);
    window.setTimeout(() => {
      const u = login(email, password);
      setBusy(false);
      if (u) {
        push("success", `Welcome back, ${u.name.split(" ")[0]}`, `Signed in as ${roleLabel[u.role]}.`);
        navigate("/app");
      } else {
        setErr("Invalid credentials. Try one of the demo accounts below.");
      }
    }, 500);
  };

  const fill = (u: User) => { setEmail(u.email); setPassword(u.password); setErr(""); };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-paper">
      {/* left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-navy-950 text-white p-12 overflow-hidden">
        <div className="absolute inset-0 paper-grid opacity-[0.15]" aria-hidden="true" />
        <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-em-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <Link to="/"><Logo dark /></Link>
        </div>
        <div className="relative max-w-md">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-em-200">School Management System</p>
          <h1 className="font-display font-extrabold text-4xl xl:text-5xl tracking-tight leading-[1.05] mt-4">
            One campus.<br />Seven portals.<br /><span className="text-em-500">Zero paperwork.</span>
          </h1>
          <p className="text-white/60 mt-5 leading-relaxed">Admissions, attendance, examinations, fees, library, transport and communication — run from a single ledger that every role can trust.</p>
          <ul className="mt-8 space-y-3">
            {["Role-based access for 7 account types", "Live attendance, marks and fee collection", "Printable report cards and receipts"].map((x) => (
              <li key={x} className="flex items-center gap-3 text-[0.9rem] text-white/80"><span className="w-5 h-5 rounded-full bg-em-500/20 text-em-200 grid place-items-center shrink-0"><ShieldCheck className="w-3 h-3" /></span>{x}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-[0.75rem] text-white/40">Demo environment · data resets are one click away</p>
      </div>

      {/* right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Link to="/"><Logo /></Link></div>
          <h2 className="font-display font-extrabold text-3xl tracking-tight">Sign in to your portal</h2>
          <p className="text-mute mt-2 text-[0.92rem]">Pick a demo account below — credentials fill in automatically.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
            {users.map((u) => {
              const I = ROLE_ICONS[u.role] ?? KeyRound;
              const active = email === u.email;
              return (
                <button key={u.id} type="button" onClick={() => fill(u)}
                  className={cx("rounded-xl border p-3 text-left transition-all cursor-pointer", active ? "border-em-600 bg-em-50 shadow-sm" : "border-line bg-card hover:border-em-200")}>
                  <I className={cx("w-4.5 h-4.5", active ? "text-em-700" : "text-mute")} />
                  <span className="block text-[0.8rem] font-bold mt-1.5 leading-tight">{roleLabel[u.role]}</span>
                  <span className="block text-[0.68rem] text-mute truncate">{u.name}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <Field label="Email address">
              <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} placeholder="you@eduvanta.edu" autoComplete="username" />
            </Field>
            <Field label="Password">
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErr(""); }} placeholder="••••••••" autoComplete="current-password" className="pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink cursor-pointer">{showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}</button>
              </div>
            </Field>
            {err && <p className="text-[0.8rem] font-semibold text-danger-600 bg-danger-100 rounded-lg px-3.5 py-2.5 anim-pop" role="alert">{err}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>{busy ? "Signing in…" : <>Sign in <ArrowRight className="w-4 h-4" /></>}</Button>
          </form>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-line">
            <Link to="/" className="text-[0.83rem] font-semibold text-mute hover:text-em-700 transition-colors">← Back to website</Link>
            <button onClick={() => { resetDemo(); push("info", "Demo data reset", "All records restored to their original state."); }} className="inline-flex items-center gap-1.5 text-[0.83rem] font-semibold text-mute hover:text-em-700 transition-colors cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />Reset demo data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
