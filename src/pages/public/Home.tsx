import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, Compass, Microscope, Users, BookOpenCheck,
  Trophy, ShieldCheck, ChevronDown, Quote, Sparkles, Palette, Code2, Dumbbell, Music2, Globe2,
} from "lucide-react";
import { Link, Button, Badge, Reveal, Counter, SectionHead } from "../../components/ui";
import { useApp } from "../../lib/store";
import { school, gradeEnrollment } from "../../lib/data";
import { images, fmtDate, cx } from "../../lib/core";

const PROGRAMS = [
  { stage: "Early Years", ages: "Ages 3–5", img: images.classroom, points: ["Play-based inquiry with early literacy and numeracy", "Dedicated garden classroom and sensory studios", "1:8 educator ratio with daily progress notes"] },
  { stage: "Primary", ages: "Grades 1–5", img: images.library, points: ["Core mastery in language, mathematics and science", "Weekly studio rotations: art, music, design, code", "Reading culture with a personal library ledger"] },
  { stage: "Middle School", ages: "Grades 6–8", img: images.science, points: ["Subject-specialist teaching across six disciplines", "Advisory groups that follow students for 3 years", "First research projects and public exhibitions"] },
  { stage: "Secondary", ages: "Grades 9–10", img: images.computer, points: ["Board-track preparation with option electives", "College counseling from Grade 9 upward", "Leadership residencies and internship weeks"] },
];

const LIFE = [
  { icon: Code2, name: "Robotics & Code", note: "Regional champions, 2025" },
  { icon: Dumbbell, name: "Athletics", note: "14 sports across 4 houses" },
  { icon: Music2, name: "Music & Drama", note: "3 ensembles, 2 stages" },
  { icon: Palette, name: "Visual Arts", note: "Annual spring exhibition" },
  { icon: Globe2, name: "Model UN", note: "Hosts 12 schools each spring" },
  { icon: Compass, name: "Outward Bound", note: "Yearly expedition weeks" },
];

const FAQS = [
  { q: "When does the admissions window open?", a: "Applications for the 2026–27 academic year are open now and close on March 31. Assessment days run monthly from January through April, and offers are issued within three weeks of assessment." },
  { q: "What does a typical school day look like?", a: "School runs 08:00–15:10. Mornings are reserved for core academics, followed by studio or lab rotations, and afternoons close with advisory, sport or club time. Junior students finish at 14:40 on Fridays." },
  { q: "Is transportation provided?", a: "Yes — four supervised bus routes cover Northfield and surrounding districts, each with a dedicated driver and GPS tracking. Routes and stops are listed under Campus & Facilities." },
  { q: "How are students assessed?", a: "We combine continuous assessment (40%) with term examinations (60%). Report cards include grades, GPA, effort markers and teacher commentary, shared at parent–teacher conferences each term." },
  { q: "What support exists for different learning paces?", a: "Every grade has a learning-support specialist. Extension programs run for advanced mathematicians and writers, while structured intervention blocks protect time for students consolidating core skills." },
  { q: "Can we visit the campus before applying?", a: "Absolutely. Open House runs on the second Saturday of each month, and private tours can be booked through the contact page on Tuesdays and Thursdays." },
];

const TESTIMONIALS = [
  { quote: "The advisory system means someone actually knows our daughter — her teachers noticed a confidence dip in October and had a plan the same week.", name: "Lucia Fuentes", role: "Parent, Grade 6" },
  { quote: "I moved schools in Grade 8 and expected to be lost. Within a month I was in the robotics team and presenting at the Science Fair.", name: "Kofi Mensah", role: "Student, Grade 8" },
  { quote: "As a teacher, the planning time is real. The timetable protects it, and the leadership team actually reads our feedback.", name: "Elena Petrova", role: "English Faculty" },
];

