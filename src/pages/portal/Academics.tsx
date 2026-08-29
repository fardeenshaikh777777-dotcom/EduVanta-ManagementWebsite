import { useMemo, useState } from "react";
import { Plus, Printer, Save, FileText, Upload, Users, CalendarDays, Award, MessageSquare, Paperclip } from "lucide-react";
import { PageHead } from "./Dashboards";
import { Card, Button, Badge, Modal, Field, Input, Select, Textarea, Tabs, EmptyState, Avatar, statusTone, Progress, usePaged, Pagination, DataTable } from "../../components/ui";
import { TrendLines, C } from "../../components/charts";
import { useApp, useToast } from "../../lib/store";
import { timetableFor, school, SCHOOL_PERIODS } from "../../lib/data";
import { cx, fmtDate, fmtDateShort, daysUntil, resultSummary, gradeOf, todayISO, SUBJECTS, DAYS } from "../../lib/core";
import type { Assignment, ResultRow } from "../../lib/core";

const SUBJ_COLORS: Record<string, string> = {
  English: "bg-navy-100 text-navy-800 border-navy-100",
  Mathematics: "bg-em-100 text-em-700 border-em-100",
  Science: "bg-gold-100 text-gold-600 border-gold-100",
  "Social Studies": "bg-danger-100 text-danger-600 border-danger-100",
  "Computer Science": "bg-[#e4e0f5] text-[#6b4fbf] border-[#e4e0f5]",
  "Art & Design": "bg-[#f3e0d3] text-[#a05a2c] border-[#f3e0d3]",
};

