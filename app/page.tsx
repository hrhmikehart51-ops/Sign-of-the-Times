import QuoteForm from "@/components/QuoteForm";
import { businessInfo } from "@/lib/business";

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: businessInfo.name,
  telephone: businessInfo.phone,
  email: businessInfo.publicEmail,
  address: {
    "@type": "PostalAddress",
    streetAddress: businessInfo.address.street,
    addressLocality: businessInfo.address.city,
    addressRegion: businessInfo.address.state,
    postalCode: businessInfo.address.postalCode,
    addressCountry: businessInfo.address.country,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:30",
      closes: "16:30",
    },
  ],
  areaServed: ["Vancouver, WA", "Portland metro area"],
  url: "https://example.com",
};

// ── Pricing: leave blank — owner to fill in ──────────────────────────────────
// Replace the "price" field below with real prices once confirmed.
// e.g.  price: "from $39"

const SERVICES = [
  {
    icon: "🚩",
    name: "Banners",
    desc: "Full-color vinyl banners for grand openings, events, storefronts, and promotions.",
    price: "",
    detail: "24×36 · 36×48 · Custom sizes",
    popular: false,
  },
  {
    icon: "🏡",
    name: "Real Estate Signs",
    desc: "Correx yard signs built for Pacific Northwest weather — open house, for sale, sold.",
    price: "",
    detail: "18×24 standard · stake-ready",
    popular: false,
  },
  {
    icon: "📋",
    name: "Yard & Lawn Signs",
    desc: "Campaigns, events, promotions — high-contrast, double-sided Correx signs with stakes.",
    price: "",
    detail: "18×24 · custom sizes available",
    popular: false,
  },
  {
    icon: "🚛",
    name: "Vehicle Lettering",
    desc: "Turn your vehicle into a moving billboard. Cut vinyl lettering or full wraps.",
    price: "",
    detail: "Custom quoted per vehicle",
    popular: false,
  },
  {
    icon: "🪟",
    name: "Window & Storefront",
    desc: "Perforated vinyl, frosted effects, business hours, logos — professional and clean.",
    price: "",
    detail: "Custom size · indoor & outdoor",
    popular: false,
  },
  {
    icon: "🎨",
    name: "Stickers & Decals",
    desc: "Die-cut or rectangular, UV-resistant outdoor vinyl. Minimum orders available.",
    price: "",
    detail: "Custom shapes · weather-resistant",
    popular: false,
  },
  {
    icon: "🅿️",
    name: "A-Frame Signs",
    desc: "Double-sided sidewalk signs for specials, open/closed, directional, and events.",
    price: "",
    detail: "Standard double-sided",
    popular: false,
  },
  {
    icon: "🏢",
    name: "Custom Signage",
    desc: "Lobby signs, magnetic signs, interior & exterior custom fabrication and installs.",
    price: "",
    detail: "Any size · custom quote",
    popular: false,
  },
];

