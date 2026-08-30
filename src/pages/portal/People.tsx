import { useMemo, useState } from "react";
import { UserPlus, Pencil, Trash2, FileText, Phone, Mail, MapPin, Download, Award, Wallet, Send, ArrowLeft } from "lucide-react";
import { PageHead } from "./Dashboards";
import { Card, Button, Badge, Modal, Field, Input, Select, DataTable, usePaged, Pagination, EmptyState, Avatar, Ring, SearchInput, Tabs, statusTone, Confirm, Link } from "../../components/ui";
import { useApp, useToast } from "../../lib/store";
import { cx, fmtDate, money, resultSummary, gradeOf, toCsv, downloadText, todayISO } from "../../lib/core";
import type { Student } from "../../lib/core";

/* ================= STUDENTS ================= */
export function StudentsPage() {
  const { db, update, studentAttendancePct, feeBalance } = useApp();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [fClass, setFClass] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [add, setAdd] = useState(false);
  const [del, setDel] = useState<Student | null>(null);

  const rows = useMemo(() => {
    let r = [...db.students];
    const s = q.trim().toLowerCase();
    if (s) r = r.filter((x) => `${x.first} ${x.last} ${x.admissionNo} ${x.parentName}`.toLowerCase().includes(s));
    if (fClass !== "all") r = r.filter((x) => x.classId === fClass);
    if (fStatus !== "all") r = r.filter((x) => x.status === fStatus);
    if (sort === "name") r.sort((a, b) => a.first.localeCompare(b.first));
    if (sort === "attendance") r.sort((a, b) => studentAttendancePct(b.id) - studentAttendancePct(a.id));
    if (sort === "fees") r.sort((a, b) => feeBalance(b.id) - feeBalance(a.id));
    return r;
  }, [db.students, q, fClass, fStatus, sort, studentAttendancePct, feeBalance]);

  const paged = usePaged(rows, 9);

  const exportCsv = () => {
    downloadText("students.csv", toCsv(
      ["ID", "Admission No", "Name", "Class", "Section", "Roll", "Parent", "Phone", "Status", "Attendance %", "Fee Balance"],
      rows.map((s) => [s.id, s.admissionNo, `${s.first} ${s.last}`, s.classId.toUpperCase(), s.section, s.roll, s.parentName, s.parentPhone, s.status, studentAttendancePct(s.id), feeBalance(s.id)])
    ));
    push("success", "Export ready", `${rows.length} student records downloaded as CSV.`);
  };

  return (
    <div>
      <PageHead title="Student Management" sub={`${db.students.length} enrolled in sample records · ${db.students.filter((s) => s.status === "Active").length} active`}
        actions={<><Button variant="outline" size="sm" onClick={exportCsv}><Download className="w-4 h-4" />Export CSV</Button><Button size="sm" onClick={() => setAdd(true)}><UserPlus className="w-4 h-4" />Add student</Button></>} />

      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <SearchInput value={q} onChange={setQ} placeholder="Search name, admission no, parent…" className="lg:w-80" />
        <div className="flex flex-wrap gap-3 flex-1">
          <Select value={fClass} onChange={(e) => setFClass(e.target.value)} className="!w-40" aria-label="Filter by class">
            <option value="all">All classes</option>
            {db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="!w-40" aria-label="Filter by status">
            <option value="all">All statuses</option><option>Active</option><option>Inactive</option><option>Transferred</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="!w-48" aria-label="Sort">
            <option value="name">Sort · Name A–Z</option><option value="attendance">Sort · Attendance</option><option value="fees">Sort · Fee balance</option>
          </Select>
        </div>
      </div>

      <DataTable cols={[
        { key: "name", label: "Student", render: (s: Student) => (
          <span className="flex items-center gap-3"><Avatar name={`${s.first} ${s.last}`} color={s.color} size={36} /><span><b className="block">{s.first} {s.last}</b><span className="text-[0.72rem] text-mute tnum">{s.admissionNo}</span></span></span>) },
        { key: "class", label: "Class", render: (s: Student) => <Badge tone="navy">{s.classId.toUpperCase()}-{s.section} · Roll {s.roll}</Badge> },
        { key: "parent", label: "Parent / Guardian", hideSm: true, render: (s: Student) => <span><span className="block font-semibold">{s.parentName}</span><span className="text-[0.72rem] text-mute">{s.parentPhone}</span></span> },
        { key: "att", label: "Attendance", render: (s: Student) => { const p = studentAttendancePct(s.id); return <span className={cx("font-bold tnum", p >= 90 ? "text-em-700" : p >= 80 ? "text-gold-600" : "text-danger-600")}>{p}%</span>; } },
        { key: "fees", label: "Fee balance", render: (s: Student) => { const b = feeBalance(s.id); return <span className={cx("tnum font-semibold", b > 0 ? "text-danger-600" : "text-em-700")}>{b > 0 ? money(b) : "Clear"}</span>; } },
        { key: "status", label: "Status", render: (s: Student) => <Badge tone={statusTone(s.status)}>{s.status}</Badge> },
        { key: "act", label: "", render: (s: Student) => (
          <span className="flex gap-1 justify-end">
            <button className="w-8 h-8 grid place-items-center rounded-lg text-mute hover:text-navy-800 hover:bg-navy-100 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setDel(s); }} aria-label={`Delete ${s.first}`}><Trash2 className="w-4 h-4" /></button>
          </span>) },
      ]} rows={paged.slice} keyOf={(s) => s.id} onRow={(s) => { window.location.hash = `#/app/students/${s.id}`; }} />
      <Pagination page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} shown={paged.shown} />

      <StudentFormModal open={add} onClose={() => setAdd(false)} />
      <Confirm open={!!del} onClose={() => setDel(null)} danger yesLabel="Remove student"
        title={`Remove ${del ? `${del.first} ${del.last}` : ""}?`}
        body="This removes the student from the register. Attendance, results and fee history for this record will also be cleared from the demo ledger."
        onYes={() => { if (del) { update((d) => ({ ...d, students: d.students.filter((x) => x.id !== del.id) })); push("info", "Student removed", `${del.first} ${del.last} was removed from the register.`); } }} />
    </div>
  );
}

