// ─────────────────────────────────────────────────────────────────────────────
// CANVA DESIGN PAGE — canva-version branch (not live)
//
// HOW TO ACTIVATE:
// 1. Open Canva → create a sign template for each product type
// 2. Click Share → "..." → "Embed" → copy the iframe src URL
// 3. Replace the CANVA_TEMPLATES entries below with your real URLs
// 4. Merge this branch into main when ready
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { businessInfo } from "@/lib/business";

// ── Swap these URLs with real Canva embed/template links ──────────────────────
const CANVA_TEMPLATES = [
  {
    name: "Banner",
    desc: "24×36 · 36×48 · Custom",
    // Replace with your Canva embed URL:
    // e.g. "https://www.canva.com/design/YOUR_ID/view?embed"
    embedUrl: "",
    templateUrl: "https://www.canva.com/create/banners/",
    icon: "🚩",
  },
  {
    name: "Yard Sign",
    desc: "18×24 standard",
    embedUrl: "",
    templateUrl: "https://www.canva.com/create/yard-signs/",
    icon: "📋",
  },
  {
    name: "Real Estate Sign",
    desc: "18×24 Correx",
    embedUrl: "",
    templateUrl: "https://www.canva.com/create/real-estate-signs/",
    icon: "🏡",
  },
  {
    name: "Window Graphic",
    desc: "Custom size",
    embedUrl: "",
    templateUrl: "https://www.canva.com/create/window-graphics/",
    icon: "🪟",
  },
];

export default function DesignPage() {
  return (
    <main
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "'Open Sans', Arial, sans-serif" }}
    >
      {/* ── Nav ── */}
      <header className="border-b border-white/10 bg-ink/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal text-sm font-black text-ink"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ST
            </div>
            <div>
              <p
                className="text-sm font-bold leading-tight text-white"
                style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "0.5px" }}
              >
                SIGN OF THE TIMES
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Vancouver, WA
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/#quote"
              className="text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              Get a quote
            </Link>
            <a
              href="tel:3608919477"
              className="flex items-center gap-2 rounded-lg bg-signal px-4 py-2.5 text-sm font-black text-ink transition hover:bg-amber-400"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              360-891-9477
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="py-14"
        style={{ background: "linear-gradient(140deg, #080f1a 0%, #0c1a2e 100%)" }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-signal via-amber-400 to-signal absolute top-0" />
        <div className="mx-auto max-w-6xl px-5 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-signal">
            Design tool
          </p>
          <h1
            className="text-4xl font-black text-white md:text-5xl"
            style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
          >
            START WITH A TEMPLATE
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            Pick a sign type below, customize the template in Canva, then download
            and attach it to your quote request. Or come in and we'll design it
            together from scratch.
          </p>

          {/* Important note */}
          <div className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
            <p className="text-sm text-amber-200">
              <span className="font-bold">Heads up:</span> These are starting points only.
              Bring your design in and we'll refine it, fix the fonts, and make sure
              it prints perfectly. Final files must be approved by our team.
            </p>
          </div>
        </div>
      </section>

      {/* ── Template grid ── */}
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 md:grid-cols-2">
            {CANVA_TEMPLATES.map((t) => (
              <div
                key={t.name}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h2
                        className="text-base font-bold text-ink"
                        style={{ fontFamily: "'Oswald', sans-serif" }}
                      >
                        {t.name}
                      </h2>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </div>
                  </div>
                  <a
                    href={t.templateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-signal px-3 py-2 text-xs font-black text-ink transition hover:bg-amber-400"
                    style={{ fontFamily: "'Oswald', sans-serif" }}
                  >
                    Open in Canva →
                  </a>
                </div>

                {/* Canva embed — swap embedUrl when ready */}
                <div className="relative bg-slate-100" style={{ paddingBottom: "62.5%", height: 0 }}>
                  {t.embedUrl ? (
                    <iframe
                      src={t.embedUrl}
                      className="absolute inset-0 h-full w-full border-0"
                      allowFullScreen
                      loading="lazy"
                      title={`${t.name} Canva template`}
                    />
                  ) : (
                    // Placeholder shown until real Canva URL is added
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-3xl">
                        {t.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        Canva template coming soon
                      </p>
                      <p className="text-xs text-slate-400">
                        Owner to add embed URL for {t.name}
                      </p>
                      <a
                        href={t.templateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 rounded-lg border border-marine/30 bg-marine/5 px-4 py-2 text-xs font-bold text-marine transition hover:bg-marine hover:text-white"
                      >
                        Browse {t.name} templates on Canva →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section
        className="py-12"
        style={{ background: "linear-gradient(135deg, #0c1a2e 0%, #176B87 100%)" }}
      >
        <div className="mx-auto max-w-6xl px-5 text-center">
          <h2
            className="text-3xl font-black text-white"
            style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
          >
            DESIGNED SOMETHING? BRING IT IN.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Download your Canva design and attach it to a quote request — or come
            into the shop and we'll polish it together before it goes to print.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/#quote"
              className="rounded-xl bg-signal px-7 py-3.5 text-base font-black text-ink transition hover:bg-amber-400"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              ATTACH TO QUOTE →
            </Link>
            <a
              href={businessInfo.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Get directions to the shop
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer note ── */}
      <div className="bg-ink py-6 text-center text-xs text-slate-500">
        <p>
          Canva is an external service. Final designs must be reviewed and approved
          by Sign of the Times before printing.
        </p>
        <p className="mt-1">
          Questions?{" "}
          <a className="text-signal hover:underline" href="tel:3608919477">
            360-891-9477
          </a>{" "}
          · Tue–Fri 9:30 AM – 4:30 PM
        </p>
      </div>
    </main>
  );
}
