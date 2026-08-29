import { HeartHandshake, Lightbulb, Hammer, Users2, Landmark, Award, Target, Eye, ArrowRight, FileCheck2, CalendarRange, ClipboardList } from "lucide-react";
import { SectionHead, Reveal, Link, Button, Badge, Card, Avatar } from "../../components/ui";
import { school } from "../../lib/data";
import { images } from "../../lib/core";

const VALUES = [
  { icon: Lightbulb, t: "Curiosity", b: "We reward good questions as highly as right answers." },
  { icon: HeartHandshake, t: "Integrity", b: "We do the honest work, even when no one is grading it." },
  { icon: Hammer, t: "Craft", b: "We revise, refine and take pride in work well made." },
  { icon: Users2, t: "Community", b: "We leave every room better company than we found it." },
];

const TIMELINE = [
  { y: "1998", t: "Founded on Harbor Lane", b: "Forty-two students, three teachers, and a conviction that Northfield deserved a different kind of school." },
  { y: "2004", t: "Riverbend Campus opens", b: "The 26-acre campus opens with the junior block, athletics ground and first science wing." },
  { y: "2012", t: "Cognia® accreditation", b: "Full international accreditation, renewed with distinction in 2018 and again in 2024." },
  { y: "2019", t: "Innovation Lab launches", b: "Robotics, computer science and design thinking become core offerings from Grade 5." },
  { y: "2023", t: "Aldridge Learning Commons", b: "The two-storey library extension opens with 8,000 new titles and silent study lofts." },
  { y: "2026", t: "1,180 students strong", b: "Record enrollment across K–10, with four houses and a 100% university placement record." },
];

const LEADERS = [
  { name: "Dr. Marcus Hale", role: "Principal", note: "Ed.D., Harvard · 22 years in education", color: "#0b6b50" },
  { name: "Ava Sterling", role: "Director of Operations", note: "MBA, Wharton · School systems & finance", color: "#1b4276" },
  { name: "Grace Adeyemi", role: "Head of Academics", note: "Ph.D. Curriculum Studies · Assessment design", color: "#c98a1f" },
  { name: "Tom Reyes", role: "Head of Student Life", note: "M.S. Kinesiology · House system & athletics", color: "#7c5cbf" },
  { name: "Ingrid Solberg", role: "Director of Admissions", note: "18 years guiding families through enrollment", color: "#bb4a3c" },
  { name: "Noah Kim", role: "Finance Controller", note: "CPA · Bursar & fee administration", color: "#27579c" },
];

