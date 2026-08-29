import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { ToastProvider, AppProvider, useApp, useRoute, useToast, navigate } from "./lib/store";
import { can, cx } from "./lib/core";
import { Link, Button, EmptyState } from "./components/ui";
import { PublicShell } from "./pages/public/Shell";
import { Home } from "./pages/public/Home";
import { AboutPage, AcademicsPage } from "./pages/public/Info";
import { AdmissionsPage, CampusPage } from "./pages/public/Admit";
import { EventsPage, ContactPage } from "./pages/public/Community";
import { LoginPage } from "./pages/Login";
import { PortalLayout, useModule } from "./pages/portal/Shell";
import { AdminDashboard, PrincipalDashboard, TeacherDashboard, StudentDashboard, ParentDashboard, AccountantDashboard } from "./pages/portal/Dashboards";
import { StudentsPage, StudentProfile, TeachersPage, ParentsPage } from "./pages/portal/People";
import { ClassesPage, TimetablePage, ExamsPage, AssignmentsPage } from "./pages/portal/Academics";
import { AttendancePage, LeavesPage, LibraryPage, TransportPage } from "./pages/portal/Operations";
import { FeesPage, NoticesPage, ProfilePage } from "./pages/portal/Finance";
import { ShieldAlert } from "lucide-react";

function ToastHost() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2rem)]" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={cx("anim-pop flex items-start gap-3 rounded-xl border bg-card shadow-xl shadow-navy-950/15 px-4 py-3.5",
          t.kind === "success" ? "border-em-200" : t.kind === "error" ? "border-danger-600/40" : "border-line")}>
          {t.kind === "success" && <CheckCircle2 className="w-5 h-5 text-em-600 shrink-0 mt-0.5" />}
          {t.kind === "error" && <XCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />}
          {t.kind === "info" && <Info className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[0.88rem] leading-snug">{t.title}</p>
            {t.msg && <p className="text-[0.78rem] text-mute mt-0.5 leading-snug">{t.msg}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className="text-mute hover:text-ink cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

function DashboardSwitch() {
  const { user } = useApp();
  if (!user) return null;
  switch (user.role) {
    case "superadmin":
    case "admin": return <AdminDashboard />;
    case "principal": return <PrincipalDashboard />;
    case "teacher": return <TeacherDashboard teacherId={user.linkId ?? "TCH-2001"} />;
    case "accountant": return <AccountantDashboard />;
    case "student": return <StudentDashboard studentId={user.linkId ?? "STU-1001"} />;
    case "parent": return <ParentDashboard children={user.children ?? ["STU-1001"]} />;
    default: return <AdminDashboard />;
  }
}

function PortalRouter() {
  const { user } = useApp();
  const mod = useModule();
  const { segs } = useRoute();

  if (user && mod !== "dashboard" && mod !== "profile" && !can(user.role, mod)) {
    return (
      <div className="grid place-items-center py-16">
        <EmptyState icon={<ShieldAlert className="w-6 h-6" />} title="Access restricted"
          body={`The ${mod} module isn't available for the ${user.role} role in this demo. Switch accounts from the login page to explore it.`}
          action={<Button onClick={() => navigate("/app")}>Back to dashboard</Button>} />
      </div>
    );
  }

  if (mod === "students" && segs[2]) return <StudentProfile id={segs[2]} />;

  switch (mod) {
    case "students": return <StudentsPage />;
    case "teachers": return <TeachersPage />;
    case "parents": return <ParentsPage />;
    case "classes": return <ClassesPage />;
    case "timetable": return <TimetablePage />;
    case "exams": return <ExamsPage />;
    case "assignments": return <AssignmentsPage />;
    case "attendance": return <AttendancePage />;
    case "leaves": return <LeavesPage />;
    case "library": return <LibraryPage />;
    case "transport": return <TransportPage />;
    case "fees": return <FeesPage />;
    case "notices": return <NoticesPage />;
    case "profile": return <ProfilePage />;
    default: return <DashboardSwitch />;
  }
}

function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-28 text-center">
      <p className="font-display font-extrabold text-[5rem] leading-none text-ink">404</p>
      <h1 className="font-display font-bold text-2xl mt-3">This hallway doesn't exist.</h1>
      <p className="text-mute mt-2">The page you're after was moved, renamed, or never built. Let's get you back to somewhere useful.</p>
      <div className="flex justify-center gap-3 mt-7">
        <Link to="/"><Button>Back to home</Button></Link>
        <Link to="/contact"><Button variant="outline">Contact us</Button></Link>
      </div>
    </div>
  );
}

function PublicRouter() {
  const { path } = useRoute();
  useEffect(() => {
    if (path.startsWith("/app")) navigate("/login");
  }, [path]);
  if (path.startsWith("/app")) return null;
  const page = path === "/" ? <Home />
    : path.startsWith("/about") ? <AboutPage />
    : path.startsWith("/academics") ? <AcademicsPage />
    : path.startsWith("/admissions") ? <AdmissionsPage />
    : path.startsWith("/campus") ? <CampusPage />
    : path.startsWith("/events") ? <EventsPage />
    : path.startsWith("/contact") ? <ContactPage />
    : <NotFound />;
  return <PublicShell>{page}</PublicShell>;
}

function Root() {
  const { path } = useRoute();
  if (path === "/login") return <LoginPage />;
  if (path.startsWith("/app")) return <PortalLayout><PortalRouter /></PortalLayout>;
  return <PublicRouter />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Root />
        <ToastHost />
      </AppProvider>
    </ToastProvider>
  );
}
