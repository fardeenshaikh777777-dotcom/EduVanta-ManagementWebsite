import { useMemo, useState } from "react";
import { Receipt, Plus, Download, Pin, Bell, Megaphone, Save, ShieldCheck, Moon, Sun, KeyRound, Check, Wallet, Clock3, AlertTriangle, TrendingUp } from "lucide-react";
import { PageHead } from "./Dashboards";
import { Card, Button, Badge, Modal, Field, Input, Select, Textarea, Tabs, EmptyState, Avatar, statusTone, usePaged, Pagination, DataTable, SearchInput, Toggle, Stat } from "../../components/ui";
import { CompareBars, SplitDonut, C } from "../../components/charts";
import { useApp, useToast, roleLabel } from "../../lib/store";
import { monthlyRevenue, school } from "../../lib/data";
import { cx, fmtDate, money, todayISO, toCsv, downloadText, PERMS } from "../../lib/core";
import type { FeeTxn, Notice } from "../../lib/core";

/* ================= FEES ================= */
export function FeesPage() {
  const { db, update, payInvoice, addInvoice, user } = useApp();
  const { push } = useToast();
  const [tab, setTab] = useState("collections");
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [pay, setPay] = useState<FeeTxn | null>(null);
  const [method, setMethod] = useState("Cash");
  const [invoice, setInvoice] = useState(false);
  const [inv, setInv] = useState({ studentId: "", type: "Tuition · Spring Term", amount: 0 });
  const [struct, setStruct] = useState(() => JSON.parse(JSON.stringify(db.structure)) as typeof db.structure);

  const limited = user && ["student", "parent"].includes(user.role);
  const myIds = user?.role === "student" ? [user.linkId] : user?.role === "parent" ? (user.children ?? []) : null;

  const rows = useMemo(() => {
    let r = [...db.fees].sort((a, b) => b.date.localeCompare(a.date));
    if (myIds) r = r.filter((f) => myIds.includes(f.studentId));
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((f) => {
      const st = db.students.find((x) => x.id === f.studentId);
      return `${st?.first} ${st?.last} ${f.receipt} ${f.type}`.toLowerCase().includes(s);
    });
    if (fStatus !== "all") r = r.filter((f) => f.status === fStatus);
    return r;
  }, [db.fees, db.students, q, fStatus, myIds]);
  const paged = usePaged(rows, 9);

  const collected = db.fees.filter((f) => f.status === "Paid").reduce((s, f) => s + f.amount, 0);
  const pending = db.fees.filter((f) => f.kind === "Invoice" && f.status === "Pending").reduce((s, f) => s + f.amount, 0);
  const overdue = db.fees.filter((f) => f.kind === "Invoice" && f.status === "Overdue").reduce((s, f) => s + f.amount, 0);
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    db.fees.filter((f) => f.status === "Paid").forEach((f) => { const k = f.type.split(" ")[0]; map[k] = (map[k] ?? 0) + f.amount; });
    const colors = [C.em, C.navy, C.gold, "#7c5cbf", C.red];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [db.fees]);

  return (
    <div>
      <PageHead title="Fees & Finance" sub={limited ? "Your invoices, receipts and payment history" : `${school.term} ledger · tuition, transport, activity and lab fees`}
        actions={!limited ? <>
          <Button variant="outline" size="sm" onClick={() => { downloadText("fee-ledger.csv", toCsv(["Receipt", "Student", "Item", "Date", "Method", "Amount", "Status"], rows.map((f) => { const st = db.students.find((x) => x.id === f.studentId); return [f.receipt, st ? `${st.first} ${st.last}` : f.studentId, f.type, f.date, f.method, f.amount, f.status]; }))); push("success", "Ledger exported", `${rows.length} transactions downloaded.`); }}><Download className="w-4 h-4" />Export</Button>
          <Button size="sm" onClick={() => setInvoice(true)}><Plus className="w-4 h-4" />New invoice</Button>
        </> : undefined} />

      {!limited && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Stat label="Collected" value={money(collected)} sub="all time in demo ledger" icon={<Wallet className="w-5 h-5" />} />
          <Stat label="Pending" value={money(pending)} sub="awaiting payment" icon={<Clock3 className="w-5 h-5" />} tone="gold" />
          <Stat label="Overdue" value={money(overdue)} sub="needs follow-up" icon={<AlertTriangle className="w-5 h-5" />} tone="red" />
          <Stat label="Collection rate" value={`${Math.round((collected / Math.max(1, collected + pending + overdue)) * 100)}%`} sub="of invoiced amount" icon={<TrendingUp className="w-5 h-5" />} tone="navy" />
        </div>
      )}

      <Tabs active={tab} onChange={setTab} tabs={limited
        ? [{ id: "collections", label: "My invoices & receipts" }]
        : [{ id: "collections", label: "Collections" }, { id: "structure", label: "Fee structure" }, { id: "reports", label: "Reports" }]} className="mb-5" />

      {tab === "collections" && (
        <div className="anim-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <SearchInput value={q} onChange={setQ} placeholder="Search student, receipt, item…" className="sm:w-72" />
            <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="!w-40" aria-label="Filter by status"><option value="all">All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option></Select>
          </div>
          <DataTable cols={[
            { key: "receipt", label: "Receipt", render: (f: FeeTxn) => <span className="tnum font-semibold">{f.receipt}</span> },
            { key: "student", label: "Student", render: (f: FeeTxn) => { const st = db.students.find((x) => x.id === f.studentId); return st ? <span className="flex items-center gap-2.5"><Avatar name={`${st.first} ${st.last}`} color={st.color} size={30} /><span><b className="block text-[0.85rem]">{st.first} {st.last}</b><span className="text-[0.7rem] text-mute">{st.classId.toUpperCase()}-{st.section}</span></span></span> : f.studentId; } },
            { key: "type", label: "Item", hideSm: true, render: (f: FeeTxn) => f.type },
            { key: "date", label: "Date", render: (f: FeeTxn) => <span className="tnum">{fmtDate(f.date)}</span> },
            { key: "method", label: "Method", hideSm: true, render: (f: FeeTxn) => f.method },
            { key: "amount", label: "Amount", render: (f: FeeTxn) => <b className="tnum">{money(f.amount)}</b> },
            { key: "status", label: "Status", render: (f: FeeTxn) => (
              f.kind === "Invoice" && f.status !== "Paid" ? (
                <span className="flex items-center gap-2">
                  <Badge tone={statusTone(f.status)}>{f.status}</Badge>
                  {(user?.role === "parent" || !limited || user?.role === "student") && (
                    <Button size="sm" variant="soft" onClick={() => { setPay(f); setMethod("Card"); }}>Pay</Button>
                  )}
                </span>
              ) : <Badge tone="emerald">Paid</Badge>) },
          ]} rows={paged.slice} keyOf={(f) => f.id} empty={<EmptyState icon={<Receipt className="w-5 h-5" />} title="No transactions" body="Adjust filters or raise a new invoice." />} />
          <Pagination page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} shown={paged.shown} />
        </div>
      )}

      {tab === "structure" && !limited && (
        <Card className="p-6 anim-fade-in">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div><h3 className="font-display font-bold text-lg">Termly fee structure</h3><p className="text-[0.8rem] text-mute">Adjust figures, then save — new invoices use these rates.</p></div>
            <Button size="sm" onClick={() => { update((d) => ({ ...d, structure: struct })); push("success", "Structure saved", "Updated rates apply to newly raised invoices."); }}><Save className="w-3.5 h-3.5" />Save structure</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[0.86rem]">
              <thead><tr className="text-left border-b border-line text-[0.7rem] uppercase tracking-wider text-mute">{["Grade", "Tuition", "Activity", "Laboratory", "Admission"].map((h) => <th key={h} className="px-3 py-2.5 font-bold">{h}</th>)}</tr></thead>
              <tbody>
                {Object.entries(struct).map(([grade, v]) => (
                  <tr key={grade} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2.5 font-bold">Grade {grade}</td>
                    {(["tuition", "activity", "lab", "admission"] as const).map((k) => (
                      <td key={k} className="px-2 py-2">
                        <input type="number" min={0} step={10} value={v[k]} aria-label={`Grade ${grade} ${k}`}
                          onChange={(e) => setStruct({ ...struct, [grade]: { ...v, [k]: Number(e.target.value) } })}
                          className="w-24 h-8.5 px-2 rounded-md border border-line bg-card text-[0.83rem] tnum focus:border-em-500 focus:outline-none" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "reports" && !limited && (
        <div className="grid lg:grid-cols-3 gap-5 anim-fade-in">
          <Card className="p-5 lg:col-span-2"><h3 className="font-display font-bold text-lg mb-1">Monthly revenue</h3><p className="text-[0.8rem] text-mute mb-3">Collected vs target · six months</p><CompareBars data={monthlyRevenue} xKey="m" series={[{ key: "collected", name: "Collected", color: C.em }, { key: "target", name: "Target", color: "#c9d4e4" }]} height={270} /></Card>
          <Card className="p-5"><h3 className="font-display font-bold text-lg mb-2">Revenue by fee type</h3><SplitDonut data={byType} height={270} /></Card>
        </div>
      )}

      {/* pay modal */}
      <Modal open={!!pay} onClose={() => setPay(null)} title="Record payment"
        footer={<><Button variant="ghost" onClick={() => setPay(null)}>Cancel</Button><Button onClick={() => { if (pay) { payInvoice(pay.id, method); push("success", "Payment recorded", `${pay.receipt} · ${money(pay.amount)} via ${method}.`); } setPay(null); }}>Confirm payment</Button></>}>
        {pay && (
          <div>
            <div className="rounded-xl bg-paper border border-line p-4 mb-4">
              <p className="text-[0.75rem] text-mute font-bold uppercase tracking-wide">{pay.receipt}</p>
              <p className="font-bold mt-1">{pay.type}</p>
              <p className="font-display font-extrabold text-2xl text-em-700 mt-1 tnum">{money(pay.amount)}</p>
            </div>
            <Field label="Payment method"><Select value={method} onChange={(e) => setMethod(e.target.value)}>{["Cash", "Card", "Bank Transfer", "Check"].map((m) => <option key={m}>{m}</option>)}</Select></Field>
          </div>
        )}
      </Modal>

      {/* invoice modal */}
      <Modal open={invoice} onClose={() => setInvoice(false)} title="Raise invoice"
        footer={<><Button variant="ghost" onClick={() => setInvoice(false)}>Cancel</Button><Button onClick={() => {
          if (!inv.studentId || inv.amount <= 0) { push("error", "Incomplete", "Pick a student and an amount above zero."); return; }
          addInvoice(inv.studentId, inv.type, inv.amount);
          const st = db.students.find((x) => x.id === inv.studentId);
          push("success", "Invoice raised", `${money(inv.amount)} · ${inv.type} for ${st?.first ?? "student"}.`);
          setInvoice(false); setInv({ studentId: "", type: "Tuition · Spring Term", amount: 0 });
        }}>Raise invoice</Button></>}>
        <div className="space-y-4">
          <Field label="Student *"><Select value={inv.studentId} onChange={(e) => setInv({ ...inv, studentId: e.target.value })}><option value="">Select…</option>{db.students.map((s) => <option key={s.id} value={s.id}>{s.first} {s.last} · {s.classId.toUpperCase()}-{s.section}</option>)}</Select></Field>
          <Field label="Fee type"><Select value={inv.type} onChange={(e) => setInv({ ...inv, type: e.target.value })}>{["Tuition · Spring Term", "Activity Fee", "Laboratory Fee", "Transport Fee", "Exam Fee", "Uniform & Books"].map((t) => <option key={t}>{t}</option>)}</Select></Field>
          <Field label="Amount ($) *"><Input type="number" min={0} value={inv.amount || ""} onChange={(e) => setInv({ ...inv, amount: Number(e.target.value) })} placeholder="0" /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ================= NOTICES ================= */
export function NoticesPage() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [compose, setCompose] = useState(false);
  const [aud, setAud] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState({ title: "", body: "", audience: "All" as Notice["audience"], category: "General" as Notice["category"], pinned: false });

  const canPost = user && ["superadmin", "admin", "principal", "teacher"].includes(user.role);
  const rows = db.notices.filter((n) => aud === "all" || n.audience === aud || n.audience === "All").sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));

  return (
    <div>
      <PageHead title="Notices & Announcements" sub="School-wide, audience-targeted and emergency communication"
        actions={canPost ? <Button size="sm" onClick={() => setCompose(true)}><Megaphone className="w-4 h-4" />Compose notice</Button> : undefined} />
      <Tabs active={aud} onChange={setAud} tabs={[{ id: "all", label: "All", badge: db.notices.length }, { id: "Students", label: "Students" }, { id: "Teachers", label: "Teachers" }, { id: "Parents", label: "Parents" }]} className="mb-5" />
      <div className="space-y-3">
        {rows.map((n) => {
          const read = n.reads.includes(user?.id ?? "");
          return (
            <Card key={n.id} className={cx("p-5 transition-colors", !read && "border-em-200 bg-em-50/40")}>
              <div className="flex items-start gap-4">
                <span className={cx("w-10 h-10 rounded-xl grid place-items-center shrink-0", n.category === "Urgent" ? "bg-danger-100 text-danger-600" : n.category === "Event" ? "bg-gold-100 text-gold-600" : n.category === "Exam" ? "bg-navy-100 text-navy-800" : "bg-em-100 text-em-700")}><Bell className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {n.pinned && <Badge tone="gold"><Pin className="w-3 h-3" />Pinned</Badge>}
                    <Badge tone={n.category === "Urgent" ? "red" : n.category === "Event" ? "gold" : n.category === "Exam" ? "navy" : "emerald"}>{n.category}</Badge>
                    <Badge tone="outline">{n.audience}</Badge>
                    {!read && <span className="w-2 h-2 rounded-full bg-em-600 pulse-dot" aria-label="Unread" />}
                    <span className="text-[0.72rem] text-mute ml-auto tnum">{fmtDate(n.date)}</span>
                  </div>
                  <button className="text-left cursor-pointer mt-2 w-full" onClick={() => { setOpen(open === n.id ? null : n.id); if (!read && user) update((d) => ({ ...d, notices: d.notices.map((x) => x.id === n.id && !x.reads.includes(user.id) ? { ...x, reads: [...x.reads, user.id] } : x) })); }} aria-expanded={open === n.id}>
                    <b className="text-[0.98rem] leading-snug">{n.title}</b>
                  </button>
                  <div className={cx("grid transition-all duration-300", open === n.id ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden"><p className="text-[0.88rem] text-mute leading-relaxed">{n.body}</p></div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {rows.length === 0 && <Card><EmptyState icon={<Bell className="w-5 h-5" />} title="No notices for this audience" body="Try another tab — or compose one." /></Card>}
      </div>

      <Modal open={compose} onClose={() => setCompose(false)} title="Compose notice" wide
        footer={<><Button variant="ghost" onClick={() => setCompose(false)}>Discard</Button><Button onClick={() => {
          if (f.title.trim().length < 6 || f.body.trim().length < 12) { push("error", "Needs more detail", "A clear title and body are required."); return; }
          update((d) => ({ ...d, notices: [{ id: `NT-${Date.now()}`, title: f.title.trim(), body: f.body.trim(), audience: f.audience, category: f.category, date: todayISO(), pinned: f.pinned, reads: [user?.id ?? ""] }, ...d.notices] }));
          push("success", "Notice published", `Visible to ${f.audience === "All" ? "everyone" : f.audience.toLowerCase()} immediately.`);
          setCompose(false); setF({ title: "", body: "", audience: "All", category: "General", pinned: false });
        }}>Publish notice</Button></>}>
        <div className="space-y-4">
          <Field label="Title *"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Sports Day — house points update" /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Audience"><Select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value as Notice["audience"] })}><option>All</option><option>Students</option><option>Teachers</option><option>Parents</option></Select></Field>
            <Field label="Category"><Select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Notice["category"] })}><option>General</option><option>Exam</option><option>Holiday</option><option>Event</option><option>Urgent</option></Select></Field>
            <Field label="Pin to top"><div className="h-10 flex items-center"><Toggle on={f.pinned} onChange={(v) => setF({ ...f, pinned: v })} label="Pin notice" /></div></Field>
          </div>
          <Field label="Message *"><Textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Write the announcement…" className="min-h-[120px]" /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ================= PROFILE ================= */
export function ProfilePage() {
  const { user, db } = useApp();
  const { push } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem("eduvanta.theme") === "dark");
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  if (!user) return null;

  const access = Object.entries(PERMS).filter(([, roles]) => roles.includes(user.role)).map(([m]) => m);
  const linkedStudent = user.linkId ? db.students.find((s) => s.id === user.linkId) : undefined;

  const savePw = () => {
    const e: Record<string, string> = {};
    if (pw.cur !== (user.role === "superadmin" ? "admin123" : user.role === "principal" ? "principal123" : user.role === "teacher" ? "teach123" : user.role === "accountant" ? "finance123" : user.role === "student" ? "study123" : "family123")) e.cur = "Current password is incorrect";
    if (pw.next.length < 6) e.next = "Minimum 6 characters";
    if (pw.next !== pw.confirm) e.confirm = "Passwords don't match";
    setErrs(e);
    if (Object.keys(e).length) return;
    setPw({ cur: "", next: "", confirm: "" });
    push("success", "Password updated", "Use the new password next time you sign in. (Demo note: sign-in still accepts the original demo password.)");
  };

  return (
    <div>
      <PageHead title="My Profile" sub="Account details, access scope and preferences" />
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} color={user.color} size={72} />
            <div className="min-w-0"><h3 className="font-display font-extrabold text-xl truncate">{user.name}</h3><Badge tone="emerald" className="mt-1.5">{roleLabel[user.role]}</Badge></div>
          </div>
          <ul className="mt-5 space-y-2.5 text-[0.86rem] border-t border-line pt-5">
            <li className="flex justify-between gap-3"><span className="text-mute">Email</span><b className="truncate">{user.email}</b></li>
            <li className="flex justify-between gap-3"><span className="text-mute">User ID</span><b className="tnum">{user.id}</b></li>
            {linkedStudent && <li className="flex justify-between gap-3"><span className="text-mute">Student record</span><b>{linkedStudent.first} {linkedStudent.last} · {linkedStudent.classId.toUpperCase()}-{linkedStudent.section}</b></li>}
            {user.children && <li className="flex justify-between gap-3"><span className="text-mute">Linked children</span><b>{user.children.length}</b></li>}
          </ul>
          <div className="mt-5 pt-5 border-t border-line">
            <p className="text-[0.72rem] font-bold uppercase tracking-wider text-mute mb-2.5">Module access</p>
            <div className="flex flex-wrap gap-1.5">{access.map((m) => <Badge key={m} tone="outline" className="capitalize">{m}</Badge>)}</div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2.5"><ShieldCheck className="w-5 h-5 text-em-600" />Change password</h3>
          <div className="space-y-3.5">
            <Field label="Current password" error={errs.cur}><Input type="password" value={pw.cur} invalid={!!errs.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} /></Field>
            <Field label="New password" error={errs.next}><Input type="password" value={pw.next} invalid={!!errs.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="Confirm new password" error={errs.confirm}><Input type="password" value={pw.confirm} invalid={!!errs.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
            <Button onClick={savePw} className="w-full"><KeyRound className="w-4 h-4" />Update password</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-lg mb-4">Preferences</h3>
          <div className="flex items-center justify-between rounded-lg border border-line px-4 py-3.5 mb-3">
            <span className="flex items-center gap-3"><span className="w-9 h-9 rounded-lg bg-navy-100 text-navy-800 grid place-items-center">{theme ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}</span><span><b className="block text-[0.88rem]">Dark dashboard</b><span className="text-[0.72rem] text-mute">Applies to portal surfaces</span></span></span>
            <Toggle on={theme} onChange={(v) => { setTheme(v); document.documentElement.classList.toggle("dark", v); localStorage.setItem("eduvanta.theme", v ? "dark" : "light"); }} label="Dark mode" />
          </div>
          {[["Email digests", "Weekly summary of grades and fees"], ["SMS alerts", "Urgent notices by text"]].map(([t, s]) => (
            <div key={t} className="flex items-center justify-between rounded-lg border border-line px-4 py-3.5 mb-3">
              <span><b className="block text-[0.88rem]">{t}</b><span className="text-[0.72rem] text-mute">{s}</span></span>
              <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-em-700"><Check className="w-4 h-4" />On</span>
            </div>
          ))}
          <p className="text-[0.75rem] text-mute mt-2">Preference changes apply to this demo session.</p>
        </Card>
      </div>
    </div>
  );
}
