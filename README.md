# Sign of the Times Prototype

A one-page Next.js prototype for **Sign of the Times** in Vancouver, WA — a real, demo-ready sign quoting and design tool.

It includes:

- Local-business landing page with structured how-it-works steps
- Quote request form grouped into Contact, Job specs, Artwork, and Consult sections
- Artwork upload (JPEG, PNG, SVG, PDF, AI, EPS)
- Sign/banner mockup canvas using Konva with safe-margin guides
- JPEG export from the canvas
- **AI chat assistant** — sign-shop-specific, context-aware, returns structured layout/quote actions
- Smart place uploaded artwork with three placement styles (logo corner, center feature, bottom mark)
- Placement summary and checklist after Smart place
- AI design suggestions and AI-to-canvas layout
- Quote submission API route
- Resend-ready email delivery
- Local mock submission logging when email is not configured
- Local SEO metadata and LocalBusiness schema

## Quick Start On Mac

Install Node.js if you do not already have it:

```bash
brew install node
```

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev
npm run typecheck
npm run build
npm run start
```

This prototype includes small wrapper scripts for `dev` and `build` that force Next.js to use the WASM compiler and Webpack. That avoids a local macOS code-signing issue seen in this Codex environment with the native Next SWC binary.

## API Routes

### `GET /api/health`

Returns service status and whether Resend/OpenAI/Anthropic are configured.

### `POST /api/ai/suggest`

Accepts JSON:

```json
{
  "description": "Grand opening banner for a coffee shop",
  "productType": "Banners",
  "size": "24x36",
  "material": "Banner material"
}
```

Returns mock suggestions unless `OPENAI_API_KEY` is configured.

### `POST /api/ai/layout`

Accepts the same JSON body and returns canvas-ready layout JSON:

```json
{
  "backgroundColor": "#ffffff",
  "elements": [
    {
      "type": "text",
      "text": "GRAND OPENING",
      "x": 100,
      "y": 80,
      "fontSize": 48,
      "color": "#000000",
      "fontWeight": "bold"
    }
  ],
  "notes": "Short explanation of the design"
}
```

### `POST /api/ai/placement`

Accepts the job description, canvas dimensions, current canvas elements, uploaded image metadata, and an optional `placementStyle` (`"corner"` | `"center"` | `"bottom"`). Returns print-safe placement coordinates for the uploaded artwork.

The mock fallback uses the uploaded image aspect ratio, product type, canvas size, current text positions, and placement style. With `OPENAI_API_KEY`, the route asks the model to reason over the same structured payload.

### `POST /api/ai/chat`

Accepts a message thread and current context (product, size, material, notes, uploaded image metadata, canvas elements). Returns a plain-text reply plus optional structured actions.

```json
{
  "messages": [
    { "role": "user", "content": "Grand opening banner for a new coffee shop" }
  ],
  "context": {
    "productType": "Banners",
    "size": "24x36",
    "material": "Banner material"
  }
}
```

Response:

```json
{
  "source": "mock",
  "data": {
    "reply": "For a grand opening, a 24×36 or 36×48 banner with a bold headline is a great choice...",
    "actions": [
      {
        "type": "updateQuote",
        "fields": { "productType": "Banners", "size": "24x36", "material": "Banner material" }
      }
    ]
  }
}
```

Action types:

- `applyLayout` — updates the canvas background color and text elements directly
- `updateQuote` — pre-fills quote form fields (product, size, material)

Returns mock responses unless `OPENAI_API_KEY` is configured.

### `POST /api/quote`

Accepts `multipart/form-data` from the website:

- `customerName`
- `email`
- `phone`
- `productType`
- `size`
- `material`
- `quantity`
- `dateNeeded`
- `preferredConsultTime`
- `notes`
- `artwork`
- `mockupJpegDataUrl`

Supported artwork types:

- JPEG
- PNG
- PDF
- SVG
- AI
- EPS

Max upload size is currently 25MB in app validation. Before launch, production uploads should move to cloud object storage because Vercel/serverless request limits may be lower than 25MB.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
QUOTE_TO_EMAIL="quotes@example.com"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="quotes@your-domain.com"
NEXT_PUBLIC_CONSULT_BOOKING_URL="https://calendly.com/your-calendly/sign-print-consult"
OPENAI_API_KEY="sk-..."
```

If Resend is not configured, submissions return a mock success response and save metadata/uploads locally in your OS temp directory, or in `LOCAL_SUBMISSION_DIR` if set.

If OpenAI is not configured, AI endpoints return local mock responses so the product remains testable.

Anthropic placeholders are included in `.env.example` for a future provider switch, but this v1 only wires OpenAI live calls plus mock fallback.

## Vercel Deployment Notes

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in Vercel Project Settings.
4. Configure a verified sending domain in Resend.
5. Set `RESEND_FROM_EMAIL` to an address on that verified domain.
6. Replace `[INSERT EMAIL]` values with real public and quote inboxes.
7. Add the production domain to `metadataBase` in `app/layout.tsx`.

## Before Launch

- Replace placeholder email values.
- Add reviews only after connecting a real review source or approved testimonials.
- Add cloud upload storage for artwork and mockups.
- Add spam protection/rate limiting to `/api/quote`.
- Add a real business/reviews URL if available.
- Replace the placeholder consult booking URL with the real Calendly or booking link.
- Confirm upload limits with the production hosting plan.
- Test on real phones before publishing.
