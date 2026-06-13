import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Icon, Button, Card, Badge } from "@/components/ui";
import { PLANS, PLATFORM_META } from "@/data/mock";
import { cn } from "@/utils/cn";
import mockupImg from "../../public/images/dashboard-mockup.png";

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const STEPS = [
  { icon: "link", title: "Connect", desc: "Link your Instagram, Facebook, and TikTok business accounts in one click via OAuth." },
  { icon: "keyboard", title: "Set Keywords", desc: "Write the words to watch for. Choose Exact Match or All match mode." },
  { icon: "bolt", title: "Auto-Reply", desc: "EchoDesk fires your saved reply in under 500ms. Every time. 24/7." },
];

const FEATURES = [
  { icon: "hub", title: "Multi-Channel", desc: "All your Facebook, Instagram, and TikTok messages in one unified desk." },
  { icon: "schedule", title: "24/7 Response", desc: "Customer asking 'kati ho?' at midnight? EchoDesk replies instantly with your price." },
  { icon: "language", title: "Local Context", desc: "Matches Nepali, English, and Romanized Nepali like 'kati parcha' or 'paaila'." },
  { icon: "monitoring", title: "Analytics", desc: "See which keywords trend, peak hours, and credit burn rate at a glance." },
  { icon: "security", title: "Safe & Secure", desc: "Official Meta and TikTok APIs only. No bots. No shadowban risk." },
  { icon: "person_pin", title: "Human Handoff", desc: "Flag any chat for personal follow-up. Never miss a high-value customer." },
];

