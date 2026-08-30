import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DB } from "./data";
import { seedDB, users } from "./data";
import type { User, Role, Mark, FeeTxn } from "./core";
import { todayISO, uid } from "./core";

/* ================= hash router ================= */
export function navigate(path: string) {
  window.location.hash = path.startsWith("#") ? path : "#" + path;
}
export function useRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const fn = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const path = hash.replace(/^#/, "") || "/";
  const segs = useMemo(() => path.split("/").filter(Boolean), [path]);
  return { path, segs };
}

/* ================= toasts ================= */
export interface Toast { id: number; kind: "success" | "error" | "info"; title: string; msg?: string; }
const ToastCtx = createContext<{ push: (kind: Toast["kind"], title: string, msg?: string) => void; toasts: Toast[]; dismiss: (id: number) => void }>({ push: () => {}, toasts: [], dismiss: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind: Toast["kind"], title: string, msg?: string) => {
    const id = idRef.current++;
    setToasts((t) => [...t.slice(-3), { id, kind, title, msg }]);
    window.setTimeout(() => dismiss(id), 4200);
  }, [dismiss]);
  return <ToastCtx.Provider value={{ push, toasts, dismiss }}>{children}</ToastCtx.Provider>;
}

/* ================= data + auth ================= */
const LS_DB = "eduvanta.db.v1";
const LS_SESSION = "eduvanta.session.v1";

interface AppApi {
  db: DB;
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  update: (fn: (d: DB) => DB) => void;
  resetDemo: () => void;
  /* helpers */
  feeBalance: (studentId: string) => number;
  markAttendance: (classKey: string, date: string, marks: Record<string, Mark>) => void;
  payInvoice: (txnId: string, method: string) => void;
  addInvoice: (studentId: string, type: string, amount: number) => void;
  studentAttendancePct: (studentId: string) => number;
}

const AppCtx = createContext<AppApi>(null as unknown as AppApi);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => {
    try {
      const raw = localStorage.getItem(LS_DB);
      if (raw) {
        const parsed = JSON.parse(raw) as DB;
        if (parsed && Array.isArray(parsed.students) && parsed.students.length) return parsed;
      }
    } catch { /* fall through to seed */ }
    return seedDB();
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const id = localStorage.getItem(LS_SESSION);
      return users.find((u) => u.id === id) ?? null;
    } catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem(LS_DB, JSON.stringify(db)); } catch { /* quota */ }
  }, [db]);

  const update = useCallback((fn: (d: DB) => DB) => setDb((d) => fn(d)), []);

  const login = useCallback((email: string, password: string) => {
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (u) { setUser(u); localStorage.setItem(LS_SESSION, u.id); }
    return u ?? null;
  }, []);
  const logout = useCallback(() => { setUser(null); localStorage.removeItem(LS_SESSION); }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(LS_DB);
    setDb(seedDB());
  }, []);

  const feeBalance = useCallback((studentId: string) =>
    db.fees.filter((f) => f.studentId === studentId && f.kind === "Invoice" && f.status !== "Paid")
      .reduce((s, f) => s + f.amount, 0), [db.fees]);

  const studentAttendancePct = useCallback((studentId: string) => {
    let p = 0, t = 0;
    for (const day of db.attendance) {
      const m = day.marks[studentId];
      if (!m) continue;
      t++;
      if (m === "P" || m === "L") p++;
    }
    return t ? Math.round((p / t) * 1000) / 10 : 100;
  }, [db.attendance]);

  const markAttendance = useCallback((classKey: string, date: string, marks: Record<string, Mark>) => {
    setDb((d) => {
      const others = d.attendance.filter((a) => !(a.date === date && a.classId === classKey));
      return { ...d, attendance: [...others, { date, classId: classKey, marks }] };
    });
  }, []);

  const payInvoice = useCallback((txnId: string, method: string) => {
    setDb((d) => ({
      ...d,
      fees: d.fees.map((f): FeeTxn => f.id === txnId ? { ...f, status: "Paid", method, date: todayISO() } : f),
    }));
  }, []);

  const addInvoice = useCallback((studentId: string, type: string, amount: number) => {
    setDb((d) => ({
      ...d,
      fees: [...d.fees, { id: uid("TX"), receipt: `RCP-${Math.floor(6000 + Math.random() * 900)}`, studentId, kind: "Invoice", type, amount, date: todayISO(), method: "—", status: "Pending" }],
    }));
  }, []);

  const api = useMemo<AppApi>(() => ({
    db, user, login, logout, update, resetDemo, feeBalance, markAttendance, payInvoice, addInvoice, studentAttendancePct,
  }), [db, user, login, logout, update, resetDemo, feeBalance, markAttendance, payInvoice, addInvoice, studentAttendancePct]);

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>;
}

export const roleLabel: Record<Role, string> = {
  superadmin: "Super Admin", admin: "Administrator", principal: "Principal",
  teacher: "Teacher", accountant: "Accountant", student: "Student", parent: "Parent",
};
