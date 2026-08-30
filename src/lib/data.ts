import type {
  Student, Teacher, ClassInfo, AttendanceDay, Exam, ResultRow, FeeTxn, Assignment, Notice,
  EventItem, NewsItem, Book, Loan, RouteInfo, LeaveReq, Message, Application, User, Mark,
} from "./core";
import { mulberry32, lastWeekdays, todayISO, images, SUBJECTS, DAYS } from "./core";

export interface DB {
  students: Student[]; teachers: Teacher[]; classes: ClassInfo[];
  attendance: AttendanceDay[]; exams: Exam[]; results: ResultRow[];
  fees: FeeTxn[]; structure: Record<number, { tuition: number; activity: number; lab: number; admission: number }>;
  assignments: Assignment[]; notices: Notice[]; events: EventItem[]; news: NewsItem[];
  books: Book[]; loans: Loan[]; routes: RouteInfo[]; leaves: LeaveReq[];
  messages: Message[]; applications: Application[];
}

const rnd = mulberry32(20260214);
const ri = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];

const AV = ["#0e8563", "#1b4276", "#c98a1f", "#7c5cbf", "#bb4a3c", "#27579c", "#0b6b50", "#8a5a2b"];
let avc = 0;
const nextColor = () => AV[avc++ % AV.length];

const addDays = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/* ---------------- people ---------------- */
const s = (id: string, admissionNo: string, first: string, last: string, gender: "M" | "F", classId: string, section: string, roll: number, parentName: string, parentEmail: string, route: string | null, grade: number): Student => ({
  id, admissionNo, first, last, gender, classId, section, roll, parentName, parentEmail, route,
  dob: `${2026 - (grade + 5) - ri(0, 1)}-${String(ri(1, 12)).padStart(2, "0")}-${String(ri(1, 28)).padStart(2, "0")}`,
  parentPhone: `+1 (555) 01${ri(0, 9)}-${ri(1000, 9899)}`,
  address: `${ri(12, 240)} ${pick(["Maple Row", "Harbor Lane", "Cedar Court", "Willow Bend", "Summit Ave", "Birchwood Dr"])}, Northfield`,
  blood: pick(["A+", "A-", "B+", "O+", "O-", "AB+"]),
  status: "Active", admitted: `202${ri(2, 5)}-08-${String(ri(10, 26))}`, color: nextColor(),
});