const FAQS = [
  { q: "Will my Instagram/Facebook account get banned?", a: "No. EchoDesk uses only the official Meta Graph API and TikTok Business API. There are no bots, no scraping, and no shadowban risk — your account stays fully compliant." },
  { q: "Can it understand Romanized Nepali like 'kati ho' or 'vau kati'?", a: "Yes. Our 'All' match mode runs a 4-layer engine including a Romanized Nepali phonetic normalization table plus fuzzy matching, so spelling variants like paila/paaila/payla all map to the same canonical keyword." },
  { q: "What happens when my credits run out?", a: "Auto-replies pause and a persistent upgrade banner appears on your dashboard. Existing rules stay saved — just top up credits to resume instantly." },
  { q: "Does EchoDesk use AI to generate replies?", a: "No AI required. You write the exact reply for each keyword, so every customer gets your approved message — fast, predictable, and on-brand." },
  { q: "Can I target a specific post only?", a: "Yes. Each rule can apply to all posts on a platform or to a specific post URL per platform (Instagram, Facebook, TikTok)." },
  { q: "Which payment methods are supported?", a: "We support eSewa and Khalti in NPR. Credits are added to your wallet instantly after a successful payment." },
  { q: "Is there a mobile app?", a: "EchoDesk is a fully responsive web app that works beautifully on mobile, tablet, and desktop — install it to your home screen for an app-like experience." },
  { q: "What is the difference between Exact Match and All mode?", a: "Exact Match triggers only when the message exactly equals your keyword. All mode runs Exact → Phonetic → Contains → Fuzzy layers to catch typos and Nepali spelling variants." },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["How it Works", "#how"],
    ["Features", "#features"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
  ];
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-standard",
        scrolled && "backdrop-blur-md bg-surface/80 border-b border-outline-variant/30 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <Icon name="graphic_eq" className="text-white text-[18px]" />
          </div>
          <span className="font-display text-xl text-primary font-extrabold">EchoDesk</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map(([l, h]) => (
            <a key={l} href={h} className="text-secondary hover:text-primary transition-standard text-sm font-medium">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-secondary hover:text-primary font-medium text-sm px-3 py-2">
            Login
          </Link>
          <Link to="/login">
            <Button>Start Free Trial</Button>
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <Icon name={open ? "close" : "menu"} className="text-[26px]" />
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-surface-lowest border-b border-outline-variant/20 px-6 py-4 flex flex-col gap-4 animate-slide-up">
          {links.map(([l, h]) => (
            <a key={l} href={h} onClick={() => setOpen(false)} className="text-on-background font-medium py-1">
              {l}
            </a>
          ))}
          <Link to="/login" className="text-secondary font-medium">Login</Link>
          <Link to="/login">
            <Button className="w-full">Start Free Trial</Button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default function Landing() {
  useReveal();
  return (
    <>
      <Helmet>
        <title>EchoDesk — Auto-Reply Hub for Nepali Merchants</title>
        <meta name="description" content="Reply to every customer in milliseconds. Keyword-based auto-replies for Instagram, Facebook & TikTok. No AI required. Built for Nepali merchants." />
      </Helmet>
    <div className="bg-surface">
      <Nav />
      <main>

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8" aria-label="Hero">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-primary-container/10 text-primary font-label-mono uppercase">
            Built for Nepali Merchants
          </Badge>
          <h1 className="font-display font-extrabold text-[28px] sm:text-5xl lg:text-[52px] leading-tight mt-6 tracking-tight">
            Reply to Every Customer.
            <br />
            <span className="text-primary-container">In Milliseconds.</span> No AI Required.
          </h1>
          <p className="text-secondary text-lg mt-6 max-w-2xl mx-auto">
            EchoDesk matches keywords and fires pre-written replies to your Instagram, Facebook, and
            TikTok messages — automatically, every time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/login">
              <Button iconRight="arrow_forward" className="text-base px-7 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" icon="play_circle" className="text-base px-7 py-3" onClick={() => { const el = document.getElementById("how"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>
              Watch Demo
            </Button>
          </div>
          <p className="text-secondary text-[13px] mt-4">
            No credit card required · 5 free triggers · Setup in 3 minutes
          </p>
        </div>

        {/* Mockup */}
        <div className="max-w-5xl mx-auto mt-14 reveal">
          <div className="bg-surface-lowest rounded-xl border border-black/5 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-outline-variant/20 bg-surface-low">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 flex-1 max-w-xs bg-surface-lowest rounded-full px-3 py-1 text-[11px] text-secondary font-mono">
                app.echodesk.com.np/dashboard
              </span>
            </div>
            <img
              src={mockupImg}
              alt="EchoDesk dashboard preview showing stats, activity feed, and keyword rules"
              className="w-full block"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="bg-surface-low border-y border-outline-variant/10 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-label-mono text-secondary uppercase">Trusted by 500+ Nepali Merchants</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mt-6">
            {["Thamel Threads", "Pokhara Pottery", "Everest Eats", "Lalitpur Leather", "Bhaktapur Beads"].map((n) => (
              <span key={n} className="font-display text-lg font-bold opacity-60 hover:opacity-100 transition-standard">
                {n}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            {(["instagram", "facebook", "tiktok"] as const).map((p) => (
              <span key={p} className="flex items-center gap-1.5 font-semibold" style={{ color: PLATFORM_META[p].brand }}>
                <Icon name={PLATFORM_META[p].icon} /> {PLATFORM_META[p].name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8" aria-label="How it works">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center">How It Works</h2>
          <p className="text-secondary text-center mt-3 max-w-xl mx-auto">
            Go from zero to automated replies in three simple steps.
          </p>
          <div className="relative grid md:grid-cols-3 gap-10 mt-16">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-outline-variant/30" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center mx-auto gold-glow relative z-10">
                  <Icon name={s.icon} className="text-[28px]" />
                </div>
                <h3 className="font-display text-xl font-semibold mt-5">{s.title}</h3>
                <p className="text-secondary mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-surface-lowest py-24 sm:py-32 px-4 sm:px-6 lg:px-8" aria-label="Features">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center">Built for Scale, Priced for Local.</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {FEATURES.map((f, i) => (
              <Card key={f.title} hover className="p-6 reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name={f.icon} className="text-[24px]" />
                </div>
                <h3 className="font-display text-lg font-semibold mt-4">{f.title}</h3>
                <p className="text-secondary mt-2 text-[15px]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8" aria-label="Pricing">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center">Simple, Predictable Pricing</h2>
          <p className="text-secondary text-center mt-3 max-w-xl mx-auto">
            All plans include the full feature set. You only pay for credits used.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
            {PLANS.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "p-6 relative flex flex-col",
                  p.popular && "border-2 border-primary-container shadow-xl"
                )}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-label-mono text-[10px] uppercase bg-primary-container text-white px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">NPR {p.price.toLocaleString()}</span>
                </div>
                <p className="text-primary-container font-semibold text-sm mt-1">{p.credits.toLocaleString()} credits</p>
                <ul className="mt-5 space-y-2.5 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-secondary">
                      <Icon name="check_circle" className="text-primary text-[18px] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="mt-6">
                  <Button variant={p.popular ? "gold" : "outline"} className="w-full">
                    {p.price === 0 ? "Start Free" : "Choose Plan"}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
          <p className="text-center text-secondary text-sm mt-8">
            1 credit = 1 auto-reply trigger. Credits deducted only on successful match.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-surface-low py-24 sm:py-32 px-4 sm:px-6 lg:px-8" aria-label="Frequently asked questions">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="mt-12 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group bg-surface-lowest p-5 rounded-xl border border-black/5 open:border-primary/20 transition-standard">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-display text-base font-semibold pr-4">{f.q}</span>
                  <Icon name="expand_more" className="text-secondary group-open:rotate-180 transition-standard shrink-0" />
                </summary>
                <p className="text-secondary mt-3 text-[15px] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center">
                <Icon name="graphic_eq" className="text-white text-[16px]" />
              </div>
              <span className="font-display text-lg text-primary font-extrabold">EchoDesk</span>
            </div>
            <p className="text-secondary text-sm mt-2">Proudly serving Nepali Merchants.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex items-center gap-6 text-sm text-secondary">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link to="/help" className="hover:text-primary">Help Center</Link>
          </nav>
          <div className="flex gap-3">
            {["public", "mail", "chat"].map((i) => (
              <span key={i} className="w-10 h-10 rounded-full bg-surface-high flex items-center justify-center text-secondary hover:text-primary transition-standard cursor-pointer">
                <Icon name={i} className="text-[18px]" />
              </span>
            ))}
          </div>
        </div>
        <p className="text-center text-secondary text-xs mt-8 opacity-70">
          &copy; {new Date().getFullYear()} EchoDesk. All rights reserved. Secure 256-bit SSL encrypted connection.
        </p>
      </footer>
    </main>
    </div>
    </>
  );
}