export function StudentFormModal({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: Student }) {
  const { db, update } = useApp();
  const { push } = useToast();
  const blank = { first: "", last: "", gender: "F", dob: "", classId: "g5", section: "A", roll: 1, parentName: "", parentEmail: "", parentPhone: "", address: "", blood: "O+", route: "" };
  const [f, setF] = useState(blank);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  if (open && edit && loadedFor !== edit.id) {
    setF({ first: edit.first, last: edit.last, gender: edit.gender, dob: edit.dob, classId: edit.classId, section: edit.section, roll: edit.roll, parentName: edit.parentName, parentEmail: edit.parentEmail, parentPhone: edit.parentPhone, address: edit.address, blood: edit.blood, route: edit.route ?? "" });
    setLoadedFor(edit.id);
  }
  if (open && !edit && loadedFor !== null) { setF(blank); setLoadedFor(null); }

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.first.trim().length < 2) e.first = "First name required";
    if (f.last.trim().length < 2) e.last = "Last name required";
    if (!f.dob) e.dob = "Date of birth required";
    if (f.parentName.trim().length < 3) e.parentName = "Guardian name required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.parentEmail)) e.parentEmail = "Valid email required";
    setErrs(e);
    if (Object.keys(e).length) return;
    if (edit) {
      update((d) => ({ ...d, students: d.students.map((x) => x.id === edit.id ? { ...x, ...f, gender: f.gender as "M" | "F", route: f.route || null, roll: Number(f.roll) } : x) }));
      push("success", "Student updated", `${f.first} ${f.last}'s record was saved.`);
    } else {
      const id = `STU-${1000 + db.students.length + Math.floor(Math.random() * 40) + 1}`;
      const colors = ["#0e8563", "#1b4276", "#c98a1f", "#7c5cbf", "#bb4a3c"];
      update((d) => ({ ...d, students: [...d.students, { id, admissionNo: `ADV-2026-${String(Math.floor(Math.random() * 90) + 10)}`, first: f.first.trim(), last: f.last.trim(), gender: f.gender as "M" | "F" as "M" | "F", dob: f.dob, classId: f.classId, section: f.section, roll: Number(f.roll), parentName: f.parentName.trim(), parentEmail: f.parentEmail.trim(), parentPhone: f.parentPhone.trim() || "+1 (555) 010-0000", address: f.address.trim() || "Northfield", blood: f.blood, status: "Active", admitted: todayISO(), color: colors[db.students.length % colors.length], route: f.route || null }] }));
      push("success", "Student admitted", `${f.first} ${f.last} added as ${id} in ${f.classId.toUpperCase()}-${f.section}.`);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={edit ? `Edit ${edit.first} ${edit.last}` : "Admit new student"} wide
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>{edit ? "Save changes" : "Admit student"}</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name *" error={errs.first}><Input value={f.first} invalid={!!errs.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
        <Field label="Last name *" error={errs.last}><Input value={f.last} invalid={!!errs.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
        <Field label="Gender"><Select value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}><option value="F">Female</option><option value="M">Male</option></Select></Field>
        <Field label="Date of birth *" error={errs.dob}><Input type="date" value={f.dob} invalid={!!errs.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} /></Field>
        <Field label="Class"><Select value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })}>{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Section"><Select value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}><option>A</option><option>B</option></Select></Field>
        <Field label="Roll number"><Input type="number" min={1} value={f.roll} onChange={(e) => setF({ ...f, roll: Number(e.target.value) })} /></Field>
        <Field label="Blood group"><Select value={f.blood} onChange={(e) => setF({ ...f, blood: e.target.value })}>{["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}</Select></Field>
        <Field label="Guardian name *" error={errs.parentName}><Input value={f.parentName} invalid={!!errs.parentName} onChange={(e) => setF({ ...f, parentName: e.target.value })} /></Field>
        <Field label="Guardian email *" error={errs.parentEmail}><Input type="email" value={f.parentEmail} invalid={!!errs.parentEmail} onChange={(e) => setF({ ...f, parentEmail: e.target.value })} /></Field>
        <Field label="Guardian phone"><Input value={f.parentPhone} onChange={(e) => setF({ ...f, parentPhone: e.target.value })} placeholder="+1 (555) …" /></Field>
        <Field label="Bus route"><Select value={f.route} onChange={(e) => setF({ ...f, route: e.target.value })}><option value="">No transport</option>{db.routes.map((r) => <option key={r.id} value={r.id}>{r.id} · {r.name}</option>)}</Select></Field>
        <Field label="Home address" className="sm:col-span-2"><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Street, district" /></Field>
      </div>
    </Modal>
  );
}

/* ---- student profile ---- */
export function StudentProfile({ id }: { id: string }) {
  const { db, studentAttendancePct, feeBalance, payInvoice } = useApp();
  const { push } = useToast();
  const [tab, setTab] = useState("overview");
  const [edit, setEdit] = useState(false);
  const st = db.students.find((s) => s.id === id);
  if (!st) return <EmptyState title="Student not found" body="The record may have been removed." action={<Link to="/app/students"><Button>Back to students</Button></Link>} />;
  const pct = studentAttendancePct(st.id);
  const balance = feeBalance(st.id);
  const txns = db.fees.filter((f) => f.studentId === st.id).sort((a, b) => b.date.localeCompare(a.date));
  const results = db.results.filter((r) => r.studentId === st.id);
  const loans = db.loans.filter((l) => l.studentId === st.id);
  const route = db.routes.find((r) => r.id === st.route);
  const days = db.attendance.filter((a) => a.marks[st.id]).sort((a, b) => b.date.localeCompare(a.date));
  const counts = { P: 0, A: 0, L: 0, E: 0 };
  days.forEach((d) => { counts[d.marks[st.id]]++; });

  return (
    <div>
      <Link to="/app/students" className="inline-flex items-center gap-1.5 text-[0.83rem] font-bold text-mute hover:text-em-700 transition-colors mb-4"><ArrowLeft className="w-4 h-4" />All students</Link>
      <Card className="p-6 mb-5">
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar name={`${st.first} ${st.last}`} color={st.color} size={72} />
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap"><h2 className="font-display font-extrabold text-2xl tracking-tight">{st.first} {st.last}</h2><Badge tone={statusTone(st.status)}>{st.status}</Badge></div>
              <p className="text-[0.85rem] text-mute mt-1 tnum">{st.id} · {st.admissionNo} · Admitted {fmtDate(st.admitted)}</p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <Badge tone="navy">{st.classId.toUpperCase()}-{st.section}</Badge><Badge tone="outline">Roll {st.roll}</Badge><Badge tone="outline">Blood {st.blood}</Badge>{route && <Badge tone="gold">Bus {route.id}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center"><Ring pct={pct} size={74} /><p className="text-[0.7rem] font-bold text-mute uppercase tracking-wide mt-1.5">Attendance</p></div>
            <div className="text-center">
              <p className={cx("font-display font-extrabold text-2xl tnum", balance > 0 ? "text-danger-600" : "text-em-700")}>{balance > 0 ? money(balance) : "Clear"}</p>
              <p className="text-[0.7rem] font-bold text-mute uppercase tracking-wide mt-1">Fee balance</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEdit(true)}><Pencil className="w-3.5 h-3.5" />Edit</Button>
          </div>
        </div>
      </Card>

      <Tabs active={tab} onChange={setTab} tabs={[{ id: "overview", label: "Overview" }, { id: "attendance", label: "Attendance" }, { id: "results", label: "Results" }, { id: "fees", label: "Fees" }, { id: "documents", label: "Documents" }]} className="mb-5" />

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-5 anim-fade-in">
          <Card className="p-5">
            <h3 className="font-display font-bold mb-4">Family & contact</h3>
            <ul className="space-y-3 text-[0.88rem]">
              <li className="flex gap-3 items-center"><span className="w-8 h-8 rounded-lg bg-em-100 text-em-700 grid place-items-center"><Avatar name={st.parentName} size={20} color={st.color} /></span><span><b className="block">{st.parentName}</b><span className="text-[0.75rem] text-mute">Parent / guardian</span></span></li>
              <li className="flex gap-3 items-center"><span className="w-8 h-8 rounded-lg bg-navy-100 text-navy-800 grid place-items-center"><Mail className="w-4 h-4" /></span><span className="break-all">{st.parentEmail}</span></li>
              <li className="flex gap-3 items-center"><span className="w-8 h-8 rounded-lg bg-navy-100 text-navy-800 grid place-items-center"><Phone className="w-4 h-4" /></span><span className="tnum">{st.parentPhone}</span></li>
              <li className="flex gap-3 items-start"><span className="w-8 h-8 rounded-lg bg-navy-100 text-navy-800 grid place-items-center shrink-0"><MapPin className="w-4 h-4" /></span><span>{st.address}</span></li>
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold mb-4">Academic history</h3>
            <ul className="space-y-3">
              {results.map((r) => {
                const ex = db.exams.find((e) => e.id === r.examId);
                const sum = resultSummary(r.marks);
                return (
                  <li key={r.examId} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
                    <span><b className="block text-[0.87rem]">{ex?.name}</b><span className="text-[0.72rem] text-mute">{ex?.term} · {fmtDate(ex?.date ?? "")}</span></span>
                    <span className="text-right"><b className="block tnum">{sum.pct}%</b><Badge tone={sum.gpa >= 3.2 ? "emerald" : sum.gpa >= 2 ? "amber" : "red"}>GPA {sum.gpa}</Badge></span>
                  </li>
                );
              })}
              {results.length === 0 && <EmptyState title="No results yet" />}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold mb-4">Transport & library</h3>
            {route ? (
              <div className="rounded-lg border border-line p-4 mb-3">
                <p className="font-bold text-[0.9rem]">Route {route.id} · {route.name}</p>
                <p className="text-[0.78rem] text-mute mt-1">{route.vehicle} · Driver {route.driver}</p>
                <p className="text-[0.78rem] text-mute">Stops: {route.stops.join(" → ")}</p>
              </div>
            ) : <p className="text-[0.85rem] text-mute mb-3">Not enrolled in school transport.</p>}
            <p className="text-[0.8rem] font-bold text-mute uppercase tracking-wide mb-2">Borrowing history</p>
            {loans.length === 0 ? <p className="text-[0.85rem] text-mute">No library loans.</p> : loans.map((l) => {
              const b = db.books.find((x) => x.id === l.bookId);
              return <p key={l.id} className="text-[0.85rem] py-1.5 border-b border-line/60 last:border-0 flex justify-between gap-2"><span className="truncate">{b?.title}</span><Badge tone={statusTone(l.status)}>{l.status}</Badge></p>;
            })}
          </Card>
        </div>
      )}

      {tab === "attendance" && (
        <div className="grid lg:grid-cols-3 gap-5 anim-fade-in">
          <Card className="p-5 lg:col-span-1">
            <h3 className="font-display font-bold mb-4">Summary</h3>
            <div className="space-y-3">
              {[["Present", counts.P, "emerald"], ["Late", counts.L, "gold"], ["Absent", counts.A, "red"], ["Excused leave", counts.E, "navy"]].map(([l, v, tone]) => (
                <div key={l as string} className="flex items-center justify-between rounded-lg border border-line px-4 py-3"><span className="font-semibold text-[0.88rem]">{l}</span><Badge tone={tone as "emerald"}>{v} days</Badge></div>
              ))}
            </div>
            <p className="text-[0.75rem] text-mute mt-4">Last {days.length} recorded school days.</p>
          </Card>
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-display font-bold mb-4">Day-by-day log</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {days.map((d) => {
                const m = d.marks[st.id];
                return (
                  <div key={d.date} className={cx("rounded-lg border px-2 py-2.5 text-center", m === "P" ? "border-em-200 bg-em-50" : m === "L" ? "border-gold-500/40 bg-gold-100/50" : m === "A" ? "border-danger-600/30 bg-danger-100/50" : "border-line bg-paper")}>
                    <p className="font-display font-bold">{m}</p>
                    <p className="text-[0.65rem] text-mute tnum">{fmtDate(d.date, { month: "short", day: "numeric" })}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === "results" && (
        <div className="anim-fade-in">
          {results.map((r) => {
            const ex = db.exams.find((e) => e.id === r.examId);
            const sum = resultSummary(r.marks);
            return (
              <Card key={r.examId} className="p-5 mb-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div><h3 className="font-display font-bold text-lg">{ex?.name}</h3><p className="text-[0.78rem] text-mute">{ex?.term} · held {fmtDate(ex?.date ?? "")}</p></div>
                  <div className="flex gap-2.5"><Badge tone="emerald">Total {sum.total}/{Object.keys(r.marks).length * 100}</Badge><Badge tone="navy">{sum.pct}%</Badge><Badge tone="gold">GPA {sum.gpa}</Badge></div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(r.marks).map(([sub, m]) => (
                    <div key={sub} className="rounded-lg border border-line px-4 py-3 flex items-center justify-between">
                      <span className="text-[0.88rem] font-semibold">{sub}</span>
                      <span className="flex items-center gap-2"><b className="tnum">{m}</b><Badge tone={m >= 80 ? "emerald" : m >= 50 ? "navy" : "red"}>{gradeOf(m).grade}</Badge></span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {results.length === 0 && <Card><EmptyState icon={<Award className="w-5 h-5" />} title="No results recorded yet" body="Marks appear here after teachers submit them under Exams & Results." /></Card>}
        </div>
      )}

      {tab === "fees" && (
        <Card className="p-5 anim-fade-in">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-display font-bold text-lg">Fee ledger — {st.first}</h3>
            <Badge tone={balance > 0 ? "red" : "emerald"}>Balance {money(balance)}</Badge>
          </div>
          <DataTable cols={[
            { key: "receipt", label: "Receipt", render: (t: (typeof txns)[0]) => <span className="tnum font-semibold">{t.receipt}</span> },
            { key: "type", label: "Item", render: (t: (typeof txns)[0]) => t.type },
            { key: "date", label: "Date", render: (t: (typeof txns)[0]) => <span className="tnum">{fmtDate(t.date)}</span> },
            { key: "method", label: "Method", hideSm: true, render: (t: (typeof txns)[0]) => t.method },
            { key: "amount", label: "Amount", render: (t: (typeof txns)[0]) => <b className="tnum">{money(t.amount)}</b> },
            { key: "status", label: "Status", render: (t: (typeof txns)[0]) => t.status !== "Paid" && t.kind === "Invoice" ? (
              <span className="flex items-center gap-2"><Badge tone={statusTone(t.status)}>{t.status}</Badge><Button size="sm" variant="soft" onClick={() => { payInvoice(t.id, "Cash"); push("success", "Payment recorded", `${t.type} settled for ${st.first}.`); }}>Collect</Button></span>
            ) : <Badge tone="emerald">Paid</Badge> },
          ]} rows={txns} keyOf={(t) => t.id} empty={<EmptyState icon={<Wallet className="w-5 h-5" />} title="No transactions" />} />
        </Card>
      )}

      {tab === "documents" && (
        <Card className="p-5 anim-fade-in">
          <h3 className="font-display font-bold mb-4">Documents on file</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[["Birth certificate", "Verified · Aug 2024"], ["Transfer certificate", "Verified · Aug 2024"], ["Immunization record", "Verified · Aug 2024"], ["Previous report cards", `${results.length + 1} files`], ["Passport photos", "2 on file"], ["Parent photo ID", "Verified"]].map(([n, meta]) => (
              <div key={n} className="flex items-center gap-3.5 rounded-lg border border-line px-4 py-3.5 hover:border-em-200 transition-colors">
                <span className="w-9 h-9 rounded-lg bg-navy-100 text-navy-800 grid place-items-center shrink-0"><FileText className="w-4.5 h-4.5" /></span>
                <span className="min-w-0"><b className="block text-[0.87rem] truncate">{n}</b><span className="text-[0.72rem] text-mute">{meta}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <StudentFormModal open={edit} onClose={() => setEdit(false)} edit={st} />
    </div>
  );
}

/* ================= TEACHERS ================= */
export function TeachersPage() {
  const { db, update } = useApp();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ first: "", last: "", subject: "Mathematics", email: "", phone: "", qualification: "" });
  const rows = db.teachers.filter((t) => `${t.first} ${t.last} ${t.subject}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHead title="Teacher Management" sub={`${db.teachers.length} faculty members · ${db.teachers.filter((t) => t.status === "Active").length} active this week`}
        actions={<Button size="sm" onClick={() => setAdd(true)}><UserPlus className="w-4 h-4" />Add teacher</Button>} />
      <SearchInput value={q} onChange={setQ} placeholder="Search by name or subject…" className="max-w-sm mb-5" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((t) => (
          <Card key={t.id} hover className="p-5">
            <div className="flex items-center gap-4">
              <Avatar name={`${t.first} ${t.last}`} color={t.color} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><b className="font-display truncate">{t.first} {t.last}</b></div>
                <p className="text-[0.75rem] text-mute tnum">{t.employeeId} · joined {fmtDate(t.joinDate, { month: "short", year: "numeric" })}</p>
              </div>
              <Badge tone={statusTone(t.status)}>{t.status}</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2"><Badge tone="emerald">{t.subject}</Badge>{t.classes.map((c) => <Badge key={c} tone="navy">{c.toUpperCase()}</Badge>)}</div>
            <p className="text-[0.78rem] text-mute mt-3 leading-snug">{t.qualification}</p>
            <div className="mt-3.5 pt-3.5 border-t border-line flex items-center justify-between text-[0.78rem] text-mute">
              <span className="inline-flex items-center gap-1.5 truncate"><Mail className="w-3.5 h-3.5 shrink-0" />{t.email}</span>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={add} onClose={() => setAdd(false)} title="Add faculty member"
        footer={<><Button variant="ghost" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => {
          if (f.first.trim().length < 2 || f.last.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) { push("error", "Missing details", "Name and a valid email are required."); return; }
          update((d) => ({ ...d, teachers: [...d.teachers, { id: `TCH-${2010 + d.teachers.length}`, employeeId: `EMP-${2010 + d.teachers.length}`, first: f.first.trim(), last: f.last.trim(), subject: f.subject, email: f.email.trim(), phone: f.phone || "+1 (555) 020-0000", classes: ["g6", "g7"], joinDate: todayISO(), qualification: f.qualification || "—", status: "Active", color: "#27579c" }] }));
          push("success", "Teacher added", `${f.first} ${f.last} joined the ${f.subject} department.`);
          setAdd(false); setF({ first: "", last: "", subject: "Mathematics", email: "", phone: "", qualification: "" });
        }}>Add teacher</Button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First name *"><Input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} /></Field>
          <Field label="Last name *"><Input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} /></Field>
          <Field label="Department / subject"><Select value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{["English", "Mathematics", "Science", "Social Studies", "Computer Science", "Art & Design", "Physical Education"].map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Email *"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Qualification"><Input value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })} placeholder="e.g. M.Ed. Mathematics" /></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ================= PARENTS ================= */
export function ParentsPage() {
  const { db, feeBalance, update } = useApp();
  const { push } = useToast();
  const [q, setQ] = useState("");
  const [msgFor, setMsgFor] = useState<string | null>(null);
  const [text, setText] = useState("");

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; email: string; kids: Student[]; balance: number }>();
    for (const s of db.students) {
      const g = map.get(s.parentEmail) ?? { name: s.parentName, email: s.parentEmail, kids: [], balance: 0 };
      g.kids.push(s); g.balance += feeBalance(s.id);
      map.set(s.parentEmail, g);
    }
    return [...map.values()].filter((g) => g.name.toLowerCase().includes(q.toLowerCase()) || g.kids.some((k) => `${k.first} ${k.last}`.toLowerCase().includes(q.toLowerCase())));
  }, [db.students, q, feeBalance]);

  const active = groups.find((g) => g.name === msgFor);
  const thread = db.messages.filter((m) => m.from === msgFor || m.to === msgFor);

  return (
    <div>
      <PageHead title="Parent Management" sub={`${groups.length} family accounts linked to student records`} />
      <SearchInput value={q} onChange={setQ} placeholder="Search parent or child…" className="max-w-sm mb-5" />
      <DataTable cols={[
        { key: "parent", label: "Parent", render: (g: (typeof groups)[0]) => <span className="flex items-center gap-3"><Avatar name={g.name} size={38} color="#7c5cbf" /><span><b className="block">{g.name}</b><span className="text-[0.72rem] text-mute">{g.email}</span></span></span> },
        { key: "kids", label: "Children", render: (g: (typeof groups)[0]) => <span className="flex flex-wrap gap-1.5">{g.kids.map((k) => <Badge key={k.id} tone="navy">{k.first} · {k.classId.toUpperCase()}-{k.section}</Badge>)}</span> },
        { key: "balance", label: "Family balance", render: (g: (typeof groups)[0]) => <b className={cx("tnum", g.balance > 0 ? "text-danger-600" : "text-em-700")}>{g.balance > 0 ? money(g.balance) : "Clear"}</b> },
        { key: "act", label: "", render: (g: (typeof groups)[0]) => <Button size="sm" variant="outline" onClick={() => setMsgFor(g.name)}><Send className="w-3.5 h-3.5" />Message</Button> },
      ]} rows={groups} keyOf={(g) => g.email} />

      <Modal open={!!active} onClose={() => setMsgFor(null)} title={`Conversation with ${msgFor ?? ""}`}>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {thread.length === 0 && <EmptyState title="No messages yet" body={`Start the conversation with ${msgFor}.`} />}
          {thread.map((m) => (
            <div key={m.id} className={cx("rounded-lg px-4 py-3 text-[0.85rem] leading-relaxed max-w-[85%]", m.fromRole === "parent" ? "bg-ink/5 mr-auto" : "bg-navy-900 text-white ml-auto")}>
              <p className="text-[0.68rem] font-bold opacity-70 mb-1">{m.from} · {fmtDate(m.at)}</p>{m.body}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply…" onKeyDown={(e) => { if (e.key === "Enter" && text.trim().length > 3) { update((d) => ({ ...d, messages: [...d.messages, { id: `MS-${Date.now()}`, from: "Front Office", fromRole: "admin", to: msgFor ?? "", toRole: "parent", body: text.trim(), at: todayISO() }] })); setText(""); push("success", "Reply sent", `${msgFor} will see this in their portal.`); } }} aria-label="Reply to parent" />
          <Button onClick={() => { if (text.trim().length > 3) { update((d) => ({ ...d, messages: [...d.messages, { id: `MS-${Date.now()}`, from: "Front Office", fromRole: "admin", to: msgFor ?? "", toRole: "parent", body: text.trim(), at: todayISO() }] })); setText(""); push("success", "Reply sent", `${msgFor} will see this in their portal.`); } }} aria-label="Send"><Send className="w-4 h-4" /></Button>
        </div>
      </Modal>
    </div>
  );
}