const students: Student[] = [
  s("STU-1001", "ADV-2024-018", "Aarav", "Patel", "M", "g7", "A", 1, "Meera Patel", "meera.patel@mail.com", "RT-1", 7),
  s("STU-1002", "ADV-2024-032", "Sofia", "Reyes", "F", "g7", "A", 2, "Carlos Reyes", "c.reyes@mail.com", "RT-2", 7),
  s("STU-1003", "ADV-2023-114", "Ethan", "Brooks", "M", "g7", "A", 3, "Dana Brooks", "dana.brooks@mail.com", null, 7),
  s("STU-1004", "ADV-2025-041", "Maya", "Osei", "F", "g7", "A", 4, "Kwame Osei", "k.osei@mail.com", "RT-1", 7),
  s("STU-1005", "ADV-2024-090", "Liam", "Novak", "M", "g7", "A", 5, "Petra Novak", "p.novak@mail.com", "RT-3", 7),
  s("STU-1006", "ADV-2025-012", "Zara", "Ahmed", "F", "g7", "A", 6, "Imran Ahmed", "imran.ahmed@mail.com", null, 7),
  s("STU-1007", "ADV-2026-004", "Anaya", "Patel", "F", "g6", "A", 1, "Meera Patel", "meera.patel@mail.com", "RT-1", 6),
  s("STU-1008", "ADV-2025-077", "Diego", "Fuentes", "M", "g6", "A", 2, "Lucia Fuentes", "l.fuentes@mail.com", "RT-4", 6),
  s("STU-1009", "ADV-2025-029", "Ivy", "Chen", "F", "g6", "A", 3, "Wei Chen", "wei.chen@mail.com", null, 6),
  s("STU-1010", "ADV-2024-121", "Noah", "Bergström", "M", "g6", "A", 4, "Astrid Bergström", "a.bergstrom@mail.com", "RT-2", 6),
  s("STU-1011", "ADV-2025-063", "Fatima", "Zaidi", "F", "g6", "A", 5, "Omar Zaidi", "omar.zaidi@mail.com", "RT-4", 6),
  s("STU-1012", "ADV-2026-021", "Oliver", "Grant", "M", "g6", "A", 6, "Simone Grant", "s.grant@mail.com", null, 6),
  s("STU-1013", "ADV-2024-055", "Lucas", "Moreau", "M", "g7", "B", 1, "Claire Moreau", "c.moreau@mail.com", "RT-3", 7),
  s("STU-1014", "ADV-2025-088", "Hana", "Kim", "F", "g7", "B", 2, "Joon Kim", "joon.kim@mail.com", null, 7),
  s("STU-1015", "ADV-2024-102", "Tobias", "Weber", "M", "g7", "B", 3, "Greta Weber", "g.weber@mail.com", "RT-2", 7),
  s("STU-1016", "ADV-2025-017", "Aisha", "Karim", "F", "g7", "B", 4, "Nadia Karim", "n.karim@mail.com", "RT-1", 7),
  s("STU-1017", "ADV-2023-071", "Grace", "Lin", "F", "g8", "A", 1, "Peter Lin", "p.lin@mail.com", null, 8),
  s("STU-1018", "ADV-2023-095", "Mateo", "Alvarez", "M", "g8", "A", 2, "Rosa Alvarez", "r.alvarez@mail.com", "RT-4", 8),
  s("STU-1019", "ADV-2024-013", "Ruby", "Dawson", "F", "g8", "A", 3, "Keith Dawson", "k.dawson@mail.com", "RT-3", 8),
  s("STU-1020", "ADV-2023-140", "Kofi", "Mensah", "M", "g8", "A", 4, "Abena Mensah", "a.mensah@mail.com", null, 8),
  s("STU-1021", "ADV-2026-009", "Ella", "Johansson", "F", "g5", "A", 1, "Nils Johansson", "n.johansson@mail.com", "RT-2", 5),
  s("STU-1022", "ADV-2026-030", "Ravi", "Sharma", "M", "g5", "A", 2, "Pooja Sharma", "pooja.sharma@mail.com", null, 5),
  s("STU-1023", "ADV-2025-110", "Nina", "Petrova", "F", "g5", "A", 3, "Ivan Petrov", "i.petrov@mail.com", "RT-1", 5),
  s("STU-1024", "ADV-2022-048", "Jonah", "Fields", "M", "g9", "A", 1, "Marcy Fields", "m.fields@mail.com", "RT-3", 9),
  s("STU-1025", "ADV-2022-084", "Leila", "Haddad", "F", "g9", "A", 2, "Samir Haddad", "s.haddad@mail.com", null, 9),
  s("STU-1026", "ADV-2023-022", "Marcus", "Boyd", "M", "g9", "A", 3, "Denise Boyd", "d.boyd@mail.com", "RT-4", 9),
  s("STU-1027", "ADV-2021-036", "Aria", "Castellano", "F", "g10", "A", 1, "Franco Castellano", "f.castellano@mail.com", "RT-2", 10),
  s("STU-1028", "ADV-2021-059", "Dmitri", "Volkov", "M", "g10", "A", 2, "Olga Volkova", "o.volkova@mail.com", null, 10),
];

const t = (id: string, first: string, last: string, subject: string, classes: string[], qual: string, join: string): Teacher => ({
  id, employeeId: id.replace("TCH", "EMP"), first, last, subject, classes,
  email: `${first[0].toLowerCase()}.${last.toLowerCase()}@eduvanta.edu`,
  phone: `+1 (555) 02${ri(0, 9)}-${ri(1000, 9899)}`, joinDate: join, qualification: qual, status: "Active", color: nextColor(),
});