const WHY_US = [
  {
    icon: "🤝",
    title: "In-person first",
    body: "The best signs start with a real conversation. Come in, bring your ideas, and we'll design something together.",
  },
  {
    icon: "✅",
    title: "Proof with every new design",
    body: "Every new design gets a digital proof you approve before we print. Reorders go straight to press.",
  },
  {
    icon: "⚡",
    title: "Fast turnaround",
    body: "Most orders ready within days. Come in for rush orders and we'll make it work.",
  },
  {
    icon: "🎯",
    title: "Local expertise",
    body: "We know what reads well from the road, what holds up in the PNW weather, and what fits your budget.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Come in or send a request",
    body: "Walk into the shop on 105th Ave — no appointment needed. Or fill out the quote form below and we'll reach out the same day.",
  },
  {
    n: "02",
    title: "We design it together",
    body: "In person or over email, we'll nail down the copy, size, material, and layout. You get a digital proof before anything is printed.",
  },
  {
    n: "03",
    title: "Pick it up at the shop",
    body: "Once you approve the proof, we go to press. Most orders are ready within days — swing by during business hours to pick it up.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50" style={{ fontFamily: "'Open Sans', Arial, sans-serif" }}>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        type="application/ld+json"
      />

      {/* ── Utility bar ─────────────────────────────────────────── */}
      <div className="hidden border-b border-white/10 bg-ink/90 py-2 text-xs text-slate-400 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="text-signal">📍</span>
              5809 NE 105th Ave, Vancouver WA 98662
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-signal">🕘</span>
              Tue–Fri · 9:30 AM – 4:30 PM
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href={`mailto:${businessInfo.publicEmail}`} className="flex items-center gap-1.5 transition hover:text-white">
              <span className="text-signal">✉️</span>
              {businessInfo.publicEmail}
            </a>
            <a href="tel:3608919477" className="flex items-center gap-1.5 font-semibold text-white transition hover:text-signal">
              <span className="text-signal">📞</span>
              360-891-9477
            </a>
          </div>
        </div>
      </div>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 shadow-md backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <a href="#" className="flex items-center gap-3 no-underline">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-sm font-black text-ink"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ST
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-white" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>
                SIGN OF THE TIMES
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Vancouver, WA</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              ["#services", "Services"],
              ["#pricing", "Pricing"],
              ["#how-it-works", "How it works"],
              ["/design", "Design a sign"],
              ["#quote", "Get a quote"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="text-sm font-medium text-slate-300 transition hover:text-signal">
                {label}
              </a>
            ))}
          </nav>

          <a
            href="tel:3608919477"
            className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-black text-ink shadow transition hover:bg-amber-400 active:scale-95"
            style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            360-891-9477
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #080f1a 0%, #0c1a2e 40%, #112240 100%)" }}
      >
        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(244,180,0,0.07) 1px, transparent 0)",
            backgroundSize: "40px 40px"
          }} />

        {/* Glow */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-signal/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-marine/10 blur-3xl" />

        <div className="h-1 w-full bg-gradient-to-r from-signal via-amber-400 to-signal" />

        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              <span className="text-xs font-bold uppercase tracking-widest text-signal">
                Vancouver, WA · Portland Metro
              </span>
            </div>

            <h1
              className="text-5xl font-black leading-[1.02] text-white md:text-6xl lg:text-[72px]"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
            >
              CUSTOM SIGNS<br />
              <span className="text-signal">DONE RIGHT.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Banners, yard signs, vehicle lettering, real estate signs, window graphics, stickers, and more.
              Walk-in friendly. Expert advice in person. Proof with every new design.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#quote"
                className="inline-flex items-center gap-2 rounded-xl bg-signal px-8 py-4 text-base font-black text-ink shadow-lg shadow-signal/20 transition hover:bg-amber-400 active:scale-[0.98]"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}
              >
                GET A FREE QUOTE
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="/design"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3a2 2 0 01.586-1.414z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Design a Sign
              </a>
              <a
                href="tel:3608919477"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call 360-891-9477
              </a>
            </div>

            {/* Trust row */}
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
              {[
                { icon: "✅", text: "Proof on new designs" },
                { icon: "⚡", text: "Fast turnaround" },
                { icon: "📍", text: "Local Vancouver shop" },
                { icon: "🎨", text: "Full-color printing" },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="text-base">{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Angled bottom edge */}
        <div
          className="pointer-events-none h-12 w-full"
          style={{ background: "linear-gradient(140deg, #080f1a 0%, #0c1a2e 40%, #112240 100%)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 40%)" }}
        />
      </section>

      {/* ── Why us ──────────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_US.map((w) => (
              <div key={w.title} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/10 text-xl">
                  {w.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.3px" }}>
                    {w.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services + Pricing ──────────────────────────────────── */}
      <section id="services" className="bg-slate-50 py-16">
        <div id="pricing" className="mx-auto max-w-6xl px-5">
          <SectionHeader
            eyebrow="Services &amp; pricing"
            title="What we make"
            sub="Pricing shown below — exact quotes depend on quantity, size, material, and complexity."
          />

          {/* Pricing note banner */}
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-signal/30 bg-signal/10 px-5 py-3 text-center">
            <p className="text-sm text-amber-800">
              <span className="font-bold">Pricing coming soon.</span>{" "}
              Fill out the quote form below or call <strong>360-891-9477</strong> for exact pricing on your project.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <div
                key={s.name}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-marine/40 hover:shadow-md"
              >
                {s.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-signal px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-3 text-3xl">{s.icon}</div>

                <h3
                  className="text-base font-bold text-ink"
                  style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.3px" }}
                >
                  {s.name}
                </h3>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Starting at</p>
                      {s.price ? (
                        <p className="text-xl font-black text-marine" style={{ fontFamily: "'Oswald', sans-serif" }}>
                          {s.price}
                        </p>
                      ) : (
                        <div className="mt-1 h-5 w-20 rounded bg-slate-100" title="Pricing coming soon" />
                      )}
                    </div>
                    <p className="text-right text-[10px] text-slate-400 leading-tight max-w-[90px]">{s.detail}</p>
                  </div>
                  <a
                    href="#quote"
                    className="mt-3 block rounded-lg border border-marine/30 bg-marine/5 px-3 py-2 text-center text-xs font-bold text-marine transition hover:bg-marine hover:text-white"
                  >
                    Request quote →
                  </a>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Volume discounts available on most products.{" "}
            <a className="font-semibold text-marine hover:underline" href="tel:3608919477">Call us</a>{" "}
            or use the quote form below for exact pricing.
          </p>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader
            eyebrow="How it works"
            title="Simple. Local. Done right."
            sub="Walk in or send a request — we handle the design, the proof, and the print."
          />
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            {/* Connector line on desktop */}
            <div className="pointer-events-none absolute left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] top-8 hidden h-px bg-gradient-to-r from-slate-200 via-marine/40 to-slate-200 md:block" />

            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col items-center text-center">
                <div
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink shadow-md"
                >
                  <span
                    className="text-2xl font-black text-signal"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3
                  className="mt-4 text-lg font-bold text-ink"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 max-w-xs">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Consult callout ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16"
        style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #102033 50%, #176B87 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }} />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-signal">In-person · always free · always better</p>
              <h2
                className="mt-2 text-4xl font-black text-white"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
              >
                COME SEE US IN PERSON.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-300">
                Signs are a physical product — and the best results come from a real conversation.
                Come into the shop and we'll look at your space, your brand, and your goals together.
                We'll help you pick the right product, size, and material on the spot.
              </p>
              <p className="mt-3 text-sm text-slate-400">
                No appointment needed during business hours. Walk-ins always welcome.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Address", value: "5809 NE 105th Ave", sub: "Vancouver WA 98662" },
                  { label: "Phone", value: "360-891-9477", sub: "Call us" },
                  { label: "Hours", value: "Tue – Fri", sub: "9:30 AM – 4:30 PM" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 lg:min-w-[220px]">
              <a
                href="tel:3608919477"
                className="flex items-center justify-center gap-2 rounded-xl bg-signal px-6 py-4 text-base font-black text-ink shadow-lg transition hover:bg-amber-400 active:scale-95"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                CALL NOW
              </a>
              <a
                href={businessInfo.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Get directions
              </a>
              <a
                href="#quote"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Book a consult time →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote form ───────────────────────────────────────────── */}
      <section id="quote" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHeader
            eyebrow="Free quote — no obligation"
            title="Tell us about your project"
            sub="We'll follow up within one business day with pricing, options, and a timeline."
          />
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-10">
            <QuoteForm />
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-ink pt-14 pb-8 text-slate-400">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-10 md:grid-cols-4">

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-signal text-sm font-black text-ink"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  ST
                </div>
                <div>
                  <p className="font-bold text-white" style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}>
                    SIGN OF THE TIMES
                  </p>
                  <p className="text-xs text-slate-500">Vancouver, WA's local sign shop</p>
                </div>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">
                Custom signs, banners, vehicle lettering, real estate signs, window graphics, stickers, and more.
                Serving Vancouver and the greater Portland metro area.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="#quote"
                  className="rounded-lg bg-signal px-4 py-2 text-xs font-black text-ink transition hover:bg-amber-400"
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                >
                  GET A QUOTE
                </a>
                <a
                  href="tel:3608919477"
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  360-891-9477
                </a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contact</p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="tel:3608919477" className="flex items-start gap-2 transition hover:text-white">
                    <span className="mt-0.5 text-signal">📞</span>
                    <span>360-891-9477</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${businessInfo.publicEmail}`} className="flex items-start gap-2 transition hover:text-white">
                    <span className="mt-0.5 text-signal">✉️</span>
                    <span>{businessInfo.publicEmail}</span>
                  </a>
                </li>
                <li>
                  <a href={businessInfo.mapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2 transition hover:text-white">
                    <span className="mt-0.5 text-signal">📍</span>
                    <span>5809 NE 105th Ave<br />Vancouver, WA 98662</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Hours</p>
              <ul className="space-y-2 text-sm">
                {[
                  ["Tuesday", "9:30 AM – 4:30 PM"],
                  ["Wednesday", "9:30 AM – 4:30 PM"],
                  ["Thursday", "9:30 AM – 4:30 PM"],
                  ["Friday", "9:30 AM – 4:30 PM"],
                  ["Mon / Sat / Sun", "Closed"],
                ].map(([day, hours]) => (
                  <li key={day} className="flex justify-between gap-4">
                    <span className={hours === "Closed" ? "text-slate-600" : ""}>{day}</span>
                    <span className={hours === "Closed" ? "text-slate-600" : "text-white font-medium"}>
                      {hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs md:flex-row">
            <p>© {new Date().getFullYear()} Sign of the Times · Vancouver, WA</p>
            <p className="text-slate-500">Serving Vancouver, WA &amp; the Portland metro area</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="text-center">
      <p
        className="mb-2 text-xs font-bold uppercase tracking-widest text-marine"
        dangerouslySetInnerHTML={{ __html: eyebrow }}
      />
      <h2
        className="text-3xl font-black text-ink md:text-4xl"
        style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
      >
        {title}
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">{sub}</p>}
    </div>
  );
}
