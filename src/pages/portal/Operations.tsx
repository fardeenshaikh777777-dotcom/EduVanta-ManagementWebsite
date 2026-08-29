import { useMemo, useState } from "react";
import { Save, Download, Check, X as XIcon, Clock, Bus as BusIcon, MapPin, Phone, UserPlus, BookOpen, RotateCcw, AlertTriangle, CalendarOff, Plus } from "lucide-react";
import { PageHead } from "./Dashboards";
import { Card, Button, Badge, Modal, Field, Input, Select, Textarea, Tabs, EmptyState, Avatar, statusTone, usePaged, Pagination, DataTable, Confirm, SearchInput, Ring } from "../../components/ui";
import { TrendLines, C } from "../../components/charts";
import { useApp, useToast } from "../../lib/store";
import { attendanceTrend } from "../../lib/data";
import { cx, fmtDate, fmtDateShort, todayISO, daysUntil, toCsv, downloadText } from "../../lib/core";
import type { Mark } from "../../lib/core";

const MARKS: { v: Mark; label: string; cls: string; active: string }[] = [
  { v: "P", label: "Present", cls: "text-em-700", active: "bg-em-600 text-white border-em-600" },
  { v: "A", label: "Absent", cls: "text-danger-600", active: "bg-danger-600 text-white border-danger-600" },
  { v: "L", label: "Late", cls: "text-gold-600", active: "bg-gold-500 text-navy-950 border-gold-500" },
  { v: "E", label: "Leave", cls: "text-navy-800", active: "bg-navy-800 text-white border-navy-800" },
];

