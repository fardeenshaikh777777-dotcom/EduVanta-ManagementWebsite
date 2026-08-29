import { useMemo, useState } from "react";
import { Users, GraduationCap, CalendarCheck2, Wallet, ClipboardCheck, UserPlus, TrendingUp, AlertTriangle, Bell, FileText, BookOpen, Bus, CalendarDays, Award, Send, Receipt, ArrowRight, CircleDollarSign } from "lucide-react";
import { Card, Stat, Badge, Button, Ring, Avatar, Modal, Field, Input, Select, Tabs, EmptyState, Link, statusTone, Progress } from "../../components/ui";
import { TrendArea, CompareBars, SplitDonut, C, TrendLines } from "../../components/charts";
import { useApp, useToast } from "../../lib/store";
import { gradeEnrollment, monthlyRevenue, attendanceTrend, timetableFor, school, todayLabel } from "../../lib/data";
import { cx, fmtDate, fmtDateShort, money, daysUntil, resultSummary, todayISO, gradeOf } from "../../lib/core";
import type { Student } from "../../lib/core";

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="font-display font-extrabold text-2xl tracking-tight">{title}</h2>
        {sub && <p className="text-[0.88rem] text-mute mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

function useDbDerived() {
  const { db, feeBalance } = useApp();
  return useMemo(() => {
    const dates = db.attendance.map((a) => a.date).sort();
    const latest = dates[dates.length - 1] ?? todayISO();
    const dayRecords = db.attendance.filter((a) => a.date === latest);
    let p = 0, t = 0;
    for (const r of dayRecords) for (const m of Object.values(r.marks)) { t++; if (m === "P" || m === "L") p++; }
    const pendingFees = db.fees.filter((f) => f.kind === "Invoice" && f.status !== "Paid").reduce((s, f) => s + f.amount, 0);
    const collected = db.fees.filter((f) => f.status === "Paid").reduce((s, f) => s + f.amount, 0);
    const lowAttendance = db.students.filter((s) => {
      let pp = 0, tt = 0;
      for (const d of db.attendance) { const m = d.marks[s.id]; if (m) { tt++; if (m === "P" || m === "L") pp++; } }
      return tt > 0 && pp / tt < 0.85;
    });
    return { latest, attPct: t ? Math.round((p / t) * 1000) / 10 : 0, pendingFees, collected, lowAttendance, feeBalance };
  }, [db, feeBalance]);
}

const ACTIVITY = [
  { icon: UserPlus, text: "New application APP-2026-014 received", time: "2h ago", tone: "emerald" },
  { icon: Receipt, text: "12 tuition payments recorded by accounts", time: "4h ago", tone: "navy" },
  { icon: ClipboardCheck, text: "Mock Board results published for G9–10", time: "Yesterday", tone: "gold" },
  { icon: AlertTriangle, text: "3 students flagged for attendance below 85%", time: "Yesterday", tone: "red" },
  { icon: Bell, text: "Bus route RT-3 timing notice sent to all families", time: "2d ago", tone: "navy" },
];

/* ================= ADMIN ================= */
export function AdminDashboard() {
  const { db } = useApp();
  const d = useDbDerived();
  const gradeData = gradeEnrollment.map((g) => ({ ...g, capacity: 130 }));
  const perfDist = useMemo(() => {
    const mid = db.exams.find((e) => e.id === "EX-01");
    const rows = db.results.filter((r) => r.examId === mid?.id);
    const buckets = [0, 0, 0, 0];
    for (const r of rows) { const pct = resultSummary(r.marks).pct; if (pct >= 80) buckets[0]++; else if (pct >= 65) buckets[1]++; else if (pct >= 50) buckets[2]++; else buckets[3]++; }
    return [
      { name: "Distinction (80+)", value: buckets[0], color: C.em },
      { name: "Merit (65–79)", value: buckets[1], color: C.navy },
      { name: "Pass (50–64)", value: buckets[2], color: C.gold },
      { name: "At risk (<50)", value: buckets[3], color: C.red },
    ];
  }, [db]);

  return (
    <div className="space-y-6">
      <PageHead title={`Good morning, Ava`} sub={`${todayLabel()} · ${school.term} term · ${db.applications.length} applications in pipeline`}
        actions={<><Link to="/app/students"><Button variant="outline" size="sm"><UserPlus className="w-4 h-4" />Add student</Button></Link><Link to="/app/notices"><Button size="sm"><Bell className="w-4 h-4" />Post notice</Button></Link></>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Total students" value={school.enrollment.toLocaleString()} sub={`${db.students.length} in sample records`} icon={<Users className="w-5 h-5" />} tone="emerald" />
        <Stat label="Teachers" value={school.faculty} sub={`${db.teachers.length} core faculty listed`} icon={<GraduationCap className="w-5 h-5" />} tone="navy" />
        <Stat label="Attendance (latest day)" value={`${d.attPct}%`} sub={`${fmtDateShort(d.latest)}`} icon={<CalendarCheck2 className="w-5 h-5" />} tone="gold" />
        <Stat label="Pending fees" value={money(d.pendingFees)} sub={`${db.fees.filter((f) => f.kind === "Invoice" && f.status !== "Paid").length} open invoices`} icon={<Wallet className="w-5 h-5" />} tone="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-display font-bold text-lg">Revenue overview</h3><p className="text-[0.8rem] text-mute">Collections vs target · last 6 months</p></div>
            <Badge tone="emerald"><TrendingUp className="w-3.5 h-3.5" />+8.4% vs last term</Badge>
          </div>
          <CompareBars data={monthlyRevenue} xKey="m" series={[{ key: "collected", name: "Collected", color: C.em }, { key: "target", name: "Target", color: "#c9d4e4" }]} />
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg">Mid-term performance</h3>
          <p className="text-[0.8rem] text-mute mb-2">Grade distribution, all sections</p>
          <SplitDonut data={perfDist} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg mb-4">Enrollment by grade</h3>
          <CompareBars data={gradeData} xKey="grade" series={[{ key: "students", name: "Students", color: C.navy }]} height={210} />
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg mb-1">Attendance trend</h3>
          <p className="text-[0.8rem] text-mute mb-3">School-wide vs sample grades · 10 days</p>
          <TrendLines data={attendanceTrend} xKey="d" series={[{ key: "school", name: "School", color: C.em }, { key: "g7", name: "Grade 7", color: C.navy }, { key: "g6", name: "Grade 6", color: C.gold }]} height={210} />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Recent activity</h3><Badge tone="navy">Live</Badge></div>
          <ul className="space-y-3.5">
            {ACTIVITY.map((a) => (
              <li key={a.text} className="flex gap-3">
                <span className={cx("w-8 h-8 rounded-lg grid place-items-center shrink-0", a.tone === "emerald" && "bg-em-100 text-em-700", a.tone === "navy" && "bg-navy-100 text-navy-800", a.tone === "gold" && "bg-gold-100 text-gold-600", a.tone === "red" && "bg-danger-100 text-danger-600")}><a.icon className="w-4 h-4" /></span>
                <span className="min-w-0"><span className="block text-[0.85rem] font-semibold leading-snug">{a.text}</span><span className="text-[0.72rem] text-mute">{a.time}</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Upcoming exams</h3><Link to="/app/exams" className="text-[0.8rem] font-bold text-em-700">Manage</Link></div>
          <div className="space-y-2.5">
            {db.exams.filter((e) => e.status === "Scheduled").map((e) => (
              <div key={e.id} className="flex items-center gap-4 rounded-lg border border-line px-4 py-3">
                <span className="w-9 h-9 rounded-lg bg-navy-100 text-navy-800 grid place-items-center"><ClipboardCheck className="w-4.5 h-4.5" /></span>
                <span className="flex-1 min-w-0"><b className="block text-[0.9rem] truncate">{e.name}</b><span className="text-[0.75rem] text-mute">{e.classes.map((c) => c.toUpperCase()).join(", ")} · {e.term}</span></span>
                <Badge tone="amber">{daysUntil(e.date)}d</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">New admissions</h3><Badge tone="gold">{db.applications.length} active</Badge></div>
          <div className="space-y-2.5">
            {db.applications.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-lg border border-line px-4 py-3">
                <Avatar name={a.studentName} size={34} />
                <span className="flex-1 min-w-0"><b className="block text-[0.9rem] truncate">{a.studentName}</b><span className="text-[0.75rem] text-mute">{a.id} · {a.grade} · guardian {a.guardian}</span></span>
                <Badge tone={statusTone(a.status)}>{a.status}</Badge>
              </div>
            ))}
            <p className="text-[0.75rem] text-mute">Applications submitted from the public site land here automatically.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= PRINCIPAL ================= */
export function PrincipalDashboard() {
  const { db } = useApp();
  const d = useDbDerived();
  const collectionRate = Math.round((d.collected / (d.collected + d.pendingFees)) * 100);
  return (
    <div className="space-y-6">
      <PageHead title="Executive overview" sub={`${todayLabel()} · ${school.term} · prepared for Dr. Marcus Hale`} />
      {d.lowAttendance.length > 0 && (
        <div className="rounded-xl bg-warn-100 border border-gold-500/30 px-5 py-4 flex items-center gap-3.5">
          <AlertTriangle className="w-5 h-5 text-warn-600 shrink-0" />
          <p className="text-[0.88rem] font-semibold text-warn-600">Attention: {d.lowAttendance.length} students are below 85% attendance this period — {d.lowAttendance.map((s) => s.first).join(", ")}.</p>
        </div>
      )}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Enrollment" value={school.enrollment.toLocaleString()} sub="+42 vs last September" icon={<Users className="w-5 h-5" />} />
        <Stat label="Fee collection rate" value={`${collectionRate}%`} sub={`${money(d.collected)} collected`} icon={<CircleDollarSign className="w-5 h-5" />} tone="gold" />
        <Stat label="Attendance" value={`${d.attPct}%`} sub="latest school day" icon={<CalendarCheck2 className="w-5 h-5" />} tone="navy" />
        <Stat label="Faculty" value={school.faculty} sub={`${db.teachers.filter((t) => t.status === "Active").length} active this week`} icon={<GraduationCap className="w-5 h-5" />} tone="red" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5"><h3 className="font-display font-bold text-lg mb-1">Enrollment trend</h3><p className="text-[0.8rem] text-mute mb-3">Students per grade, current year</p><CompareBars data={gradeEnrollment} xKey="grade" series={[{ key: "students", name: "Students", color: C.em }]} height={230} /></Card>
        <Card className="p-5"><h3 className="font-display font-bold text-lg mb-1">Fee collection vs target</h3><p className="text-[0.8rem] text-mute mb-3">Monthly, all fee types</p><TrendArea data={monthlyRevenue} series={[{ key: "collected", name: "Collected", color: C.em }, { key: "target", name: "Target", color: C.gold }]} height={230} /></Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-4">Academic performance — mid-term averages by subject</h3>
          <CompareBars xKey="subject" height={230}
            data={["English", "Mathematics", "Science", "Social Studies", "Computer Science", "Art & Design"].map((sub) => {
              const rows = db.results.filter((r) => r.examId === "EX-01");
              const avg = rows.length ? Math.round(rows.reduce((s, r) => s + (r.marks[sub] ?? 0), 0) / rows.length) : 0;
              return { subject: sub.split(" ")[0], avg };
            })}
            series={[{ key: "avg", name: "Class average", color: C.navy }]} />
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg mb-4">This week on campus</h3>
          <ul className="space-y-3">
            {db.events.slice(0, 4).map((e) => (
              <li key={e.id} className="flex items-center gap-3.5">
                <span className="w-11 text-center rounded-lg bg-navy-900 text-white py-1.5 shrink-0">
                  <span className="block text-[0.58rem] font-bold uppercase text-em-200">{new Date(e.date + "T12:00").toLocaleDateString("en-US", { month: "short" })}</span>
                  <span className="block font-display font-bold text-sm leading-none tnum">{new Date(e.date + "T12:00").getDate()}</span>
                </span>
                <span className="min-w-0"><b className="block text-[0.85rem] truncate">{e.title}</b><span className="text-[0.72rem] text-mute">{e.place} · {e.attendees} expected</span></span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ================= TEACHER ================= */
export function TeacherDashboard({ teacherId }: { teacherId: string }) {
  const { db, user, update } = useApp();
  const { push } = useToast();
  const [note, setNote] = useState("");
  const teacher = db.teachers.find((t) => t.id === teacherId);
  const myClasses = teacher?.classes ?? [];
  const dayIdx = Math.min(4, Math.max(0, new Date().getDay() - 1));
  const today = timetableFor(7)[dayIdx].filter((p) => p.teacher === teacher?.first + " " + teacher?.last);
  const myAssignments = db.assignments.filter((a) => a.by === `${teacher?.first} ${teacher?.last}`);
  const pendingSubs = myAssignments.reduce((s, a) => s + Math.max(0, db.students.filter((x) => x.classId === a.classId && x.section === a.section).length - Object.keys(a.submissions).length), 0);

  const postNotice = () => {
    if (note.trim().length < 8) { push("error", "Too short", "Write at least a sentence for the notice."); return; }
    update((d) => ({ ...d, notices: [{ id: `NT-${Date.now()}`, title: note.trim().slice(0, 60), body: note.trim(), audience: "Students" as const, category: "General" as const, date: todayISO(), pinned: false, reads: [] }, ...d.notices] }));
    setNote("");
    push("success", "Announcement posted", "Students in your classes will see it on their noticeboard.");
  };

  return (
    <div className="space-y-6">
      <PageHead title={`Welcome back, ${teacher?.first ?? "Teacher"}`} sub={`${todayLabel()} · ${myClasses.map((c) => c.toUpperCase()).join(" · ")} · ${teacher?.subject}`}
        actions={<><Link to="/app/attendance"><Button variant="outline" size="sm"><CalendarCheck2 className="w-4 h-4" />Take attendance</Button></Link><Link to="/app/assignments"><Button size="sm"><FileText className="w-4 h-4" />New assignment</Button></Link></>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="My classes" value={myClasses.length} sub={myClasses.map((c) => c.toUpperCase()).join(", ")} icon={<BookOpen className="w-5 h-5" />} />
        <Stat label="My students" value={db.students.filter((s) => myClasses.includes(s.classId)).length} sub="across all sections" icon={<Users className="w-5 h-5" />} tone="navy" />
        <Stat label="Awaiting submissions" value={pendingSubs} sub={`${myAssignments.length} live assignments`} icon={<FileText className="w-5 h-5" />} tone="gold" />
        <Stat label="Periods today" value={today.length} sub={`${["Mon", "Tue", "Wed", "Thu", "Fri"][dayIdx]} schedule`} icon={<CalendarDays className="w-5 h-5" />} tone="red" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Today's periods</h3><Link to="/app/timetable" className="text-[0.8rem] font-bold text-em-700">Full timetable</Link></div>
          {today.length === 0 ? <EmptyState title="No periods today" body="Enjoy the planning time — your next class is on the timetable." /> : (
            <div className="space-y-2.5">
              {today.map((p, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border border-line px-4 py-3 hover:border-em-200 transition-colors">
                  <span className="text-[0.78rem] font-bold text-mute tnum w-12 shrink-0">{["08:00", "08:50", "09:40", "10:50", "11:40", "12:30", "13:40"][p.period - 1]}</span>
                  <span className="flex-1"><b className="block text-[0.9rem]">{p.subject}</b><span className="text-[0.75rem] text-mute">Grade 7 · Section A · R-701</span></span>
                  <Badge tone="navy">Period {p.period}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-3">Quick announcement</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Grade 7A — bring graph paper tomorrow…" className="w-full min-h-[80px] text-[0.88rem] rounded-lg border border-line bg-paper p-3 focus:border-em-500 focus:outline-none" aria-label="Quick announcement" />
            <Button size="sm" className="mt-2.5 w-full" onClick={postNotice}><Send className="w-3.5 h-3.5" />Send to my classes</Button>
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-3">Class pulse — Grade 7A</h3>
            {[["Attendance", 94], ["Homework submitted", 82], ["Quiz average", 76]].map(([l, v]) => (
              <div key={l as string} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[0.8rem] font-semibold mb-1"><span>{l}</span><span className="tnum text-mute">{v}%</span></div>
                <Progress pct={v as number} tone={(v as number) > 85 ? "emerald" : "gold"} />
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">My assignments</h3><Link to="/app/assignments" className="text-[0.8rem] font-bold text-em-700">Manage all</Link></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {myAssignments.map((a) => {
            const roster = db.students.filter((s) => s.classId === a.classId && s.section === a.section).length;
            const got = Object.keys(a.submissions).length;
            const late = daysUntil(a.due) < 0;
            return (
              <div key={a.id} className="rounded-lg border border-line p-4 hover:border-em-200 transition-colors">
                <div className="flex items-center justify-between gap-2"><Badge tone="navy">{a.classId.toUpperCase()}-{a.section}</Badge><Badge tone={late ? "red" : "amber"}>{late ? "Overdue" : `${daysUntil(a.due)}d left`}</Badge></div>
                <p className="font-bold text-[0.9rem] mt-2.5 leading-snug">{a.title}</p>
                <div className="mt-3"><Progress pct={(got / Math.max(1, roster)) * 100} /><p className="text-[0.72rem] text-mute mt-1.5 tnum">{got} of {roster} submitted</p></div>
              </div>
            );
          })}
        </div>
      </Card>
      {user?.id && <span className="sr-only">{user.id}</span>}
    </div>
  );
}


/* ================= STUDENT ================= */
export function StudentDashboard({ studentId }: { studentId: string }) {
  const { db, studentAttendancePct, feeBalance } = useApp();
  const st = db.students.find((s) => s.id === studentId);
  if (!st) return <EmptyState title="Student record not found" />;
  const grade = Number(st.classId.slice(1));
  const dayIdx = Math.min(4, Math.max(0, new Date().getDay() - 1));
  const today = timetableFor(grade)[dayIdx];
  const myAssignments = db.assignments.filter((a) => a.classId === st.classId && a.section === st.section);
  const result = db.results.find((r) => r.examId === "EX-01" && r.studentId === st.id);
  const summary = result ? resultSummary(result.marks) : null;
  const balance = feeBalance(st.id);
  const pct = studentAttendancePct(st.id);

  return (
    <div className="space-y-6">
      <PageHead title={`Hey, ${st.first}`} sub={`${st.classId.toUpperCase()}-${st.section} · Roll ${st.roll} · ${todayLabel()}`}
        actions={<Link to="/app/timetable"><Button variant="outline" size="sm"><CalendarDays className="w-4 h-4" />This week</Button></Link>} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4"><Ring pct={pct} size={64} /><div><p className="text-[0.75rem] font-semibold text-mute uppercase tracking-wide">Attendance</p><p className="text-[0.8rem] text-mute mt-0.5">{pct >= 90 ? "Great standing" : "Keep it above 90%"}</p></div></Card>
        <Stat label="Current GPA" value={summary?.gpa.toFixed(2) ?? "—"} sub={`Grade ${summary?.grade ?? "—"} · mid-term`} icon={<Award className="w-5 h-5" />} tone="navy" />
        <Stat label="Assignments due" value={myAssignments.filter((a) => daysUntil(a.due) >= 0 && !a.submissions[st.id]).length} sub={`${myAssignments.length} total this term`} icon={<FileText className="w-5 h-5" />} tone="gold" />
        <Stat label="Fee balance" value={money(balance)} sub={balance === 0 ? "All clear — nice." : "See fees module"} icon={<Wallet className="w-5 h-5" />} tone={balance > 0 ? "red" : "emerald"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Today's schedule</h3><Badge tone="navy">{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][dayIdx]}</Badge></div>
          <ol className="relative border-l-2 border-em-200 ml-1.5 space-y-4">
            {today.map((p, i) => (
              <li key={i} className="ml-5 relative">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-card border-[3px] border-em-600" />
                <p className="text-[0.72rem] font-bold text-mute tnum">{["08:00", "08:50", "09:40", "10:50", "11:40", "12:30", "13:40"][i]} – period {p.period}</p>
                <p className="font-bold text-[0.92rem]">{p.subject} <span className="font-semibold text-mute text-[0.78rem]">· {p.teacher}</span></p>
              </li>
            ))}
          </ol>
        </Card>
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-3">Mid-term snapshot</h3>
            {summary && (
              <>
                <div className="flex items-center justify-between rounded-lg bg-em-50 border border-em-200/70 px-4 py-3 mb-3">
                  <span className="text-[0.85rem] font-semibold">Overall</span>
                  <span className="font-display font-extrabold text-xl text-em-700 tnum">{summary.pct}% · {summary.grade}</span>
                </div>
                <ul className="space-y-2">
                  {Object.entries(result!.marks).slice(0, 4).map(([sub, m]) => (
                    <li key={sub} className="flex items-center justify-between text-[0.83rem]"><span className="text-mute">{sub}</span><span className="font-bold tnum">{m} <Badge tone={statusTone(gradeOf(m).grade.startsWith("F") ? "Absent" : m >= 70 ? "Paid" : "Pending")} className="ml-1.5">{gradeOf(m).grade}</Badge></span></li>
                  ))}
                </ul>
                <Link to="/app/exams" className="inline-flex items-center gap-1 mt-3 text-[0.8rem] font-bold text-em-700">Full results <ArrowRight className="w-3.5 h-3.5" /></Link>
              </>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="font-display font-bold text-lg mb-3">Upcoming exams</h3>
            {db.exams.filter((e) => e.status === "Scheduled" && e.classes.includes(st.classId)).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5 mb-2 last:mb-0">
                <span className="text-[0.85rem] font-semibold truncate">{e.name}</span>
                <Badge tone="amber">{fmtDateShort(e.date)}</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">My homework</h3><Link to="/app/assignments" className="text-[0.8rem] font-bold text-em-700">All assignments</Link></div>
          <div className="space-y-2.5">
            {myAssignments.slice(0, 4).map((a) => {
              const done = !!a.submissions[st.id];
              const late = daysUntil(a.due) < 0;
              return (
                <div key={a.id} className="flex items-center gap-3.5 rounded-lg border border-line px-4 py-3">
                  <span className={cx("w-8 h-8 rounded-lg grid place-items-center shrink-0", done ? "bg-em-100 text-em-700" : late ? "bg-danger-100 text-danger-600" : "bg-gold-100 text-gold-600")}><FileText className="w-4 h-4" /></span>
                  <span className="flex-1 min-w-0"><b className="block text-[0.87rem] truncate">{a.title}</b><span className="text-[0.73rem] text-mute">{a.subject} · due {fmtDateShort(a.due)}</span></span>
                  <Badge tone={done ? "emerald" : late ? "red" : "amber"}>{done ? "Submitted" : late ? "Overdue" : "Due"}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Noticeboard</h3><Link to="/app/notices" className="text-[0.8rem] font-bold text-em-700">All notices</Link></div>
          <div className="space-y-2.5">
            {db.notices.filter((n) => n.audience === "All" || n.audience === "Students").slice(0, 4).map((n) => (
              <div key={n.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center gap-2"><Badge tone={n.category === "Urgent" ? "red" : "navy"}>{n.category}</Badge><span className="text-[0.7rem] text-mute">{fmtDateShort(n.date)}</span></div>
                <p className="font-semibold text-[0.87rem] mt-1.5 leading-snug">{n.title}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================= PARENT ================= */
export function ParentDashboard({ children: kids }: { children: string[] }) {
  const { db, studentAttendancePct, feeBalance, payInvoice } = useApp();
  const { push } = useToast();
  const [active, setActive] = useState(0);
  const [payFor, setPayFor] = useState<{ id: string; amount: number } | null>(null);
  const [method, setMethod] = useState("Card");
  const kidsList = db.students.filter((s) => kids.includes(s.id));
  const st: Student | undefined = kidsList[Math.min(active, kidsList.length - 1)];
  if (!st) return <EmptyState title="No linked children" body="Ask the front office to link your parent account." />;
  const pct = studentAttendancePct(st.id);
  const invoices = db.fees.filter((f) => f.studentId === st.id && f.kind === "Invoice" && f.status !== "Paid");
  const result = db.results.find((r) => r.examId === "EX-01" && r.studentId === st.id);
  const summary = result ? resultSummary(result.marks) : null;
  const balance = feeBalance(st.id);
  const thread = db.messages.filter((m) => (m.from === "Meera Patel" && m.to === "Sarah Mercer") || (m.from === "Sarah Mercer" && m.to === "Meera Patel"));

  return (
    <div className="space-y-6">
      <PageHead title="Family dashboard" sub={`${todayLabel()} · ${kidsList.length} children enrolled`} />
      {kidsList.length > 1 && (
        <Tabs active={String(active)} onChange={(v) => setActive(Number(v))} tabs={kidsList.map((k, i) => ({ id: String(i), label: `${k.first} · ${k.classId.toUpperCase()}-${k.section}` }))} />
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4"><Ring pct={pct} size={64} color={pct >= 90 ? C.em : C.gold} /><div><p className="text-[0.75rem] font-semibold text-mute uppercase tracking-wide">{st.first}'s attendance</p><p className="text-[0.8rem] text-mute mt-0.5">last 15 school days</p></div></Card>
        <Stat label="Mid-term result" value={summary ? `${summary.pct}%` : "—"} sub={summary ? `Grade ${summary.grade} · GPA ${summary.gpa}` : "no records"} icon={<Award className="w-5 h-5" />} tone="navy" />
        <Stat label="Homework open" value={db.assignments.filter((a) => a.classId === st.classId && a.section === st.section && !a.submissions[st.id] && daysUntil(a.due) >= 0).length} sub="not yet submitted" icon={<FileText className="w-5 h-5" />} tone="gold" />
        <Stat label="Fee balance" value={money(balance)} sub={`${invoices.length} open invoice${invoices.length === 1 ? "" : "s"}`} icon={<Wallet className="w-5 h-5" />} tone={balance > 0 ? "red" : "emerald"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Open invoices — {st.first}</h3>{balance > 0 && <Button size="sm" variant="soft" onClick={() => setPayFor(invoices[0] && { id: invoices[0].id, amount: invoices[0].amount })}>Pay next invoice</Button>}</div>
          {invoices.length === 0 ? <EmptyState icon={<Receipt className="w-5 h-5" />} title="No balance due" body={`${st.first}'s account is fully settled. Receipts live under Fees.`} /> : (
            <div className="space-y-2.5">
              {invoices.map((f) => (
                <div key={f.id} className="flex items-center gap-4 rounded-lg border border-line px-4 py-3">
                  <span className="w-9 h-9 rounded-lg bg-danger-100 text-danger-600 grid place-items-center"><Receipt className="w-4.5 h-4.5" /></span>
                  <span className="flex-1 min-w-0"><b className="block text-[0.9rem] truncate">{f.type}</b><span className="text-[0.75rem] text-mute">Due {fmtDate(f.date)} · {f.receipt}</span></span>
                  <b className="tnum font-display">{money(f.amount)}</b>
                  <Button size="sm" onClick={() => setPayFor({ id: f.id, amount: f.amount })}>Pay</Button>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg mb-3">Message the school</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {thread.map((m) => (
              <div key={m.id} className={cx("rounded-lg px-3.5 py-2.5 text-[0.83rem] leading-relaxed", m.fromRole === "parent" ? "bg-navy-900 text-white ml-6" : "bg-ink/5 mr-6")}>
                <p className="text-[0.68rem] font-bold opacity-70 mb-0.5">{m.from} · {m.fromRole === "parent" ? "you" : "teacher"}</p>{m.body}
              </div>
            ))}
          </div>
          <ParentComposer />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display font-bold text-lg mb-4">{st.first}'s week — attendance</h3>
          <AttendanceMini studentId={st.id} />
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Notices for families</h3><Link to="/app/notices" className="text-[0.8rem] font-bold text-em-700">All</Link></div>
          <div className="space-y-2.5">
            {db.notices.filter((n) => n.audience === "All" || n.audience === "Parents").slice(0, 4).map((n) => (
              <div key={n.id} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-center gap-2"><Badge tone={n.category === "Urgent" ? "red" : n.category === "Event" ? "gold" : "navy"}>{n.category}</Badge><span className="text-[0.7rem] text-mute">{fmtDateShort(n.date)}</span></div>
                <p className="font-semibold text-[0.87rem] mt-1.5 leading-snug">{n.title}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={!!payFor} onClose={() => setPayFor(null)} title="Confirm payment"
        footer={<><Button variant="ghost" onClick={() => setPayFor(null)}>Cancel</Button><Button onClick={() => { if (payFor) { payInvoice(payFor.id, method); push("success", "Payment recorded", `${money(payFor.amount)} paid via ${method}. Receipt updated.`); } setPayFor(null); }}>Pay {payFor ? money(payFor.amount) : ""}</Button></>}>
        <p className="text-[0.9rem] text-mute">Settle this invoice for <b className="text-ink">{st.first}</b>? The receipt status updates immediately.</p>
        <Field label="Payment method" className="mt-4">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>{["Card", "Bank Transfer", "Cash", "Check"].map((m) => <option key={m}>{m}</option>)}</Select>
        </Field>
      </Modal>
    </div>
  );
}

function ParentComposer() {
  const { db, update, user } = useApp();
  const { push } = useToast();
  const [text, setText] = useState("");
  const to = db.teachers[0];
  const send = () => {
    if (text.trim().length < 4) return;
    update((d) => ({ ...d, messages: [...d.messages, { id: `MS-${Date.now()}`, from: user?.name ?? "Parent", fromRole: "parent" as const, to: `${to.first} ${to.last}`, toRole: "teacher" as const, body: text.trim(), at: todayISO() }] }));
    setText("");
    push("success", "Message sent", `${to.first} ${to.last} typically replies within a day.`);
  };
  return (
    <div className="flex gap-2 mt-3.5">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${to.first} ${to.last}…`} onKeyDown={(e) => e.key === "Enter" && send()} aria-label="Message teacher" />
      <Button onClick={send} aria-label="Send message"><Send className="w-4 h-4" /></Button>
    </div>
  );
}

function AttendanceMini({ studentId }: { studentId: string }) {
  const { db } = useApp();
  const days = db.attendance.filter((a) => a.marks[studentId]).sort((a, b) => a.date.localeCompare(b.date)).slice(-10);
  if (!days.length) return <EmptyState title="No attendance yet" />;
  return (
    <div className="grid grid-cols-5 gap-2">
      {days.map((d) => {
        const m = d.marks[studentId];
        return (
          <div key={d.date + d.classId} className="rounded-lg border border-line p-2 text-center">
            <p className={cx("font-display font-bold text-[0.8rem]", m === "P" ? "text-em-700" : m === "L" ? "text-gold-600" : m === "A" ? "text-danger-600" : "text-mute")}>{m}</p>
            <p className="text-[0.62rem] text-mute tnum">{fmtDateShort(d.date)}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ================= ACCOUNTANT ================= */
export function AccountantDashboard() {
  const { db, payInvoice } = useApp();
  const { push } = useToast();
  const d = useDbDerived();
  const overdue = db.fees.filter((f) => f.kind === "Invoice" && f.status === "Overdue");
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    db.fees.filter((f) => f.status === "Paid").forEach((f) => { const k = f.type.split(" ")[0]; map[k] = (map[k] ?? 0) + f.amount; });
    const colors = [C.em, C.navy, C.gold, "#7c5cbf", C.red];
    return Object.entries(map).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  }, [db.fees]);

  return (
    <div className="space-y-6">
      <PageHead title="Finance office" sub={`${todayLabel()} · ${school.term} ledger`}
        actions={<Link to="/app/fees"><Button size="sm"><Receipt className="w-4 h-4" />Open full ledger</Button></Link>} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat label="Collected to date" value={money(d.collected)} sub="all fee types" icon={<CircleDollarSign className="w-5 h-5" />} />
        <Stat label="Outstanding" value={money(d.pendingFees)} sub={`${db.fees.filter((f) => f.kind === "Invoice" && f.status !== "Paid").length} invoices open`} icon={<Wallet className="w-5 h-5" />} tone="red" />
        <Stat label="Overdue" value={money(overdue.reduce((s, f) => s + f.amount, 0))} sub={`${overdue.length} accounts need chasing`} icon={<AlertTriangle className="w-5 h-5" />} tone="gold" />
        <Stat label="Transport fees due" value={money(db.fees.filter((f) => f.type.startsWith("Transport") && f.status !== "Paid").reduce((s, f) => s + f.amount, 0))} sub="4 routes active" icon={<Bus className="w-5 h-5" />} tone="navy" />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2"><h3 className="font-display font-bold text-lg mb-1">Collections vs target</h3><p className="text-[0.8rem] text-mute mb-3">Six-month rolling view</p><CompareBars data={monthlyRevenue} xKey="m" series={[{ key: "collected", name: "Collected", color: C.em }, { key: "target", name: "Target", color: "#c9d4e4" }]} height={250} /></Card>
        <Card className="p-5"><h3 className="font-display font-bold text-lg mb-2">Revenue by fee type</h3><SplitDonut data={byType} height={250} /></Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="font-display font-bold text-lg">Overdue accounts — chase list</h3><Badge tone="red">{overdue.length}</Badge></div>
        <div className="grid md:grid-cols-2 gap-3">
          {overdue.slice(0, 6).map((f) => {
            const st = db.students.find((s) => s.id === f.studentId);
            return (
              <div key={f.id} className="flex items-center gap-3.5 rounded-lg border border-line px-4 py-3">
                <Avatar name={st ? `${st.first} ${st.last}` : "?"} size={36} color={st?.color} />
                <span className="flex-1 min-w-0"><b className="block text-[0.87rem] truncate">{st ? `${st.first} ${st.last}` : f.studentId}</b><span className="text-[0.73rem] text-mute">{f.type} · due {fmtDate(f.date)}</span></span>
                <b className="tnum text-danger-600">{money(f.amount)}</b>
                <Button size="sm" variant="soft" onClick={() => { payInvoice(f.id, "Cash"); push("success", "Payment recorded", `${st?.first}'s ${f.type.toLowerCase()} settled in cash.`); }}>Collect</Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
