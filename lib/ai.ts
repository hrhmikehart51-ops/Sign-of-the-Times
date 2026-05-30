import { materials, products, sizes } from "@/lib/business";

export type SuggestionRequest = {
  description: string;
  productType?: string;
  size?: string;
  material?: string;
};

export type DesignSuggestion = {
  suggestedHeadline: string;
  supportingText: string;
  colorPalette: string[];
  fontStyleDirection: string;
  layoutSuggestion: string;
  recommendedProductType: string;
  recommendedSize: string;
  recommendedMaterial: string;
  notes: string;
};

export type CanvasTextElement = {
  type: "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight?: "normal" | "bold";
  fontFamily?: "oswald" | "bebas" | "opensans" | "anton";
  letterSpacing?: number;
  textShadow?: boolean;
  align?: "left" | "center" | "right";
};

export type CanvasLayout = {
  backgroundColor: string;
  backgroundGradient?: string; // CSS linear-gradient string
  accentColor?: string;         // stripe / bar accent
  elements: Array<CanvasTextElement>;
  notes: string;
};

export type PlacementRequest = SuggestionRequest & {
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  image: {
    name: string;
    width: number;
    height: number;
    aspectRatio: number;
    fileType?: string;
  };
  elements: Array<{
    type: "text" | "image";
    text?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
  }>;
  placementStyle?: "corner" | "center" | "bottom";
};

export type PlacementSuggestion = {
  image: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  notes: string;
  checklist: string[];
};

type AiSource = "mock" | "openai" | "claude";

export type AiResult<T> = {
  source: AiSource;
  data: T;
};

export function validateSuggestionRequest(body: unknown): SuggestionRequest {
  if (!body || typeof body !== "object") {
    throw new Error("JSON body is required.");
  }

  const request = body as Record<string, unknown>;
  const description = String(request.description || request.prompt || "").trim();
  if (description.length < 8) {
    throw new Error("Describe the sign or banner in at least a few words.");
  }

  return {
    description,
    productType: typeof request.productType === "string" ? request.productType : undefined,
    size: typeof request.size === "string" ? request.size : undefined,
    material: typeof request.material === "string" ? request.material : undefined
  };
}

export function validatePlacementRequest(body: unknown): PlacementRequest {
  const base = validateSuggestionRequest(body);
  const request = body as Record<string, unknown>;
  const canvas = request.canvas as Record<string, unknown> | undefined;
  const image = request.image as Record<string, unknown> | undefined;
  const elements = Array.isArray(request.elements) ? request.elements : [];

  if (!canvas || !image) {
    throw new Error("Canvas and uploaded image metadata are required.");
  }

  const width = Number(canvas.width);
  const height = Number(canvas.height);
  const imageWidth = Number(image.width);
  const imageHeight = Number(image.height);

  if (!width || !height || !imageWidth || !imageHeight) {
    throw new Error("Canvas and image dimensions are required.");
  }

  const rawStyle = request.placementStyle;
  const placementStyle =
    rawStyle === "corner" || rawStyle === "center" || rawStyle === "bottom"
      ? rawStyle
      : undefined;

  return {
    ...base,
    canvas: {
      width,
      height,
      backgroundColor:
        typeof canvas.backgroundColor === "string" ? canvas.backgroundColor : "#ffffff"
    },
    image: {
      name: typeof image.name === "string" ? image.name : "uploaded-artwork",
      width: imageWidth,
      height: imageHeight,
      aspectRatio: Number(image.aspectRatio) || imageWidth / imageHeight,
      fileType: typeof image.fileType === "string" ? image.fileType : undefined
    },
    elements: elements
      .filter((element): element is Record<string, unknown> => {
        return Boolean(element && typeof element === "object");
      })
      .map((element) => ({
        type: element.type === "image" ? "image" : ("text" as "text" | "image"),
        text: typeof element.text === "string" ? element.text : undefined,
        x: Number(element.x) || 0,
        y: Number(element.y) || 0,
        width: Number(element.width) || undefined,
        height: Number(element.height) || undefined,
        fontSize: Number(element.fontSize) || undefined
      })),
    placementStyle
  };
}

export async function getDesignSuggestion(request: SuggestionRequest): Promise<AiResult<DesignSuggestion>> {
  if (process.env.OPENAI_API_KEY) {
    const openAi = await callOpenAiJson<DesignSuggestion>(
      "Return practical sign design guidance as JSON.",
      buildSuggestionPrompt(request)
    );

    if (openAi) {
      return { source: "openai", data: openAi };
    }
  }

  return { source: "mock", data: mockSuggestion(request) };
}

export async function getPlacementSuggestion(
  request: PlacementRequest
): Promise<AiResult<PlacementSuggestion>> {
  if (process.env.OPENAI_API_KEY) {
    const openAi = await callOpenAiJson<PlacementSuggestion>(
      "Return only valid JSON with practical uploaded-art placement for a sign mockup.",
      buildPlacementPrompt(request)
    );

    if (openAi && isPlacementSuggestion(openAi)) {
      return { source: "openai", data: clampPlacement(openAi, request) };
    }
  }

  return { source: "mock", data: mockPlacementSuggestion(request) };
}

export async function getCanvasLayout(request: SuggestionRequest): Promise<AiResult<CanvasLayout>> {
  if (process.env.OPENAI_API_KEY) {
    const openAi = await callOpenAiJson<CanvasLayout>(
      "Return only valid JSON for a sign canvas layout. Match the required schema exactly.",
      buildLayoutPrompt(request)
    );

    if (openAi && isCanvasLayout(openAi)) {
      return { source: "openai", data: openAi };
    }
  }

  return { source: "mock", data: mockCanvasLayout(request) };
}