/* ================= CLASSES ================= */
export function ClassesPage() {
  const { db, update } = useApp();
  const { push } = useToast();
  const [add, setAdd] = useState(false);
  const [f, setF] = useState({ grade: 5, room: "", teacherId: "TCH-2001" });

  return (
    <div>
      <PageHead title="Classes & Sections" sub={`${db.classes.length} grades · A/B sections · ${school.term}`}
        actions={<Button size="sm" onClick={() => setAdd(true)}><Plus className="w-4 h-4" />Add class</Button>} />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {db.classes.map((c) => {
          const teacher = db.teachers.find((t) => t.id === c.teacherId);
          const kids = db.students.filter((s) => s.classId === c.id);
          return (
            <Card key={c.id} hover className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-xl">{c.name}</h3>
                  <p className="text-[0.75rem] text-mute mt-0.5">{c.room}</p>
                </div>
                <Badge tone="emerald">AY 2025–26</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {c.sections.map((sec) => {
                  const secKids = kids.filter((k) => k.section === sec);
                  return (
                    <div key={sec} className="rounded-lg border border-line p-3.5">
                      <div className="flex items-center justify-between">
                        <b className="text-[0.88rem]">Section {sec}</b>
                        <span className="text-[0.72rem] font-semibold text-mute inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{secKids.length} students</span>
                      </div>
                      <div className="flex -space-x-2 mt-2.5">
                        {secKids.slice(0, 6).map((k) => <Avatar key={k.id} name={`${k.first} ${k.last}`} color={k.color} size={26} className="ring-2 ring-card" />)}
                        {secKids.length === 0 && <span className="text-[0.75rem] text-mute">No sample students assigned</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3.5 border-t border-line flex items-center gap-3">
                {teacher && <Avatar name={`${teacher.first} ${teacher.last}`} color={teacher.color} size={32} />}
                <span className="min-w-0"><b className="block text-[0.83rem] truncate">{teacher ? `${teacher.first} ${teacher.last}` : "Unassigned"}</b><span className="text-[0.7rem] text-mute">Class teacher</span></span>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={add} onClose={() => setAdd(false)} title="Create class"
        footer={<><Button variant="ghost" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => {
          if (db.classes.some((c) => c.grade === Number(f.grade))) { push("error", "Already exists", `Grade ${f.grade} is already on the register.`); return; }
          update((d) => ({ ...d, classes: [...d.classes, { id: `g${f.grade}`, grade: Number(f.grade), name: `Grade ${f.grade}`, sections: ["A", "B"], room: f.room || `Block Junior · R-${f.grade}01`, teacherId: f.teacherId }].sort((a, b) => a.grade - b.grade) }));
          push("success", "Class created", `Grade ${f.grade} added with sections A and B.`);
          setAdd(false);
        }}>Create class</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Grade level"><Select value={String(f.grade)} onChange={(e) => setF({ ...f, grade: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}</Select></Field>
          <Field label="Classroom"><Input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} placeholder="e.g. R-701" /></Field>
          <Field label="Class teacher" className="col-span-2"><Select value={f.teacherId} onChange={(e) => setF({ ...f, teacherId: e.target.value })}>{db.teachers.map((t) => <option key={t.id} value={t.id}>{t.first} {t.last} — {t.subject}</option>)}</Select></Field>
        </div>
      </Modal>
    </div>
  );
}

/* ================= TIMETABLE ================= */
export function TimetablePage() {
  const { db, user } = useApp();
  const [grade, setGrade] = useState(7);
  const [section, setSection] = useState("A");
  const grid = timetableFor(grade);
  const me = user?.role === "teacher" ? db.teachers.find((t) => t.id === user.linkId) : null;

  return (
    <div>
      <PageHead title="Weekly Timetable" sub="Subject scheduling with room and teacher allocation"
        actions={<div className="flex gap-2.5">
          <Select value={String(grade)} onChange={(e) => setGrade(Number(e.target.value))} className="!w-32" aria-label="Select grade">{db.classes.map((c) => <option key={c.id} value={c.grade}>{c.name}</option>)}</Select>
          <Select value={section} onChange={(e) => setSection(e.target.value)} className="!w-28" aria-label="Select section"><option>A</option><option>B</option></Select>
        </div>} />
      {me && <p className="mb-4 text-[0.85rem] text-mute">Your periods are highlighted in <span className="font-bold text-em-700">green</span>.</p>}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[0.8rem]">
            <thead>
              <tr className="border-b border-line bg-paper/70">
                <th className="px-4 py-3.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-mute w-24">Period</th>
                {DAYS.map((d) => <th key={d} className="px-3 py-3.5 text-left text-[0.7rem] font-bold uppercase tracking-wider text-mute">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {SCHOOL_PERIODS.map((time, pi) => (
                <tr key={time} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-3 align-top">
                    <b className="block tnum text-[0.8rem]">P{pi + 1}</b>
                    <span className="text-[0.68rem] text-mute tnum">{time}</span>
                  </td>
                  {DAYS.map((_, di) => {
                    const cell = grid[di][pi];
                    const mine = me && `${cell.teacher}` === `${me.first} ${me.last}`;
                    return (
                      <td key={di} className="px-2 py-2">
                        <div className={cx("rounded-lg border px-3 py-2.5 transition-colors", mine ? "border-em-600 bg-em-50 shadow-sm" : cx("border", SUBJ_COLORS[cell.subject] ?? "border-line"))}>
                          <p className={cx("font-bold text-[0.8rem] leading-tight")}>{cell.subject}</p>
                          <p className="text-[0.68rem] opacity-70 mt-0.5">{cell.teacher} · R-{grade}0{grade % 2 + 1}{section}</p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-[0.78rem] text-mute mt-3">Break 10:30–10:50 · Lunch 12:30–13:10 (P6 overlaps lunch rotation for senior block).</p>
    </div>
  );
}

/* ================= EXAMS & RESULTS ================= */
export function ExamsPage() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [examId, setExamId] = useState(db.exams[0]?.id ?? "EX-01");
  const [classId, setClassId] = useState("g7");
  const [section, setSection] = useState("A");
  const [subTab, setSubTab] = useState("entry");
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [nf, setNf] = useState({ name: "", date: "", term: school.term });

  const exam = db.exams.find((e) => e.id === examId)!;
  const editable = user && ["superadmin", "admin", "teacher", "principal"].includes(user.role) && exam.status === "Completed";
  const roster = db.students.filter((s) => s.classId === classId && s.section === section && exam.classes.includes(classId));
  const rowsFor = (stId: string) => db.results.find((r) => r.examId === examId && r.studentId === stId);

  const setMark = (stId: string, sub: string, val: number) => {
    update((d) => {
      const existing = d.results.find((r) => r.examId === examId && r.studentId === stId);
      if (existing) {
        return { ...d, results: d.results.map((r) => r === existing ? { ...r, marks: { ...r.marks, [sub]: Math.max(0, Math.min(100, val)) } } : r) };
      }
      const marks: Record<string, number> = {};
      SUBJECTS.forEach((s) => (marks[s] = s === sub ? Math.max(0, Math.min(100, val)) : 60));
      return { ...d, results: [...d.results, { examId, studentId: stId, marks }] };
    });
  };

  const classAvgSeries = useMemo(() => {
    return SUBJECTS.map((sub) => {
      const vals = roster.map((s) => rowsFor(s.id)?.marks[sub] ?? 0).filter((v) => v > 0);
      return { subject: sub.split(" ")[0], average: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.results, examId, classId, section]);

  const reportStudent = db.students.find((s) => s.id === reportFor);
  const reportRow = reportFor ? rowsFor(reportFor) : undefined;

  return (
    <div>
      <PageHead title="Examination & Results" sub="Create exams, enter marks, and publish printable report cards"
        actions={user && ["superadmin", "admin"].includes(user.role) ? <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" />Create exam</Button> : undefined} />

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
        {db.exams.map((e) => (
          <button key={e.id} onClick={() => { setExamId(e.id); if (!e.classes.includes(classId)) setClassId(e.classes[0]); }}
            className={cx("text-left rounded-xl border p-4 transition-all cursor-pointer", examId === e.id ? "border-em-600 bg-em-50 shadow-sm" : "border-line bg-card hover:border-em-200")}>
            <div className="flex items-center justify-between gap-2"><Badge tone={statusTone(e.status)}>{e.status}</Badge><span className="text-[0.7rem] text-mute tnum">{fmtDateShort(e.date)}</span></div>
            <p className="font-display font-bold text-[0.95rem] mt-2 leading-snug">{e.name}</p>
            <p className="text-[0.72rem] text-mute mt-1">{e.term} · {e.classes.map((c) => c.toUpperCase()).join(", ")}</p>
          </button>
        ))}
      </div>

      <Tabs active={subTab} onChange={setSubTab} tabs={[{ id: "entry", label: "Marks entry" }, { id: "analytics", label: "Class analytics" }, { id: "reports", label: "Report cards" }]} className="mb-5" />

      {subTab === "entry" && (
        <div className="anim-fade-in">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)} className="!w-36" aria-label="Class">{exam.classes.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}</Select>
            <Select value={section} onChange={(e) => setSection(e.target.value)} className="!w-28" aria-label="Section"><option>A</option><option>B</option></Select>
            <Badge tone="navy">{roster.length} students</Badge>
            {!editable && <Badge tone="outline">Read-only · {exam.status === "Scheduled" ? "exam not yet held" : "your role views results only"}</Badge>}
            {editable && <Button size="sm" variant="soft" onClick={() => push("success", "Marks saved", `Marks for ${classId.toUpperCase()}-${section} synced to the ledger.`)}><Save className="w-3.5 h-3.5" />Save marks</Button>}
          </div>
          {roster.length === 0 ? <Card><EmptyState icon={<Award className="w-5 h-5" />} title="No students in this section" body="Pick another class or section — sample students are seeded in selected groups." /></Card> : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-[0.83rem]">
                  <thead>
                    <tr className="border-b border-line bg-paper/70 text-left text-[0.7rem] uppercase tracking-wider text-mute">
                      <th className="px-4 py-3 font-bold">Student</th>
                      {SUBJECTS.map((s) => <th key={s} className="px-2 py-3 font-bold whitespace-nowrap">{s.split(" ")[0]}</th>)}
                      <th className="px-2 py-3 font-bold">Total</th><th className="px-2 py-3 font-bold">%</th><th className="px-3 py-3 font-bold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((st) => {
                      const row = rowsFor(st.id);
                      const sum = row ? resultSummary(row.marks) : null;
                      return (
                        <tr key={st.id} className="border-b border-line/60 last:border-0 hover:bg-em-50/40 transition-colors">
                          <td className="px-4 py-2.5"><span className="flex items-center gap-2.5"><Avatar name={`${st.first} ${st.last}`} color={st.color} size={30} /><b className="whitespace-nowrap">{st.first} {st.last}</b></span></td>
                          {SUBJECTS.map((sub) => (
                            <td key={sub} className="px-1.5 py-2">
                              {editable ? (
                                <input type="number" min={0} max={100} value={row?.marks[sub] ?? ""} placeholder="—"
                                  onChange={(e) => setMark(st.id, sub, Number(e.target.value))}
                                  className="w-14 h-8 px-2 rounded-md border border-line bg-card text-center text-[0.83rem] tnum focus:border-em-500 focus:outline-none" aria-label={`${st.first} ${sub} marks`} />
                              ) : (
                                <span className="inline-block w-14 text-center tnum font-semibold">{row?.marks[sub] ?? "—"}</span>
                              )}
                            </td>
                          ))}
                          <td className="px-2 py-2 tnum font-bold">{sum ? `${sum.total}` : "—"}</td>
                          <td className="px-2 py-2 tnum font-bold">{sum ? `${sum.pct}%` : "—"}</td>
                          <td className="px-3 py-2">{sum && <Badge tone={sum.pct >= 80 ? "emerald" : sum.pct >= 50 ? "navy" : "red"}>{sum.grade}</Badge>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {subTab === "analytics" && (
        <div className="grid lg:grid-cols-2 gap-5 anim-fade-in">
          <Card className="p-5"><h3 className="font-display font-bold text-lg mb-1">Subject averages — {classId.toUpperCase()}-{section}</h3><p className="text-[0.8rem] text-mute mb-3">{exam.name}</p>
            <TrendLines data={classAvgSeries} xKey="subject" series={[{ key: "average", name: "Average mark", color: C.em }]} height={250} /></Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-4">Grade distribution</h3>
            {(() => {
              const sums = roster.map((s) => rowsFor(s.id)).filter(Boolean).map((r) => resultSummary((r as ResultRow).marks).pct);
              const bands = [["A / A+ (80+)", sums.filter((p) => p >= 80).length], ["B (60–79)", sums.filter((p) => p >= 60 && p < 80).length], ["C (50–59)", sums.filter((p) => p >= 50 && p < 60).length], ["Below C", sums.filter((p) => p < 50).length]] as const;
              return (
                <div className="space-y-3.5">
                  {bands.map(([l, v]) => (
                    <div key={l}>
                      <div className="flex justify-between text-[0.82rem] font-semibold mb-1"><span>{l}</span><span className="tnum text-mute">{v} students</span></div>
                      <Progress pct={sums.length ? (v / sums.length) * 100 : 0} tone={l.startsWith("A") ? "emerald" : l.startsWith("B") ? "navy" : l.startsWith("C") ? "gold" : "red"} />
                    </div>
                  ))}
                  <p className="text-[0.78rem] text-mute pt-2 border-t border-line">Class mean {sums.length ? Math.round(sums.reduce((a, b) => a + b, 0) / sums.length) : "—"}% · highest {sums.length ? Math.max(...sums) : "—"}% · lowest {sums.length ? Math.min(...sums) : "—"}%</p>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {subTab === "reports" && (
        <div className="anim-fade-in">
          {roster.length === 0 ? <Card><EmptyState title="No students in this section" /></Card> : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {roster.map((st) => {
                const row = rowsFor(st.id);
                const sum = row ? resultSummary(row.marks) : null;
                return (
                  <Card key={st.id} className="p-5 flex items-center gap-4">
                    <Avatar name={`${st.first} ${st.last}`} color={st.color} size={44} />
                    <div className="flex-1 min-w-0"><b className="block truncate text-[0.92rem]">{st.first} {st.last}</b><span className="text-[0.75rem] text-mute">{sum ? `${sum.pct}% · Grade ${sum.grade} · GPA ${sum.gpa}` : "No marks yet"}</span></div>
                    <Button size="sm" variant="outline" disabled={!row} onClick={() => setReportFor(st.id)}><Printer className="w-3.5 h-3.5" />Report</Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* printable report card */}
      <Modal open={!!reportStudent} onClose={() => setReportFor(null)} title="Report card preview" wide
        footer={<><Button variant="ghost" onClick={() => setReportFor(null)}>Close</Button><Button onClick={() => window.print()}><Printer className="w-4 h-4" />Print report card</Button></>}>
        {reportStudent && reportRow && (
          <div className="print-sheet rounded-xl border border-line p-7 bg-card">
            <div className="flex items-center justify-between border-b-2 border-navy-900 pb-4">
              <div>
                <p className="font-display font-extrabold text-xl text-navy-900">{school.name}</p>
                <p className="text-[0.75rem] text-mute">{school.address}</p>
              </div>
              <div className="text-right"><p className="font-display font-bold">STUDENT REPORT CARD</p><p className="text-[0.75rem] text-mute tnum">{exam.name} · {exam.term}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 text-[0.82rem]">
              <span><span className="text-mute block text-[0.68rem] uppercase font-bold">Student</span><b>{reportStudent.first} {reportStudent.last}</b></span>
              <span><span className="text-mute block text-[0.68rem] uppercase font-bold">ID / Roll</span><b className="tnum">{reportStudent.id} · {reportStudent.roll}</b></span>
              <span><span className="text-mute block text-[0.68rem] uppercase font-bold">Class</span><b>{reportStudent.classId.toUpperCase()}-{reportStudent.section}</b></span>
              <span><span className="text-mute block text-[0.68rem] uppercase font-bold">Class teacher</span><b>{db.teachers.find((t) => t.id === db.classes.find((c) => c.id === reportStudent.classId)?.teacherId)?.first ?? ""} {db.teachers.find((t) => t.id === db.classes.find((c) => c.id === reportStudent.classId)?.teacherId)?.last ?? ""}</b></span>
            </div>
            <table className="w-full text-[0.82rem]">
              <thead><tr className="border-y border-line text-left text-[0.68rem] uppercase tracking-wider text-mute"><th className="py-2">Subject</th><th>Marks /100</th><th>Grade</th><th>GPA</th><th className="text-right">Remarks</th></tr></thead>
              <tbody>
                {Object.entries(reportRow.marks).map(([sub, m]) => (
                  <tr key={sub} className="border-b border-line/60"><td className="py-2 font-semibold">{sub}</td><td className="tnum">{m}</td><td>{gradeOf(m).grade}</td><td className="tnum">{gradeOf(m).gpa.toFixed(1)}</td><td className="text-right text-mute">{m >= 80 ? "Excellent" : m >= 65 ? "Good work" : m >= 50 ? "Satisfactory" : "Needs support"}</td></tr>
                ))}
              </tbody>
            </table>
            {(() => { const sum = resultSummary(reportRow.marks); return (
              <div className="flex items-center justify-between mt-5 rounded-lg bg-em-50 border border-em-200 px-5 py-3.5">
                <span className="text-[0.85rem] font-semibold">Overall — {sum.total}/{Object.keys(reportRow.marks).length * 100} · {sum.pct}%</span>
                <span className="font-display font-extrabold text-em-700">Grade {sum.grade} · GPA {sum.gpa}</span>
              </div>
            ); })()}
            <div className="flex justify-between mt-8 text-[0.75rem] text-mute"><span>Class teacher signature</span><span>Principal signature</span><span>Issued {fmtDate(todayISO())}</span></div>
          </div>
        )}
      </Modal>

      {/* create exam */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule examination"
        footer={<><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => {
          if (nf.name.trim().length < 4 || !nf.date) { push("error", "Missing details", "Exam name and date are required."); return; }
          update((d) => ({ ...d, exams: [...d.exams, { id: `EX-${String(d.exams.length + 1).padStart(2, "0")}`, name: nf.name.trim(), term: nf.term, date: nf.date, status: "Scheduled", classes: ["g5", "g6", "g7", "g8", "g9", "g10"] }] }));
          push("success", "Exam scheduled", `${nf.name} added to the examination calendar.`);
          setCreateOpen(false); setNf({ name: "", date: "", term: school.term });
        }}>Schedule exam</Button></>}>
        <div className="space-y-4">
          <Field label="Examination name *"><Input value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} placeholder="e.g. Unit Quiz · Science" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date *"><Input type="date" value={nf.date} onChange={(e) => setNf({ ...nf, date: e.target.value })} /></Field>
            <Field label="Term"><Select value={nf.term} onChange={(e) => setNf({ ...nf, term: e.target.value })}><option>Fall 2025</option><option>Spring 2026</option><option>Summer 2026</option></Select></Field>
          </div>
          <p className="text-[0.78rem] text-mute">The exam will apply to all six grades; subject papers can be attached later.</p>
        </div>
      </Modal>
    </div>
  );
}

/* ================= ASSIGNMENTS ================= */
export function AssignmentsPage() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [create, setCreate] = useState(false);
  const [submitFor, setSubmitFor] = useState<Assignment | null>(null);
  const [note, setNote] = useState("");
  const [f, setF] = useState({ title: "", classId: "g7", section: "A", subject: "Mathematics", due: "", desc: "" });

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher" || user?.role === "admin" || user?.role === "superadmin";
  const myStudent = db.students.find((s) => s.id === user?.linkId);

  const list = useMemo(() => {
    let l = [...db.assignments].sort((a, b) => a.due.localeCompare(b.due));
    if (isStudent && myStudent) l = l.filter((a) => a.classId === myStudent.classId && a.section === myStudent.section);
    if (user?.role === "parent") {
      const kid = db.students.find((s) => (user.children ?? []).includes(s.id));
      if (kid) l = l.filter((a) => a.classId === kid.classId && a.section === kid.section);
    }
    return l;
  }, [db.assignments, isStudent, myStudent, user]);
  const paged = usePaged(list, 8);

  return (
    <div>
      <PageHead title="Assignments & Homework" sub={isStudent ? "Your classwork, deadlines and submissions" : "Create, assign and track homework across sections"}
        actions={isTeacher ? <Button size="sm" onClick={() => setCreate(true)}><Plus className="w-4 h-4" />New assignment</Button> : undefined} />

      <div className="space-y-3.5">
        {paged.slice.map((a) => {
          const roster = db.students.filter((s) => s.classId === a.classId && s.section === a.section).length;
          const got = Object.keys(a.submissions).length;
          const due = daysUntil(a.due);
          const mine = myStudent ? a.submissions[myStudent.id] : undefined;
          return (
            <Card key={a.id} className="p-5 hover:border-em-200 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <span className={cx("w-11 h-11 rounded-xl grid place-items-center shrink-0", due < 0 ? "bg-danger-100 text-danger-600" : due <= 2 ? "bg-gold-100 text-gold-600" : "bg-em-100 text-em-700")}><FileText className="w-5 h-5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="navy">{a.classId.toUpperCase()}-{a.section}</Badge>
                    <Badge tone="outline">{a.subject}</Badge>
                    {a.file && <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-mute"><Paperclip className="w-3 h-3" />{a.file}</span>}
                    <Badge tone={due < 0 ? "red" : due <= 2 ? "amber" : "emerald"}>{due < 0 ? `Overdue ${Math.abs(due)}d` : due === 0 ? "Due today" : `Due in ${due}d`}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg mt-2 leading-snug">{a.title}</h3>
                  <p className="text-[0.86rem] text-mute mt-1.5 leading-relaxed">{a.desc}</p>
                  <p className="text-[0.75rem] text-mute mt-2">Set by <b>{a.by}</b> · due {fmtDate(a.due)}</p>
                  {!isStudent && user?.role !== "parent" && (
                    <div className="mt-3 max-w-xs"><div className="flex justify-between text-[0.75rem] font-semibold mb-1"><span>Submissions</span><span className="tnum text-mute">{got}/{roster || got}</span></div><Progress pct={roster ? (got / roster) * 100 : 0} /></div>
                  )}
                  {mine && <p className="mt-3 rounded-lg bg-em-50 border border-em-200/70 px-3.5 py-2.5 text-[0.82rem]"><b className="text-em-700">Submitted {fmtDateShort(mine.at)}.</b> {mine.note}{mine.feedback && <span className="block mt-1 text-mute">Teacher feedback: <b className="text-ink">{mine.feedback}</b></span>}</p>}
                </div>
                <div className="shrink-0 flex md:flex-col gap-2">
                  {isStudent && !mine && <Button size="sm" onClick={() => { setSubmitFor(a); setNote(""); }}><Upload className="w-3.5 h-3.5" />Submit work</Button>}
                  {isStudent && mine && <Badge tone="emerald" className="!py-2">Submitted</Badge>}
                  {isTeacher && <Button size="sm" variant="outline" onClick={() => setSubmitFor(a)}><MessageSquare className="w-3.5 h-3.5" />Review ({got})</Button>}
                </div>
              </div>
            </Card>
          );
        })}
        {list.length === 0 && <Card><EmptyState icon={<CalendarDays className="w-5 h-5" />} title="No assignments" body="Nothing assigned to this group yet." /></Card>}
      </div>
      <Pagination page={paged.page} pages={paged.pages} onPage={paged.setPage} total={paged.total} shown={paged.shown} />

      {/* student submit modal */}
      <Modal open={isStudent && !!submitFor} onClose={() => setSubmitFor(null)} title={`Submit — ${submitFor?.title ?? ""}`}
        footer={<><Button variant="ghost" onClick={() => setSubmitFor(null)}>Cancel</Button><Button onClick={() => {
          if (note.trim().length < 4) { push("error", "Add a note", "Tell your teacher what you're handing in."); return; }
          if (submitFor && myStudent) {
            update((d) => ({ ...d, assignments: d.assignments.map((a) => a.id === submitFor.id ? { ...a, submissions: { ...a.submissions, [myStudent.id]: { at: todayISO(), note: note.trim() } } } : a) }));
            push("success", "Work submitted", `${submitFor.by} has been notified.`);
          }
          setSubmitFor(null);
        }}>Submit</Button></>}>
        <div className="border-2 border-dashed border-line rounded-xl p-6 text-center mb-4">
          <Upload className="w-6 h-6 mx-auto text-mute" />
          <p className="text-[0.85rem] font-semibold mt-2">work-{submitFor?.id.toLowerCase()}.pdf</p>
          <p className="text-[0.72rem] text-mute mt-1">Demo upload — a placeholder file is attached automatically.</p>
        </div>
        <Field label="Note to teacher *"><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Completed all questions — graph for Q14 attached." /></Field>
      </Modal>

      {/* teacher review modal */}
      {!isStudent && (
        <Modal open={!!submitFor && !isStudent} onClose={() => setSubmitFor(null)} title={`Submissions — ${submitFor?.title ?? ""}`} wide>
          {submitFor && (
            <DataTable cols={[
              { key: "st", label: "Student", render: (r: [string, { at: string; note: string; feedback?: string }]) => { const st = db.students.find((x) => x.id === r[0]); return st ? <span className="flex items-center gap-2.5"><Avatar name={`${st.first} ${st.last}`} color={st.color} size={30} /><b>{st.first} {st.last}</b></span> : r[0]; } },
              { key: "at", label: "Submitted", render: (r: [string, { at: string; note: string }]) => <span className="tnum">{fmtDate(r[1].at)}</span> },
              { key: "note", label: "Note", render: (r: [string, { note: string }]) => <span className="text-mute">{r[1].note}</span> },
              { key: "fb", label: "Feedback", render: (r: [string, { feedback?: string }]) => r[1].feedback ? <Badge tone="emerald">{r[1].feedback.slice(0, 28)}…</Badge> : <Button size="sm" variant="soft" onClick={() => {
                const fb = window.prompt("Feedback for this student:");
                if (fb && submitFor) {
                  const aid = submitFor.id, sid = r[0];
                  update((d) => ({ ...d, assignments: d.assignments.map((a) => a.id === aid ? { ...a, submissions: { ...a.submissions, [sid]: { ...a.submissions[sid], feedback: fb } } } : a) }));
                  push("success", "Feedback saved", "The student can see it under their assignments.");
                }
              }}>Give feedback</Button> },
            ]} rows={Object.entries(submitFor.submissions)} keyOf={(r) => r[0]} empty={<EmptyState title="No submissions yet" body="Students haven't handed anything in for this assignment." />} />
          )}
        </Modal>
      )}

      {/* create assignment */}
      <Modal open={create} onClose={() => setCreate(false)} title="Create assignment" wide
        footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Cancel</Button><Button onClick={() => {
          if (f.title.trim().length < 5 || !f.due) { push("error", "Missing details", "A title and due date are required."); return; }
          update((d) => ({ ...d, assignments: [{ id: `AS-${String(d.assignments.length + 1).padStart(2, "0")}`, title: f.title.trim(), classId: f.classId, section: f.section, subject: f.subject, due: f.due, by: user?.name ?? "Staff", desc: f.desc.trim() || "Details shared in class.", submissions: {} }, ...d.assignments] }));
          push("success", "Assignment posted", `${f.classId.toUpperCase()}-${f.section} · ${f.subject} — students see it immediately.`);
          setCreate(false); setF({ title: "", classId: "g7", section: "A", subject: "Mathematics", due: "", desc: "" });
        }}>Post assignment</Button></>}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Title *" className="sm:col-span-2"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Problem Set 5 — Fractions" /></Field>
          <Field label="Class"><Select value={f.classId} onChange={(e) => setF({ ...f, classId: e.target.value })}>{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
          <Field label="Section"><Select value={f.section} onChange={(e) => setF({ ...f, section: e.target.value })}><option>A</option><option>B</option></Select></Field>
          <Field label="Subject"><Select value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</Select></Field>
          <Field label="Due date *"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
          <Field label="Instructions" className="sm:col-span-2"><Textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} placeholder="What should students do?" /></Field>
        </div>
      </Modal>
    </div>
  );
}
