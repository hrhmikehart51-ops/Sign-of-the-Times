"use client";

import { useRef, useState } from "react";
import { materials, products } from "@/lib/business";

// ── Which products get which extra options ────────────────────────────────────

const PRODUCTS_WITH_SIDES = new Set([
  "Banners",
  "A-frame signs",
  "Real estate signs",
  "Yard signs",
  "Storefront signage",
  "Custom signs",
]);

const PRODUCTS_WITH_GROMMETS = new Set([
  "Banners",
  "Custom signs",
]);

const PRESET_SIZES = [
  "18×24 in",
  "24×36 in",
  "36×48 in",
  "2×4 ft",
  "3×6 ft",
  "4×8 ft",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  customerName: string;
  email: string;
  phone: string;
  orderType: string;
  productType: string;
  size: string;
  material: string;
  quantity: string;
  sided: string;
  grommets: string;
  dateNeeded: string;
  preferredConsultTime: string;
  notes: string;
};

const INITIAL: FormState = {
  customerName: "",
  email: "",
  phone: "",
  orderType: "",
  productType: "Banners",
  size: "24×36 in",
  material: "Banner material",
  quantity: "1",
  sided: "",
  grommets: "",
  dateNeeded: "",
  preferredConsultTime: "",
  notes: "",
};

