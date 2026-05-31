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
    // Send both emails in parallel — shop notification + customer confirmation
    await Promise.all([
      sendViaGmailSmtp({
        user,
        pass,
        to,
        subject: `New quote request: ${quote.productType} — ${quote.customerName}`,
        html: buildEmailHtml(submissionId, quote, files),
        attachments: files.map((f) => ({
          filename: f.originalName,
          contentType: f.type || "application/octet-stream",
          data: f.buffer,
        })),
      }),
      sendViaGmailSmtp({
        user,
        pass,
        to: quote.email,
        subject: `We received your quote request — Sign of the Times`,
        html: buildConfirmationHtml(quote),
      }),
    ]);
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

// ── Raw Gmail SMTP over port 465 (implicit TLS) with MIME attachments ────────

type Attachment = {
  filename: string;
  contentType: string;
  data: Buffer;
};

async function sendViaGmailSmtp(cfg: {
  user: string;
  pass: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<void> {
  const boundary = `----=_Part_${Date.now().toString(36)}`;

  // Build multipart/mixed MIME body
  const parts: string[] = [];

  // HTML part
  parts.push(
    [
      `--${boundary}`,
      "Content-Type: text/html; charset=utf-8",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      encodeQP(cfg.html),
    ].join("\r\n")
  );

  // Attachment parts
  for (const att of cfg.attachments ?? []) {
    const encoded = att.data.toString("base64");
    // Split base64 into 76-char lines (RFC 2045)
    const lines = encoded.match(/.{1,76}/g)?.join("\r\n") ?? encoded;
    const safeName = encodeRFC2047(att.filename);
    parts.push(
      [
        `--${boundary}`,
        `Content-Type: ${att.contentType}; name="${safeName}"`,
        `Content-Disposition: attachment; filename="${safeName}"`,
        "Content-Transfer-Encoding: base64",
        "",
        lines,
      ].join("\r\n")
    );
  }

  const body = parts.join("\r\n") + `\r\n--${boundary}--`;

  const headers = [
    `From: ${businessInfo.name} <${cfg.user}>`,
    `To: ${cfg.to}`,
    `Subject: =?utf-8?B?${b64(cfg.subject)}?=`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    body,
  ].join("\r\n");

  return smtpSend({ user: cfg.user, pass: cfg.pass, to: cfg.to, raw: headers });
}

// ── Core SMTP state-machine ───────────────────────────────────────────────────

function smtpSend(cfg: {
  user: string;
  pass: string;
  to: string;
  raw: string;
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
      if (err) { socket.destroy(); reject(err); }
      else     { socket.end();     resolve();    }
    }

    function send(line: string) {
      socket.write(line + "\r\n");
    }

    // Dot-stuff: any line beginning with "." needs an extra "."
    const safeBody = cfg.raw.replace(/(^|\r\n)\./g, "$1..");

    const steps: Array<() => void> = [
      // [0] After 220 greeting
      () => send("EHLO mail.sign-of-the-times.local"),
      // [1] After 250 EHLO (multi-line — waits for last line)
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
      // [7] After 354 — send full message then terminator
      () => socket.write(safeBody + "\r\n.\r\n"),
      // [8] After 250 message accepted
      () => send("QUIT"),
      // [9] After 221 bye
      () => done(),
    ];

    socket.setTimeout(30_000);
    socket.on("timeout", () => done(new Error("SMTP connection timed out")));
    socket.on("error", (err) => done(err));

    socket.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
      let idx: number;
      while ((idx = buf.indexOf("\r\n")) !== -1) {
        const line = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const code = parseInt(line.slice(0, 3), 10);
        const continued = line[3] === "-"; // "250-..." = more lines coming
        if (!continued) {
          if (code >= 400) { done(new Error(`SMTP ${code}: ${line.trim()}`)); return; }
          const step = steps[state++];
          if (step) step();
        }
      }
    });
  });
}

// ── Encoding helpers ──────────────────────────────────────────────────────────

function b64(s: string) {
  return Buffer.from(s).toString("base64");
}

/** Quoted-printable encode (for HTML body — keeps it readable in email clients) */
function encodeQP(input: string): string {
  return input
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, (c) => {
      const hex = c.codePointAt(0)!.toString(16).toUpperCase();
      // Multi-byte UTF-8 characters
      const bytes = Buffer.from(c, "utf8");
      return [...bytes].map((b) => `=${b.toString(16).toUpperCase().padStart(2, "0")}`).join("");
    })
    .replace(/=\n/g, "=\r\n")
    // Soft line breaks at 76 chars
    .replace(/(.{75})/g, "$1=\r\n");
}

/** RFC 2047 encoded-word for non-ASCII filenames */
function encodeRFC2047(name: string) {
  if (/^[\x20-\x7E]+$/.test(name)) return name; // ASCII — no encoding needed
  return `=?utf-8?B?${b64(name)}?=`;
}

// ── Customer confirmation email ───────────────────────────────────────────────

function buildConfirmationHtml(quote: QuotePayload) {
  const details: [string, string][] = [
    ["Product", quote.productType],
    ["Size", quote.size],
    ["Material", quote.material],
    ["Quantity", String(quote.quantity)],
    ...(quote.sided    ? [["Sides", quote.sided]    as [string, string]] : []),
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
          Questions? Reply to this email or call us at
          <strong>360-891-9477</strong>.
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

// ── Shop notification email ───────────────────────────────────────────────────

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
    ...(quote.sided    ? [["Sides", quote.sided]       as [string, string]] : []),
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
          ${businessInfo.name} · ${businessInfo.address}
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

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
