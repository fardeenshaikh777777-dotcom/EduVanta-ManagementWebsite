import { useState } from "react";
import { Check, ChevronDown, FileText, Search, Monitor, FlaskConical, BookOpen, Dumbbell, Theater, UtensilsCrossed, HeartPulse, Bus, Send, Loader2, MapPin, ClipboardCheck } from "lucide-react";
import { SectionHead, Reveal, Badge, Button, Field, Input, Select, Card } from "../../components/ui";
import { useApp, useToast } from "../../lib/store";
import { school } from "../../lib/data";
import { images, cx, todayISO, money } from "../../lib/core";

const STEPS = [
  { t: "Submit application", b: "Complete the online form below — takes about 10 minutes. You'll receive an application ID instantly.", d: "10 min" },
  { t: "Document review", b: "Our admissions team verifies transcripts and records within 5 working days. You can track status with your ID.", d: "5 days" },
  { t: "Assessment day", b: "Students join a morning of age-appropriate activities and a family interview — a working session, not an interrogation.", d: "1 morning" },
  { t: "Offer & enrollment", b: "Offers are issued within 3 weeks. Accept, pay the admission fee, and join the new-family orientation in August.", d: "3 weeks" },
];

const DOCS = ["Completed application form (online)", "Birth certificate (copy)", "Previous 2 years of report cards", "Transfer certificate from current school", "Two passport-size photographs", "Immunization record", "Parent photo ID"];

const FEE_TABLE = [
  { stage: "Early Years (K)", tuition: 980, admission: 200, transport: 280, activity: 120 },
  { stage: "Primary · G1–5", tuition: 1150, admission: 250, transport: 320, activity: 150 },
  { stage: "Middle · G6–8", tuition: 1350, admission: 300, transport: 340, activity: 150 },
  { stage: "Secondary · G9–10", tuition: 1650, admission: 350, transport: 360, activity: 150 },
];

const ADMISSION_FAQS = [
  { q: "Is there an application fee?", a: "No — applications are free. The one-time admission fee is only payable after an offer is accepted." },
  { q: "Do you offer scholarships or sibling discounts?", a: "Yes. Merit scholarships cover up to 50% of tuition for exceptional candidates, and siblings receive a 10% discount from the second child onward." },
  { q: "Can students join mid-year?", a: "Mid-year admission is considered for Grades 1–9 where space allows. Assessment days run monthly, so families are never locked into a single window." },
  { q: "What if my child has learning support needs?", a: "Tell us in the application. Our learning-support team reviews every file, and we'll be honest early about whether we're the right placement." },
];