const CONSULT_SLOTS = [
  "Tuesday morning (9:30–12:00)",
  "Tuesday afternoon (12:00–4:30)",
  "Wednesday morning (9:30–12:00)",
  "Wednesday afternoon (12:00–4:30)",
  "Thursday morning (9:30–12:00)",
  "Thursday afternoon (12:00–4:30)",
  "Friday morning (9:30–12:00)",
  "Friday afternoon (12:00–4:30)",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const showSides    = PRODUCTS_WITH_SIDES.has(form.productType);
  const showGrommets = PRODUCTS_WITH_GROMMETS.has(form.productType);

  function set(key: keyof FormState, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Clear sided/grommets when switching to a product that doesn't support them
      if (key === "productType") {
        if (!PRODUCTS_WITH_SIDES.has(value))    next.sided = "";
        if (!PRODUCTS_WITH_GROMMETS.has(value)) next.grommets = "";
      }
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.customerName.trim()) next.customerName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) next.email = "Valid email required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.productType) next.productType = "Required";
    if (!form.quantity || Number(form.quantity) < 1) next.quantity = "At least 1";
    if (!form.dateNeeded.trim()) next.dateNeeded = "Required";
    if (isCustomSize && !form.size.trim()) next.size = "Enter your custom size";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerError("");

    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => fd.append(k, v));
      if (artwork) fd.append("artwork", artwork);

      const res = await fetch("/api/quote", { method: "POST", body: fd });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please call us at 360-891-9477.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-emerald-900" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Quote request received!
        </h3>
        <p className="mt-2 text-emerald-700">
          We'll follow up at <strong>{form.email}</strong> or <strong>{form.phone}</strong> within one business day.
        </p>
        <p className="mt-1 text-sm text-emerald-600">
          Need it sooner? Call <strong>360-891-9477</strong> — Tue–Fri 9:30 AM–4:30 PM.
        </p>
        <button
          className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
          onClick={() => { setSuccess(false); setForm(INITIAL); setArtwork(null); setIsCustomSize(false); }}
          type="button"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-8 lg:grid-cols-2">

        {/* ── Left col ── */}
        <div className="space-y-6">

          {/* Contact */}
          <Section label="Your contact info">
            <Field label="Full name" error={errors.customerName}>
              <input className={input(errors.customerName)} value={form.customerName}
                onChange={e => set("customerName", e.target.value)} placeholder="Jane Smith" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" error={errors.email}>
                <input className={input(errors.email)} type="email" value={form.email}
                  onChange={e => set("email", e.target.value)} placeholder="jane@example.com" />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input className={input(errors.phone)} type="tel" value={form.phone}
                  onChange={e => set("phone", e.target.value)} placeholder="360-555-0100" />
              </Field>
            </div>
          </Section>

          {/* Job specs */}
          <Section label="What do you need?">

            <TogglePair
              label="New design or reorder?"
              value={form.orderType}
              onChange={v => set("orderType", v)}
              options={["New design", "Reorder"]}
            />

            <Field label="Product type" error={errors.productType}>
              <select className={input(errors.productType)} value={form.productType}
                onChange={e => set("productType", e.target.value)}>
                {products.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>

            {/* Size / Material / Qty */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Size" error={errors.size}>
                <select
                  className={input(errors.size)}
                  value={isCustomSize ? "Custom…" : form.size}
                  onChange={e => {
                    if (e.target.value === "Custom…") {
                      setIsCustomSize(true);
                      set("size", "");
                    } else {
                      setIsCustomSize(false);
                      set("size", e.target.value);
                    }
                  }}
                >
                  {PRESET_SIZES.map(s => <option key={s}>{s}</option>)}
                  <option value="Custom…">Custom…</option>
                </select>
                {isCustomSize && (
                  <input
                    className={`mt-1.5 ${input(errors.size)}`}
                    value={form.size}
                    onChange={e => set("size", e.target.value)}
                    placeholder="e.g. 3×10 ft"
                    autoFocus
                  />
                )}
              </Field>
              <Field label="Material">
                <select className={input()} value={form.material}
                  onChange={e => set("material", e.target.value)}>
                  {materials.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Qty" error={errors.quantity}>
                <input className={input(errors.quantity)} type="number" min="1"
                  value={form.quantity} onChange={e => set("quantity", e.target.value)} />
              </Field>
            </div>

            {/* Sided + Grommets — only for relevant products */}
            {(showSides || showGrommets) && (
              <div className={`grid gap-3 ${showSides && showGrommets ? "grid-cols-2" : "grid-cols-1"}`}>
                {showSides && (
                  <TogglePair
                    label="Sides"
                    value={form.sided}
                    onChange={v => set("sided", v)}
                    options={["Single-sided", "Double-sided"]}
                  />
                )}
                {showGrommets && (
                  <TogglePair
                    label="Grommets"
                    value={form.grommets}
                    onChange={v => set("grommets", v)}
                    options={["With grommets", "Without grommets"]}
                  />
                )}
              </div>
            )}

            <Field label="Notes / design details">
              <textarea
                className={`${input()} min-h-[80px] resize-none`}
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Colors, text, logo placement, special requirements…"
              />
            </Field>
          </Section>
        </div>

        {/* ── Right col ── */}
        <div className="space-y-6">

          {/* Timing */}
          <Section label="When do you need it?">
            <Field label="Date needed" error={errors.dateNeeded}>
              <input className={input(errors.dateNeeded)} value={form.dateNeeded}
                onChange={e => set("dateNeeded", e.target.value)}
                placeholder="e.g. June 20, 2026" />
            </Field>
            <Field label="Come in for a consult (recommended)">
              <select className={input()} value={form.preferredConsultTime}
                onChange={e => set("preferredConsultTime", e.target.value)}>
                <option value="">Just reach out by phone or email</option>
                {CONSULT_SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                Walk-ins welcome · 5809 NE 105th Ave, Vancouver WA · Tue–Fri 9:30 AM–4:30 PM
              </p>
            </Field>
          </Section>

          {/* Artwork */}
          <Section label="Artwork (optional)">
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition hover:border-marine hover:bg-marine/5"
              onClick={() => fileRef.current?.click()}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {artwork ? (
                <div>
                  <p className="text-sm font-semibold text-marine">{artwork.name}</p>
                  <p className="text-xs text-slate-400">{(artwork.size / 1024).toFixed(0)} KB · click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Drop your logo or artwork here</p>
                  <p className="text-xs text-slate-400">JPEG preferred · PNG, PDF, SVG, AI, EPS also accepted · up to 25 MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf,image/svg+xml,.ai,.eps"
              className="hidden"
              onChange={e => setArtwork(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-slate-400">
              No artwork yet? No problem — we can work from a description or help you design from scratch.
            </p>
          </Section>

          {/* What happens next */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">What happens next</p>
            <ol className="space-y-2">
              {(form.orderType === "Reorder"
                ? [
                    "We receive your request and reach out within one business day.",
                    "We'll confirm your existing design and quantity — no proof needed unless you're making changes.",
                    "Once confirmed, we go straight to print. Come pick it up when it's ready.",
                  ]
                : [
                    "We receive your request and reach out within one business day.",
                    "We'll go over your design — by phone or even better, in person at the shop.",
                    "You get a digital proof to approve before anything goes to press. Every new design gets one.",
                  ]
              ).map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-500">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-marine/20 text-[10px] font-bold text-marine">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {form.orderType === "New design" && (
              <p className="mt-3 rounded-lg bg-signal/10 px-3 py-2 text-xs font-medium text-ink">
                ✓ Every new design includes a digital proof — you approve it before we print anything.
              </p>
            )}
          </div>

          {/* CTA */}
          <div>
            {serverError && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {serverError}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-signal px-6 py-4 text-base font-black text-ink shadow-md transition hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
              style={{ fontFamily: "'Oswald', sans-serif", letterSpacing: "1px" }}
            >
              {busy ? "Sending your request…" : "SEND QUOTE REQUEST →"}
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              Prefer to call?{" "}
              <a className="font-semibold text-marine hover:underline" href="tel:3608919477">
                360-891-9477
              </a>{" "}
              · Tue–Fri 9:30 AM – 4:30 PM
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function input(error?: string) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-ink placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
    error
      ? "border-red-400 bg-red-50 focus:ring-red-300"
      : "border-slate-200 bg-white focus:border-marine focus:ring-marine/20"
  }`;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function TogglePair({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string];
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-slate-600">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`flex-1 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
              value === opt
                ? "border-marine bg-marine text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-marine/40 hover:text-marine"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
