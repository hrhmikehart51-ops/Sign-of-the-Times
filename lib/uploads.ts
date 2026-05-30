import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const maxUploadBytes = 25 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "application/pdf",
  "application/postscript",
  "application/illustrator",
  "application/octet-stream"
]);

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".pdf",
  ".svg",
  ".ai",
  ".eps"
]);

export type SavedUpload = {
  fieldName: string;
  originalName: string;
  safeName: string;
  type: string;
  size: number;
  localPath?: string;
  buffer: Buffer;
};

export function sanitizeFileName(name: string) {
  const normalized = name.trim().replace(/[/\\?%*:|"<>]/g, "-");
  return normalized.replace(/\s+/g, "-").slice(0, 120) || "upload";
}

export function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] || "";
}

export function validateUpload(file: File) {
  const errors: string[] = [];
  const extension = getExtension(file.name);

  if (file.size > maxUploadBytes) {
    errors.push(`File must be ${Math.round(maxUploadBytes / 1024 / 1024)}MB or less.`);
  }

  if (!allowedMimeTypes.has(file.type) && !allowedExtensions.has(extension)) {
    errors.push("File must be JPEG, PNG, PDF, SVG, AI, or EPS.");
  }

  return errors;
}

export async function fileToSavedUpload(fieldName: string, file: File): Promise<SavedUpload> {
  const errors = validateUpload(file);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    fieldName,
    originalName: file.name,
    safeName: sanitizeFileName(file.name),
    type: file.type || "application/octet-stream",
    size: file.size,
    buffer
  };
}

export async function dataUrlToSavedUpload(
  fieldName: string,
  dataUrl: string,
  fileName = "mockup.jpg"
): Promise<SavedUpload> {
  const match = dataUrl.match(/^data:(image\/jpeg|image\/jpg);base64,([a-z0-9+/=]+)$/i);
  if (!match) {
    throw new Error("Mockup image must be a JPEG data URL.");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > maxUploadBytes) {
    throw new Error(`Mockup image must be ${Math.round(maxUploadBytes / 1024 / 1024)}MB or less.`);
  }

  return {
    fieldName,
    originalName: fileName,
    safeName: sanitizeFileName(fileName),
    type: "image/jpeg",
    size: buffer.byteLength,
    buffer
  };
}

export async function persistSubmissionFiles(submissionId: string, files: SavedUpload[]) {
  const baseDir =
    process.env.LOCAL_SUBMISSION_DIR ||
    join(tmpdir(), "sign-of-the-times-submissions");
  const submissionDir = join(baseDir, submissionId);

  await mkdir(submissionDir, { recursive: true });

  const saved = await Promise.all(
    files.map(async (file) => {
      const localPath = join(submissionDir, `${file.fieldName}-${file.safeName}`);
      await writeFile(localPath, file.buffer);
      return {
        ...file,
        localPath,
        buffer: Buffer.alloc(0)
      };
    })
  );

  return { submissionDir, files: saved };
}
