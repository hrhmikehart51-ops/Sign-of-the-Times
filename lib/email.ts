import { businessInfo } from "@/lib/business";
import type { QuotePayload } from "@/lib/quote";
import type { SavedUpload } from "@/lib/uploads";

export type QuoteEmailResult = {
  configured: boolean;
  sent: boolean;
  provider: "resend" | "none";
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
  files
}: EmailSubmission): Promise<QuoteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !to || !from || to.includes("[INSERT EMAIL]")) {
    return {
      configured: false,
      sent: false,
      provider: "none",
      reason: "Resend is not configured. Submission was saved locally for development."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: `New quote request: ${quote.productType} from ${quote.customerName}`,
      html: buildEmailHtml(submissionId, quote, files),
      attachments: files.map((file) => ({
        filename: file.safeName,
        content: file.buffer.toString("base64")
      }))
    })
  });

  if (!response.ok) {
    return {
      configured: true,
      sent: false,
      provider: "resend",
      reason: await response.text()
    };
  }

  const result = (await response.json()) as { id?: string };
  return {
    configured: true,
    sent: true,
    provider: "resend",
    messageId: result.id
  };
}

function buildEmailHtml(submissionId: string, quote: QuotePayload, files: SavedUpload[]) {
  const rows = [
    ["Submission ID", submissionId],
    ["Name", quote.customerName],
    ["Email", quote.email],
    ["Phone", quote.phone],
    ["Product", quote.productType],
    ["Size", quote.size],
    ["Material", quote.material],
    ["Quantity", String(quote.quantity)],
    ["Date needed", quote.dateNeeded],
    ["Preferred consult time", quote.preferredConsultTime || "Not requested"],
    ["Notes", quote.notes || "None"],
    ["Files", files.length ? files.map((file) => `${file.originalName} (${file.type})`).join(", ") : "None"]
  ];

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
      <h1 style="font-size:22px">New quote request</h1>
      <p>${businessInfo.name} received a quote request from the website prototype.</p>
      <table style="border-collapse:collapse;width:100%;max-width:680px">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <th style="border:1px solid #e5e7eb;padding:8px;text-align:left;background:#f9fafb;width:170px">${escapeHtml(label)}</th>
                <td style="border:1px solid #e5e7eb;padding:8px">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