function buildSuggestionPrompt(request: SuggestionRequest) {
  return [
    `Business: Sign of the Times, a sign and banner company in Vancouver, WA serving Vancouver and the Portland metro area.`,
    `Products: ${products.join(", ")}.`,
    `Common sizes: ${sizes.join(", ")}.`,
    `Materials: ${materials.join(", ")}.`,
    `Customer description: ${request.description}`,
    `Selected product type: ${request.productType || "not selected"}.`,
    `Selected size: ${request.size || "not selected"}.`,
    `Selected material: ${request.material || "not selected"}.`,
    "Return JSON with suggestedHeadline, supportingText, colorPalette, fontStyleDirection, layoutSuggestion, recommendedProductType, recommendedSize, recommendedMaterial, and notes."
  ].join("\n");
}

function buildLayoutPrompt(request: SuggestionRequest) {
  return [
    buildSuggestionPrompt(request),
    "Return the canvas JSON shape exactly:",
    '{"backgroundColor":"#ffffff","elements":[{"type":"text","text":"GRAND OPENING","x":100,"y":80,"fontSize":48,"color":"#000000","fontWeight":"bold"}],"notes":"Short explanation of the design"}',
    "Use 0-1000 canvas coordinates, keep text inside the canvas, and use no more than four text elements."
  ].join("\n");
}

function buildPlacementPrompt(request: PlacementRequest) {
  return [
    `Business: Sign of the Times in Vancouver, WA.`,
    `Product: ${request.productType || "not selected"}. Size: ${request.size || "not selected"}. Material: ${request.material || "not selected"}.`,
    `Customer description: ${request.description}.`,
    `Canvas: ${request.canvas.width}x${request.canvas.height}, background ${request.canvas.backgroundColor}.`,
    `Uploaded image: ${request.image.name}, ${request.image.width}x${request.image.height}, aspect ${request.image.aspectRatio.toFixed(2)}, type ${request.image.fileType || "unknown"}.`,
    `Existing elements: ${JSON.stringify(request.elements.slice(0, 8))}.`,
    request.placementStyle ? `Placement style requested: ${request.placementStyle}. For "corner" place top-right as a logo. For "center" center it large. For "bottom" place bottom-right as a small supporting mark.` : "",
    "Recommend a print-safe placement for the uploaded image. Keep it inside the canvas, away from edges, and avoid covering primary text.",
    "Return JSON exactly: {\"image\":{\"x\":620,\"y\":80,\"width\":280,\"height\":160},\"notes\":\"why this placement works\",\"checklist\":[\"short practical check\"]}"
  ]
    .filter(Boolean)
    .join("\n");
}

async function callOpenAiJson<T>(system: string, prompt: string): Promise<T | null> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: system
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    })
  });

  if (!response.ok) {
    console.warn("OpenAI request failed", response.status, await response.text());
    return null;
  }

  const result = (await response.json()) as { output_text?: string };
  const outputText = result.output_text;
  if (!outputText) {
    return null;
  }

  try {
    return JSON.parse(outputText) as T;
  } catch {
    return null;
  }
}

function mockSuggestion(request: SuggestionRequest): DesignSuggestion {
  const lower = request.description.toLowerCase();
  const isEvent = lower.includes("grand") || lower.includes("opening") || lower.includes("sale");
  const isRealEstate = lower.includes("real estate") || lower.includes("open house");
  const isVehicle = lower.includes("vehicle") || lower.includes("truck") || lower.includes("van");

  return {
    suggestedHeadline: isEvent ? "GRAND OPENING" : isRealEstate ? "OPEN HOUSE" : "MAKE YOUR MESSAGE STAND OUT",
    supportingText: isEvent
      ? "New location now open in Vancouver"
      : isRealEstate
        ? "Saturday 12-3 PM | Call for details"
        : "Clear, bold, readable from the street",
    colorPalette: isRealEstate
      ? ["#0f172a", "#ffffff", "#f97316"]
      : ["#0f172a", "#f8fafc", "#2563eb", "#facc15"],
    fontStyleDirection:
      "Use a bold sans-serif headline with a simple supporting line. Keep contrast high and avoid small details.",
    layoutSuggestion:
      "Place the headline in the upper third, supporting text below it, and reserve one corner for phone, logo, or address details.",
    recommendedProductType: request.productType || (isVehicle ? "Vehicle lettering" : isRealEstate ? "Real estate signs" : "Banners"),
    recommendedSize: request.size || (isVehicle ? "Custom size" : isRealEstate ? "18x24" : "24x36"),
    recommendedMaterial:
      request.material || (isVehicle ? "Vinyl/sticker material" : isRealEstate ? "Correx 4 mil" : "Banner material"),
    notes: "Mock response. Add OPENAI_API_KEY to switch this route to live AI suggestions."
  };
}

function mockCanvasLayout(request: SuggestionRequest): CanvasLayout {
  const suggestion = mockSuggestion(request);

  return {
    backgroundColor: suggestion.colorPalette[1] || "#ffffff",
    elements: [
      {
        type: "text",
        text: suggestion.suggestedHeadline,
        x: 90,
        y: 110,
        fontSize: 58,
        color: suggestion.colorPalette[0] || "#000000",
        fontWeight: "bold"
      },
      {
        type: "text",
        text: suggestion.supportingText,
        x: 100,
        y: 210,
        fontSize: 28,
        color: suggestion.colorPalette[2] || "#2563eb",
        fontWeight: "normal"
      },
      {
        type: "text",
        text: "360-891-9477",
        x: 100,
        y: 300,
        fontSize: 24,
        color: suggestion.colorPalette[0] || "#000000",
        fontWeight: "bold"
      }
    ],
    notes: "Mock layout generated from the description. Frontend can apply this directly to a Konva or Fabric canvas."
  };
}

