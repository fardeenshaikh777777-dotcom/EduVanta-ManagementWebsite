import { useState } from "react";
import { CalendarPlus, MapPin, Clock, Users, ChevronRight, Send, Phone, Mail, Clock4, Facebook, Instagram, Twitter, Youtube, BadgeCheck } from "lucide-react";
import { SectionHead, Reveal, Badge, Button, Tabs, Field, Input, Textarea, Modal, SearchInput } from "../../components/ui";
import { useApp, useToast } from "../../lib/store";
import { school } from "../../lib/data";
import { images, cx, fmtDate, daysUntil } from "../../lib/core";
import type { NewsItem } from "../../lib/core";

export function EventsPage() {
  const { db, update } = useApp();
  const { push } = useToast();
  const [tab, setTab] = useState("events");
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; cap: string } | null>(null);
  const [q, setQ] = useState("");

  const events = [...db.events].filter((e) => e.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.date.localeCompare(b.date));
  const news = [...db.news].sort((a, b) => b.date.localeCompare(a.date));
  const gallery = [
    { src: images.classroom, cap: "Grade 7 seminar — Socratic discussion in English" },
    { src: images.science, cap: "Chemistry practical, senior lab wing" },
    { src: images.library, cap: "Quiet hour in the Aldridge Learning Commons" },
    { src: images.sports, cap: "Inter-house football semi-final" },
    { src: images.computer, cap: "Robotics club, Tuesday session" },
    { src: images.graduation, cap: "Class of 2025, cap toss" },
    { src: images.campus, cap: "Riverbend Campus, main approach" },
    { src: images.hero, cap: "First week back — courtyard, 07:50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <SectionHead kicker="Events & news" title="The campus, in real time." body="Everything happening across Riverbend — from assessment mornings to the winter concert." />
        <SearchInput value={q} onChange={setQ} placeholder="Filter events…" className="w-full md:w-64" />
      </div>

      <div className="mt-10">
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: "events", label: "Events", badge: events.length },
          { id: "news", label: "News & stories", badge: news.length },
          { id: "gallery", label: "Gallery", badge: gallery.length },
        ]} />
      </div>

      {tab === "events" && (
        <div className="mt-8 grid lg:grid-cols-2 gap-5 anim-fade-in">
          {events.length === 0 && <p className="text-mute col-span-2 py-10 text-center">No events match “{q}”.</p>}
          {events.map((e, i) => (
            <Reveal key={e.id} delay={(i % 2) * 70}>
              <article className="group flex gap-5 rounded-xl border border-line bg-card p-5 hover:border-em-200 hover:shadow-lg hover:shadow-navy-900/6 transition-all h-full">
                <div className="shrink-0 w-20 text-center">
                  <span className="block rounded-xl bg-navy-900 text-white py-3">
                    <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-em-200">{new Date(e.date + "T12:00").toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="block font-display font-extrabold text-2xl leading-none tnum">{new Date(e.date + "T12:00").getDate()}</span>
                  </span>
                  <span className={cx("block text-[0.7rem] font-bold mt-2", daysUntil(e.date) <= 7 ? "text-gold-600" : "text-mute")}>{daysUntil(e.date) === 0 ? "Today" : `In ${daysUntil(e.date)}d`}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap"><Badge tone="navy">{e.category}</Badge><span className="text-[0.75rem] text-mute inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{e.attendees} attending</span></div>
                  <h3 className="font-display font-bold text-lg mt-2 leading-snug">{e.title}</h3>
                  <p className="text-[0.85rem] text-mute mt-1.5 leading-relaxed">{e.desc}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-mute mt-3">
                    <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-em-600" />{e.time}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-em-600" />{e.place}</span>
                  </div>
                  <Button size="sm" variant="soft" className="mt-3.5" onClick={() => { update((d) => ({ ...d, events: d.events.map((x) => x.id === e.id ? { ...x, attendees: x.attendees + 1 } : x) })); push("success", "Seat reserved", `You're on the list for ${e.title}.`); }}>
                    <CalendarPlus className="w-3.5 h-3.5" />Reserve a seat
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "news" && (
        <div className="mt-8 space-y-5 anim-fade-in">
          {news.map((n, i) => (
            <Reveal key={n.id} delay={i * 50}>
              <button onClick={() => setArticle(n)} className="group w-full flex flex-col sm:flex-row gap-6 rounded-xl border border-line bg-card p-4 sm:p-5 text-left hover:border-em-200 hover:shadow-lg hover:shadow-navy-900/6 transition-all cursor-pointer">
                <span className="sm:w-60 shrink-0 overflow-hidden rounded-lg">
                  <img src={n.image} alt={n.title} loading="lazy" className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-3 text-[0.75rem] font-semibold text-mute flex-wrap"><Badge tone={i === 0 ? "gold" : "navy"}>{n.tag}</Badge>{fmtDate(n.date)}</span>
                  <span className="font-display font-bold text-xl block mt-2 group-hover:text-em-700 transition-colors">{n.title}</span>
                  <span className="text-[0.9rem] text-mute block mt-2 leading-relaxed">{n.excerpt}</span>
                  <span className="inline-flex items-center gap-1 mt-3 text-[0.83rem] font-bold text-em-700 group-hover:gap-2 transition-all">Read story <ChevronRight className="w-4 h-4" /></span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      )}

      {tab === "gallery" && (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[150px] sm:auto-rows-[185px] anim-fade-in">
          {gallery.map((g, i) => (
            <button key={g.src + i} onClick={() => setLightbox(g)} className={cx("group relative overflow-hidden rounded-xl cursor-pointer", i % 5 === 0 && "col-span-2 row-span-2")} aria-label={`View: ${g.cap}`}>
              <img src={g.src} alt={g.cap} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
              <span className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/45 transition-colors" />
              <span className="absolute bottom-0 left-0 right-0 p-3 text-white text-[0.75rem] font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all bg-gradient-to-t from-navy-950/80 to-transparent pt-8">{g.cap}</span>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!article} onClose={() => setArticle(null)} title={article?.tag ?? ""} wide>
        {article && (
          <div>
            <img src={article.image} alt={article.title} className="w-full aspect-[21/9] object-cover rounded-xl" />
            <h3 className="font-display font-extrabold text-2xl mt-5">{article.title}</h3>
            <p className="text-[0.8rem] text-mute mt-2 flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-em-600" />Campus Communications · {fmtDate(article.date)}</p>
            <p className="text-[0.95rem] leading-relaxed text-ink/85 mt-4">{article.body}</p>
          </div>
        )}
      </Modal>

      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title={lightbox?.cap ?? ""} wide>
        {lightbox && <img src={lightbox.src} alt={lightbox.cap} className="w-full max-h-[70vh] object-contain rounded-xl" />}
      </Modal>
    </div>
  );
}

export function ContactPage() {
  const { push } = useToast();
  const [f, setF] = useState({ name: "", email: "", subject: "General inquiry", message: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Please enter your name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) er.email = "Enter a valid email";
    if (f.message.trim().length < 12) er.message = "Tell us a little more (12+ characters)";
    setErrs(er);
    if (Object.keys(er).length) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setF({ name: "", email: "", subject: "General inquiry", message: "" });
      push("success", "Message sent", "The office replies within one working day.");
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
      <SectionHead kicker="Contact" title="Talk to a human, not a form letter." body="The front office answers every message within one working day. For admissions questions, Ingrid's team picks up the phone." />

      <div className="mt-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Reveal>
            <form onSubmit={submit} className="rounded-2xl border border-line bg-card p-8 grid sm:grid-cols-2 gap-4" noValidate>
              <h3 className="font-display font-bold text-xl sm:col-span-2">Send us a message</h3>
              <Field label="Your name *" error={errs.name}>
                <Input value={f.name} invalid={!!errs.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Full name" />
              </Field>
              <Field label="Email *" error={errs.email}>
                <Input type="email" value={f.email} invalid={!!errs.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@email.com" />
              </Field>
              <Field label="Subject" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {["General inquiry", "Admissions", "Fees & billing", "Campus tour", "Feedback"].map((s) => (
                    <button type="button" key={s} onClick={() => setF({ ...f, subject: s })}
                      className={cx("text-[0.8rem] font-semibold px-3.5 py-2 rounded-lg border transition-colors cursor-pointer", f.subject === s ? "border-em-600 bg-em-50 text-em-700" : "border-line text-mute hover:text-ink")}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Message *" error={errs.message} className="sm:col-span-2">
                <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="How can we help?" className="min-h-[130px]" />
              </Field>
              <div className="sm:col-span-2">
                <Button type="submit" size="lg" disabled={sending}>{sending ? "Sending…" : <><Send className="w-4 h-4" />Send message</>}</Button>
              </div>
            </form>
          </Reveal>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <Reveal delay={80}>
            <div className="rounded-2xl bg-navy-900 text-white p-7">
              <h3 className="font-display font-bold text-xl">Visit the campus</h3>
              <ul className="mt-5 space-y-4 text-[0.9rem]">
                <li className="flex gap-3.5"><span className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0"><MapPin className="w-4.5 h-4.5 text-em-200" /></span><span><b className="block">{school.name}</b><span className="text-white/65 text-[0.85rem]">{school.address}</span></span></li>
                <li className="flex gap-3.5 items-center"><span className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0"><Phone className="w-4.5 h-4.5 text-em-200" /></span><span>{school.phone} · Front office</span></li>
                <li className="flex gap-3.5 items-center"><span className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0"><Mail className="w-4.5 h-4.5 text-em-200" /></span><span>{school.email}</span></li>
                <li className="flex gap-3.5 items-center"><span className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center shrink-0"><Clock4 className="w-4.5 h-4.5 text-em-200" /></span><span>{school.hours}</span></li>
              </ul>
              <div className="flex gap-2.5 mt-6 pt-6 border-t border-white/10">
                {[Facebook, Instagram, Twitter, Youtube].map((I, i) => (
                  <a key={i} href="#/contact" aria-label="Social media" className="w-9 h-9 grid place-items-center rounded-lg bg-white/8 hover:bg-em-600 transition-colors"><I className="w-4 h-4" /></a>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={140}>
            {/* stylized map placeholder */}
            <div className="rounded-2xl border border-line bg-card overflow-hidden relative h-64" role="img" aria-label="Stylized map showing the campus at Scholars Way and Meridian Avenue">
              <svg viewBox="0 0 400 240" className="w-full h-full" aria-hidden="true">
                <rect width="400" height="240" fill="var(--color-em-50)" />
                <g stroke="var(--color-em-200)" strokeWidth="1">
                  {Array.from({ length: 10 }, (_, i) => <line key={"v" + i} x1={i * 44} y1="0" x2={i * 44} y2="240" />)}
                  {Array.from({ length: 6 }, (_, i) => <line key={"h" + i} x1="0" y1={i * 44} x2="400" y2={i * 44} />)}
                </g>
                <path d="M0 150 C120 130 240 170 400 140" stroke="var(--color-em-500)" strokeWidth="10" fill="none" opacity="0.35" />
                <path d="M90 0 L150 240" stroke="var(--color-navy-700)" strokeWidth="8" fill="none" opacity="0.3" />
                <path d="M0 80 L400 60" stroke="var(--color-navy-700)" strokeWidth="6" fill="none" opacity="0.22" />
                <rect x="228" y="92" width="52" height="38" rx="5" fill="var(--color-navy-900)" />
                <text x="254" y="115" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Instrument Sans" fontWeight="700">CAMPUS</text>
              </svg>
              <span className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-full flex flex-col items-center">
                <span className="bg-navy-900 text-white text-[0.72rem] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">18 Scholars' Way</span>
                <MapPin className="w-7 h-7 text-em-600 -mt-0.5 drop-shadow" />
              </span>
              <span className="absolute bottom-3 right-3 text-[0.7rem] font-semibold text-mute bg-card/90 border border-line rounded-md px-2.5 py-1">Interactive map · opens in Maps</span>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}