const teachers: Teacher[] = [
  t("TCH-2001", "Sarah", "Mercer", "Mathematics", ["g5", "g6", "g7"], "M.Ed. Mathematics, Columbia", "2018-08-14"),
  t("TCH-2002", "David", "Okafor", "Science", ["g7", "g8", "g9", "g10"], "M.Sc. Chemistry, MIT", "2016-01-11"),
  t("TCH-2003", "Elena", "Petrova", "English", ["g5", "g6"], "M.A. English Literature, Yale", "2019-08-12"),
  t("TCH-2004", "James", "Whitfield", "Social Studies", ["g7", "g8", "g9", "g10"], "M.A. History, Georgetown", "2015-03-02"),
  t("TCH-2005", "Priya", "Nair", "Computer Science", ["g6", "g7", "g8", "g9", "g10"], "M.S. Computer Science, Stanford", "2020-08-17"),
  t("TCH-2006", "Miguel", "Santos", "Art & Design", ["g5", "g6", "g7"], "B.F.A. Rhode Island School of Design", "2021-01-08"),
  t("TCH-2007", "Hana", "Yoshida", "English", ["g7", "g8", "g9", "g10"], "M.A. Comparative Literature, Princeton", "2017-08-15"),
  t("TCH-2008", "Robert", "Ellis", "Mathematics", ["g8", "g9", "g10"], "M.Sc. Applied Math, Cambridge", "2014-09-01"),
  t("TCH-2009", "Amara", "Diallo", "Science", ["g5", "g6"], "M.Sc. Biology, Johns Hopkins", "2022-08-16"),
  t("TCH-2010", "Lydia", "Frost", "Physical Education", ["g5", "g6", "g7", "g8", "g9", "g10"], "B.S. Kinesiology, Michigan", "2019-02-04"),
];

const classes: ClassInfo[] = [5, 6, 7, 8, 9, 10].map((g) => ({
  id: `g${g}`, grade: g, name: `Grade ${g}`, sections: ["A", "B"],
  room: `Block ${g <= 7 ? "Junior" : "Senior"} · R-${g}0${g % 2 + 1}`,
  teacherId: g <= 6 ? "TCH-2003" : g === 7 ? "TCH-2001" : g === 8 ? "TCH-2002" : g === 9 ? "TCH-2004" : "TCH-2008",
}));

/* ---------------- attendance (past 15 weekdays) ---------------- */
const attendance: AttendanceDay[] = [];
for (const date of lastWeekdays(15)) {
  for (const c of classes) {
    for (const sec of c.sections) {
      const roster = students.filter((st) => st.classId === c.id && st.section === sec);
      if (!roster.length) continue;
      const marks: Record<string, Mark> = {};
      for (const st of roster) {
        const r = rnd();
        marks[st.id] = r < 0.885 ? "P" : r < 0.925 ? "L" : r < 0.97 ? "A" : "E";
      }
      attendance.push({ date, classId: `${c.id}-${sec}`, marks });
    }
  }
}

/* ---------------- exams & results ---------------- */
const exams: Exam[] = [
  { id: "EX-01", name: "Mid-Term Examination", term: "Fall 2025", date: addDays(-64), status: "Completed", classes: ["g5", "g6", "g7", "g8", "g9", "g10"] },
  { id: "EX-02", name: "Mock Board Examination", term: "Spring 2026", date: addDays(-12), status: "Completed", classes: ["g9", "g10"] },
  { id: "EX-03", name: "Unit Quiz · Mathematics", term: "Spring 2026", date: addDays(6), status: "Scheduled", classes: ["g6", "g7"] },
  { id: "EX-04", name: "Final Term Examination", term: "Spring 2026", date: addDays(41), status: "Scheduled", classes: ["g5", "g6", "g7", "g8", "g9", "g10"] },
];

const ability: Record<string, number> = {};
students.forEach((st) => (ability[st.id] = ri(52, 90)));
const results: ResultRow[] = [];
for (const ex of exams.filter((e) => e.status === "Completed")) {
  for (const st of students.filter((x) => ex.classes.includes(x.classId))) {
    const marks: Record<string, number> = {};
    for (const sub of SUBJECTS) marks[sub] = Math.max(35, Math.min(99, ability[st.id] + ri(-13, 13)));
    results.push({ examId: ex.id, studentId: st.id, marks });
  }
}