function mockPlacementSuggestion(request: PlacementRequest): PlacementSuggestion {
  const margin = Math.max(54, Math.round(request.canvas.width * 0.06));
  const lowerProduct = (request.productType || "").toLowerCase();
  const uploadedAspect = request.image.aspectRatio || 1;
  const style = request.placementStyle;

  // Size the image based on style
  let maxWidth: number;
  let maxHeight: number;
  if (style === "center") {
    maxWidth = request.canvas.width * 0.5;
    maxHeight = request.canvas.height * 0.45;
  } else if (style === "bottom") {
    maxWidth = request.canvas.width * 0.22;
    maxHeight = request.canvas.height * 0.22;
  } else {
    // corner (default)
    maxWidth =
      lowerProduct.includes("vehicle") || lowerProduct.includes("window")
        ? request.canvas.width * 0.38
        : request.canvas.width * 0.28;
    maxHeight = request.canvas.height * 0.3;
  }

  let width = Math.min(maxWidth, maxHeight * uploadedAspect);
  let height = width / uploadedAspect;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * uploadedAspect;
  }

  const textElements = request.elements.filter((element) => element.type === "text");
  const headline = textElements.reduce(
    (largest, element) =>
      (element.fontSize || 0) > (largest?.fontSize || 0) ? element : largest,
    textElements[0]
  );

  let x: number;
  let y: number;
  let notes: string;

  if (style === "center") {
    x = Math.round((request.canvas.width - width) / 2);
    y = Math.round((request.canvas.height - height) / 2);
    notes = "Centered as the main visual element — works best when the image is the primary focus.";
  } else if (style === "bottom") {
    x = request.canvas.width - width - margin;
    y = request.canvas.height - height - margin;
    notes = "Small supporting mark in the bottom-right corner — keeps the headline prominent.";
  } else {
    // corner: top-right by default, flip to top-left if headline is on the right
    x = request.canvas.width - width - margin;
    y = margin;
    if (headline && headline.x > request.canvas.width * 0.45) {
      x = margin;
    }
    if (lowerProduct.includes("real estate") || lowerProduct.includes("yard")) {
      y = request.canvas.height - height - margin;
    }
    if (lowerProduct.includes("vehicle")) {
      x = Math.round((request.canvas.width - width) / 2);
      y = request.canvas.height - height - margin;
    }
    notes =
      "Placed in the logo corner — secondary focal zone with a safe margin so the headline stays readable.";
  }

  return clampPlacement(
    {
      image: {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      },
      notes,
      checklist: [
        "Keep important logo details at least 5–10% in from the edge.",
        "Use high contrast between the uploaded art and the background.",
        "For final print, send the original vector/PDF artwork when available."
      ]
    },
    request
  );
}

function clampPlacement(
  placement: PlacementSuggestion,
  request: PlacementRequest
): PlacementSuggestion {
  const margin = Math.max(32, Math.round(request.canvas.width * 0.04));
  const maxWidth = request.canvas.width - margin * 2;
  const maxHeight = request.canvas.height - margin * 2;
  const width = Math.max(60, Math.min(Math.round(placement.image.width), maxWidth));
  const height = Math.max(60, Math.min(Math.round(placement.image.height), maxHeight));
  const x = Math.max(margin, Math.min(Math.round(placement.image.x), request.canvas.width - width - margin));
  const y = Math.max(margin, Math.min(Math.round(placement.image.y), request.canvas.height - height - margin));

  return {
    image: { x, y, width, height },
    notes: placement.notes || "Placement generated for the uploaded artwork.",
    checklist: Array.isArray(placement.checklist)
      ? placement.checklist.slice(0, 4)
      : ["Confirm final artwork resolution before print."]
  };
}

function isCanvasLayout(value: unknown): value is CanvasLayout {
  if (!value || typeof value !== "object") {
    return false;
  }

  const layout = value as CanvasLayout;
  return (
    typeof layout.backgroundColor === "string" &&
    Array.isArray(layout.elements) &&
    layout.elements.every(
      (element) =>
        element.type === "text" &&
        typeof element.text === "string" &&
        typeof element.x === "number" &&
        typeof element.y === "number" &&
        typeof element.fontSize === "number" &&
        typeof element.color === "string"
    )
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────

/** Shorthand builder with correct return type */

function isPlacementSuggestion(value: unknown): value is PlacementSuggestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const suggestion = value as PlacementSuggestion;
  return (
    Boolean(suggestion.image) &&
    typeof suggestion.image.x === "number" &&
    typeof suggestion.image.y === "number" &&
    typeof suggestion.image.width === "number" &&
    typeof suggestion.image.height === "number" &&
    typeof suggestion.notes === "string" &&
    Array.isArray(suggestion.checklist)
  );
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatAction =
  | { type: "applyLayout"; layout: CanvasLayout }
  | { type: "updateQuote"; fields: Record<string, string> }
  | { type: "moveImage"; x: number; y: number; width?: number; height?: number }
  | { type: "setBackground"; color: string }
  | { type: "addText"; text: string; x: number; y: number; fontSize: number; color: string; fontWeight?: "normal" | "bold" };

export type ChatResponse = {
  reply: string;
  actions?: ChatAction[];
};

export type ChatContext = {
  productType?: string;
  size?: string;
  material?: string;
  notes?: string;
  uploadedImage?: { name: string; width: number; height: number };
  canvasElements?: Array<{ type: string; text?: string; fontSize?: number }>;
};

export type ChatImageInput = {
  name: string;
  mimeType: string;
  base64: string; // resized JPEG base64
};

export type ChatRequest = {
  messages: ChatMessage[];
  context: ChatContext;
  images?: ChatImageInput[]; // images attached to the current/latest user message
};

export function validateChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== "object") {
    throw new Error("JSON body required.");
  }

  const req = body as Record<string, unknown>;
  const messages = Array.isArray(req.messages)
    ? req.messages
        .filter((m): m is Record<string, unknown> => Boolean(m && typeof m === "object"))
        .map((m) => ({
          role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
          content: typeof m.content === "string" ? m.content : ""
        }))
        .filter((m) => m.content.length > 0)
    : [];

  if (messages.length === 0) {
    throw new Error("At least one message is required.");
  }

  const ctx = (
    req.context && typeof req.context === "object" ? req.context : {}
  ) as Record<string, unknown>;

  const rawImage = ctx.uploadedImage;
  const uploadedImage =
    rawImage && typeof rawImage === "object"
      ? {
          name: String((rawImage as Record<string, unknown>).name || ""),
          width: Number((rawImage as Record<string, unknown>).width) || 0,
          height: Number((rawImage as Record<string, unknown>).height) || 0
        }
      : undefined;

  const rawImages = req.images;
  const images: ChatImageInput[] = Array.isArray(rawImages)
    ? rawImages
        .filter((i): i is Record<string, unknown> => Boolean(i && typeof i === "object"))
        .map((i) => ({
          name: String(i.name || "upload"),
          mimeType: String(i.mimeType || "image/jpeg"),
          base64: String(i.base64 || "")
        }))
        .filter((i) => i.base64.length > 0)
    : [];

  return {
    messages,
    context: {
      productType: typeof ctx.productType === "string" ? ctx.productType : undefined,
      size: typeof ctx.size === "string" ? ctx.size : undefined,
      material: typeof ctx.material === "string" ? ctx.material : undefined,
      notes: typeof ctx.notes === "string" ? ctx.notes : undefined,
      uploadedImage,
      canvasElements: Array.isArray(ctx.canvasElements)
        ? ctx.canvasElements
            .filter((e): e is Record<string, unknown> => Boolean(e && typeof e === "object"))
            .map((e) => ({
              type: String(e.type || "text"),
              text: typeof e.text === "string" ? e.text : undefined,
              fontSize: typeof e.fontSize === "number" ? e.fontSize : undefined
            }))
        : undefined
    },
    images: images.length > 0 ? images : undefined
  };
}

