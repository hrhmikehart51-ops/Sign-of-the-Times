import { businessInfo } from "@/lib/business";
import type { QuotePayload } from "@/lib/quote";
import type { SavedUpload } from "@/lib/uploads";

export type QuoteEmailResult = {
  configured: boolean;
  sent: boolean;
  provider: "brevo" | "none";
  messageId?: string;
  reason?: string;
};

type EmailSubmission = {
  submissionId: string;
  quote: QuotePayload;
  files: SavedUpload[];
};

// ── Main entry point ──────────────────────────────────────────────────────────

export async function sendQuoteEmail({
  submissionId,
  quote,
  files,
}: EmailSubmission): Promise<QuoteEmailResult> {
  const apiKey    = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_SENDER_EMAIL;
  const to        = process.env.QUOTE_TO_EMAIL;

  if (!apiKey || !fromEmail || !to) {
    return {
      configured: false,
      sent: false,
      provider: "none",
      reason:
        "Brevo not configured. Add BREVO_API_KEY, BREVO_SENDER_EMAIL, and QUOTE_TO_EMAIL to .env.local.",
    };
  }

  try {
    // Fire both emails in parallel
    await Promise.all([
      brevoSend({
        apiKey,
        from: { name: businessInfo.name, email: fromEmail },
        to: [{ email: to }],
        subject: `New quote request: ${quote.productType} — ${quote.customerName}`,
        html: buildShopEmailHtml(submissionId, quote, files),
        attachments: files.map((f) => ({
          name: f.originalName,
          content: f.buffer.toString("base64"),
        })),
      }),
      brevoSend({
        apiKey,
        from: { name: businessInfo.name, email: fromEmail },
        to: [{ email: quote.email, name: quote.customerName }],
        subject: `We received your quote request — Sign of the Times`,
        html: buildConfirmationHtml(quote),
      }),
    ]);

    return { configured: true, sent: true, provider: "brevo" };
  } catch (err) {
    return {
      configured: true,
      sent: false,
      provider: "brevo",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Brevo HTTP API ────────────────────────────────────────────────────────────

type BrevoRecipient  = { email: string; name?: string };
type BrevoAttachment = { name: string; content: string }; // base64 content

async function brevoSend(opts: {
  apiKey: string;
  from: { name: string; email: string };
  to: BrevoRecipient[];
  subject: string;
  html: string;
  attachments?: BrevoAttachment[];
}) {
  const body: Record<string, unknown> = {
    sender:      opts.from,
    to:          opts.to,
    subject:     opts.subject,
    htmlContent: opts.html,
  };

  if (opts.attachments?.length) {
    body.attachment = opts.attachments;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key":      opts.apiKey,
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Brevo API error ${res.status}: ${text}`);
  }
}

// ── Shop notification email ───────────────────────────────────────────────────

function buildShopEmailHtml(
  submissionId: string,
  quote: QuotePayload,
  files: SavedUpload[]
) {
  const rows: [string, string][] = [
    ["Submission ID", submissionId],
    ["Name", quote.customerName],
    ["Email", quote.email],
    ["Phone", quote.phone],
    ...(quote.orderType ? [["Order type", quote.orderType] as [string, string]] : []),
    ["Product", quote.productType],
    ["Size", quote.size],
    ["Material", quote.material],
    ["Quantity", String(quote.quantity)],
    ...(quote.sided    ? [["Sides",    quote.sided]    as [string, string]] : []),
    ...(quote.grommets ? [["Grommets", quote.grommets] as [string, string]] : []),
    ["Date needed", quote.dateNeeded],
    ["Preferred consult time", quote.preferredConsultTime || "Not requested"],
    ["Notes", quote.notes || "None"],
    [
      "Files attached",
      files.length
        ? files.map((f) => `${f.originalName} (${(f.size / 1024).toFixed(0)} KB)`).join(", ")
        : "None",
    ],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
      <tr>
        <th style="border:1px solid #e5e7eb;padding:10px 12px;text-align:left;
                   background:#f9fafb;width:180px;font-size:13px;color:#374151">
          ${esc(label)}
        </th>
        <td style="border:1px solid #e5e7eb;padding:10px 12px;font-size:13px;color:#111827">
          ${esc(value)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:700px">
      <div style="background:#102033;padding:20px 28px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px;color:#F4B400;letter-spacing:1px">
          NEW QUOTE REQUEST
        </h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">
          ${businessInfo.name} · ${businessInfo.address.street}, ${businessInfo.address.city} ${businessInfo.address.state}
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px 28px;border-radius:0 0 8px 8px">
        <table style="border-collapse:collapse;width:100%">
          ${tableRows}
        </table>
        ${
          files.length
            ? `<p style="margin-top:16px;font-size:12px;color:#6b7280">
                📎 ${files.length} file${files.length > 1 ? "s" : ""} attached to this email.
               </p>`
            : ""
        }
        <p style="margin-top:8px;font-size:12px;color:#9ca3af">
          Submitted via the Sign of the Times website quote form.
        </p>
      </div>
    </div>
  `;
}

// ── Customer confirmation email ───────────────────────────────────────────────

function buildConfirmationHtml(quote: QuotePayload) {
  const details: [string, string][] = [
    ["Product",  quote.productType],
    ["Size",     quote.size],
    ["Material", quote.material],
    ["Quantity", String(quote.quantity)],
    ...(quote.sided    ? [["Sides",    quote.sided]    as [string, string]] : []),
    ...(quote.grommets ? [["Grommets", quote.grommets] as [string, string]] : []),
    ["Date needed", quote.dateNeeded],
    ...(quote.preferredConsultTime
      ? [["Consult time", quote.preferredConsultTime] as [string, string]]
      : []),
    ...(quote.notes ? [["Notes", quote.notes] as [string, string]] : []),
  ];

  const tableRows = details
    .map(
      ([label, value]) => `
      <tr>
        <th style="border:1px solid #e5e7eb;padding:9px 12px;text-align:left;
                   background:#f9fafb;width:140px;font-size:13px;color:#374151">
          ${esc(label)}
        </th>
        <td style="border:1px solid #e5e7eb;padding:9px 12px;font-size:13px;color:#111827">
          ${esc(value)}
        </td>
      </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px">
      <div style="background:#102033;padding:20px 28px;border-radius:8px 8px 0 0">
        <h1 style="margin:0;font-size:20px;color:#F4B400;letter-spacing:1px">
          SIGN OF THE TIMES
        </h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8">
          Vancouver, WA · 360-891-9477
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 8px 8px">
        <p style="font-size:16px;margin:0 0 6px">
          Hi <strong>${esc(quote.customerName)}</strong>,
        </p>
        <p style="font-size:14px;color:#374151;margin:0 0 20px">
          Thanks for reaching out! We received your quote request and will be in touch
          within one business day. Here's a summary of what you submitted:
        </p>
        <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
          ${tableRows}
        </table>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin-bottom:20px">
          <p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:#0369a1">
            Want to move faster?
          </p>
          <p style="margin:0;font-size:13px;color:#0c4a6e">
            Stop by the shop at <strong>5809 NE 105th Ave, Vancouver WA</strong> —
            no appointment needed. We're open <strong>Tuesday–Friday, 9:30 AM–4:30 PM</strong>.
            Walk-ins always welcome.
          </p>
        </div>
        <p style="font-size:13px;color:#6b7280;margin:0">
          Questions? Reply to this email or call us at <strong>360-891-9477</strong>.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="font-size:11px;color:#9ca3af;margin:0">
          Sign of the Times · 5809 NE 105th Ave, Vancouver WA 98662 ·
          <a href="mailto:signswa@yahoo.com" style="color:#9ca3af">signswa@yahoo.com</a>
        </p>
      </div>
    </div>
  `;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
