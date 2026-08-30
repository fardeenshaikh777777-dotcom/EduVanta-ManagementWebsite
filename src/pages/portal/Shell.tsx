import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  LayoutDashboard, Users, GraduationCap, School as SchoolIcon, CalendarDays, ClipboardCheck,
  Wallet, CalendarClock, FileText, Bell, Bus, BookOpen, CalendarOff, MessageSquare, User,
  LogOut, Menu, X, Search, Sun, Moon, ChevronDown, ExternalLink, RotateCcw, Sparkles,
} from "lucide-react";
import { Logo, Avatar, Link, Button, Crumbs } from "../../components/ui";
import { useApp, useToast, roleLabel, navigate, useRoute } from "../../lib/store";
import { cx, can, fmtDateShort } from "../../lib/core";
import type { Role } from "../../lib/core";

const NAV: { group: string; items: { mod: string; label: string; icon: typeof Users }[] }[] = [
  { group: "Overview", items: [{ mod: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "People", items: [
      { mod: "students", label: "Students", icon: Users },
      { mod: "teachers", label: "Teachers", icon: GraduationCap },
      { mod: "parents", label: "Parents", icon: MessageSquare },
    ],
  },
  {
    group: "Academics", items: [
      { mod: "classes", label: "Classes & Sections", icon: SchoolIcon },
      { mod: "timetable", label: "Timetable", icon: CalendarDays },
      { mod: "exams", label: "Exams & Results", icon: ClipboardCheck },
      { mod: "assignments", label: "Assignments", icon: FileText },
    ],
  },
  {
    group: "Operations", items: [
      { mod: "attendance", label: "Attendance", icon: CalendarClock },
      { mod: "leaves", label: "Leave Management", icon: CalendarOff },
      { mod: "library", label: "Library", icon: BookOpen },
      { mod: "transport", label: "Transport", icon: Bus },
    ],
  },
  { group: "Finance", items: [{ mod: "fees", label: "Fees & Finance", icon: Wallet }] },
  { group: "Communication", items: [{ mod: "notices", label: "Notices", icon: Bell }] },
];

const TITLES: Record<string, string> = {
  dashboard: "Dashboard", students: "Student Management", teachers: "Teacher Management", parents: "Parent Management",
  classes: "Classes & Sections", timetable: "Timetable", exams: "Examination & Results", assignments: "Assignments & Homework",
  attendance: "Attendance", leaves: "Leave Management", library: "Library", transport: "Transport",
  fees: "Fees & Finance", notices: "Notices & Announcements", profile: "My Profile",
};

export function useModule() {
  const { segs } = useRoute();
  return segs[1] ?? "dashboard";
}

export function PortalLayout({ children }: { children: ReactNode }) {
  const { user, logout, db, update, resetDemo } = useApp();
  const { push } = useToast();
  const mod = useModule();
  const [drawer, setDrawer] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("eduvanta.theme") === "dark");
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDrawer(false); setBell(false); setMenu(false); }, [mod]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("eduvanta.theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); window.setTimeout(() => searchRef.current?.focus(), 50); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return { students: [], teachers: [] as { id: string; name: string; sub: string; to: string }[] };
    return {
      students: db.students.filter((x) => `${x.first} ${x.last} ${x.admissionNo}`.toLowerCase().includes(s)).slice(0, 5)
        .map((x) => ({ id: x.id, name: `${x.first} ${x.last}`, sub: `${x.admissionNo} · ${x.classId.toUpperCase()}-${x.section}`, to: `/app/students/${x.id}` })),
      teachers: db.teachers.filter((x) => `${x.first} ${x.last} ${x.subject}`.toLowerCase().includes(s)).slice(0, 4)
        .map((x) => ({ id: x.id, name: `${x.first} ${x.last}`, sub: `${x.subject} · ${x.employeeId}`, to: "/app/teachers" })),
    };
  }, [q, db.students, db.teachers]);

  if (!user) {
    return (
      <div className="min-h-[70vh] grid place-items-center px-4">
        <div className="text-center anim-pop">
          <span className="w-14 h-14 rounded-2xl bg-navy-900 text-em-500 grid place-items-center mx-auto"><Sparkles className="w-7 h-7" /></span>
          <h2 className="font-display font-extrabold text-2xl mt-5">You're signed out</h2>
          <p className="text-mute mt-2 max-w-sm">The portals are role-gated. Sign in with one of the demo accounts to explore the full system.</p>
          <Link to="/login" className="inline-block mt-5"><Button>Go to sign in <ExternalLink className="w-4 h-4" /></Button></Link>
        </div>
      </div>
    );
  }

  const unread = db.notices.filter((n) => !n.reads.includes(user.id) && (n.audience === "All" || n.audience === roleLabel[user.role].replace("Administrator", "") || matchesAudience(n.audience, user.role)));
  const visibleGroups = NAV.map((g) => ({ ...g, items: g.items.filter((i) => can(user.role, i.mod)) })).filter((g) => g.items.length);

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-[64px] flex items-center justify-between border-b border-white/8 shrink-0">
        <Link to="/"><Logo dark /></Link>
        <button className="lg:hidden w-9 h-9 grid place-items-center rounded-lg text-white/70 hover:bg-white/10 cursor-pointer" onClick={() => setDrawer(false)} aria-label="Close menu"><X className="w-5 h-5" /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5" aria-label="Portal navigation">
        {visibleGroups.map((g) => (
          <div key={g.group}>
            <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/35 mb-1.5">{g.group}</p>
            {g.items.map((i) => {
              const active = mod === i.mod || (i.mod === "dashboard" && mod === "dashboard");
              return (
                <Link key={i.mod} to={`/app/${i.mod === "dashboard" ? "" : i.mod}`}
                  className={cx("flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.86rem] font-semibold transition-all mb-0.5",
                    active ? "bg-em-600 text-white shadow-md shadow-em-600/25" : "text-white/60 hover:text-white hover:bg-white/6")}>
                  <i.icon className="w-[1.15rem] h-[1.15rem] shrink-0" />{i.label}
                  {i.mod === "notices" && unread.length > 0 && <span className="ml-auto text-[0.65rem] font-bold bg-gold-500 text-navy-950 rounded-full px-1.5 py-0.5 tnum">{unread.length}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/8 shrink-0">
        <Link to="/app/profile" className={cx("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors", mod === "profile" ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/6")}>
          <Avatar name={user.name} color={user.color} size={34} />
          <span className="min-w-0 flex-1"><span className="block text-[0.85rem] font-bold text-white truncate">{user.name}</span><span className="block text-[0.7rem] text-white/45">{roleLabel[user.role]}</span></span>
          <User className="w-4 h-4 text-white/40" />
        </Link>
        <button onClick={() => { logout(); navigate("/login"); push("info", "Signed out", "See you next time."); }}
          className="mt-1.5 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.85rem] font-semibold text-white/60 hover:text-white hover:bg-danger-600/20 transition-colors cursor-pointer">
          <LogOut className="w-[1.1rem] h-[1.1rem]" />Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper text-ink flex">
      {/* desktop sidebar */}
      <aside className="hidden lg:block w-[248px] shrink-0 bg-navy-950 sticky top-0 h-screen">{SidebarInner}</aside>

      {/* mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/60 anim-fade-in" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[270px] bg-navy-950 anim-fade-up">{SidebarInner}</aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* topbar */}
        <header className="sticky top-0 z-40 h-[64px] bg-card/92 backdrop-blur-md border-b border-line flex items-center gap-3 px-4 sm:px-6">
          <button className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-line cursor-pointer" onClick={() => setDrawer(true)} aria-label="Open navigation menu"><Menu className="w-5 h-5" /></button>
          <div className="min-w-0 hidden sm:block">
            <Crumbs items={[{ label: "EduVanta SMS", to: "/app" }, { label: TITLES[mod] ?? "Dashboard" }]} />
            <h1 className="font-display font-bold text-[1.02rem] leading-tight truncate -mt-0.5">{TITLES[mod] ?? "Dashboard"}</h1>
          </div>

          {/* global search */}
          <div className="flex-1 max-w-md mx-auto relative">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input ref={searchRef} value={q} onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 160)}
                placeholder="Search students, teachers…  (⌘K)" aria-label="Global search"
                className="w-full h-9.5 pl-9 pr-3 rounded-lg border border-line bg-paper text-[0.85rem] focus:border-em-500 focus:outline-none focus:ring-2 focus:ring-em-500/25" />
            </div>
            {searchOpen && q.trim().length >= 2 && (
              <div className="absolute top-11 left-0 right-0 bg-card border border-line rounded-xl shadow-xl shadow-navy-900/12 overflow-hidden anim-pop z-50">
                {results.students.length === 0 && results.teachers.length === 0 && <p className="px-4 py-4 text-[0.85rem] text-mute">No matches for “{q}”.</p>}
                {results.students.length > 0 && <p className="px-4 pt-3 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-mute">Students</p>}
                {results.students.map((r) => (
                  <button key={r.id} onMouseDown={() => { navigate(r.to); setQ(""); }} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-em-50 text-left cursor-pointer">
                    <span><span className="block text-[0.85rem] font-semibold">{r.name}</span><span className="text-[0.72rem] text-mute">{r.sub}</span></span>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-mute" />
                  </button>
                ))}
                {results.teachers.length > 0 && <p className="px-4 pt-3 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-mute border-t border-line/60 mt-1">Teachers</p>}
                {results.teachers.map((r) => (
                  <button key={r.id} onMouseDown={() => { navigate(r.to); setQ(""); }} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-em-50 text-left cursor-pointer">
                    <span><span className="block text-[0.85rem] font-semibold">{r.name}</span><span className="text-[0.72rem] text-mute">{r.sub}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="w-10 h-10 grid place-items-center rounded-lg border border-line text-mute hover:text-ink hover:border-em-500 transition-colors cursor-pointer">
            {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* notifications */}
          <div className="relative">
            <button onClick={() => { setBell(!bell); setMenu(false); }} aria-label="Notifications" className="relative w-10 h-10 grid place-items-center rounded-lg border border-line text-mute hover:text-ink hover:border-em-500 transition-colors cursor-pointer">
              <Bell className="w-4.5 h-4.5" />
              {unread.length > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-danger-600 text-white text-[0.62rem] font-bold grid place-items-center px-1 tnum">{unread.length}</span>}
            </button>
            {bell && (
              <div className="absolute right-0 top-12 w-[340px] max-w-[86vw] bg-card border border-line rounded-xl shadow-xl shadow-navy-900/15 overflow-hidden anim-pop z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                  <p className="font-display font-bold text-[0.95rem]">Notifications</p>
                  <button className="text-[0.75rem] font-bold text-em-700 hover:underline cursor-pointer" onClick={() => { update((d) => ({ ...d, notices: d.notices.map((n) => ({ ...n, reads: n.reads.includes(user.id) ? n.reads : [...n.reads, user.id] })) })); }}>Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {db.notices.slice(0, 6).map((n) => {
                    const isRead = n.reads.includes(user.id);
                    return (
                      <button key={n.id} onClick={() => update((d) => ({ ...d, notices: d.notices.map((x) => x.id === n.id && !x.reads.includes(user.id) ? { ...x, reads: [...x.reads, user.id] } : x) }))}
                        className={cx("w-full text-left px-4 py-3 border-b border-line/60 last:border-0 hover:bg-em-50/60 transition-colors cursor-pointer", !isRead && "bg-em-50/40")}>
                        <span className="flex items-center gap-2">
                          {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-em-600 shrink-0" />}
                          <span className={cx("text-[0.85rem] leading-snug", !isRead && "font-bold")}>{n.title}</span>
                        </span>
                        <span className="block text-[0.72rem] text-mute mt-1">{n.category} · {fmtDateShort(n.date)} · {n.audience}</span>
                      </button>
                    );
                  })}
                </div>
                <Link to="/app/notices" className="block text-center py-2.5 text-[0.8rem] font-bold text-em-700 hover:bg-em-50 border-t border-line">View all notices</Link>
              </div>
            )}
          </div>

          {/* profile menu */}
          <div className="relative">
            <button onClick={() => { setMenu(!menu); setBell(false); }} className="flex items-center gap-2.5 pl-1.5 pr-2 h-11 rounded-lg hover:bg-ink/5 transition-colors cursor-pointer" aria-label="Account menu" aria-expanded={menu}>
              <Avatar name={user.name} color={user.color} size={32} />
              <span className="hidden md:block text-left"><span className="block text-[0.8rem] font-bold leading-tight">{user.name}</span><span className="block text-[0.65rem] text-mute">{roleLabel[user.role]}</span></span>
              <ChevronDown className="w-4 h-4 text-mute hidden md:block" />
            </button>
            {menu && (
              <div className="absolute right-0 top-13 w-56 bg-card border border-line rounded-xl shadow-xl shadow-navy-900/15 overflow-hidden anim-pop z-50">
                <div className="px-4 py-3 border-b border-line">
                  <p className="font-bold text-[0.88rem]">{user.name}</p>
                  <p className="text-[0.72rem] text-mute">{user.email}</p>
                </div>
                <Link to="/app/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-[0.85rem] font-semibold hover:bg-em-50 transition-colors"><User className="w-4 h-4 text-mute" />My profile</Link>
                <button onClick={() => { resetDemo(); push("info", "Demo data reset", "Records restored."); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.85rem] font-semibold hover:bg-em-50 transition-colors text-left cursor-pointer"><RotateCcw className="w-4 h-4 text-mute" />Reset demo data</button>
                <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[0.85rem] font-semibold hover:bg-danger-100 text-danger-600 transition-colors border-t border-line text-left cursor-pointer"><LogOut className="w-4 h-4" />Sign out</button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
        <footer className="px-6 py-4 border-t border-line text-[0.75rem] text-mute flex flex-wrap gap-2 justify-between">
          <span>EduVanta SMS v2.4 · {roleLabel[user.role]} workspace</span>
          <span>Spring 2026 term · demo data</span>
        </footer>
      </div>
    </div>
  );
}

function matchesAudience(aud: string, role: Role) {
  if (aud === "All") return true;
  if (aud === "Students") return role === "student";
  if (aud === "Teachers") return role === "teacher";
  if (aud === "Parents") return role === "parent";
  return false;
}