/* ---------------- fees ---------------- */
const structure: DB["structure"] = {
  5: { tuition: 1150, activity: 150, lab: 0, admission: 250 },
  6: { tuition: 1200, activity: 150, lab: 0, admission: 250 },
  7: { tuition: 1350, activity: 150, lab: 90, admission: 300 },
  8: { tuition: 1400, activity: 150, lab: 90, admission: 300 },
  9: { tuition: 1550, activity: 150, lab: 120, admission: 350 },
  10: { tuition: 1650, activity: 150, lab: 120, admission: 350 },
};
const methods = ["Bank Transfer", "Card", "Cash", "Check"];
const fees: FeeTxn[] = [];
let rcp = 5201;
const invoice = (studentId: string, type: string, amount: number, ageDays: number, paidChance: number) => {
  const r = rnd();
  const status = r < paidChance ? "Paid" : r < paidChance + 0.14 ? "Overdue" : "Pending";
  fees.push({
    id: `TX-${fees.length + 300}`, receipt: `RCP-${rcp++}`, studentId, kind: "Invoice", type, amount,
    date: status === "Pending" ? addDays(ri(6, 21)) : addDays(-ageDays),
    method: status === "Paid" ? pick(methods) : "—", status,
  });
};
for (const st of students) {
  const grade = Number(st.classId.slice(1));
  invoice(st.id, "Tuition · Spring Term", structure[grade].tuition, ri(10, 50), 0.68);
  invoice(st.id, "Activity Fee", structure[grade].activity, ri(20, 70), 0.8);
  if (grade >= 7) invoice(st.id, "Laboratory Fee", structure[grade].lab, ri(20, 70), 0.75);
  if (st.route) invoice(st.id, "Transport Fee", 340, ri(15, 60), 0.72);
}

/* ---------------- assignments ---------------- */
const assignments: Assignment[] = [
  { id: "AS-01", title: "Linear Equations — Problem Set 4", classId: "g7", section: "A", subject: "Mathematics", due: addDays(3), by: "Sarah Mercer", desc: "Complete questions 1–18 from chapter 4. Show all working; graph questions 12–14 on grid paper.", file: "problem-set-4.pdf", submissions: { "STU-1001": { at: addDays(-1), note: "Finished all 18 — Q14 graph attached.", feedback: "Excellent work, Aarav. Clean graphs." }, "STU-1002": { at: addDays(-1), note: "Completed." }, "STU-1004": { at: addDays(0), note: "Uploaded worksheet scan." }, "STU-1006": { at: addDays(0), note: "Done, found Q17 tricky." } } },
  { id: "AS-02", title: "Poetry Analysis — “The Road Not Taken”", classId: "g6", section: "A", subject: "English", due: addDays(5), by: "Elena Petrova", desc: "Write a 300-word analysis of metaphor and choice in the poem. Cite two lines as evidence.", file: "analysis-rubric.pdf", submissions: { "STU-1007": { at: addDays(0), note: "Draft attached." }, "STU-1009": { at: addDays(-2), note: "Final version.", feedback: "Strong thesis, Ivy. Watch comma splices." }, "STU-1011": { at: addDays(-1), note: "Submitted." } } },
  { id: "AS-03", title: "Lab Report — Photosynthesis Investigation", classId: "g7", section: "A", subject: "Science", due: addDays(-1), by: "David Okafor", desc: "Structure your report with hypothesis, method, results table and conclusion. Max 4 pages.", submissions: { "STU-1001": { at: addDays(-2), note: "Report with data table." }, "STU-1002": { at: addDays(-1), note: "Attached." }, "STU-1003": { at: addDays(-1), note: "Submitted late evening." }, "STU-1005": { at: addDays(-2), note: "Done." }, "STU-1006": { at: addDays(-3), note: "Early submission." } } },
  { id: "AS-04", title: "Build Your First Web Page", classId: "g8", section: "A", subject: "Computer Science", due: addDays(7), by: "Priya Nair", desc: "Using HTML and CSS, build a one-page site about a topic you love. Include a nav bar, image and footer.", file: "html-starter.zip", submissions: { "STU-1017": { at: addDays(0), note: "Link in note: my-page.glitch.me" }, "STU-1019": { at: addDays(-1), note: "Zip attached." } } },
  { id: "AS-05", title: "Color Wheel Studies", classId: "g5", section: "A", subject: "Art & Design", due: addDays(2), by: "Miguel Santos", desc: "Paint a 12-part color wheel and one complementary study. Photograph and upload.", submissions: { "STU-1021": { at: addDays(0), note: "Photos attached." } } },
  { id: "AS-06", title: "Cold War Timeline Poster", classId: "g9", section: "A", subject: "Social Studies", due: addDays(4), by: "James Whitfield", desc: "Create a timeline of 10 key events (1945–1991) with one-line significance for each.", submissions: {} },
];