export function Home() {
  const { db } = useApp();
  const [faq, setFaq] = useState<number | null>(0);
  const upcoming = [...db.events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const newsTop = [...db.news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 paper-grid opacity-70" aria-hidden="true" />
        <div className="absolute -top-32 -right-40 w-[560px] h-[560px] rounded-full bg-em-100/70 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="anim-fade-up">
              <Badge tone="emerald" className="!px-3 !py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-em-600 pulse-dot" />Admissions open · 2026–27
              </Badge>
            </div>
            <h1 className="font-display font-extrabold tracking-tight text-[2.6rem] leading-[1.02] sm:text-6xl mt-6 anim-fade-up" style={{ animationDelay: "80ms" }}>
              Where curious minds become <span className="relative inline-block text-em-700">capable<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 220 12" aria-hidden="true"><path d="M3 9c60-7 140-7 214-3" stroke="#e9b44c" strokeWidth="5" strokeLinecap="round" fill="none" /></svg></span> people.
            </h1>
            <p className="text-mute text-lg leading-relaxed mt-6 max-w-xl anim-fade-up" style={{ animationDelay: "160ms" }}>
              {school.name} pairs rigorous academics with studios, labs and playing fields — one campus where {school.enrollment.toLocaleString()} students from Grade K to 10 learn by building, testing and presenting.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-8 anim-fade-up" style={{ animationDelay: "240ms" }}>
              <Link to="/admissions"><Button size="lg">Apply for Admission <ArrowRight className="w-4 h-4" /></Button></Link>
              <Link to="/campus"><Button size="lg" variant="outline">Explore Campus <ArrowUpRight className="w-4 h-4" /></Button></Link>
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-line anim-fade-up" style={{ animationDelay: "320ms" }}>
              {[
                { n: school.enrollment, s: "+", l: "Students K–10" },
                { n: school.faculty, s: "", l: "Expert faculty" },
                { n: 9, s: ":1", l: "Student ratio" },
                { n: 100, s: "%", l: "University offers" },
              ].map((x) => (
                <div key={x.l}>
                  <dt className="sr-only">{x.l}</dt>
                  <dd className="font-display font-extrabold text-3xl text-ink"><Counter to={x.n} suffix={x.s} /></dd>
                  <dd className="text-[0.78rem] font-semibold text-mute mt-1 uppercase tracking-wide">{x.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* collage */}
          <div className="lg:col-span-6 relative anim-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[1.6rem] border-2 border-em-200/80 rotate-1" aria-hidden="true" />
              <img src={images.classroom} alt="Students raising hands during a classroom discussion" className="relative w-full aspect-[4/3] object-cover rounded-2xl shadow-xl shadow-navy-900/15" />
              <img src={images.science} alt="Students running a science experiment" loading="lazy" className="hidden sm:block absolute -bottom-10 -left-10 w-44 lg:w-56 aspect-square object-cover rounded-xl border-4 border-paper shadow-lg rotate-[-4deg]" />
              {/* live card */}
              <div className="absolute top-5 -right-3 sm:-right-8 bg-card border border-line rounded-xl shadow-xl shadow-navy-900/12 p-4 w-56 anim-float">
                <p className="text-[0.68rem] font-bold uppercase tracking-widest text-mute flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-em-500 pulse-dot" />Today on campus</p>
                <ul className="mt-2.5 space-y-2 text-[0.78rem]">
                  <li className="flex justify-between gap-2"><span className="text-mute">Attendance</span><b className="tnum text-em-700">96.2%</b></li>
                  <li className="flex justify-between gap-2"><span className="text-mute">Next event</span><b className="text-right">{upcoming[0]?.title.split(" ").slice(0, 2).join(" ")}</b></li>
                  <li className="flex justify-between gap-2"><span className="text-mute">Library loans</span><b className="tnum">38 today</b></li>
                </ul>
              </div>
              <div className="absolute -bottom-6 right-6 sm:right-12 bg-navy-900 text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-gold-500/20 text-gold-500 grid place-items-center"><Trophy className="w-4.5 h-4.5" /></span>
                <span className="text-[0.78rem] leading-tight"><b className="block">Regional Robotics</b><span className="text-white/60">Champions · 2025</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- intro / why ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHead kicker="Why EduVanta" title="A school built around the learner, not the timetable." body="Four commitments shape every decision we make — from how periods are scheduled to how report cards are written." />
              <div className="mt-8 flex gap-3">
                <Link to="/about"><Button variant="dark">Our story <ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            {[
              { icon: Microscope, n: "01", t: "Inquiry before answers", b: "Lessons open with problems, specimens and source material — students build understanding before they're told it. Labs run twice weekly from Grade 5." },
              { icon: Users, n: "02", t: "Known by name, known well", b: "Advisory groups of 12 stay together for three years. Every student has an adult who tracks progress, wellbeing and goals across every subject." },
              { icon: BookOpenCheck, n: "03", t: "Mastery, not coverage", b: "We teach fewer topics in greater depth, with reassessment windows that let students prove growth instead of averaging a bad week into a grade." },
              { icon: ShieldCheck, n: "04", t: "Character in the curriculum", b: "Integrity, craft and community are assessed like academics — through portfolios, peer review and real responsibility on campus." },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 70}>
                <div className="group flex gap-5 sm:gap-7 p-6 sm:p-7 rounded-xl border border-transparent hover:border-line hover:bg-card hover:shadow-lg hover:shadow-navy-900/6 transition-all duration-300 mb-3">
                  <div className="shrink-0">
                    <span className="w-12 h-12 rounded-xl bg-em-100 text-em-700 grid place-items-center group-hover:bg-em-600 group-hover:text-white transition-colors duration-300"><f.icon className="w-5.5 h-5.5" /></span>
                  </div>
                  <div>
                    <p className="text-[0.72rem] font-bold text-gold-600 tracking-widest">{f.n}</p>
                    <h3 className="font-display font-bold text-xl mt-1">{f.t}</h3>
                    <p className="text-mute leading-relaxed mt-2 text-[0.94rem]">{f.b}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- programs ---------- */}
      <section className="bg-card border-y border-line">
        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-24">
          <Reveal><SectionHead kicker="Academic programs" title="Four stages, one continuous journey." body="Each stage has its own buildings, rhythm and rituals — and a deliberate handover to the next." /></Reveal>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.stage} delay={(i % 2) * 90}>
                <div className="group rounded-xl overflow-hidden border border-line bg-paper hover:shadow-xl hover:shadow-navy-900/8 transition-all duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img src={p.img} alt={`${p.stage} students learning`} loading="lazy" className="w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                    <span className="absolute top-4 left-4 bg-navy-950/85 text-white text-[0.72rem] font-bold px-3 py-1.5 rounded-md backdrop-blur-sm">{p.ages}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl flex items-center justify-between">{p.stage}<ArrowUpRight className="w-5 h-5 text-em-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></h3>
                    <ul className="mt-3.5 space-y-2">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex gap-2.5 text-[0.88rem] text-mute"><span className="w-1.5 h-1.5 rounded-full bg-em-500 mt-2 shrink-0" />{pt}</li>
                      ))}
                    </ul>
                    <Link to="/academics" className="inline-flex items-center gap-1.5 mt-4 text-[0.85rem] font-bold text-em-700 hover:gap-2.5 transition-all">Curriculum details <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- campus mosaic ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20 lg:py-24">
        <Reveal><SectionHead kicker="Campus & facilities" title="26 acres designed for making things." body="Workshops, labs and quiet corners — every space on campus was built around a kind of learning." /></Reveal>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[150px] sm:auto-rows-[190px]">
          {[
            { img: images.campus, t: "Riverbend Campus", s: "Brick, glass and green", cls: "col-span-2 row-span-2" },
            { img: images.library, t: "Aldridge Library", s: "40,000 volumes", cls: "col-span-2" },
            { img: images.sports, t: "Athletics Ground", s: "4 houses, 14 sports", cls: "" },
            { img: images.computer, t: "Innovation Lab", s: "60 networked stations", cls: "" },
            { img: images.graduation, t: "Hale Auditorium", s: "640 seats", cls: "col-span-2" },
          ].map((m, i) => (
            <Reveal key={m.t} delay={i * 60} className={m.cls}>
              <Link to="/campus" className="group relative block w-full h-full rounded-xl overflow-hidden">
                <img src={m.img} alt={m.t} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <span className="absolute bottom-0 left-0 p-4 text-white">
                  <span className="font-display font-bold block text-lg leading-tight">{m.t}</span>
                  <span className="text-[0.78rem] text-white/70">{m.s}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- student life ---------- */}
      <section className="bg-navy-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-gold-500"><span className="w-6 h-px bg-gold-500" />Student life</p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mt-3">After the last bell, the best part starts.</h2>
            </div>
            <Link to="/events" className="shrink-0"><Button variant="gold">See the calendar <ArrowRight className="w-4 h-4" /></Button></Link>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIFE.map((a, i) => (
              <Reveal key={a.name} delay={i * 60}>
                <div className="group flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:border-em-500/40 transition-all duration-300">
                  <span className="w-11 h-11 rounded-lg bg-em-500/15 text-em-200 grid place-items-center group-hover:bg-em-500 group-hover:text-navy-950 transition-colors"><a.icon className="w-5 h-5" /></span>
                  <span>
                    <span className="font-display font-bold block">{a.name}</span>
                    <span className="text-[0.8rem] text-white/55">{a.note}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- events + achievements ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20 lg:py-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <Reveal><SectionHead kicker="Upcoming events" title="What's happening on campus." /></Reveal>
          <div className="mt-8 space-y-3">
            {upcoming.map((e, i) => (
              <Reveal key={e.id} delay={i * 70}>
                <Link to="/events" className="group flex items-center gap-5 p-4 rounded-xl border border-line bg-card hover:border-em-200 hover:shadow-lg hover:shadow-navy-900/6 transition-all duration-300">
                  <span className="shrink-0 w-16 text-center rounded-lg bg-navy-900 text-white py-2.5">
                    <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-em-200">{new Date(e.date + "T12:00").toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="block font-display font-extrabold text-xl leading-none tnum">{new Date(e.date + "T12:00").getDate()}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display font-bold block truncate">{e.title}</span>
                    <span className="text-[0.8rem] text-mute">{e.time} · {e.place}</span>
                  </span>
                  <Badge tone="navy" className="hidden sm:inline-flex shrink-0">{e.category}</Badge>
                  <ArrowRight className="w-4 h-4 text-mute group-hover:text-em-700 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </Reveal>
            ))}
          </div>
          <Link to="/events" className="inline-flex items-center gap-1.5 mt-6 text-[0.88rem] font-bold text-em-700 hover:gap-2.5 transition-all">Full events calendar <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="lg:col-span-5">
          <Reveal>
            <div className="rounded-2xl bg-navy-900 text-white p-8 h-full relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-em-600/20 blur-2xl" aria-hidden="true" />
              <p className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-gold-500 flex items-center gap-2"><Trophy className="w-4 h-4" />2025 Achievements</p>
              <ul className="mt-6 space-y-5">
                {[
                  { n: "1st", t: "Regional VEX Robotics Championship" },
                  { n: "14", t: "Merit scholarships earned by the Class of 2025" },
                  { n: "Gold", t: "Cognia® Accreditation — renewed with distinction" },
                  { n: "96%", t: "Students competing in at least one inter-school event" },
                ].map((a) => (
                  <li key={a.t} className="flex items-center gap-4 border-b border-white/10 last:border-0 pb-5 last:pb-0">
                    <span className="font-display font-extrabold text-2xl text-gold-500 w-16 shrink-0 tnum">{a.n}</span>
                    <span className="text-[0.9rem] text-white/80 leading-snug">{a.t}</span>
                  </li>
                ))}
              </ul>
              <img src={images.graduation} alt="Graduates celebrating" loading="lazy" className="w-full aspect-[16/9] object-cover rounded-xl mt-7" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- testimonials ---------- */}
      <section className="bg-card border-y border-line">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <Reveal><SectionHead kicker="Voices" title="What our community says." center /></Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6 items-start">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90} className={i === 1 ? "md:-translate-y-4" : ""}>
                <figure className={cx("rounded-xl border border-line bg-paper p-7 relative", i === 0 && "md:row-span-2")}>
                  <Quote className="w-7 h-7 text-em-200" />
                  <blockquote className="font-display text-[1.06rem] leading-relaxed mt-4">“{t.quote}”</blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-line">
                    <span className="font-bold block text-[0.9rem]">{t.name}</span>
                    <span className="text-[0.78rem] text-mute">{t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- news ---------- */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <Reveal><SectionHead kicker="Latest news" title="From the campus bulletin." /></Reveal>
          <Link to="/events" className="shrink-0 hidden sm:block"><Button variant="outline">All stories <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {newsTop.slice(0, 3).map((n, i) => (
            <Reveal key={n.id} delay={i * 80}>
              <Link to="/events" className="group block rounded-xl overflow-hidden border border-line bg-card hover:shadow-xl hover:shadow-navy-900/8 transition-all duration-300 hover:-translate-y-1">
                <div className="overflow-hidden">
                  <img src={n.image} alt={n.title} loading="lazy" className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-[0.75rem] font-semibold text-mute"><Badge tone={i === 0 ? "gold" : "navy"}>{n.tag}</Badge>{fmtDate(n.date)}</div>
                  <h3 className="font-display font-bold text-lg leading-snug mt-3 group-hover:text-em-700 transition-colors">{n.title}</h3>
                  <p className="text-[0.88rem] text-mute mt-2 leading-relaxed line-clamp-2">{n.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <Reveal><SectionHead kicker="Questions" title="Admissions, answered." center /></Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 50}>
              <div className={cx("rounded-xl border bg-card transition-colors", faq === i ? "border-em-200" : "border-line")}>
                <button className="w-full flex items-center justify-between gap-4 text-left px-6 py-4.5 cursor-pointer" onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i}>
                  <span className="font-display font-bold text-[1rem]">{f.q}</span>
                  <ChevronDown className={cx("w-5 h-5 shrink-0 text-mute transition-transform duration-300", faq === i && "rotate-180 text-em-700")} />
                </button>
                <div className={cx("grid transition-all duration-300", faq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden"><p className="px-6 pb-5 text-[0.92rem] text-mute leading-relaxed">{f.a}</p></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <Reveal>
          <div className="rounded-2xl bg-navy-950 text-white relative overflow-hidden">
            <img src={images.campus} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/92 to-navy-950/60" />
            <div className="relative px-8 sm:px-14 py-14 sm:py-16 grid lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-em-200 flex items-center gap-2"><Sparkles className="w-4 h-4" />Fall 2026 cohort</p>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-3 max-w-xl leading-tight">Your child's next chapter starts with a visit.</h2>
                <p className="text-white/70 mt-3 max-w-lg">Applications close March 31. Tour the campus, meet teachers, and see a Tuesday-morning class in full flow.</p>
              </div>
              <div className="flex flex-wrap gap-3.5">
                <Link to="/admissions"><Button variant="gold" size="lg">Start application <ArrowRight className="w-4 h-4" /></Button></Link>
                <Link to="/contact"><Button size="lg" className="!bg-white/10 hover:!bg-white/20 border border-white/20 shadow-none">Book a tour</Button></Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

export function EnrollmentStrip() {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {gradeEnrollment.map((g) => (
        <div key={g.grade} className="rounded-lg bg-ink/4 border border-line px-2 py-2.5 text-center">
          <p className="text-[0.68rem] font-bold text-mute">{g.grade}</p>
          <p className="font-display font-bold tnum text-[0.9rem]">{g.students}</p>
        </div>
      ))}
    </div>
  );
}