export function AttendancePage() {
  const { db, update, user, studentAttendancePct } = useApp();
  const { push } = useToast();
  const [tab, setTab] = useState("take");
  const [classId, setClassId] = useState("g7");
  const [section, setSection] = useState("A");
  const [date, setDate] = useState(todayISO());
  const [local, setLocal] = useState<Record<string, Mark>>({});
  const [loadedKey, setLoadedKey] = useState("");

  const key = `${classId}-${section}|${date}`;
  const roster = db.students.filter((s) => s.classId === classId && s.section === section);
  const existing = db.attendance.find((a) => a.date === date && a.classId === `${classId}-${section}`);
  if (loadedKey !== key) {
    const init: Record<string, Mark> = {};
    roster.forEach((s) => { init[s.id] = existing?.marks[s.id] ?? "P"; });
    setLocal(init);
    setLoadedKey(key);
  }

  const counts = useMemo(() => {
    const c = { P: 0, A: 0, L: 0, E: 0 };
    Object.values(local).forEach((m) => c[m]++);
    return c;
  }, [local]);

  const readonly = user && ["student", "parent"].includes(user.role);
  const myStudentId = user?.role === "student" ? user.linkId : user?.role === "parent" ? (user.children ?? [])[0] : null;

  const classSummary = useMemo(() => {
    return db.classes.flatMap((c) => c.sections.map((sec) => {
      const recs = db.attendance.filter((a) => a.classId === `${c.id}-${sec}`);
      let p = 0, t = 0;
      recs.forEach((r) => Object.values(r.marks).forEach((m) => { t++; if (m === "P" || m === "L") p++; }));
      return { class: `${c.name} ${sec}`, days: recs.length, pct: t ? Math.round((p / t) * 1000) / 10 : 0 };
    })).filter((x) => x.days > 0);
  }, [db]);

  if (readonly) {
    const st = db.students.find((s) => s.id === myStudentId);
    const days = db.attendance.filter((a) => st && a.marks[st.id]).sort((a, b) => b.date.localeCompare(a.date));
    const pct = myStudentId ? studentAttendancePct(myStudentId) : 100;
    return (
      <div>
        <PageHead title="My Attendance" sub={st ? `${st.first} ${st.last} · ${st.classId.toUpperCase()}-${st.section}` : "Attendance record"} />
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="p-6 flex flex-col items-center justify-center"><Ring pct={pct} size={120} stroke={10} /><p className="font-bold mt-3">Overall attendance</p><p className="text-[0.8rem] text-mute">last {days.length} school days</p></Card>
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-display font-bold mb-4">Day-by-day</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {days.map((d) => { const m = d.marks[myStudentId!]; return (
                <div key={d.date} className={cx("rounded-lg border px-2 py-2.5 text-center", m === "P" ? "border-em-200 bg-em-50" : m === "L" ? "border-gold-500/40 bg-gold-100/50" : m === "A" ? "border-danger-600/30 bg-danger-100/50" : "border-line bg-paper")}>
                  <p className="font-display font-bold">{m}</p><p className="text-[0.65rem] text-mute tnum">{fmtDateShort(d.date)}</p>
                </div>
              ); })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHead title="Attendance" sub="Daily registers, class analytics and monthly reports"
        actions={<Button variant="outline" size="sm" onClick={() => { downloadText("attendance-report.csv", toCsv(["Class", "Days recorded", "Attendance %"], classSummary.map((r) => [r.class, r.days, r.pct]))); push("success", "Report exported", "Monthly attendance report downloaded."); }}><Download className="w-4 h-4" />Export report</Button>} />
      <Tabs active={tab} onChange={setTab} tabs={[{ id: "take", label: "Take attendance" }, { id: "analytics", label: "Analytics & reports" }]} className="mb-5" />

      {tab === "take" && (
        <div className="anim-fade-in">
          <div className="flex flex-wrap gap-3 mb-5">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="!w-36" aria-label="Class">{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
            <Select value={section} onChange={(e) => setSection(e.target.value)} className="!w-28" aria-label="Section"><option>A</option><option>B</option></Select>
            <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} className="!w-44" aria-label="Date" />
            <Button size="md" onClick={() => {
              if (roster.length === 0) { push("error", "Empty roster", "No sample students in this section."); return; }
              update((d) => ({ ...d, attendance: [...d.attendance.filter((a) => !(a.date === date && a.classId === `${classId}-${section}`)), { date, classId: `${classId}-${section}`, marks: local }] }));
              push("success", "Register saved", `${classId.toUpperCase()}-${section} · ${fmtDate(date)} — ${counts.P} present, ${counts.A} absent, ${counts.L} late, ${counts.E} on leave.`);
            }}><Save className="w-4 h-4" />Save register</Button>
            {existing && <Badge tone="emerald" className="!py-2.5">Saved register loaded</Badge>}
          </div>

          {roster.length === 0 ? <Card><EmptyState title="No students in this section" body="Sample students are seeded in selected class-section groups. Try Grade 7 A or Grade 6 A." /></Card> : (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4 max-w-lg">
                {MARKS.map((m) => (
                  <div key={m.v} className="rounded-lg border border-line bg-card px-3 py-2.5 text-center">
                    <p className={cx("font-display font-extrabold text-lg tnum", m.cls)}>{counts[m.v]}</p>
                    <p className="text-[0.68rem] font-bold uppercase tracking-wide text-mute">{m.label}</p>
                  </div>
                ))}
              </div>
              <Card className="divide-y divide-line/70">
                {roster.map((s, i) => (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5">
                    <span className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-6 text-[0.75rem] font-bold text-mute tnum">{i + 1}</span>
                      <Avatar name={`${s.first} ${s.last}`} color={s.color} size={34} />
                      <span className="min-w-0"><b className="block text-[0.9rem] truncate">{s.first} {s.last}</b><span className="text-[0.72rem] text-mute tnum">{s.id} · Roll {s.roll}</span></span>
                    </span>
                    <div className="flex gap-1.5 sm:ml-auto" role="radiogroup" aria-label={`Attendance for ${s.first}`}>
                      {MARKS.map((m) => (
                        <button key={m.v} onClick={() => setLocal({ ...local, [s.id]: m.v })}
                          className={cx("px-3 h-8 rounded-lg border text-[0.75rem] font-bold transition-all cursor-pointer", local[s.id] === m.v ? m.active : cx("border-line text-mute hover:border-em-300", m.cls))}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-5 anim-fade-in">
          <div className="grid lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2"><h3 className="font-display font-bold text-lg mb-1">Attendance trend</h3><p className="text-[0.8rem] text-mute mb-3">School-wide vs grades · last 10 school days</p>
              <TrendLines data={attendanceTrend} xKey="d" series={[{ key: "school", name: "School", color: C.em }, { key: "g7", name: "Grade 7", color: C.navy }, { key: "g6", name: "Grade 6", color: C.gold }]} height={250} /></Card>
            <Card className="p-5">
              <h3 className="font-display font-bold text-lg mb-4">Flagged students</h3>
              {db.students.filter((s) => studentAttendancePct(s.id) < 88).slice(0, 5).map((s) => {
                const p = studentAttendancePct(s.id);
                return (
                  <div key={s.id} className="flex items-center gap-3 py-2.5 border-b border-line/60 last:border-0">
                    <AlertTriangle className={cx("w-4 h-4 shrink-0", p < 80 ? "text-danger-600" : "text-gold-600")} />
                    <span className="flex-1 min-w-0"><b className="block text-[0.85rem] truncate">{s.first} {s.last}</b><span className="text-[0.7rem] text-mute">{s.classId.toUpperCase()}-{s.section}</span></span>
                    <b className={cx("tnum", p < 80 ? "text-danger-600" : "text-gold-600")}>{p}%</b>
                  </div>
                );
              })}
            </Card>
          </div>
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-4">Monthly report by class-section</h3>
            <DataTable cols={[
              { key: "class", label: "Class", render: (r: (typeof classSummary)[0]) => <b>{r.class}</b> },
              { key: "days", label: "Days recorded", render: (r: (typeof classSummary)[0]) => <span className="tnum">{r.days}</span> },
              { key: "pct", label: "Attendance", render: (r: (typeof classSummary)[0]) => (
                <span className="flex items-center gap-3"><span className={cx("font-bold tnum w-14", r.pct >= 92 ? "text-em-700" : r.pct >= 85 ? "text-gold-600" : "text-danger-600")}>{r.pct}%</span><span className="flex-1 h-1.5 rounded-full bg-ink/8 max-w-[160px]"><span className={cx("block h-full rounded-full", r.pct >= 92 ? "bg-em-500" : r.pct >= 85 ? "bg-gold-500" : "bg-danger-600")} style={{ width: `${r.pct}%` }} /></span></span>) },
            ]} rows={classSummary} keyOf={(r) => r.class} />
          </Card>
        </div>
      )}
    </div>
  );
}

/* ================= LEAVES ================= */
export function LeavesPage() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [status, setStatus] = useState("all");
  const [apply, setApply] = useState(false);
  const [decide, setDecide] = useState<{ id: string; to: "Approved" | "Rejected" } | null>(null);
  const [f, setF] = useState({ from: "", to: "", reason: "" });

  const approver = user && ["superadmin", "admin", "principal"].includes(user.role);
  const rows = db.leaves.filter((l) => status === "all" || l.status === status);

  return (
    <div>
      <PageHead title="Leave Management" sub="Student and staff leave requests with approval workflow"
        actions={<Button size="sm" onClick={() => setApply(true)}><Plus className="w-4 h-4" />Apply for leave</Button>} />
      <Tabs active={status} onChange={setStatus} tabs={[
        { id: "all", label: "All", badge: db.leaves.length },
        { id: "Pending", label: "Pending", badge: db.leaves.filter((l) => l.status === "Pending").length },
        { id: "Approved", label: "Approved" }, { id: "Rejected", label: "Rejected" },
      ]} className="mb-5" />
      <div className="space-y-3">
        {rows.map((l) => (
          <Card key={l.id} className="p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className={cx("w-11 h-11 rounded-xl grid place-items-center shrink-0", l.kind === "Teacher" ? "bg-navy-100 text-navy-800" : "bg-em-100 text-em-700")}><CalendarOff className="w-5 h-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap"><b className="text-[0.95rem]">{l.who}</b><Badge tone={l.kind === "Teacher" ? "navy" : "emerald"}>{l.kind}</Badge><Badge tone={statusTone(l.status)}>{l.status}</Badge></div>
                <p className="text-[0.83rem] text-mute mt-1.5"><b className="tnum">{fmtDate(l.from)}</b> → <b className="tnum">{fmtDate(l.to)}</b> · applied {fmtDateShort(l.appliedOn)}</p>
                <p className="text-[0.86rem] mt-1.5 text-ink/80">“{l.reason}”</p>
              </div>
              {approver && l.status === "Pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" onClick={() => setDecide({ id: l.id, to: "Approved" })}><Check className="w-3.5 h-3.5" />Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => setDecide({ id: l.id, to: "Rejected" })}><XIcon className="w-3.5 h-3.5" />Reject</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {rows.length === 0 && <Card><EmptyState icon={<Clock className="w-5 h-5" />} title="No requests here" body="Nothing with this status right now." /></Card>}
      </div>

      <Modal open={apply} onClose={() => setApply(false)} title="Apply for leave"
        footer={<><Button variant="ghost" onClick={() => setApply(false)}>Cancel</Button><Button onClick={() => {
          if (!f.from || !f.to || f.reason.trim().length < 8) { push("error", "Incomplete request", "Dates and a short reason are required."); return; }
          const who = user?.role === "teacher" ? `${user.name} (Staff)` : user?.role === "student" ? `${user.name} (Student)` : `${user?.name ?? "Requester"}`;
          update((d) => ({ ...d, leaves: [{ id: `LV-${Date.now()}`, who, kind: user?.role === "teacher" ? "Teacher" : "Student", from: f.from, to: f.to, reason: f.reason.trim(), status: "Pending", appliedOn: todayISO() }, ...d.leaves] }));
          push("success", "Request submitted", "It's now waiting for admin approval.");
          setApply(false); setF({ from: "", to: "", reason: "" });
        }}>Submit request</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="From *"><Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></Field>
          <Field label="To *"><Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field>
          <Field label="Reason *" className="col-span-2"><Textarea value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Briefly explain the leave…" /></Field>
        </div>
      </Modal>

      <Confirm open={!!decide} onClose={() => setDecide(null)} danger={decide?.to === "Rejected"} yesLabel={decide?.to ?? "Confirm"}
        title={`${decide?.to === "Approved" ? "Approve" : "Reject"} this request?`}
        body={decide?.to === "Approved" ? "The requester will be notified and the absence marked as authorized in the register." : "The requester will be notified that this leave was declined."}
        onYes={() => { if (decide) { update((d) => ({ ...d, leaves: d.leaves.map((l) => l.id === decide.id ? { ...l, status: decide.to } : l) })); push(decide.to === "Approved" ? "success" : "info", `Request ${decide.to.toLowerCase()}`, "The requester has been notified."); } }} />
    </div>
  );
}

/* ================= LIBRARY ================= */
export function LibraryPage() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [issue, setIssue] = useState(false);
  const [ret, setRet] = useState<string | null>(null);
  const [f, setF] = useState({ bookId: "", studentId: "", days: 14 });

  const books = db.books.filter((b) => `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q.toLowerCase()));
  const activeLoans = db.loans.filter((l) => l.status !== "Returned").sort((a, b) => a.due.localeCompare(b.due));
  const librarian = user && ["superadmin", "admin", "teacher"].includes(user.role);
  const paged = usePaged(activeLoans, 6);

  return (
    <div>
      <PageHead title="Library Management" sub={`${db.books.reduce((s, b) => s + b.copies, 0)} volumes · ${activeLoans.length} loans out · ${activeLoans.filter((l) => l.status === "Overdue").length} overdue`}
        actions={librarian ? <Button size="sm" onClick={() => setIssue(true)}><Plus className="w-4 h-4" />Issue book</Button> : undefined} />
      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search title, author, category…" className="mb-4" />
          <div className="space-y-3">
            {books.map((b) => (
              <Card key={b.id} className="p-4.5 flex items-center gap-4 hover:border-em-200 transition-colors">
                <span className="w-11 h-11 rounded-lg bg-navy-100 text-navy-800 grid place-items-center shrink-0"><BookOpen className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <b className="block text-[0.92rem] truncate">{b.title}</b>
                  <p className="text-[0.75rem] text-mute">{b.author} · ISBN {b.isbn}</p>
                  <div className="flex gap-2 mt-1.5"><Badge tone="navy">{b.category}</Badge><Badge tone={b.available > 0 ? "emerald" : "red"}>{b.available}/{b.copies} available</Badge></div>
                </div>
              </Card>
            ))}
            {books.length === 0 && <Card><EmptyState title="No books match" body="Try a different search term." /></Card>}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-4">Active & overdue loans</h3>
            <div className="space-y-2.5">
              {paged.slice.map((l) => {
                const b = db.books.find((x) => x.id === l.bookId);
                const st = db.students.find((x) => x.id === l.studentId);
                const overdue = l.status === "Overdue" || (l.status === "Active" && daysUntil(l.due) < 0);
                return (
                  <div key={l.id} className={cx("rounded-lg border p-3.5", overdue ? "border-danger-600/40 bg-danger-100/30" : "border-line")}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone={overdue ? "red" : "emerald"}>{overdue ? "Overdue" : "Active"}</Badge>
                      <span className="text-[0.72rem] text-mute tnum">due {fmtDateShort(l.due)}</span>
                    </div>
                    <b className="block text-[0.88rem] mt-1.5 leading-snug">{b?.title}</b>
                    <div className="flex items-center justify-between mt-2">
                      <span className="flex items-center gap-2 text-[0.78rem] text-mute">{st && <Avatar name={`${st.first} ${st.last}`} color={st.color} size={22} />}{st ? `${st.first} ${st.last}` : l.studentId}</span>
                      {librarian && <Button size="sm" variant="outline" onClick={() => setRet(l.id)}><RotateCcw className="w-3.5 h-3.5" />Return</Button>}
                    </div>
                  </div>
                );
              })}
              {activeLoans.length === 0 && <EmptyState icon={<BookOpen className="w-5 h-5" />} title="All books returned" />}
            </div>
            <Pagination page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} shown={paged.shown} />
          </Card>
        </div>
      </div>

      <Modal open={issue} onClose={() => setIssue(false)} title="Issue book"
        footer={<><Button variant="ghost" onClick={() => setIssue(false)}>Cancel</Button><Button onClick={() => {
          const b = db.books.find((x) => x.id === f.bookId);
          if (!f.bookId || !f.studentId) { push("error", "Select both", "Pick a book and a borrower."); return; }
          if (!b || b.available <= 0) { push("error", "No copies", "That title has no copies available."); return; }
          const due = new Date(); due.setDate(due.getDate() + f.days);
          update((d) => ({ ...d, books: d.books.map((x) => x.id === f.bookId ? { ...x, available: x.available - 1 } : x), loans: [...d.loans, { id: `LN-${Date.now()}`, bookId: f.bookId, studentId: f.studentId, issued: todayISO(), due: due.toISOString().slice(0, 10), returned: null, status: "Active" }] }));
          push("success", "Book issued", `${b.title} — due back ${fmtDate(due.toISOString().slice(0, 10))}.`);
          setIssue(false); setF({ bookId: "", studentId: "", days: 14 });
        }}>Issue book</Button></>}>
        <div className="space-y-4">
          <Field label="Book *"><Select value={f.bookId} onChange={(e) => setF({ ...f, bookId: e.target.value })}><option value="">Select a title…</option>{db.books.map((b) => <option key={b.id} value={b.id}>{b.title} — {b.available} available</option>)}</Select></Field>
          <Field label="Borrower *"><Select value={f.studentId} onChange={(e) => setF({ ...f, studentId: e.target.value })}><option value="">Select a student…</option>{db.students.map((s) => <option key={s.id} value={s.id}>{s.first} {s.last} · {s.classId.toUpperCase()}-{s.section}</option>)}</Select></Field>
          <Field label="Loan period"><Select value={String(f.days)} onChange={(e) => setF({ ...f, days: Number(e.target.value) })}><option value="7">7 days</option><option value="14">14 days</option><option value="21">21 days</option></Select></Field>
        </div>
      </Modal>

      <Confirm open={!!ret} onClose={() => setRet(null)} title="Confirm return" yesLabel="Mark returned"
        body="Return this book to the shelf? The borrower's history updates immediately."
        onYes={() => { if (ret) { const loan = db.loans.find((l) => l.id === ret); update((d) => ({ ...d, loans: d.loans.map((l) => l.id === ret ? { ...l, status: "Returned", returned: todayISO() } : l), books: d.books.map((b) => b.id === loan?.bookId ? { ...b, available: Math.min(b.copies, b.available + 1) } : b) })); push("success", "Book returned", "Back on the shelf and available to borrow."); } }} />
    </div>
  );
}

/* ================= TRANSPORT ================= */
export function TransportPage() {
  const { db, update } = useApp();
  const { push } = useToast();
  const [assign, setAssign] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const route = db.routes.find((r) => r.id === assign);

  return (
    <div>
      <PageHead title="Transport Management" sub={`${db.routes.length} routes · ${db.routes.reduce((s, r) => s + r.students.length, 0)} riders · all vehicles GPS-tracked`} />
      <div className="grid md:grid-cols-2 gap-5">
        {db.routes.map((r) => {
          const dueCount = r.students.filter((sid) => db.fees.some((f) => f.studentId === sid && f.type.startsWith("Transport") && f.status !== "Paid")).length;
          return (
            <Card key={r.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <span className="w-12 h-12 rounded-xl bg-navy-900 text-em-200 grid place-items-center"><BusIcon className="w-6 h-6" /></span>
                  <div>
                    <h3 className="font-display font-extrabold text-lg leading-tight">{r.id} · {r.name}</h3>
                    <p className="text-[0.75rem] text-mute">{r.vehicle} · {r.plate}</p>
                  </div>
                </div>
                <Badge tone={dueCount > 0 ? "amber" : "emerald"}>{dueCount > 0 ? `${dueCount} fee due` : "Fees clear"}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-lg bg-paper border border-line px-4 py-2.5 text-[0.83rem]">
                <Avatar name={r.driver} size={30} color="#1b4276" />
                <span className="flex-1"><b>{r.driver}</b><span className="text-mute"> · Driver</span></span>
                <a href={`tel:${r.driverPhone}`} className="inline-flex items-center gap-1.5 font-semibold text-em-700 hover:underline"><Phone className="w-3.5 h-3.5" />Call</a>
              </div>
              <p className="text-[0.72rem] font-bold uppercase tracking-wider text-mute mt-4 mb-2">Route stops</p>
              <ol className="relative border-l-2 border-em-200 ml-1 space-y-2.5">
                {r.stops.map((stop, i) => (
                  <li key={stop} className="ml-5 relative">
                    <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-card border-[3px] border-em-600" />
                    <span className="text-[0.85rem] font-semibold">{stop}</span>
                    <span className="text-[0.72rem] text-mute ml-2 tnum">{["07:05", "07:18", "07:31", "07:42", "07:55"][i] ?? ""}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-4 border-t border-line">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[0.72rem] font-bold uppercase tracking-wider text-mute">Assigned students · {r.students.length}</p>
                  <Button size="sm" variant="outline" onClick={() => { setAssign(r.id); setStudentId(""); }}><UserPlus className="w-3.5 h-3.5" />Assign</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.students.map((sid) => {
                    const st = db.students.find((x) => x.id === sid);
                    return st ? <Badge key={sid} tone="navy" className="!py-1.5">{st.first} {st.last[0]}.</Badge> : null;
                  })}
                  {r.students.length === 0 && <span className="text-[0.8rem] text-mute">No riders assigned.</span>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!route} onClose={() => setAssign(null)} title={`Assign rider — ${route?.id} ${route?.name}`}
        footer={<><Button variant="ghost" onClick={() => setAssign(null)}>Cancel</Button><Button onClick={() => {
          if (!studentId || !route) { push("error", "Pick a student", "Choose who rides this route."); return; }
          const st = db.students.find((x) => x.id === studentId);
          if (route.students.includes(studentId)) { push("error", "Already assigned", `${st?.first} is already on this route.`); return; }
          update((d) => ({ ...d, routes: d.routes.map((x) => x.id === route.id ? { ...x, students: [...x.students, studentId] } : x), students: d.students.map((x) => x.id === studentId ? { ...x, route: route.id } : x) }));
          push("success", "Rider assigned", `${st?.first} ${st?.last} now rides ${route.id} · transport fee of $${route.fee}/term applies.`);
          setAssign(null);
        }}>Assign to route</Button></>}>
        <Field label="Student *">
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            <option value="">Select a student…</option>
            {db.students.filter((s) => !route?.students.includes(s.id)).map((s) => <option key={s.id} value={s.id}>{s.first} {s.last} · {s.classId.toUpperCase()}-{s.section}</option>)}
          </Select>
        </Field>
        <div className="mt-4 rounded-lg bg-paper border border-line p-4 text-[0.83rem] text-mute flex gap-3">
          <MapPin className="w-4 h-4 text-em-600 shrink-0 mt-0.5" />
          <span>Pickup at the nearest stop on <b className="text-ink">{route?.name}</b>. Monthly fee {`$${route?.fee ?? 0}`}/term is invoiced automatically.</span>
        </div>
      </Modal>
    </div>
  );
}