export function AdmissionsPage() {
  const { db, update } = useApp();
  const { push } = useToast();
  const [form, setForm] = useState({ studentName: "", dob: "", grade: "Grade 5", guardian: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [track, setTrack] = useState("");
  const [trackResult, setTrackResult] = useState<{ id: string; status: string; date: string; name: string } | null | "notfound">(null);
  const [faq, setFaq] = useState<number | null>(0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.studentName.trim().length < 3) e.studentName = "Enter the student's full name";
    if (!form.dob) e.dob = "Date of birth is required";
    if (form.guardian.trim().length < 3) e.guardian = "Enter a parent or guardian name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) { push("error", "Check the form", "A few fields need attention before we can accept the application."); return; }
    setSubmitting(true);
    const id = `APP-2026-${String(Math.floor(20 + Math.random() * 70))}`;
    window.setTimeout(() => {
      update((d) => ({ ...d, applications: [{ id, studentName: form.studentName.trim(), dob: form.dob, grade: form.grade, guardian: form.guardian.trim(), email: form.email.trim(), phone: form.phone.trim(), date: todayISO(), status: "Received" }, ...d.applications] }));
      setSubmitting(false);
      setDone(id);
      push("success", "Application received", `Your reference is ${id}. Save it to track your status.`);
    }, 900);
  };

  const runTrack = (ev: React.FormEvent) => {
    ev.preventDefault();
    const q = track.trim().toUpperCase();
    if (!q) return;
    const found = db.applications.find((a) => a.id.toUpperCase() === q);
    if (found) setTrackResult({ id: found.id, status: found.status, date: found.date, name: found.studentName });
    else setTrackResult("notfound");
  };

  const stageIdx = ["Received", "In Review", "Assessment", "Offer Sent", "Enrolled"];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHead kicker="Admissions 2026–27" title="A straightforward path to a seat at EduVanta." body="Four steps, honest timelines, and a real person — Ingrid Solberg's admissions team — reading every application. Applications close March 31, 2026." />
          <div className="flex flex-wrap gap-2.5 mt-7">
            <Badge tone="emerald" className="!py-2 !px-3">Applications close Mar 31</Badge>
            <Badge tone="gold" className="!py-2 !px-3">Merit scholarships up to 50%</Badge>
            <Badge tone="navy" className="!py-2 !px-3">Sibling discount 10%</Badge>
          </div>
        </div>
        <Reveal>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4 rounded-xl border border-line bg-card p-5 hover:border-em-200 hover:shadow-md transition-all">
                <span className="w-10 h-10 shrink-0 rounded-lg bg-navy-900 text-white font-display font-bold grid place-items-center">{i + 1}</span>
                <span>
                  <span className="flex items-center gap-3"><b className="font-display">{s.t}</b><Badge tone="outline" className="!text-[0.65rem]">{s.d}</Badge></span>
                  <span className="block text-[0.86rem] text-mute leading-relaxed mt-1">{s.b}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      {/* eligibility + documents */}
      <div className="grid lg:grid-cols-2 gap-6 mt-20">
        <Reveal>
          <Card className="p-8 h-full">
            <h3 className="font-display font-bold text-xl flex items-center gap-3"><ClipboardCheck className="w-5 h-5 text-em-600" />Eligibility</h3>
            <ul className="mt-5 space-y-3.5">
              {[
                ["Early Years (K)", "Child turns 4 by September 1 of the entry year."],
                ["Grade 1", "Child turns 6 by September 1; one year of kindergarten completed."],
                ["Grades 2–8", "Age-appropriate placement with satisfactory reports from the previous two years."],
                ["Grades 9–10", "Strong standing in mathematics and English; entry assessment in both subjects."],
                ["All applicants", "A family interview and a student taster morning — for fit on both sides."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-3 text-[0.9rem]"><Check className="w-4.5 h-4.5 text-em-600 shrink-0 mt-0.5" /><span><b>{t} — </b><span className="text-mute">{b}</span></span></li>
              ))}
            </ul>
          </Card>
        </Reveal>
        <Reveal delay={90}>
          <Card className="p-8 h-full">
            <h3 className="font-display font-bold text-xl flex items-center gap-3"><FileText className="w-5 h-5 text-em-600" />Required documents</h3>
            <ul className="mt-5 grid sm:grid-cols-2 gap-3">
              {DOCS.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-[0.86rem] text-mute leading-snug">
                  <span className="w-5 h-5 rounded border border-line bg-paper grid place-items-center shrink-0 mt-0.5"><Check className="w-3 h-3 text-em-600" /></span>{d}
                </li>
              ))}
            </ul>
            <p className="text-[0.8rem] text-mute mt-5 border-t border-line pt-4">Digital copies are accepted at application; originals are verified at enrollment.</p>
          </Card>
        </Reveal>
      </div>

      {/* fee table */}
      <div className="mt-20">
        <Reveal><SectionHead kicker="Fee information" title="Clear figures, no surprise line items." body="Termly fees for 2026–27. Transport is optional and billed per route; textbooks and exam fees are included in tuition." /></Reveal>
        <Reveal delay={80}>
          <div className="mt-10 overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full text-[0.88rem] min-w-[560px]">
              <thead><tr className="text-left border-b border-line bg-paper/70 text-[0.72rem] uppercase tracking-wider text-mute">
                {["Stage", "Tuition / term", "Admission (one-time)", "Transport / term", "Activity / term"].map((h) => <th key={h} className="px-5 py-3.5 font-bold whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {FEE_TABLE.map((r, i) => (
                  <tr key={r.stage} className={cx("border-b border-line/60 last:border-0", i % 2 ? "bg-paper/40" : "")}>
                    <td className="px-5 py-3.5 font-semibold">{r.stage}</td>
                    <td className="px-5 py-3.5 tnum font-bold text-em-700">{money(r.tuition)}</td>
                    <td className="px-5 py-3.5 tnum">{money(r.admission)}</td>
                    <td className="px-5 py-3.5 tnum">{money(r.transport)}</td>
                    <td className="px-5 py-3.5 tnum">{money(r.activity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>

      {/* apply + track */}
      <div className="mt-20 grid lg:grid-cols-2 gap-6 items-start">
        <Reveal>
          <div className="rounded-2xl border border-line bg-card p-8">
            <h3 className="font-display font-bold text-2xl">Online application</h3>
            <p className="text-[0.88rem] text-mute mt-1.5">Fields marked * are required. You'll receive a reference ID to track progress.</p>
            {done ? (
              <div className="mt-7 rounded-xl bg-em-50 border border-em-200 p-6 text-center anim-pop">
                <span className="w-12 h-12 rounded-full bg-em-600 text-white grid place-items-center mx-auto"><Check className="w-6 h-6" /></span>
                <h4 className="font-display font-bold text-xl mt-4">Application submitted</h4>
                <p className="text-[0.9rem] text-mute mt-2">Your reference ID is</p>
                <p className="font-display font-extrabold text-2xl text-em-700 tnum tracking-wide mt-1">{done}</p>
                <p className="text-[0.8rem] text-mute mt-3">Our team will email <b>{form.email}</b> within 5 working days. Use the tracker →</p>
                <Button variant="soft" className="mt-4" onClick={() => { setDone(null); setForm({ studentName: "", dob: "", grade: "Grade 5", guardian: "", email: "", phone: "" }); }}>Submit another application</Button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4" noValidate>
                <Field label="Student full name *" error={errors.studentName} className="sm:col-span-2">
                  <Input value={form.studentName} invalid={!!errors.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="e.g. Theo Laurent" />
                </Field>
                <Field label="Date of birth *" error={errors.dob}>
                  <Input type="date" value={form.dob} invalid={!!errors.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </Field>
                <Field label="Applying for *">
                  <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
                    {["Early Years (K)", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map((g) => <option key={g}>{g}</option>)}
                  </Select>
                </Field>
                <Field label="Parent / guardian *" error={errors.guardian} className="sm:col-span-2">
                  <Input value={form.guardian} invalid={!!errors.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} placeholder="Full name" />
                </Field>
                <Field label="Email *" error={errors.email}>
                  <Input type="email" value={form.email} invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <Input value={form.phone} invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </Field>
                <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                  <Button type="submit" size="lg" disabled={submitting}>{submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : <><Send className="w-4 h-4" />Submit application</>}</Button>
                  <p className="text-[0.75rem] text-mute leading-snug">No application fee.<br />We reply within 5 working days.</p>
                </div>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="rounded-2xl bg-navy-900 text-white p-8">
            <h3 className="font-display font-bold text-2xl">Track your application</h3>
            <p className="text-[0.88rem] text-white/60 mt-1.5">Enter the reference ID from your confirmation.</p>
            <form onSubmit={runTrack} className="flex gap-2.5 mt-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <Input value={track} onChange={(e) => setTrack(e.target.value)} placeholder="APP-2026-014" aria-label="Application reference ID" className="!bg-white/8 !border-white/15 !text-white placeholder:!text-white/35 pl-10" />
              </div>
              <Button type="submit" variant="gold">Track</Button>
            </form>
            <p className="text-[0.72rem] text-white/40 mt-2.5">Demo hint: try <button type="button" className="underline text-em-200 cursor-pointer" onClick={() => setTrack("APP-2026-014")}>APP-2026-014</button></p>
            {trackResult === "notfound" && (
              <div className="mt-6 rounded-xl bg-white/5 border border-white/15 p-5 anim-pop">
                <p className="font-bold">No application found</p>
                <p className="text-[0.83rem] text-white/60 mt-1">Check the reference ID, or email <b className="text-em-200">admissions@eduvanta.edu</b> and we'll locate it.</p>
              </div>
            )}
            {trackResult && trackResult !== "notfound" && (
              <div className="mt-6 rounded-xl bg-white/5 border border-white/15 p-6 anim-pop">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div><p className="text-[0.75rem] text-white/50 uppercase tracking-wider font-bold">{trackResult.id} · {trackResult.name}</p>
                    <p className="font-display font-bold text-xl mt-1 text-gold-500">{trackResult.status}</p></div>
                  <Badge tone="emerald">Submitted {new Date(trackResult.date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Badge>
                </div>
                <ol className="mt-6 grid grid-cols-5 gap-1.5">
                  {stageIdx.map((s, i) => {
                    const cur = stageIdx.indexOf(trackResult.status);
                    const active = i <= cur;
                    return (
                      <li key={s} className="text-center">
                        <span className={cx("block h-1.5 rounded-full", active ? "bg-em-500" : "bg-white/15")} />
                        <span className={cx("block text-[0.62rem] font-semibold mt-2 leading-tight", active ? "text-em-200" : "text-white/40")}>{s}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* admissions FAQ */}
          <div className="mt-6 space-y-2.5">
            {ADMISSION_FAQS.map((f, i) => (
              <div key={f.q} className="rounded-xl border border-line bg-card overflow-hidden">
                <button className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer" onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                  <span className="font-semibold text-[0.92rem]">{f.q}</span>
                  <ChevronDown className={cx("w-4.5 h-4.5 text-mute shrink-0 transition-transform", faq === i && "rotate-180 text-em-700")} />
                </button>
                <div className={cx("grid transition-all duration-300", faq === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}><div className="overflow-hidden"><p className="px-5 pb-4 text-[0.86rem] text-mute leading-relaxed">{f.a}</p></div></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

const FACILITIES = [
  { icon: Monitor, t: "Smart classrooms", b: "Every room from Grade 1 up has an interactive panel, document camera and acoustic treatment — 64 rooms in total.", img: images.classroom },
  { icon: FlaskConical, t: "Science laboratories", b: "Dedicated physics, chemistry and biology labs with a preparation room and full-time technician from Grade 7.", img: images.science },
  { icon: Monitor, t: "Computer & innovation lab", b: "60 networked stations, a robotics arena and 3D printers. Computer science is timetabled weekly from Grade 6.", img: images.computer },
  { icon: BookOpen, t: "Aldridge Library", b: "40,000 volumes across two floors with silent study lofts, a media lab and a staffed research desk.", img: images.library },
  { icon: Dumbbell, t: "Sports facilities", b: "Athletics track, two gyms, six-lane pool and floodlit turf — shared across four competitive houses.", img: images.sports },
  { icon: Theater, t: "Hale Auditorium", b: "A 640-seat performance hall with a full lighting rig, used for assemblies, concerts and public lectures.", img: images.graduation },
  { icon: UtensilsCrossed, t: "Cafeteria", b: "Two serving lines with dietitian-planned rotating menus; allergies are flagged at the point of service.", img: images.hero },
  { icon: HeartPulse, t: "Medical room", b: "Full-time nurse on campus 07:30–16:30, an isolation room, and hospital transfer agreements on file.", img: images.campus },
  { icon: Bus, t: "Transport fleet", b: "12 GPS-tracked buses and minibuses covering four routes, each with a dedicated driver and morning checklist.", img: images.sports },
];

export function CampusPage() {
  const [active, setActive] = useState(0);
  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <SectionHead kicker="Campus & facilities" title="Spaces built for the work, not the brochure." body="Every facility below is in daily use by students — no showpiece rooms that stay locked. Select a facility to preview it." />

      <div className="mt-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="relative rounded-2xl overflow-hidden border border-line">
              <img src={FACILITIES[active].img} alt={FACILITIES[active].t} className="w-full aspect-[16/10] object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <Badge tone="gold" className="mb-2">{`Facility ${String(active + 1).padStart(2, "0")} / ${FACILITIES.length}`}</Badge>
                <h3 className="font-display font-extrabold text-2xl">{FACILITIES[active].t}</h3>
                <p className="text-[0.9rem] text-white/75 mt-1.5 max-w-lg leading-relaxed">{FACILITIES[active].b}</p>
              </div>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {[[school.acres + " acres", "Single green campus"], ["64", "Classrooms & studios"], ["12", "Buses across 4 routes"], ["2", "Libraries (junior + senior)"], ["640", "Auditorium seats"], ["24/7", "Campus security & CCTV"]].map(([n, l]) => (
              <div key={l} className="rounded-xl border border-line bg-card p-4 text-center hover:border-em-200 transition-colors">
                <p className="font-display font-extrabold text-2xl text-navy-800 tnum">{n}</p>
                <p className="text-[0.75rem] font-semibold text-mute mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="space-y-2.5">
            {FACILITIES.map((f, i) => (
              <button key={f.t} onClick={() => setActive(i)}
                className={cx("w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer",
                  active === i ? "border-em-600 bg-em-50 shadow-sm" : "border-line bg-card hover:border-em-200")}
                aria-pressed={active === i}>
                <span className={cx("w-10 h-10 rounded-lg grid place-items-center shrink-0 transition-colors", active === i ? "bg-em-600 text-white" : "bg-ink/5 text-mute")}><f.icon className="w-5 h-5" /></span>
                <span className="min-w-0 flex-1">
                  <b className="font-display block text-[0.95rem]">{f.t}</b>
                  <span className="text-[0.78rem] text-mute line-clamp-1 block">{f.b}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-navy-900 text-white p-6">
            <p className="font-display font-bold text-lg">Want the full tour?</p>
            <p className="text-[0.85rem] text-white/65 mt-1.5">Open House runs the second Saturday of each month, 10:00–12:00. Students lead the tour — they're the honest ones.</p>
            <a href="#/contact" className="inline-flex items-center gap-2 mt-4 text-[0.85rem] font-bold text-gold-500 hover:text-gold-600 transition-colors">
              <MapPin className="w-4 h-4" />Book a visit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