export function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHead kicker="About EduVanta" title="Twenty-eight years of treating school as serious, joyful work." body={`${school.name} was founded in ${school.founded} on a simple premise: children rise to the level of the work they're trusted with. Today our Riverbend Campus holds ${school.enrollment.toLocaleString()} students, ${school.faculty} faculty members, and a community that still argues — fondly — about whether the robotics lab or the auditorium is the heart of the school.`} />
          <div className="flex gap-3 mt-8">
            <Link to="/academics"><Button variant="dark">See academics <ArrowRight className="w-4 h-4" /></Button></Link>
            <Link to="/contact"><Button variant="outline">Visit us</Button></Link>
          </div>
        </div>
        <Reveal>
          <div className="relative">
            <img src={images.campus} alt="The Riverbend Campus main building" className="w-full aspect-[16/10] object-cover rounded-2xl shadow-xl shadow-navy-900/12" />
            <div className="absolute -bottom-6 left-6 bg-card border border-line rounded-xl px-5 py-4 shadow-lg flex items-center gap-4">
              <span className="w-11 h-11 rounded-lg bg-gold-100 text-gold-600 grid place-items-center"><Landmark className="w-5 h-5" /></span>
              <span><b className="font-display block leading-tight">Est. {school.founded}</b><span className="text-[0.8rem] text-mute">Northfield, NF</span></span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* mission / vision */}
      <div className="grid md:grid-cols-2 gap-6 mt-24">
        <Reveal><Card className="p-8 h-full border-l-4 !border-l-em-600"><span className="w-11 h-11 rounded-lg bg-em-100 text-em-700 grid place-items-center"><Target className="w-5 h-5" /></span><h3 className="font-display font-bold text-2xl mt-4">Our mission</h3><p className="text-mute leading-relaxed mt-3">To educate young people who think rigorously, make things carefully, and act with integrity — through a curriculum of depth, a culture of advisory, and a campus built for real work.</p></Card></Reveal>
        <Reveal delay={90}><Card className="p-8 h-full border-l-4 !border-l-navy-700"><span className="w-11 h-11 rounded-lg bg-navy-100 text-navy-800 grid place-items-center"><Eye className="w-5 h-5" /></span><h3 className="font-display font-bold text-2xl mt-4">Our vision</h3><p className="text-mute leading-relaxed mt-3">A school where every graduate leaves with a portfolio of work they're proud of, an adult who knows them well, and the habits to keep learning long after the last bell.</p></Card></Reveal>
      </div>

      {/* values */}
      <div className="mt-24">
        <Reveal><SectionHead kicker="Core values" title="Four words we grade ourselves on." /></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {VALUES.map((v, i) => (
            <Reveal key={v.t} delay={i * 70}>
              <div className="group rounded-xl border border-line bg-card p-6 h-full hover:-translate-y-1 hover:shadow-lg hover:shadow-navy-900/8 transition-all duration-300">
                <span className="w-11 h-11 rounded-lg bg-em-100 text-em-700 grid place-items-center group-hover:bg-em-600 group-hover:text-white transition-colors"><v.icon className="w-5 h-5" /></span>
                <h3 className="font-display font-bold text-lg mt-4">{v.t}</h3>
                <p className="text-[0.88rem] text-mute mt-2 leading-relaxed">{v.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* principal message */}
      <div className="mt-24 rounded-2xl bg-navy-900 text-white overflow-hidden grid lg:grid-cols-[auto_1fr]">
        <div className="relative min-h-[260px] lg:min-h-0">
          <img src={images.classroom} alt="Principal visiting a classroom" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0 bg-navy-950/30 lg:bg-gradient-to-r lg:from-transparent lg:to-navy-900" />
        </div>
        <div className="p-8 sm:p-12">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.14em] text-gold-500">From the principal's desk</p>
          <p className="font-display text-2xl sm:text-[1.7rem] leading-snug mt-4 max-w-2xl">“We don't prepare students for the future by predicting it. We prepare them by letting them practice — presenting, building, failing, revising — in rooms where adults take their work seriously.”</p>
          <div className="flex items-center gap-4 mt-7">
            <Avatar name="Marcus Hale" color="#0e8563" size={48} />
            <div><b className="block font-display">Dr. Marcus Hale</b><span className="text-[0.83rem] text-white/60">Principal, {school.short} International School</span></div>
          </div>
        </div>
      </div>

      {/* history */}
      <div className="mt-24 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4"><SectionHead kicker="Our story" title="Milestones worth remembering." body="Every building on campus has a year attached — and a story about the students who pushed for it." /></div>
        <div className="lg:col-span-8">
          <ol className="relative border-l-2 border-em-200 ml-2 space-y-8">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.y} delay={i * 60}>
                <li className="ml-8 relative">
                  <span className="absolute -left-[41px] w-5 h-5 rounded-full bg-card border-[3px] border-em-600" aria-hidden="true" />
                  <Badge tone="emerald">{t.y}</Badge>
                  <h3 className="font-display font-bold text-lg mt-2">{t.t}</h3>
                  <p className="text-[0.9rem] text-mute leading-relaxed mt-1 max-w-xl">{t.b}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      {/* leadership */}
      <div className="mt-24">
        <Reveal><SectionHead kicker="Leadership" title="The team that keeps the lights on — and the standards up." /></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {LEADERS.map((l, i) => (
            <Reveal key={l.name} delay={i * 60}>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-5 hover:border-em-200 hover:shadow-md transition-all">
                <Avatar name={l.name} color={l.color} size={52} />
                <div className="min-w-0"><b className="font-display block truncate">{l.name}</b><span className="text-[0.8rem] font-semibold text-em-700 block">{l.role}</span><span className="text-[0.75rem] text-mute block truncate">{l.note}</span></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* accreditation */}
      <div className="mt-20 rounded-2xl border border-line bg-card p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
        <span className="w-14 h-14 rounded-xl bg-gold-100 text-gold-600 grid place-items-center shrink-0"><Award className="w-7 h-7" /></span>
        <div className="flex-1">
          <h3 className="font-display font-bold text-xl">Accreditation & affiliations</h3>
          <p className="text-[0.9rem] text-mute mt-2 leading-relaxed max-w-3xl">EduVanta is accredited by Cognia® (renewed with distinction, 2024) and is a member school of the Council of International Schools. Our examination programs are aligned with the Cambridge International pathway, and faculty development runs in partnership with the Northfield Institute of Education.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Cognia®", "CIS Member", "Cambridge Pathway", "NFSIA"].map((b) => <Badge key={b} tone="navy" className="!text-[0.8rem] !px-3 !py-2">{b}</Badge>)}
        </div>
      </div>
    </div>
  );
}

const CURRICULUM = [
  { stage: "Early Years", subjects: ["Early literacy", "Numeracy through play", "Nature studies", "Movement & music", "Studio time"], assess: "Observation portfolios shared weekly with families." },
  { stage: "Primary · G1–5", subjects: ["English", "Mathematics", "Science", "Social Studies", "Art, Music & PE", "Introduction to Code"], assess: "Termly mastery reports with effort markers and reading levels." },
  { stage: "Middle · G6–8", subjects: ["English", "Mathematics", "Integrated Sciences", "History & Geography", "Computer Science", "Design & Art"], assess: "Continuous assessment (40%) + term examinations (60%), GPA reported." },
  { stage: "Secondary · G9–10", subjects: ["English Language & Literature", "Mathematics (Core/Extended)", "Physics · Chemistry · Biology", "Global Perspectives", "Computer Science", "Two electives"], assess: "Board-aligned mock examinations, full report cards with GPA and commentary." },
];

const CALENDAR = [
  { term: "Fall Term", dates: "Aug 25 – Dec 19, 2025", exams: "Mid-Term: Oct 13–17 · Finals: Dec 8–12", note: "Fall break Oct 27–31" },
  { term: "Spring Term", dates: "Jan 5 – May 29, 2026", exams: "Mock Boards: Feb 2–6 (G9–10) · Finals: May 18–22", note: "Spring break Mar 30 – Apr 3" },
  { term: "Summer Session", dates: "Jun 15 – Jul 10, 2026", exams: "No examinations — enrichment only", note: "Optional arts & sports intensives" },
];

export function AcademicsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <SectionHead kicker="Academics" title="A curriculum of depth, taught by specialists." body="Six disciplines carry the program from Grade 5 upward, with studio and laboratory work woven into every week — not bolted on at the end." />

      <div className="grid lg:grid-cols-2 gap-6 mt-12">
        {CURRICULUM.map((c, i) => (
          <Reveal key={c.stage} delay={(i % 2) * 80}>
            <Card className="p-7 h-full hover:shadow-lg hover:shadow-navy-900/6 transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display font-bold text-xl">{c.stage}</h3>
                <Badge tone={i % 2 ? "navy" : "emerald"}>Stage {i + 1}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {c.subjects.map((s) => <span key={s} className="text-[0.78rem] font-semibold bg-ink/5 border border-line rounded-md px-2.5 py-1.5">{s}</span>)}
              </div>
              <p className="text-[0.88rem] text-mute mt-4 leading-relaxed border-t border-line pt-4 flex gap-2.5"><FileCheck2 className="w-4 h-4 text-em-600 shrink-0 mt-0.5" />{c.assess}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* calendar */}
      <div className="mt-20">
        <Reveal><SectionHead kicker="Academic calendar 2025–26" title="Three terms, deliberately paced." /></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {CALENDAR.map((t, i) => (
            <Reveal key={t.term} delay={i * 80}>
              <div className="rounded-xl border border-line bg-card p-6 h-full hover:border-em-200 transition-colors">
                <span className="w-10 h-10 rounded-lg bg-navy-100 text-navy-800 grid place-items-center"><CalendarRange className="w-5 h-5" /></span>
                <h3 className="font-display font-bold text-lg mt-4">{t.term}</h3>
                <p className="text-[0.85rem] font-semibold text-em-700 mt-1 tnum">{t.dates}</p>
                <p className="text-[0.85rem] text-mute mt-3 leading-relaxed">{t.exams}</p>
                <p className="text-[0.78rem] text-gold-600 font-semibold mt-3">{t.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* examination system */}
      <div className="mt-20 grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5">
          <Reveal><SectionHead kicker="Examination system" title="Assessment that reports growth, not just rank." body="Grades follow a transparent 4.0 scale. Reassessment windows mean a difficult September never has to define a May report card." /></Reveal>
          <Link to="/admissions" className="mt-6 inline-block"><Button variant="dark">Join the next cohort <ArrowRight className="w-4 h-4" /></Button></Link>
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={80}>
            <div className="rounded-xl border border-line bg-card overflow-hidden">
              <div className="grid grid-cols-3 px-6 py-3.5 bg-paper/70 border-b border-line text-[0.72rem] font-bold uppercase tracking-wider text-mute">
                <span>Score band</span><span>Grade</span><span>GPA points</span>
              </div>
              {[["90 – 100", "A+", "4.0"], ["80 – 89", "A", "3.6"], ["70 – 79", "B+", "3.2"], ["60 – 69", "B", "2.8"], ["55 – 59", "C+", "2.4"], ["50 – 54", "C", "2.0"], ["40 – 49", "D", "1.5"], ["Below 40", "F", "0.0"]].map((r, i) => (
                <div key={r[0]} className={`grid grid-cols-3 px-6 py-3 text-[0.88rem] ${i % 2 ? "bg-paper/40" : ""}`}>
                  <span className="tnum font-semibold">{r[0]}</span>
                  <span><Badge tone={i < 2 ? "emerald" : i < 6 ? "navy" : "red"}>{r[1]}</Badge></span>
                  <span className="tnum text-mute">{r[2]}</span>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <div className="flex gap-3.5 items-start rounded-xl border border-line bg-card p-5"><span className="w-9 h-9 rounded-lg bg-em-100 text-em-700 grid place-items-center shrink-0"><ClipboardList className="w-4.5 h-4.5" /></span><p className="text-[0.85rem] text-mute leading-relaxed"><b className="text-ink">Report cards</b> issue termly with grades, GPA, effort markers and teacher commentary — reviewed in conference with families.</p></div>
              <div className="flex gap-3.5 items-start rounded-xl border border-line bg-card p-5"><span className="w-9 h-9 rounded-lg bg-gold-100 text-gold-600 grid place-items-center shrink-0"><Award className="w-4.5 h-4.5" /></span><p className="text-[0.85rem] text-mute leading-relaxed"><b className="text-ink">Honor roll</b> recognizes GPA 3.6+ each term; the Meridian Medal goes to one graduate per year for character and craft.</p></div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