export async function getChatResponse(request: ChatRequest): Promise<AiResult<ChatResponse>> {
  // Prefer Claude (Anthropic) → OpenAI → mock
  if (process.env.ANTHROPIC_API_KEY) {
    const result = await callAnthropicChat(request);
    if (result) return { source: "claude", data: result };
  }

  if (process.env.OPENAI_API_KEY) {
    const result = await callOpenAiChat(request);
    if (result) return { source: "openai", data: result };
  }

  return { source: "mock", data: mockChatResponse(request) };
}

function canvasHeightForSize(size: string | undefined): number {
  if (size === "18x24") return 1333;
  if (size === "36x48") return 1333;
  if (size === "24x36") return 1500;
  return 1500;
}

function buildChatSystemPrompt(context: ChatContext): string {
  const h = canvasHeightForSize(context.size);
  const canvasSummary = context.canvasElements?.length
    ? `Canvas has ${context.canvasElements.length} elements: ${context.canvasElements
        .map((e) => (e.type === "text" ? `"${e.text}" at ${e.fontSize}px` : "image"))
        .join(", ")}.`
    : "Canvas is empty.";

  const imageSummary = context.uploadedImage
    ? `Canvas artwork: ${context.uploadedImage.name}.`
    : "No artwork on canvas yet.";

  return `You are a seasoned professional sign designer at Sign of the Times in Vancouver, WA. You have designed thousands of signs over 15 years.

## YOUR ROLE
Guide the customer through a complete design process. You are proactive, opinionated, and build things immediately. You never just describe — you BUILD and apply layouts.

## CONVERSATION FLOW (follow this every time)
1. LEARN: What are they making? Business/event name? Where will it be seen?
2. COLLECT BRAND ASSETS: "Upload your logo, a brand photo, or a reference sign."
3. CONFIRM COPY: "What MUST the sign say? Give me the exact text."
4. BUILD: Apply a full layout immediately.
5. ITERATE: "What should change? Colors? Text size? Different layout?"

## WHEN IMAGES ARE UPLOADED (CRITICAL)
You are a multimodal AI with vision. When the customer uploads images:
- DESCRIBE what you see: "I can see a [logo/photo/sign] with [colors/style]"
- EXTRACT colors from the logo/brand and USE THEM in your layout
- MATCH the visual tone: bold, minimal, classic, playful, etc.
- If it's a reference sign: acknowledge what works, improve it
- If it's a logo: use the dominant colors as your palette
- If it's a storefront photo: note the existing brand feel
Always reference the upload in your reply — show the customer you actually looked at it.

## DESIGN RULES BY SIGN TYPE

ROADSIDE BANNERS (24×36, 36×48, canvas height ~${h}):
- Headline: y=140–165, fontSize=80–96, bold — must read at 50+ feet
- Supporting: y=270–295, fontSize=28–34
- Contact: y=345–370, fontSize=24–28
- Max 3 lines total. High contrast only.

YARD SIGNS (18×24, canvas height 1333):
- Headline: y=130–155, fontSize=84–100, bold
- Detail: y=260–280, fontSize=30–36
- Max 2 lines. Stark contrast.

REAL ESTATE (18×24 Correx):
- White background (#ffffff)
- Headline: y=110, fontSize=72–84, dark navy
- Date/time: y=225, fontSize=32–36, teal (#176B87)
- Address: y=280, fontSize=24–26, dark
- Phone: y=330, fontSize=22–24, red (#B9472D)

VEHICLE LETTERING (custom size):
- Headline/company: y=115–135, fontSize=72–86, bold
- Tagline: y=240–260, fontSize=28–32
- Phone: y=305–325, fontSize=28–30, bold
- Reads at 40 mph = max 3 lines, extreme contrast

STOREFRONT / WINDOW:
- More detail allowed (close viewing)
- Hours, logo area, services — up to 5 lines
- Centered layout with breathing room

## COLOR PRINCIPLES
- ALWAYS high contrast: dark bg + white/gold, or white bg + dark navy
- Gold (#F4B400) on dark navy (#0f172a) = maximum road visibility
- White (#ffffff) + navy (#102033) + teal (#176B87) = clean professional
- Red (#B9472D) on white = urgency/sale
- Never: similar values (dark on dark, light on light)

## CANVAS COORDINATES
Width: 1000 units. Height for ${context.size || "24x36"}: ${h} units.
Safe margin: keep all text ≥ 70px from edges.

## CURRENT STATE
Product: ${context.productType || "not selected"} | Size: ${context.size || "not selected"} | Material: ${context.material || "not selected"}
${context.notes ? `Notes: ${context.notes}` : ""}
${canvasSummary}
${imageSummary}

## RESPONSE FORMAT — JSON ONLY, NO EXCEPTIONS:
{"reply":"1–3 sentences. Confident, specific, designer voice. Reference what you see in uploads.","actions":[...]}

## FONTS AVAILABLE
- "oswald"  → Oswald (condensed sans — BEST for headlines, all-caps, high impact)
- "bebas"   → Bebas Neue (ultra-condensed display — HUGE single-word callouts)
- "opensans"→ Open Sans (body, supporting copy, URLs, phone numbers)
- "anton"   → Anton (heavy impact — dramatic single words)

Always set fontFamily on every text element. Use "oswald" for bold headlines, "opensans" for supporting text.
Use letterSpacing: 2–6 on Oswald headlines for premium look.
Use textShadow: true on dark backgrounds for depth.
Use backgroundGradient (CSS linear-gradient) instead of flat backgroundColor for premium feel.
Use accentColor to add a color stripe at top and bottom of the sign.

## ACTION TYPES:

Full layout (use this constantly — build something on every meaningful exchange):
{"type":"applyLayout","layout":{"backgroundColor":"#0c1a2e","backgroundGradient":"linear-gradient(160deg,#0c1a2e 0%,#102033 100%)","accentColor":"#F4B400","elements":[{"type":"text","text":"HEADLINE","x":65,"y":150,"fontSize":88,"color":"#F4B400","fontWeight":"bold","fontFamily":"oswald","letterSpacing":4,"textShadow":true},{"type":"text","text":"Supporting copy here","x":70,"y":278,"fontSize":30,"color":"#e2e8f0","fontWeight":"normal","fontFamily":"opensans"},{"type":"text","text":"360-891-9477","x":70,"y":336,"fontSize":30,"color":"#F4B400","fontWeight":"bold","fontFamily":"oswald"}],"notes":"One sentence describing design rationale"}}

Move uploaded logo/image:
{"type":"moveImage","x":700,"y":70,"width":240,"height":130}

Background only:
{"type":"setBackground","color":"#ffffff"}

Add text element:
{"type":"addText","text":"FREE COFFEE TODAY","x":70,"y":410,"fontSize":28,"color":"#F4B400","fontWeight":"bold"}

Update quote specs:
{"type":"updateQuote","fields":{"productType":"Banners","size":"24x36","material":"Banner material"}}

Remember: BUILD the design on every exchange. The canvas must always reflect your latest thinking.`;
}

