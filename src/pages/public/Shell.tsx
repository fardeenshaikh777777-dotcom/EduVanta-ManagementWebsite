import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu, X, ArrowRight, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Megaphone } from "lucide-react";
import { Link, Logo, Button, Input } from "../../components/ui";
import { useApp, useToast, useRoute } from "../../lib/store";
import { school } from "../../lib/data";
import { cx } from "../../lib/core";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/campus", label: "Campus" },
  { to: "/events", label: "Events & News" },
  { to: "/contact", label: "Contact" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const { path } = useRoute();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { db } = useApp();
  const { push } = useToast();

  useEffect(() => { window.scrollTo({ top: 0 }); setMenu(false); }, [path]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const tickerItems = [
    ...db.notices.filter((n) => n.pinned).map((n) => n.title),
    `Admissions open for ${school.term.split(" ")[1]}–27 · Grades K–10`,
    "Annual Science Fair — register before Friday",
    "Parent–Teacher Conference slots now booking",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      {/* announcement ticker */}
      <div className="bg-navy-950 text-white/90 text-[0.78rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 h-9">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-bold text-gold-500 shrink-0 uppercase tracking-wider text-[0.68rem]">
            <Megaphone className="w-3.5 h-3.5" /> Live
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="ticker-track gap-10">
              {[...tickerItems, ...tickerItems].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-em-500 pulse-dot shrink-0" aria-hidden="true" />{t}
                </span>
              ))}
            </div>
          </div>
          <a href="#/login" className="hidden md:block text-em-200 hover:text-white transition-colors font-semibold shrink-0">Portal Login →</a>
        </div>
      </div>

      {/* header */}
      <header className={cx("sticky top-0 z-40 transition-all duration-300 border-b", scrolled ? "bg-card/95 backdrop-blur-md shadow-sm shadow-navy-900/5 border-line" : "bg-card border-transparent")}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[68px]">
          <Link to="/" aria-label="EduVanta home"><Logo /></Link>
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to}
                className={cx("px-3.5 py-2 rounded-lg text-[0.88rem] font-semibold transition-colors",
                  path === n.to || (n.to !== "/" && path.startsWith(n.to)) ? "text-em-700 bg-em-50" : "text-mute hover:text-ink")}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login"><Button variant="outline" size="sm">Portal Login</Button></Link>
            <Link to="/admissions"><Button size="sm">Apply for Admission <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
          </div>
          <button className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-line" onClick={() => setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}>
            {menu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menu && (
          <div className="lg:hidden border-t border-line bg-card anim-fade-in">
            <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col" aria-label="Mobile">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} onClick={() => setMenu(false)}
                  className={cx("px-3 py-3 rounded-lg font-semibold text-[0.95rem] border-b border-line/60 last:border-0", path === n.to ? "text-em-700 bg-em-50" : "text-ink")}>
                  {n.label}
                </Link>
              ))}
              <div className="flex gap-3 py-4">
                <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Portal Login</Button></Link>
                <Link to="/admissions" className="flex-1"><Button className="w-full">Apply Now</Button></Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
      <Footer onSubscribe={() => push("success", "Subscribed", "You'll receive our monthly campus digest.")} />
    </div>
  );
}

function Footer({ onSubscribe }: { onSubscribe: () => void }) {
  const [email, setEmail] = useState("");
  return (
    <footer className="bg-navy-950 text-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <Logo dark />
            <p className="text-[0.88rem] leading-relaxed mt-4 max-w-xs text-white/60">
              A K–10 learning community in Northfield, pairing rigorous academics with the habits of curious, capable people — since {school.founded}.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[Facebook, Instagram, Twitter, Youtube].map((I, i) => (
                <a key={i} href="#/contact" aria-label="Social media link" className="w-9 h-9 grid place-items-center rounded-lg bg-white/8 hover:bg-em-600 hover:text-white transition-colors"><I className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-display font-bold text-white mb-4">Explore</p>
            <ul className="space-y-2.5 text-[0.88rem]">
              {[["About the school", "/about"], ["Academics", "/academics"], ["Admissions", "/admissions"], ["Campus & facilities", "/campus"], ["Events & news", "/events"]].map(([l, to]) => (
                <li key={to}><Link to={to} className="hover:text-em-200 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display font-bold text-white mb-4">Portals</p>
            <ul className="space-y-2.5 text-[0.88rem]">
              {["Admin & staff", "Teachers", "Students", "Parents", "Finance office"].map((l) => (
                <li key={l}><Link to="/login" className="hover:text-em-200 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display font-bold text-white mb-4">Stay in the loop</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) { onSubscribe(); setEmail(""); } }}>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@email.com" aria-label="Email for newsletter" className="!bg-white/8 !border-white/15 !text-white placeholder:!text-white/40" />
              <Button type="submit" variant="gold" size="md" aria-label="Subscribe">Join</Button>
            </form>
            <ul className="mt-6 space-y-2.5 text-[0.83rem] text-white/60">
              <li className="flex gap-2.5 items-start"><MapPin className="w-4 h-4 mt-0.5 text-em-200 shrink-0" />{school.address}</li>
              <li className="flex gap-2.5 items-center"><Phone className="w-4 h-4 text-em-200 shrink-0" />{school.phone}</li>
              <li className="flex gap-2.5 items-center"><Mail className="w-4 h-4 text-em-200 shrink-0" />{school.email}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.78rem] text-white/45">
          <p>© 2026 {school.name}. Crafted for curious minds.</p>
          <p>Accredited by the Council of International Schools · Cognia®</p>
        </div>
      </div>
    </footer>
  );
}
