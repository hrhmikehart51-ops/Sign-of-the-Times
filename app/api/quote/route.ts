import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { sendQuoteEmail } from "@/lib/email";
import { getClientIp, jsonError, jsonOk } from "@/lib/http";
import {
  parseJsonQuote,
  parseMultipartQuote,
  QuoteValidationError,
  type ParsedQuoteSubmission
} from "@/lib/quote";
import { persistSubmissionFiles } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let parsed: ParsedQuoteSubmission;

  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      parsed = await parseMultipartQuote(await request.formData());
    } else if (contentType.includes("application/json")) {
      parsed = await parseJsonQuote(await request.json());
    } else {
      return jsonError("Use multipart/form-data or application/json.", 415);
    }
  } catch (error) {
    if (error instanceof QuoteValidationError) {
      return jsonError("Validation failed", 400, error.details);
    }

    return jsonError(error instanceof Error ? error.message : "Invalid quote submission.");
  }

  const submissionId = randomUUID();
  const submittedAt = new Date().toISOString();
  const ip = getClientIp(request);

  try {
    const emailResult = await sendQuoteEmail({
      submissionId,
      quote: parsed.quote,
      files: parsed.files
    });

    const shouldPersistLocally = !emailResult.sent || process.env.NODE_ENV !== "production";
    const persisted = shouldPersistLocally
      ? await saveLocalSubmission({
          submissionId,
          submittedAt,
          ip,
          parsed,
          emailResult
        })
      : undefined;

    return jsonOk(
      {
        ok: true,
        submissionId,
        submittedAt,
        message: emailResult.sent
          ? "Quote request submitted. Sign of the Times will follow up manually."
          : "Mock success: quote request was accepted and saved locally for testing.",
        email: emailResult,
        files: parsed.files.map((file) => ({
          fieldName: file.fieldName,
          originalName: file.originalName,
          type: file.type,
          size: file.size
        })),
        local: persisted
          ? {
              submissionDir: persisted.submissionDir,
              metadataPath: persisted.metadataPath
            }
          : undefined
      },
      201
    );
  } catch (error) {
    console.error("Quote submission failed", error);
    return jsonError("Quote submission failed. Please try again or call 360-891-9477.", 500);
  }
}

async function saveLocalSubmission({
  submissionId,
  submittedAt,
  ip,
  parsed,
  emailResult
}: {
  submissionId: string;
  submittedAt: string;
  ip: string;
  parsed: ParsedQuoteSubmission;
  emailResult: Awaited<ReturnType<typeof sendQuoteEmail>>;
}) {
  const persisted = await persistSubmissionFiles(submissionId, parsed.files);
  await mkdir(persisted.submissionDir, { recursive: true });

  const metadataPath = join(persisted.submissionDir, "submission.json");
  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        submissionId,
        submittedAt,
        ip,
        quote: parsed.quote,
        files: persisted.files.map((file) => ({
          fieldName: file.fieldName,
          originalName: file.originalName,
          safeName: file.safeName,
          type: file.type,
          size: file.size,
          localPath: file.localPath
        })),
        email: emailResult,
        todo:
          "TODO before launch: upload artwork/mockups to cloud storage instead of relying on local temp files."
      },
      null,
      2
    )
  );

  return {
    submissionDir: persisted.submissionDir,
    metadataPath
  };
}
