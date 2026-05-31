// TO ADD REAL CANVA EMBEDS: replace each embedUrl: "" with your Canva embed URL
// In Canva: Share → "..." → Embed → copy the iframe src

import { businessInfo } from "@/lib/business";

const CANVA_TEMPLATES = [
  { name: "Banner", desc: "24×36 · 36×48 · Custom sizes", icon: "🚩", embedUrl: "", templateUrl: "https://www.canva.com/create/banners/" },
  { name: "Yard Sign", desc: "18×24 standard · stake-ready", icon: "📋", embedUrl: "", templateUrl: "https://www.canva.com/create/yard-signs/" },
  { name: "Real Estate Sign", desc: "18×24 Correx · open house · for sale", icon: "🏡", embedUrl: "", templateUrl: "https://www.canva.com/create/real-estate-signs/" },
  { name: "Window Graphic", desc: "Custom size · indoor & outdoor", icon: "🪟", embedUrl: "", templateUrl: "https://www.canva.com/create/window-graphics/" },
  { name: "Stickers & Decals", desc: "Die-cut · rectangular · any shape", icon: "🎨", embedUrl: "", templateUrl: "https://www.canva.com/create/stickers/" },
];

const STEPS = [
  { n: "01", title: "Pick a template below", body: 'Click "Open in Canva" for your sign type. Free account needed to edit.' },
  { n: "02", title: "Customize it", body: "Swap in your business name, colors, phone, and logo. Bold text, high contrast." },
  { n: "03", title: "Download as PDF or PNG", body: 'In Canva: Share → Download → "PDF Print" for best quality.' },
  { n: "04", title: "Attach to your quote", body: "Come back here, scroll to the quote form, upload your file, and hit send." },
];

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-slate-50" style={{ fontFamily: "'Open Sans', Arial, sans-serif" }}>

      {/* ── Utility bar ── */}
      <div className="hidden border-b border-white/10 bg-ink/90 py-2 text-xs text-slate-400 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><span className="text-signal">📍</span>5809 NE 105th Ave, Vancouver WA 98662</span>
            <span className="flex items-center gap-1.5"><span className="text-signal">🕘</span>Tue–Fri · 9:30 AM – 4:30 PM</span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`mailto:${businessInfo.publicEmail}`} className="flex items-center gap-1.5 transition hover:text-white"><span className="text-signal">✉️</span>{businessInfo.publicEmail}</a>
            <a href="tel:3608919477" className="flex items-center gap-1.5 font-semibold text-white transition hover:text-signal"><span className="text-signal">📞</span>360-891-9477</a>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-sm font-black text-ink" style={{ fontFamily: "'Oswald', sans-serif" }}>ST</div>
            <div>
              <p className="text-sm font-bold leading-tight text-white" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>SIGN OF THE TIMES</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Vancouver, WA</p>
            </div>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {[["/", "Home"], ["/#services", "Services"], ["/#pricing", "Pricing"], ["/#quote", "Get a quote"]].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-slate-300 transition hover:text-signal">{label}</a>
            ))}
          </nav>
          <a href="tel:3608919477" className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-black text-ink shadow transition hover:bg-amber-400 active:scale-95" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
            360-891-9477
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(140deg, #080f1a 0%, #0c1a2e 40%, #112240 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,180,0,0.07) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-signal/10 blur-3xl" />
        <div className="h-1 w-full bg-gradient-to-r from-signal via-amber-400 to-signal" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-24">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span className="text-xs font-bold uppercase tracking-widest text-signal">Start with a template</span>
            </div>
            <h1 className="text-5xl font-black leading-[1.02] text-white md:text-6xl" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}>
              DESIGN YOUR SIGN<br /><span className="text-signal">IN CANVA.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-300">
              Pick a template, customize it with your text and logo, download it, and attach it to your quote. We handle the printing.
            </p>
            <p className="mt-3 text-sm text-slate-400">Not a designer? No problem — just come in and we'll design it together for free.</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <a href="#templates" className="inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-base font-black text-ink shadow-lg transition hover:bg-amber-400" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>
                BROWSE TEMPLATES
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a href="/#quote" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                Skip to quote form →
              </a>
            </div>
          </div>
        </div>
        <div className="pointer-events-none h-10 w-full" style={{ background: "linear-gradient(140deg, #080f1a 0%, #0c1a2e 100%)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 40%)" }} />
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-marine">How it works</p>
            <h2 className="text-3xl font-black text-ink md:text-4xl" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}>FOUR STEPS TO A FINISHED QUOTE</h2>
          </div>
          <div className="relative mt-12 grid gap-6 md:grid-cols-4">
            <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-slate-200 via-marine/40 to-slate-200 md:block" />
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex flex-col items-center text-center">
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink shadow-md">
                  <span className="text-2xl font-black text-signal" style={{ fontFamily: "'Oswald', sans-serif" }}>{i + 1}</span>
                </div>
                <h3 className="mt-4 text-base font-bold text-ink" style={{ fontFamily: "'Oswald', sans-serif" }}>{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 max-w-[180px]">{step.body}</p>
              </div>
            ))}
          </div>

          {/* Upload instructions */}
          <div className="mt-12 rounded-2xl border border-marine/25 bg-marine/5 p-6 md:flex md:items-start md:gap-6">
            <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-marine/15 text-2xl md:mb-0">📎</div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-ink" style={{ fontFamily: "'Oswald', sans-serif" }}>HOW TO UPLOAD YOUR CANVA FILE TO THE QUOTE FORM</h3>
              <ol className="mt-3 space-y-2">
                {[
                  'In Canva, click "Share" (top right) → "Download" → select "PDF Print" for best quality, or "PNG" for a quick preview.',
                  "Save the file to your computer or phone.",
                  <span key="3">Go to the <a href="/#quote" className="font-semibold text-marine underline hover:text-sky-700">quote form on the homepage</a> and fill in your details.</span>,
                  'In the "Artwork" section, click the upload area and select your Canva file.',
                  'Hit "Send Quote Request" — we\'ll review your design and follow up within one business day.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-marine/20 text-xs font-bold text-marine">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-4 shrink-0 md:mt-0">
              <a href="/#quote" className="inline-flex items-center gap-2 rounded-xl bg-marine px-5 py-3 text-sm font-black text-white transition hover:bg-sky-800" style={{ fontFamily: "'Oswald', sans-serif" }}>
                GO TO QUOTE FORM →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section id="templates" className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-marine">Canva templates</p>
            <h2 className="text-3xl font-black text-ink md:text-4xl" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}>PICK YOUR SIGN TYPE</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">Each button opens a Canva template sized for that sign type. Free Canva account required to edit.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CANVA_TEMPLATES.map((t) => (
              <div key={t.name} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-marine/40 hover:shadow-md">
                <div className="relative bg-slate-100" style={{ paddingBottom: "70%", height: 0 }}>
                  {t.embedUrl ? (
                    <iframe src={t.embedUrl} className="absolute inset-0 h-full w-full border-0" allowFullScreen loading="lazy" title={`${t.name} Canva template`} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                      <span className="text-5xl">{t.icon}</span>
                      <p className="text-xs font-semibold text-slate-400">Template preview coming soon</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-bold text-ink" style={{ fontFamily: "'Oswald', sans-serif" }}>{t.name}</h3>
                  <p className="mt-0.5 flex-1 text-xs text-slate-400">{t.desc}</p>
                  <a href={t.templateUrl} target="_blank" rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-sm font-black text-ink transition hover:bg-amber-400 active:scale-[0.98]"
                    style={{ fontFamily: "'Oswald', sans-serif" }}>
                    Open in Canva →
                  </a>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Don't see your sign type?{" "}
            <a className="font-semibold text-marine hover:underline" href="tel:3608919477">Call us</a> or{" "}
            <a className="font-semibold text-marine hover:underline" href="/#quote">request a quote</a> and we'll handle the design.
          </p>
        </div>
      </section>

      {/* ── Come in CTA ── */}
      <section className="relative overflow-hidden py-14" style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #102033 50%, #176B87 100%)" }}>
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative mx-auto max-w-6xl px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-signal">Or skip the design tool entirely</p>
          <h2 className="mt-2 text-4xl font-black text-white" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}>COME IN AND WE'LL DO IT TOGETHER.</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-300">Walk in, bring your ideas, and we'll design your sign from scratch. Free consult, no appointment needed.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <a href="tel:3608919477" className="inline-flex items-center gap-2 rounded-xl bg-signal px-7 py-3.5 text-base font-black text-ink shadow-lg transition hover:bg-amber-400" style={{ fontFamily: "'Oswald', sans-serif" }}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              CALL 360-891-9477
            </a>
            <a href={businessInfo.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Get directions
            </a>
            <a href="/#quote" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
              Request a quote →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-ink py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Sign of the Times · 5809 NE 105th Ave, Vancouver WA · Tue–Fri 9:30 AM–4:30 PM</p>
        <p className="mt-1">
          <a className="text-signal hover:underline" href="tel:3608919477">360-891-9477</a>
          {" · "}
          <a className="hover:text-white hover:underline" href={`mailto:${businessInfo.publicEmail}`}>{businessInfo.publicEmail}</a>
        </p>
      </footer>
    </main>
  );
}