async function callAnthropicChat(request: ChatRequest): Promise<ChatResponse | null> {
  const system = buildChatSystemPrompt(request.context);

  // Build message array — attach images to the LAST user message if present
  type AnthropicContent = string | Array<Record<string, unknown>>;
  const msgs: Array<{ role: string; content: AnthropicContent }> = request.messages.map(
    (msg, idx) => {
      const isLastUser =
        msg.role === "user" && idx === request.messages.length - 1 && request.images?.length;

      if (isLastUser && request.images) {
        const contentParts: Array<Record<string, unknown>> = [
          ...request.images.map((img) => ({
            type: "image",
            source: {
              type: "base64",
              media_type: img.mimeType,
              data: img.base64
            }
          })),
          { type: "text", text: msg.content }
        ];
        return { role: msg.role, content: contentParts };
      }

      return { role: msg.role, content: msg.content };
    }
  );

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 2000,
      system,
      messages: [
        ...msgs,
        { role: "assistant", content: "{" } // prefill for JSON
      ]
    })
  });

  if (!response.ok) {
    console.warn("Anthropic chat failed", response.status, await response.text());
    return null;
  }

  const result = (await response.json()) as { content?: Array<{ type: string; text: string }> };
  const text = result.content?.find((c) => c.type === "text")?.text;
  if (!text) return null;

  return parseChatJson("{" + text);
}

async function callOpenAiChat(request: ChatRequest): Promise<ChatResponse | null> {
  const system = buildChatSystemPrompt(request.context);

  // Build input with optional vision content on last user message
  type OaiContent = string | Array<Record<string, unknown>>;
  const input: Array<{ role: string; content: OaiContent }> = [
    { role: "system", content: system },
    ...request.messages.map((msg, idx) => {
      const isLastUser =
        msg.role === "user" && idx === request.messages.length - 1 && request.images?.length;
      if (isLastUser && request.images) {
        return {
          role: msg.role,
          content: [
            ...request.images.map((img) => ({
              type: "input_image",
              image_url: `data:${img.mimeType};base64,${img.base64}`
            })),
            { type: "input_text", text: msg.content }
          ]
        };
      }
      return { role: msg.role, content: msg.content };
    })
  ];

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input,
      text: { format: { type: "json_object" } }
    })
  });

  if (!response.ok) {
    console.warn("OpenAI chat failed", response.status, await response.text());
    return null;
  }

  const result = (await response.json()) as { output_text?: string };
  if (!result.output_text) return null;
  return parseChatJson(result.output_text);
}

function parseChatJson(raw: string): ChatResponse | null {
  try {
    const parsed = JSON.parse(raw) as { reply?: unknown; actions?: unknown };
    if (typeof parsed.reply !== "string") return null;
    const actions = Array.isArray(parsed.actions)
      ? parsed.actions.filter(isChatAction)
      : undefined;
    return { reply: parsed.reply, actions: actions?.length ? actions : undefined };
  } catch {
    return null;
  }
}

function isChatAction(value: unknown): value is ChatAction {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  switch (a.type) {
    case "applyLayout":
      return isCanvasLayout(a.layout);
    case "updateQuote":
      return Boolean(a.fields && typeof a.fields === "object");
    case "moveImage":
      return typeof a.x === "number" && typeof a.y === "number";
    case "setBackground":
      return typeof a.color === "string";
    case "addText":
      return (
        typeof a.text === "string" &&
        typeof a.x === "number" &&
        typeof a.y === "number" &&
        typeof a.fontSize === "number" &&
        typeof a.color === "string"
      );
    default:
      return false;
  }
}


// ── Mock designer — guided, layout-first ──────────────────────────────────────