/* ---------------- notices / events / news ---------------- */
const notices: Notice[] = [
  { id: "NT-01", title: "Final Term Examination timetable released", body: "The Spring 2026 final examination timetable is now available under Exams. Students should confirm their subject slots and report 15 minutes early.", audience: "All", category: "Exam", date: addDays(-1), pinned: true, reads: ["u-student"] },
  { id: "NT-02", title: "Campus closed — Educators' Conference Day", body: "School will remain closed on the conference date for professional development. All classes resume the following morning.", audience: "All", category: "Holiday", date: addDays(-3), pinned: true, reads: ["u-student", "u-parent"] },
  { id: "NT-03", title: "Fee payment window closes Friday", body: "Spring term invoices are due by Friday. Payments can be made via bank transfer, card or at the accounts office (Block A, Room 004).", audience: "Parents", category: "General", date: addDays(-2), pinned: false, reads: [] },
  { id: "NT-04", title: "Science Fair — volunteer judges needed", body: "We are looking for parents and staff to judge Grade 5–8 project categories at the annual Science Fair. Sign up at the front office.", audience: "Parents", category: "Event", date: addDays(-4), pinned: false, reads: ["u-parent"] },
  { id: "NT-05", title: "Staff meeting moved to 15:30", body: "Thursday's whole-staff meeting will begin at 15:30 in the Auditorium. Agenda: exam moderation and duty roster.", audience: "Teachers", category: "General", date: addDays(-5), pinned: false, reads: ["u-teacher"] },
  { id: "NT-06", title: "Bus route RT-3 timing change", body: "From Monday, route RT-3 (East Hills) departs 10 minutes earlier at 07:05 due to roadworks on Summit Avenue.", audience: "All", category: "Urgent", date: addDays(-6), pinned: false, reads: [] },
  { id: "NT-07", title: "Library extends borrowing to 4 books", body: "Students may now borrow up to 4 books for 14 days. Reserve popular titles from the library portal.", audience: "Students", category: "General", date: addDays(-8), pinned: false, reads: ["u-student"] },
  { id: "NT-08", title: "Winter Concert — ticket booking open", body: "Family tickets for the Winter Concert are free but must be reserved. Two tickets per family, booking closes one week before the event.", audience: "Parents", category: "Event", date: addDays(-9), pinned: false, reads: [] },
];

const events: EventItem[] = [
  { id: "EV-01", title: "Annual Science Fair", date: addDays(12), time: "09:00 – 13:00", place: "Senior Block Atrium", category: "Academic", desc: "120 student projects across physics, biology and engineering categories. Judges' awards at 12:30.", attendees: 214 },
  { id: "EV-02", title: "Parent–Teacher Conference", date: addDays(6), time: "15:00 – 18:30", place: "Homeroom Classrooms", category: "Meeting", desc: "20-minute slots to discuss progress reports and set spring goals. Book via the parent portal.", attendees: 168 },
  { id: "EV-03", title: "Open House & Campus Tours", date: addDays(9), time: "10:00 – 12:00", place: "Main Reception", category: "Admissions", desc: "Meet teachers, visit labs and studios, and learn about 2026–27 admissions for Grades 5–10.", attendees: 96 },
  { id: "EV-04", title: "Inter-House Sports Day", date: addDays(20), time: "08:30 – 15:00", place: "Northfield Athletics Ground", category: "Sports", desc: "Track, relay and field events across all four houses. The Meridian Cup will be awarded at closing.", attendees: 540 },
  { id: "EV-05", title: "Winter Concert", date: addDays(34), time: "18:00 – 20:00", place: "Hale Auditorium", category: "Arts", desc: "Choir, string ensemble and jazz band perform. Grade 10 students host the interval café.", attendees: 320 },
  { id: "EV-06", title: "Careers Day — Alumni Panel", date: addDays(48), time: "11:00 – 13:00", place: "Hale Auditorium", category: "Academic", desc: "Alumni in medicine, engineering, design and public service answer questions from Grades 8–10.", attendees: 180 },
];

