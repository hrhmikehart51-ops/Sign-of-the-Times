import { products, materials, sizes } from "@/lib/business";
import { dataUrlToSavedUpload, fileToSavedUpload, type SavedUpload } from "@/lib/uploads";

export type QuotePayload = {
  customerName: string;
  email: string;
  phone: string;
  productType: string;
  size: string;
  material: string;
  quantity: number;
  dateNeeded: string;
  preferredConsultTime: string;
  notes: string;
};

export type ParsedQuoteSubmission = {
  quote: QuotePayload;
  files: SavedUpload[];
};

export class QuoteValidationError extends Error {
  constructor(public details: Record<string, string>) {
    super("Validation failed");
  }
}

const requiredFields = [
  "customerName",
  "email",
  "phone",
  "productType",
  "size",
  "material",
  "quantity",
  "dateNeeded"
] as const;

function valueFromForm(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateQuotePayload(payload: QuotePayload) {
  const errors: Record<string, string> = {};

  for (const field of requiredFields) {
    if (!String(payload[field]).trim()) {
      errors[field] = "Required";
    }
  }

  if (payload.email && !validateEmail(payload.email)) {
    errors.email = "Use a valid email address.";
  }

  if (payload.quantity && (!Number.isInteger(payload.quantity) || payload.quantity < 1)) {
    errors.quantity = "Quantity must be at least 1.";
  }

  if (payload.productType && !(products as readonly string[]).includes(payload.productType)) {
    errors.productType = "Choose a supported product type.";
  }

  if (payload.size && !(sizes as readonly string[]).includes(payload.size)) {
    errors.size = "Choose a supported size.";
  }

  if (payload.material && !(materials as readonly string[]).includes(payload.material)) {
    errors.material = "Choose a supported material.";
  }

  return errors;
}

export async function parseMultipartQuote(formData: FormData): Promise<ParsedQuoteSubmission> {
  const quote: QuotePayload = {
    customerName: valueFromForm(formData, "customerName"),
    email: valueFromForm(formData, "email"),
    phone: valueFromForm(formData, "phone"),
    productType: valueFromForm(formData, "productType"),
    size: valueFromForm(formData, "size"),
    material: valueFromForm(formData, "material"),
    quantity: Number.parseInt(valueFromForm(formData, "quantity"), 10),
    dateNeeded: valueFromForm(formData, "dateNeeded"),
    preferredConsultTime: valueFromForm(formData, "preferredConsultTime"),
    notes: valueFromForm(formData, "notes")
  };

  const errors = validateQuotePayload(quote);
  if (Object.keys(errors).length > 0) {
    throw new QuoteValidationError(errors);
  }

  const files: SavedUpload[] = [];
  const artwork = formData.get("artwork");
  if (artwork instanceof File && artwork.size > 0) {
    files.push(await fileToSavedUpload("artwork", artwork));
  }

  const mockup = formData.get("mockupJpeg");
  if (mockup instanceof File && mockup.size > 0) {
    files.push(await fileToSavedUpload("mockupJpeg", mockup));
  }

  const mockupDataUrl = valueFromForm(formData, "mockupJpegDataUrl");
  if (mockupDataUrl) {
    files.push(await dataUrlToSavedUpload("mockupJpeg", mockupDataUrl));
  }

  return { quote, files };
}

export async function parseJsonQuote(body: unknown): Promise<ParsedQuoteSubmission> {
  if (!body || typeof body !== "object") {
    throw new Error("JSON body is required.");
  }

  const source = body as Record<string, unknown>;
  const quote: QuotePayload = {
    customerName: String(source.customerName || "").trim(),
    email: String(source.email || "").trim(),
    phone: String(source.phone || "").trim(),
    productType: String(source.productType || "").trim(),
    size: String(source.size || "").trim(),
    material: String(source.material || "").trim(),
    quantity: Number.parseInt(String(source.quantity || ""), 10),
    dateNeeded: String(source.dateNeeded || "").trim(),
    preferredConsultTime: String(source.preferredConsultTime || "").trim(),
    notes: String(source.notes || "").trim()
  };

  const errors = validateQuotePayload(quote);
  if (Object.keys(errors).length > 0) {
    throw new QuoteValidationError(errors);
  }

  const files: SavedUpload[] = [];
  if (typeof source.mockupJpegDataUrl === "string" && source.mockupJpegDataUrl.trim()) {
    files.push(await dataUrlToSavedUpload("mockupJpeg", source.mockupJpegDataUrl));
  }

  return { quote, files };
}