function mkLayout(
  bg: string,
  els: Array<Omit<CanvasTextElement, "type">>,
  notes: string,
  opts?: { gradient?: string; accent?: string }
): CanvasLayout {
  return {
    backgroundColor: bg,
    backgroundGradient: opts?.gradient,
    accentColor: opts?.accent,
    elements: els.map((e) => ({ type: "text" as const, ...e })),
    notes
  };
}

/** Derive canvas y-positions appropriate for the selected sign size */
function pos(size: string | undefined) {
  if (size === "18x24") return { y1: 125, y2: 248, y3: 308, fs1: 82, fs2: 29, fs3: 23 };
  if (size === "36x48") return { y1: 135, y2: 258, y3: 318, fs1: 88, fs2: 32, fs3: 26 };
  // default 24x36
  return { y1: 148, y2: 275, y3: 338, fs1: 88, fs2: 32, fs3: 27 };
}

function mockChatResponse(request: ChatRequest): ChatResponse {
  const last = request.messages.at(-1);
  const lower = last?.content.toLowerCase() ?? "";
  const ctx = request.context;
  const p = pos(ctx.size);
  const hasImages = (request.images?.length ?? 0) > 0;
  const msgCount = request.messages.length;

  // ── Image uploads ──────────────────────────────────────────────────────────
  if (hasImages) {
    const imgName = request.images![0].name;
    const isReference =
      imgName.toLowerCase().includes("sign") || imgName.toLowerCase().includes("reference") ||
      lower.includes("reference") || lower.includes("existing") || lower.includes("previous");

    if (isReference) {
      return {
        reply: `Studied your reference sign — I see the structure. I'm improving the contrast and type hierarchy significantly. Apply this, then tell me what text to swap in.`,
        actions: [{
          type: "applyLayout",
          layout: mkLayout(
            "#0f172a",
            [
              { text: "YOUR HEADLINE HERE", x: 70, y: p.y1, fontSize: p.fs1, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 2, textShadow: true },
              { text: "Based on your reference sign", x: 70, y: p.y2, fontSize: p.fs2, color: "#f1f5f9", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: p.y3, fontSize: p.fs3 + 2, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "Reference-inspired — improved contrast and Oswald headline.",
            { gradient: "linear-gradient(160deg, #0f172a 60%, #1e293b 100%)", accent: "#F4B400" }
          )
        }]
      };
    }

    return {
      reply: `Got your image — ${imgName}. I've built a layout that works with your brand assets. Apply it, then use the canvas upload to place the image. What's the exact headline text?`,
      actions: [{
        type: "applyLayout",
        layout: mkLayout(
          "#0f172a",
          [
            { text: ctx.productType === "Real estate signs" ? "OPEN HOUSE" : "YOUR BUSINESS", x: 70, y: p.y1, fontSize: p.fs1, color: "#ffffff", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 3 },
            { text: "Vancouver, WA", x: 70, y: p.y2, fontSize: p.fs2, color: "#F4B400", fontWeight: "normal", fontFamily: "opensans" },
            { text: "360-891-9477", x: 70, y: p.y3, fontSize: p.fs3 + 2, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald" }
          ],
          "Brand-matched layout — swap in the real copy.",
          { gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", accent: "#F4B400" }
        )
      }]
    };
  }

  // ── Grand opening ──────────────────────────────────────────────────────────
  if (lower.includes("grand opening") || lower.includes("now open") || lower.includes("opening soon") || lower.includes("new location")) {
    return {
      reply: "Navy + gold is the gold standard for grand openings — maximum road visibility. What's the business name? I'll make it the hero.",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#0c1a2e",
            [
              { text: "GRAND OPENING", x: 65, y: p.y1, fontSize: p.fs1, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 4, textShadow: true },
              { text: "Now open in Vancouver, WA", x: 70, y: p.y2, fontSize: p.fs2, color: "#e2e8f0", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: p.y3, fontSize: p.fs3 + 3, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "Navy + Oswald gold — proven high-visibility grand opening layout.",
            { gradient: "linear-gradient(160deg, #0c1a2e 0%, #102033 55%, #0c1a2e 100%)", accent: "#F4B400" }
          )
        },
        { type: "updateQuote", fields: { productType: "Banners", size: "24x36", material: "Banner material" } }
      ]
    };
  }

  // ── Real estate ────────────────────────────────────────────────────────────
  if (lower.includes("real estate") || lower.includes("open house") || lower.includes("for sale") || lower.includes("listing") || lower.includes("realtor")) {
    return {
      reply: "Clean white + teal + navy — professional, curb-readable standard. Give me the date, time, and address and I'll populate it.",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#ffffff",
            [
              { text: "OPEN HOUSE", x: 65, y: 88, fontSize: 82, color: "#102033", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 5, textShadow: false },
              { text: "Saturday 12–3 PM", x: 70, y: 214, fontSize: 34, color: "#176B87", fontWeight: "bold", fontFamily: "opensans" },
              { text: "123 Main St, Vancouver WA", x: 70, y: 262, fontSize: 24, color: "#334155", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: 310, fontSize: 26, color: "#B9472D", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "White + navy + teal — clean real estate standard.",
            { accent: "#176B87" }
          )
        },
        { type: "updateQuote", fields: { productType: "Real estate signs", size: "18x24", material: "Correx 4 mil" } }
      ]
    };
  }

  // ── Sale / promo ───────────────────────────────────────────────────────────
  if (lower.includes("sale") || lower.includes("discount") || lower.includes("% off") || lower.includes("promo") || lower.includes("clearance")) {
    return {
      reply: "Red on white = retail stop signal. Giant callout, discount, deadline. What's the % off and any end date?",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#ffffff",
            [
              { text: "SALE", x: 65, y: 72, fontSize: 140, color: "#B9472D", fontWeight: "bold", fontFamily: "bebas", letterSpacing: 6, textShadow: false },
              { text: "UP TO 50% OFF", x: 65, y: 262, fontSize: 46, color: "#102033", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 2 },
              { text: "This weekend only  ·  360-891-9477", x: 70, y: 332, fontSize: 24, color: "#176B87", fontWeight: "normal", fontFamily: "opensans" }
            ],
            "High-urgency sale — Bebas Neue massive callout, red on white.",
            { accent: "#B9472D" }
          )
        }
      ]
    };
  }

  // ── Restaurant / food ──────────────────────────────────────────────────────
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("coffee") || lower.includes("pizza") || lower.includes("taco") || lower.includes("food") || lower.includes("bakery") || lower.includes("bar ")) {
    return {
      reply: "Warm amber — inviting, appetite-forward. What's the name and the main message? Give me the exact copy and I'll build it out.",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#1c0a00",
            [
              { text: "NOW OPEN", x: 65, y: p.y1, fontSize: p.fs1, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 4, textShadow: true },
              { text: "Fresh food · Great atmosphere", x: 70, y: p.y2, fontSize: p.fs2, color: "#fde68a", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: p.y3, fontSize: p.fs3 + 2, color: "#fb923c", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "Dark espresso + amber — warm, upscale food business feel.",
            { gradient: "linear-gradient(150deg, #1c0a00 0%, #2d1200 100%)", accent: "#F4B400" }
          )
        },
        { type: "updateQuote", fields: { productType: "Banners", material: "Banner material" } }
      ]
    };
  }

  // ── Vehicle lettering ──────────────────────────────────────────────────────
  if (lower.includes("vehicle") || lower.includes("truck") || lower.includes("van") || lower.includes("fleet") || lower.includes("car lettering")) {
    return {
      reply: "Vehicle wraps read at 40 mph — 3 lines max, company name huge, phone prominent. What color is the vehicle? I'll set contrast accordingly.",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#ffffff",
            [
              { text: "YOUR BUSINESS NAME", x: 55, y: 105, fontSize: 74, color: "#102033", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 2, textShadow: false },
              { text: "yourwebsite.com  ·  Services listed here", x: 60, y: 228, fontSize: 27, color: "#176B87", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 60, y: 280, fontSize: 36, color: "#B9472D", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "Vehicle wrap — Oswald headline, 3 lines, 40mph readable.",
            { accent: "#B9472D" }
          )
        },
        { type: "updateQuote", fields: { productType: "Vehicle lettering", size: "Custom size", material: "Vinyl/sticker material" } }
      ]
    };
  }

  // ── Yard / campaign signs ──────────────────────────────────────────────────
  if (lower.includes("yard sign") || lower.includes("lawn sign") || lower.includes("political") || lower.includes("campaign")) {
    return {
      reply: "18×24 Correx — stakes in easily, survives the weather. Two lines max, extreme contrast. What name or message goes at the top?",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#102033",
            [
              { text: "YOUR NAME", x: 65, y: 138, fontSize: 94, color: "#ffffff", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 3, textShadow: false },
              { text: "yourwebsite.com", x: 70, y: 278, fontSize: 36, color: "#F4B400", fontWeight: "bold", fontFamily: "opensans" }
            ],
            "Bold yard sign — Oswald headline, dark navy + white + gold.",
            { gradient: "linear-gradient(170deg, #102033 0%, #0c1a2e 100%)", accent: "#F4B400" }
          )
        },
        { type: "updateQuote", fields: { productType: "Yard signs", size: "18x24", material: "Correx 4 mil" } }
      ]
    };
  }

  // ── Window / storefront ────────────────────────────────────────────────────
  if (lower.includes("window") || lower.includes("storefront") || lower.includes("store front") || lower.includes("hours")) {
    return {
      reply: "Window graphics are close-up viewing — you can fit hours, services, promos. Keep the center clear so people can see in. What are your hours?",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#ffffff",
            [
              { text: "OPEN", x: 65, y: 82, fontSize: 98, color: "#176B87", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 8, textShadow: false },
              { text: "Mon – Sat   9 AM – 6 PM", x: 70, y: 218, fontSize: 30, color: "#102033", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: 268, fontSize: 28, color: "#B9472D", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "Clean storefront — teal OPEN headline, hours, phone.",
            { accent: "#176B87" }
          )
        },
        { type: "updateQuote", fields: { productType: "Window graphics", size: "Custom size", material: "Vinyl/sticker material" } }
      ]
    };
  }

  // ── Stickers / decals ─────────────────────────────────────────────────────
  if (lower.includes("sticker") || lower.includes("decal") || lower.includes("bumper") || lower.includes("label")) {
    return {
      reply: "Stickers: 2 lines max, bold shape, strong contrast at small sizes. Die-cut or rectangular? What's the message?",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#102033",
            [
              { text: "YOUR BRAND", x: 70, y: p.y1, fontSize: p.fs1 - 8, color: "#F4B400", fontWeight: "bold", fontFamily: "bebas", letterSpacing: 5 },
              { text: "yourwebsite.com", x: 72, y: p.y2, fontSize: p.fs2, color: "#e2e8f0", fontWeight: "normal", fontFamily: "opensans" }
            ],
            "Bold sticker — Bebas Neue + gold, high-impact at small sizes.",
            { gradient: "linear-gradient(135deg, #102033 0%, #1e3a5f 100%)", accent: "#F4B400" }
          )
        },
        { type: "updateQuote", fields: { productType: "Stickers and decals", material: "Vinyl/sticker material" } }
      ]
    };
  }

  // ── A-frame ────────────────────────────────────────────────────────────────
  if (lower.includes("a-frame") || lower.includes("a frame") || lower.includes("sandwich board") || lower.includes("sidewalk sign")) {
    return {
      reply: "A-frames are close-up — 4–5 lines works, unlike roadside. Great for daily specials, hours, calls-to-action. What's the main offer?",
      actions: [
        {
          type: "applyLayout",
          layout: mkLayout(
            "#ffffff",
            [
              { text: "COME ON IN", x: 65, y: 84, fontSize: 72, color: "#102033", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 3 },
              { text: "Open today  ·  9 AM – 6 PM", x: 70, y: 192, fontSize: 28, color: "#176B87", fontWeight: "normal", fontFamily: "opensans" },
              { text: "Ask about our specials", x: 70, y: 238, fontSize: 24, color: "#475569", fontWeight: "normal", fontFamily: "opensans" },
              { text: "360-891-9477", x: 70, y: 294, fontSize: 24, color: "#B9472D", fontWeight: "bold", fontFamily: "oswald" }
            ],
            "A-frame — close viewing, room for detail.",
            { accent: "#176B87" }
          )
        },
        { type: "updateQuote", fields: { productType: "A-frame signs", material: "Correx 4 mil" } }
      ]
    };
  }

  // ── Move image ─────────────────────────────────────────────────────────────
  if (lower.includes("move") || lower.includes("reposition") || lower.includes("shift") || lower.includes("put the logo") || lower.includes("put the image")) {
    if (lower.includes("corner") || lower.includes("top right") || lower.includes("right corner"))
      return { reply: "Moving the logo to the top-right — headline stays dominant on the left.", actions: [{ type: "moveImage", x: 690, y: 65, width: 250, height: 130 }] };
    if (lower.includes("center") || lower.includes("middle") || lower.includes("big") || lower.includes("feature"))
      return { reply: "Centering and enlarging the logo — works when the image is the hero.", actions: [{ type: "moveImage", x: 200, y: 160, width: 600, height: 300 }] };
    if (lower.includes("bottom") || lower.includes("small") || lower.includes("subtle"))
      return { reply: "Dropping it to the bottom-right as a supporting mark.", actions: [{ type: "moveImage", x: 730, y: 360, width: 200, height: 100 }] };
    if (lower.includes("left") || lower.includes("top left"))
      return { reply: "Moving the logo to the top-left — text runs right.", actions: [{ type: "moveImage", x: 60, y: 60, width: 220, height: 110 }] };
    return { reply: "Repositioning the logo to the top-right corner.", actions: [{ type: "moveImage", x: 700, y: 65, width: 240, height: 125 }] };
  }

  // ── Background color changes ───────────────────────────────────────────────
  if (lower.includes("dark") || lower.includes("navy") || lower.includes("dark background"))
    return { reply: "Going dark navy — stronger contrast, more premium for roadside.", actions: [{ type: "setBackground", color: "#0f172a" }] };
  if (lower.includes("white") || lower.includes("light") || lower.includes("clean"))
    return { reply: "White background — clean and professional. Best for real estate, retail, indoor.", actions: [{ type: "setBackground", color: "#ffffff" }] };
  if (lower.includes("red") || lower.includes("urgent") || lower.includes("bold color"))
    return { reply: "Deep red — high urgency, strong for sales and attention signs.", actions: [{ type: "setBackground", color: "#7f1d1d" }] };
  if (lower.includes("green"))
    return { reply: "Forest green — great for health, outdoor, eco businesses.", actions: [{ type: "setBackground", color: "#14532d" }] };

  // ── Second message — ask for uploads ──────────────────────────────────────
  if (msgCount === 2) {
    return {
      reply: `Perfect. Before I finalize — do you have a logo or brand assets? Upload them with the 📎 button. Even a photo of your storefront or a previous sign helps me nail your style. If not, tell me your brand colors and I'll build from scratch.`
    };
  }

  // ── Colors/style mentioned ────────────────────────────────────────────────
  if (msgCount === 3 || lower.includes("color") || lower.includes("colour") || lower.includes("blue") || lower.includes("brand color")) {
    return {
      reply: `On it. Here's a starting point matching your style preferences. Tell me the exact headline copy and I'll lock it in.`,
      actions: [{
        type: "applyLayout",
        layout: mkLayout(
          "#0f172a",
          [
            { text: "YOUR HEADLINE", x: 65, y: p.y1, fontSize: p.fs1, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald", letterSpacing: 3, textShadow: true },
            { text: "Supporting info here", x: 70, y: p.y2, fontSize: p.fs2, color: "#e2e8f0", fontWeight: "normal", fontFamily: "opensans" },
            { text: "360-891-9477", x: 70, y: p.y3, fontSize: p.fs3 + 2, color: "#F4B400", fontWeight: "bold", fontFamily: "oswald" }
          ],
          "Brand-matched base layout.",
          { gradient: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", accent: "#F4B400" }
        )
      }]
    };
  }

  // ── User provides short copy ───────────────────────────────────────────────
  if (last && last.content.length > 4 && last.content.length < 60 && !lower.includes("?")) {
    const headline = last.content.toUpperCase().replace(/[^A-Z0-9 &'.-]/g, "").slice(0, 28);
    const longHead = headline.length > 18;
    return {
      reply: `Using "${last.content}" as the headline — set in Oswald with tight tracking for maximum impact. What else goes on the sign — supporting text, phone, website?`,
      actions: [{
        type: "applyLayout",
        layout: mkLayout(
          "#0c1a2e",
          [
            { text: headline, x: 65, y: p.y1, fontSize: longHead ? p.fs1 - 16 : p.fs1, color: "#ffffff", fontWeight: "bold", fontFamily: "oswald", letterSpacing: longHead ? 1 : 3, textShadow: true },
            { text: "Vancouver, WA  ·  360-891-9477", x: 70, y: p.y2, fontSize: p.fs2, color: "#F4B400", fontWeight: "normal", fontFamily: "opensans" }
          ],
          "Business name headline — Oswald, dark + white + gold.",
          { gradient: "linear-gradient(155deg, #0c1a2e 0%, #102033 100%)", accent: "#F4B400" }
        )
      }]
    };
  }

  // ── Pricing ────────────────────────────────────────────────────────────────
  if (lower.includes("price") || lower.includes("cost") || lower.includes("how much") || lower.includes("quote")) {
    return {
      reply: "Fill out the quote form in the sidebar — the shop follows up manually with pricing. Faster: call 360-891-9477 Tue–Fri, 9:30 AM–4:30 PM."
    };
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup)/i.test(lower.trim())) {
    return {
      reply: "Hey! What are we making? Give me the business or event name and where the sign will be seen. More detail = better design on the first pass."
    };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return {
    reply: "Tell me more — what's the business or event name, what must the sign say, and where will people see it? Once I have that I'll build a real layout immediately."
  };
}
