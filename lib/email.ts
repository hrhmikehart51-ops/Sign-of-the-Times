import tls from "tls";
import { businessInfo } from "@/lib/business";
import type { QuotePayload } from "@/lib/quote";
import type { SavedUpload } from "@/lib/uploads";

export type QuoteEmailResult = {
  configured: boolean;
  sent: boolean;
  provider: "gmail" | "none";
  messageId?: string;
  reason?: string;
};

type EmailSubmission = {
  submissionId: string;
  quote: QuotePayload;
  files: SavedUpload[];
};

export async function sendQuoteEmail({
  submissionId,
  quote,
  files,
}: EmailSubmission): Promise<QuoteEmailResult> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.QUOTE_TO_EMAIL;

  if (!user || !pass || !to) {
    return {
      configured: false,
      sent: false,
      provider: "none",
      reason:
        "Gmail SMTP not configured. Add GMAIL_USER, GMAIL_APP_PASSWORD, and QUOTE_TO_EMAIL to .env.local.",
    };
  }

  try {
    await sendViaGmailSmtp({
      user,
      pass,
      to,
      subject: `New quote request: ${quote.productType} — ${quote.customerName}`,
      html: buildEmailHtml(submissionId, quote, files),
    });
    return { configured: true, sent: true, provider: "gmail" };
  } catch (err) {
    return {
      configured: true,
      sent: false,
      provider: "gmail",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Raw Gmail SMTP over port 465 (implicit TLS) — no packages needed ────────

async function sendViaGmailSmtp(cfg: {
  user: string;
  pass: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    let state = 0;
    let buf = "";
    let settled = false;

    const socket = tls.connect(465, "smtp.gmail.com", {
      servername: "smtp.gmail.com",
    });

    function done(err?: Error) {
      if (settled) return;
      settled = true;
      if (err) {
        socket.destroy();
        reject(err);
      } else {
        socket.end();
        resolve();
      }
    }

    function b64(s: string) {
      return Buffer.from(s).toString("base64");
    }

    function send(line: string) {
      socket.write(line + "\r\n");
    }

    // Each step fires after the previous server response clears
    const steps: Array<() => void> = [
      // [0] After 220 greeting
      () => send("EHLO mail.sign-of-the-times.local"),
      // [1] After 250 EHLO (may be multi-line — handled below)
      () => send("AUTH LOGIN"),
      // [2] After 334 username prompt
      () => send(b64(cfg.user)),
      // [3] After 334 password prompt
      () => send(b64(cfg.pass)),
      // [4] After 235 auth success
      () => send(`MAIL FROM:<${cfg.user}>`),
      // [5] After 250 MAIL FROM
      () => send(`RCPT TO:<${cfg.to}>`),
      // [6] After 250 RCPT TO
      () => send("DATA"),
      // [7] After 354 — send headers + body
      () => {
        // Dot-stuffing: a line that starts with "." must be doubled
        const safeBody = cfg.html.replace(/(^|\r\n)\./g, "$1..");
        const msg = [
          `From: ${businessInfo.name} <${cfg.user}>`,
          `To: ${cfg.to}`,
          `Subject: =?utf-8?B?${b64(cfg.subject)}?=`,
          "MIME-Version: 1.0",
          "Content-Type: text/html; charset=utf-8",
          "",
          safeBody,
        ].join("\r\n");
        socket.write(msg + "\r\n.\r\n");
      },
      // [8] After 250 message accepted
      () => send("QUIT"),
      // [9] After 221 bye
      () => done(),
    ];

    socket.setTimeout(20_000);
    socket.on("timeout", () => done(new Error("SMTP connection timed out")));
    socket.on("error", (err) => done(err));

    socket.on("data", (chunk: Buffer) => {
      buf += chunk.toString();

      // Process complete SMTP response lines
      let idx: number;
      while ((idx = buf.indexOf("\r\n")) !== -1) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        const code = parseInt(line.slice(0, 3), 10);
        const continued = line[3] === "-"; // "250-..." = more lines coming

        if (!continued) {
          if (code >= 400) {
            done(new Error(`SMTP ${code}: ${line.trim()}`));
            return;
          }
          const step = steps[state];
          state++;
          if (step) step();
        }
      }
    });
  });
}

// ── Email HTML builder ────────────────────────────────────────────────────────

function buildEmailHtml(
  submissionId: string,
  quote: QuotePayload,
  files: SavedUpload[]
) {
  const rows: [string, string][] = [
    ["Submission ID", submissionId],
    ["Name", quote.customerName],
    ["Email", quote.email],
    ["Phone", quote.phone],
    ["Product", quote.productType],
    ["Size", quote.size],
    ["Material", quote.material],
    ["Quantity", String(quote.quantity)],
    ["Date needed", quote.dateNeeded],
    [
      "Preferred consult time",
      quote.preferredConsultTime || "Not requested",
    ],
    ["Notes", quote.notes || "None"],
    [
      "Files attached",
      files.length
        ? files.map((f) => `${f.originalName} (${f.type})`).join(", ")
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
          ${businessInfo.name} · ${businessInfo.address}
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;padding:24px 28px;border-radius:0 0 8px 8px">
        <table style="border-collapse:collapse;width:100%">
          ${tableRows}
        </table>
        <p style="margin-top:20px;font-size:12px;color:#9ca3af">
          Submitted via the Sign of the Times website quote form.
        </p>
      </div>
    </div>
  `;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