const news: NewsItem[] = [
  { id: "NW-01", title: "Robotics team takes regional crown", date: addDays(-6), tag: "Achievement", excerpt: "The Meridian Circuits team won the regional VEX championship with an autonomous routine scored at 96%.", body: "After three qualifying rounds, Grade 8–10 members of the Meridian Circuits robotics team outscored 22 schools to claim the regional VEX championship. The team now advances to the state finals in March, where they will present their autonomous navigation routine — scored at 96% in the final match. Coach Priya Nair credited the win to 'two years of Tuesday-afternoon grit.'", image: images.computer },
  { id: "NW-02", title: "New library wing opens with 8,000 titles", date: addDays(-19), tag: "Campus", excerpt: "The two-storey Learning Commons adds silent study lofts, a media lab and a dedicated research desk.", body: "Students and staff gathered for the ribbon-cutting of the Aldridge Learning Commons, a two-storey extension to the school library. The wing adds 8,000 new titles, silent study lofts, a small media lab, and a staffed research desk. Librarian staff will run information-literacy workshops for every homeroom this term.", image: images.library },
  { id: "NW-03", title: "Class of 2025 earns 100% university placement", date: addDays(-41), tag: "Results", excerpt: "All 86 graduates received offers, with 14 scholarships worth a combined $1.2M.", body: "Every member of the Class of 2025 received at least one university offer, continuing a decade-long record. Fourteen graduates earned merit scholarships worth a combined $1.2M, and a record five students will pursue engineering and health sciences programs. The college counseling office attributed the results to early portfolio mentoring beginning in Grade 9.", image: images.graduation },
  { id: "NW-04", title: "Fall term begins with record enrollment", date: addDays(-120), tag: "School Life", excerpt: "1,180 students returned across Grades K–12, including 140 new joiners in the junior school.", body: "The fall term opened with 1,180 enrolled students — the highest figure in the school's history. Orientation week paired every new joiner with a student ambassador, and homeroom teachers spent the first week on diagnostic assessments that now shape spring grouping in mathematics and English.", image: images.hero },
];

