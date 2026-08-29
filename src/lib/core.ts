/* Core domain types + shared utilities for EduVanta */

export type Role = "superadmin" | "admin" | "principal" | "teacher" | "accountant" | "student" | "parent";

export interface Student {
  id: string; admissionNo: string; first: string; last: string;
  gender: "M" | "F"; dob: string; classId: string; section: string; roll: number;
  parentName: string; parentEmail: string; parentPhone: string;
  address: string; blood: string; status: "Active" | "Inactive" | "Transferred";
  admitted: string; color: string; route: string | null;
}
export interface Teacher {
  id: string; employeeId: string; first: string; last: string; subject: string;
  email: string; phone: string; classes: string[]; joinDate: string;
  qualification: string; status: "Active" | "On Leave"; color: string;
}
export interface ClassInfo { id: string; grade: number; name: string; sections: string[]; room: string; teacherId: string; }
export type Mark = "P" | "A" | "L" | "E";
export interface AttendanceDay { date: string; classId: string; marks: Record<string, Mark>; }
export interface Exam { id: string; name: string; term: string; date: string; status: "Completed" | "Scheduled"; classes: string[]; }
export interface ResultRow { examId: string; studentId: string; marks: Record<string, number>; }
export interface FeeTxn {
  id: string; receipt: string; studentId: string; kind: "Invoice" | "Payment"; type: string;
  amount: number; date: string; method: string; status: "Paid" | "Pending" | "Overdue";
}
export interface Assignment {
  id: string; title: string; classId: string; section: string; subject: string;
  due: string; by: string; desc: string; file?: string;
  submissions: Record<string, { at: string; note: string; feedback?: string }>;
}
export interface Notice {
  id: string; title: string; body: string; audience: "All" | "Students" | "Teachers" | "Parents";
  category: "General" | "Exam" | "Holiday" | "Urgent" | "Event"; date: string; pinned: boolean; reads: string[];
}
export interface EventItem { id: string; title: string; date: string; time: string; place: string; category: string; desc: string; attendees: number; }
export interface NewsItem { id: string; title: string; date: string; tag: string; excerpt: string; body: string; image: string; }
export interface Book { id: string; title: string; author: string; isbn: string; category: string; copies: number; available: number; }
export interface Loan { id: string; bookId: string; studentId: string; issued: string; due: string; returned: string | null; status: "Active" | "Returned" | "Overdue"; }
export interface RouteInfo { id: string; name: string; vehicle: string; plate: string; driver: string; driverPhone: string; stops: string[]; fee: number; students: string[]; }
export interface LeaveReq { id: string; who: string; kind: "Student" | "Teacher"; from: string; to: string; reason: string; status: "Pending" | "Approved" | "Rejected"; appliedOn: string; }
export interface Message { id: string; from: string; fromRole: Role; to: string; toRole: Role; body: string; at: string; }
export interface Application { id: string; studentName: string; dob: string; grade: string; guardian: string; email: string; phone: string; date: string; status: "Received" | "In Review" | "Assessment" | "Offer Sent" | "Enrolled"; }
export interface User { id: string; name: string; role: Role; email: string; password: string; linkId: string | null; children?: string[]; color: string; }

export const SUBJECTS = ["English", "Mathematics", "Science", "Social Studies", "Computer Science", "Art & Design"] as const;
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const PERIODS = ["08:00", "08:50", "09:40", "10:50", "11:40", "12:30", "13:40"];

/* ---------- image map (unique photo set) ---------- */
const IMG = "https://image.qwenlm.ai/generated-images";
export const images = {
  hero: `${IMG}/c6531e66-f274-4714-95c4-c4a965d8b185/_result.png`,
  classroom: `${IMG}/9c54b3eb-f7c1-4869-8cd1-c2c8e3fd7cd8/_result.png`,
  science: `${IMG}/b3b53598-1331-4a6b-bf69-d9d26fe4f4f3/_result.png`,
  library: `${IMG}/9ed57eaf-2343-41b1-8692-fea94daf96ea/_result.png`,
  sports: `${IMG}/e73855a2-2aa3-43e8-a808-4e12f8217a28/_result.png`,
  computer: `${IMG}/da71fe78-4d04-4732-b8da-2b30e9546c97/_result.png`,
  graduation: `${IMG}/a8beaab8-8bd4-4c5b-901c-e25700fad26e/_result.png`,
  campus: `${IMG}/4c05ecda-89cb-49f1-95f8-6df0577581b2/_result.png`,
};

/* ---------- small utils ---------- */
export const cx = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(" ");
export const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
export const todayISO = () => new Date().toISOString().slice(0, 10);

export function lastWeekdays(n: number): string[] {
  const out: string[] = []; const d = new Date();
  while (out.length < n) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

export function fmtDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", opts ?? { month: "short", day: "numeric", year: "numeric" });
}
export function fmtDateShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso + "T00:00:00").getTime() - new Date(todayISO() + "T00:00:00").getTime()) / 86400000);
}
export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.floor(Math.random() * 90 + 10)}`;
}
export function downloadText(name: string, text: string, mime = "text/csv") {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
}

/* deterministic PRNG for stable demo data */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- grading ---------- */
export function gradeOf(score: number): { grade: string; gpa: number } {
  if (score >= 90) return { grade: "A+", gpa: 4.0 };
  if (score >= 80) return { grade: "A", gpa: 3.6 };
  if (score >= 70) return { grade: "B+", gpa: 3.2 };
  if (score >= 60) return { grade: "B", gpa: 2.8 };
  if (score >= 55) return { grade: "C+", gpa: 2.4 };
  if (score >= 50) return { grade: "C", gpa: 2.0 };
  if (score >= 40) return { grade: "D", gpa: 1.5 };
  return { grade: "F", gpa: 0 };
}
export function resultSummary(marks: Record<string, number>) {
  const subs = Object.entries(marks);
  const total = subs.reduce((s, [, m]) => s + m, 0);
  const pct = Math.round((total / (subs.length * 100)) * 1000) / 10;
  const gpa = Math.round((subs.reduce((s, [, m]) => s + gradeOf(m).gpa, 0) / subs.length) * 100) / 100;
  return { total, pct, gpa, grade: gradeOf(pct).grade };
}

/* ---------- role access ---------- */
export const PERMS: Record<string, Role[]> = {
  students: ["superadmin", "admin", "principal", "teacher"],
  teachers: ["superadmin", "admin", "principal"],
  parents: ["superadmin", "admin", "principal", "teacher"],
  classes: ["superadmin", "admin", "principal", "teacher"],
  timetable: ["superadmin", "admin", "principal", "teacher", "student", "parent", "accountant"],
  exams: ["superadmin", "admin", "principal", "teacher", "student", "parent"],
  assignments: ["superadmin", "admin", "teacher", "student", "parent"],
  attendance: ["superadmin", "admin", "principal", "teacher", "student", "parent"],
  fees: ["superadmin", "admin", "principal", "accountant", "student", "parent"],
  library: ["superadmin", "admin", "teacher", "student"],
  transport: ["superadmin", "admin", "principal", "accountant", "parent"],
  leaves: ["superadmin", "admin", "principal", "teacher", "student"],
  notices: ["superadmin", "admin", "principal", "teacher", "accountant", "student", "parent"],
  profile: ["superadmin", "admin", "principal", "teacher", "accountant", "student", "parent"],
};
export const can = (role: Role | undefined, mod: string) => !!role && (PERMS[mod] ?? []).includes(role);