/* ---------------- library / transport / leaves / messages / applications ---------------- */
const books: Book[] = [
  { id: "BK-01", title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", category: "Science", copies: 6, available: 4 },
  { id: "BK-02", title: "The Giver", author: "Lois Lowry", isbn: "978-0547345901", category: "Fiction", copies: 8, available: 5 },
  { id: "BK-03", title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", category: "History", copies: 5, available: 3 },
  { id: "BK-04", title: "The Elements of Style", author: "Strunk & White", isbn: "978-0205309023", category: "Reference", copies: 10, available: 8 },
  { id: "BK-05", title: "Hidden Figures", author: "Margot Lee Shetterly", isbn: "978-0062363602", category: "Biography", copies: 4, available: 2 },
  { id: "BK-06", title: "The Boy Who Harnessed the Wind", author: "William Kamkwamba", isbn: "978-0803735118", category: "Biography", copies: 5, available: 4 },
  { id: "BK-07", title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", isbn: "978-0262533058", category: "Computer Science", copies: 3, available: 3 },
  { id: "BK-08", title: "Wonder", author: "R. J. Palacio", isbn: "978-0375869020", category: "Fiction", copies: 9, available: 6 },
  { id: "BK-09", title: "The Periodic Table", author: "Primo Levi", isbn: "978-0805210415", category: "Science", copies: 4, available: 3 },
  { id: "BK-10", title: "Long Walk to Freedom", author: "Nelson Mandela", isbn: "978-0316545853", category: "Biography", copies: 5, available: 4 },
  { id: "BK-11", title: "The Art of Looking Sideways", author: "Alan Fletcher", isbn: "978-0714834498", category: "Art & Design", copies: 3, available: 2 },
  { id: "BK-12", title: "Goodnight Mister Tom", author: "Michelle Magorian", isbn: "978-0064406369", category: "Fiction", copies: 7, available: 5 },
];
const loans: Loan[] = [
  { id: "LN-01", bookId: "BK-02", studentId: "STU-1009", issued: addDays(-9), due: addDays(5), returned: null, status: "Active" },
  { id: "LN-02", bookId: "BK-05", studentId: "STU-1001", issued: addDays(-20), due: addDays(-6), returned: null, status: "Overdue" },
  { id: "LN-03", bookId: "BK-08", studentId: "STU-1021", issued: addDays(-4), due: addDays(10), returned: null, status: "Active" },
  { id: "LN-04", bookId: "BK-11", studentId: "STU-1017", issued: addDays(-18), due: addDays(-4), returned: null, status: "Overdue" },
  { id: "LN-05", bookId: "BK-03", studentId: "STU-1024", issued: addDays(-6), due: addDays(8), returned: null, status: "Active" },
  { id: "LN-06", bookId: "BK-09", studentId: "STU-1004", issued: addDays(-30), due: addDays(-16), returned: addDays(-15), status: "Returned" },
  { id: "LN-07", bookId: "BK-12", studentId: "STU-1022", issued: addDays(-25), due: addDays(-11), returned: addDays(-12), status: "Returned" },
  { id: "LN-08", bookId: "BK-01", studentId: "STU-1028", issued: addDays(-3), due: addDays(11), returned: null, status: "Active" },
];

const routes: RouteInfo[] = [
  { id: "RT-1", name: "North Loop", vehicle: "Bus 12 · 42 seats", plate: "NF-4821", driver: "Harold Jensen", driverPhone: "+1 (555) 031-2210", stops: ["Maple Row", "Harbor Lane", "Cedar Court", "North Gate"], fee: 340, students: ["STU-1001", "STU-1004", "STU-1007", "STU-1016", "STU-1023"] },
  { id: "RT-2", name: "Lakeview Express", vehicle: "Bus 07 · 42 seats", plate: "NF-3308", driver: "Ruth Calloway", driverPhone: "+1 (555) 031-2287", stops: ["Willow Bend", "Lakeview Terrace", "Summit Ave", "West Gate"], fee: 320, students: ["STU-1002", "STU-1010", "STU-1015", "STU-1021", "STU-1027"] },
  { id: "RT-3", name: "East Hills", vehicle: "Mini-Bus 03 · 24 seats", plate: "NF-5112", driver: "Omar Suleiman", driverPhone: "+1 (555) 031-2344", stops: ["Summit Ave", "Birchwood Dr", "East Hills Plaza", "South Gate"], fee: 300, students: ["STU-1005", "STU-1013", "STU-1019", "STU-1024"] },
  { id: "RT-4", name: "City Center", vehicle: "Bus 15 · 42 seats", plate: "NF-2976", driver: "Bess Thornton", driverPhone: "+1 (555) 031-2402", stops: ["Central Station", "Museum Mile", "Cedar Court", "Main Gate"], fee: 360, students: ["STU-1008", "STU-1011", "STU-1018", "STU-1026"] },
];

const leaves: LeaveReq[] = [
  { id: "LV-01", who: "Sofia Reyes (STU-1002)", kind: "Student", from: addDays(2), to: addDays(3), reason: "Family wedding out of state.", status: "Pending", appliedOn: addDays(-1) },
  { id: "LV-02", who: "Sarah Mercer (TCH-2001)", kind: "Teacher", from: addDays(7), to: addDays(8), reason: "Medical appointment — will set cover work for G6/G7.", status: "Pending", appliedOn: addDays(-2) },
  { id: "LV-03", who: "Kofi Mensah (STU-1020)", kind: "Student", from: addDays(-9), to: addDays(-8), reason: "Regional athletics selection camp.", status: "Approved", appliedOn: addDays(-14) },
  { id: "LV-04", who: "Miguel Santos (TCH-2006)", kind: "Teacher", from: addDays(-16), to: addDays(-15), reason: "Personal — two days.", status: "Approved", appliedOn: addDays(-21) },
  { id: "LV-05", who: "Jonah Fields (STU-1024)", kind: "Student", from: addDays(-3), to: addDays(-1), reason: "Extended family travel.", status: "Rejected", appliedOn: addDays(-6) },
];

const messages: Message[] = [
  { id: "MS-01", from: "Meera Patel", fromRole: "parent", to: "Sarah Mercer", toRole: "teacher", body: "Hi Ms. Mercer — Aarav mentioned the algebra quiz moved to next week. Could you confirm what chapters it covers?", at: addDays(-2) },
  { id: "MS-02", from: "Sarah Mercer", fromRole: "teacher", to: "Meera Patel", toRole: "parent", body: "Of course — it covers chapters 3 and 4. The review sheet is posted under Assignments (AS-01).", at: addDays(-2) },
  { id: "MS-03", from: "Meera Patel", fromRole: "parent", to: "Sarah Mercer", toRole: "teacher", body: "Thank you! Anaya is also excited about the math club — is there a waitlist for Grade 6?", at: addDays(-1) },
];

const applications: Application[] = [
  { id: "APP-2026-009", studentName: "Theo Laurent", dob: "2014-05-19", grade: "Grade 7", guardian: "Sophie Laurent", email: "s.laurent@mail.com", phone: "+1 (555) 019-8834", date: addDays(-11), status: "Offer Sent" },
  { id: "APP-2026-014", studentName: "Amelie Laurent", dob: "2016-09-02", grade: "Grade 5", guardian: "Sophie Laurent", email: "s.laurent@mail.com", phone: "+1 (555) 019-8834", date: addDays(-4), status: "In Review" },
];

/* ---------------- timetable ---------------- */
const TEACHER_BY_SUBJECT: Record<string, (grade: number) => string> = {
  English: (g) => (g <= 6 ? "Elena Petrova" : "Hana Yoshida"),
  Mathematics: (g) => (g <= 7 ? "Sarah Mercer" : "Robert Ellis"),
  Science: (g) => (g <= 6 ? "Amara Diallo" : "David Okafor"),
  "Social Studies": () => "James Whitfield",
  "Computer Science": () => "Priya Nair",
  "Art & Design": () => "Miguel Santos",
};
export function timetableFor(grade: number) {
  return DAYS.map((day, di) =>
    PERIODS_LOCAL.map((_, pi) => {
      const subject = SUBJECTS[(di * 2 + pi + grade) % SUBJECTS.length];
      return { subject, teacher: TEACHER_BY_SUBJECT[subject](grade), period: pi + 1 };
    })
  );
}
const PERIODS_LOCAL = ["08:00", "08:50", "09:40", "10:50", "11:40", "12:30", "13:40"];
export const SCHOOL_PERIODS = PERIODS_LOCAL;

/* ---------------- accounts ---------------- */
export const users: User[] = [
  { id: "u-admin", name: "Ava Sterling", role: "superadmin", email: "admin@eduvanta.edu", password: "admin123", linkId: null, color: "#1b4276" },
  { id: "u-principal", name: "Dr. Marcus Hale", role: "principal", email: "principal@eduvanta.edu", password: "principal123", linkId: null, color: "#0b6b50" },
  { id: "u-teacher", name: "Sarah Mercer", role: "teacher", email: "s.mercer@eduvanta.edu", password: "teach123", linkId: "TCH-2001", color: "#c98a1f" },
  { id: "u-accountant", name: "Noah Kim", role: "accountant", email: "accounts@eduvanta.edu", password: "finance123", linkId: null, color: "#7c5cbf" },
  { id: "u-student", name: "Aarav Patel", role: "student", email: "aarav@student.eduvanta.edu", password: "study123", linkId: "STU-1001", color: "#0e8563" },
  { id: "u-parent", name: "Meera Patel", role: "parent", email: "meera.patel@mail.com", password: "family123", linkId: null, children: ["STU-1001", "STU-1007"], color: "#bb4a3c" },
];

export function seedDB(): DB {
  return {
    students, teachers, classes, attendance, exams, results, fees, structure,
    assignments, notices, events, news, books, loans, routes, leaves, messages, applications,
  };
}

export const school = {
  name: "EduVanta International School",
  short: "EduVanta",
  founded: 1998,
  address: "18 Scholars' Way, Riverbend Campus, Northfield, NF 04512",
  phone: "+1 (555) 014-2030",
  email: "hello@eduvanta.edu",
  hours: "Mon – Fri · 07:30 – 16:00",
  term: "Spring 2026",
  enrollment: 1180,
  faculty: 84,
  ratio: "9:1",
  acres: 26,
};

export const gradeEnrollment = [
  { grade: "G1", students: 96 }, { grade: "G2", students: 104 }, { grade: "G3", students: 98 },
  { grade: "G4", students: 110 }, { grade: "G5", students: 108 }, { grade: "G6", students: 116 },
  { grade: "G7", students: 124 }, { grade: "G8", students: 112 }, { grade: "G9", students: 98 }, { grade: "G10", students: 86 },
];
export const monthlyRevenue = [
  { m: "Sep", collected: 42800, target: 45000 }, { m: "Oct", collected: 51200, target: 48000 },
  { m: "Nov", collected: 46900, target: 48000 }, { m: "Dec", collected: 39400, target: 44000 },
  { m: "Jan", collected: 57300, target: 52000 }, { m: "Feb", collected: 49800, target: 52000 },
];
export const attendanceTrend = lastWeekdays(10).map((d, i) => ({
  d: fmtShort(d), school: 93 + ((i * 7) % 5), g7: 91 + ((i * 5) % 7), g6: 94 - ((i * 3) % 4),
}));
function fmtShort(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
export { todayISO };
