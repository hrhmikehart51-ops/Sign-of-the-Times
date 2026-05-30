# Claude Code Handoff Prompt

Paste this into Claude Code while opened in this project folder:

```text
You are working in an existing Next.js prototype for Sign of the Times, a sign and banner company in Vancouver, Washington.

Project folder:
/Users/mikehart/Documents/Codex/2026-05-29/build-a-functional-v1-prototype-for

Current stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- Konva / react-konva
- Vercel-friendly API routes

Important existing files:
- app/page.tsx
- components/QuoteDesignTool.tsx
- components/QuoteDesignToolLoader.tsx
- app/api/quote/route.ts
- app/api/ai/suggest/route.ts
- app/api/ai/layout/route.ts
- app/api/ai/placement/route.ts
- lib/ai.ts
- lib/business.ts
- lib/quote.ts
- lib/email.ts
- lib/uploads.ts
- README.md
- .env.example

Current functionality:
- One-page site for Sign of the Times.
- Tool-first page with hero, workflow, product list, quote/design tool, consult booking CTA, and contact.
- Quote form validates required fields.
- Artwork upload supports JPEG, PNG, PDF, SVG, AI, EPS up to about 25MB.
- Image uploads can be placed on the canvas.
- Canvas supports changing size/aspect ratio, background color, text editing, text color, font size, dragging objects, and JPEG export.
- AI routes currently work with local mock fallback.
- /api/ai/suggest returns design suggestions.
- /api/ai/layout returns structured canvas JSON.
- /api/ai/placement returns uploaded-art placement coordinates using image metadata and current canvas elements.
- /api/quote accepts form data, uploaded art info, exported mockup JPEG, and consult preference.
- Resend email sending is ready if env vars exist; otherwise submission saves locally/mocks success.
- Consult booking link uses NEXT_PUBLIC_CONSULT_BOOKING_URL.

Business info:
- Name: Sign of the Times
- Phone: 360-891-9477
- Hours: Tuesday to Friday, 9:30 AM to 4:30 PM
- Address: 5809 NE 105th Ave, Vancouver, WA 98662
- Service area: Vancouver, WA and Portland metro area
- Maps: https://maps.google.com/?q=5809+NE+105th+Ave,+Vancouver,+WA+98662

Products:
- Banners
- A-frame signs
- Real estate signs
- Yard signs
- Vehicle lettering
- Stickers and decals
- Storefront signage
- Window graphics
- Magnetic signs
- Custom signs

Common sizes:
- 18x24
- 24x36
- 36x48
- Custom size

Materials:
- Correx 4 mil
- Correx 10 mil
- Metal
- Banner material
- Vinyl/sticker material

Your goal:
Take this from a working v1 prototype to a much more polished, credible, demo-ready product. Do not restart from scratch. Improve the current codebase.

Priority 1: Better UI
- Make the page feel like a real premium local sign-shop quoting tool, not a generic template.
- Keep the tool-first direction. No fake reviews, no filler gallery, no fake claims.
- Improve spacing, typography, visual hierarchy, button states, mobile layout, and the quote/design tool panel.
- Make the design canvas feel more professional and less cramped.
- Improve mobile usability.
- Add clear states for loading, success, error, and disabled actions.
- Keep cards restrained and purposeful. Avoid decorative filler.
- Use a richer but professional palette, not a one-note theme.
- Keep the header sticky but make anchor scrolling clean.

Priority 2: Real AI Chatbot
- Add a real AI chat assistant UI inside or near the design tool.
- The chatbot should help customers describe what they need, decide product/material/size, improve copy, and refine the canvas layout.
- Add a new API route such as app/api/ai/chat/route.ts.
- Use OpenAI if OPENAI_API_KEY exists.
- Use a local mock fallback if OPENAI_API_KEY is missing, but label the UI clearly enough during development.
- Keep the chatbot practical and sign-shop-specific.
- The chatbot should understand current form state, selected product/size/material, current canvas elements, uploaded image metadata, and notes.
- It should return normal chat text plus optional structured actions.
- Suggested structured action shape:
  {
    "reply": "Plain-language answer to show in chat",
    "actions": [
      {
        "type": "applyLayout",
        "layout": {
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
          "notes": "Short explanation"
        }
      },
      {
        "type": "updateQuote",
        "fields": {
          "productType": "Banners",
          "size": "24x36",
          "material": "Banner material"
        }
      }
    ]
  }
- Add buttons in chat like “Apply this layout” or “Use these quote settings” when structured actions are returned.
- Keep the chatbot useful even without image generation. Do not build AI image generation yet.

Priority 3: Better Uploaded Image Placement
- Improve the Smart place uploaded artwork flow.
- If the uploaded image is wide, tall, or square, place it naturally.
- Avoid overlapping major text where possible.
- Add simple safe-margin guides or trim/safe area hints on the canvas.
- Add a placement summary that says why the image was placed there.
- Allow “Try another placement” with 2-3 placement styles:
  - Logo corner
  - Center feature
  - Bottom/right supporting mark
- Keep it understandable for non-technical customers.

Priority 4: Quote/Consult Flow
- Make the quote form feel less overwhelming.
- Consider grouping into “Contact”, “Job specs”, “Artwork/mockup”, and “Consult”.
- Add an obvious Calendly/booking CTA.
- Keep preferred in-person consult time in the submitted quote data.
- Make success response clearer: “Your quote request was received. We’ll follow up manually.”
- Keep no payments.

Priority 5: Production Readiness
- Update .env.example with any new keys.
- Update README with the new chat route and setup.
- Keep Vercel-friendly structure.
- Keep mock fallbacks.
- Run:
  npm run typecheck
  npm run build
- Fix all errors.
- Browser-smoke-test desktop and mobile.

Current build details:
- package.json uses wrapper scripts:
  - npm run dev => node scripts/next-wasm-dev.mjs
  - npm run build => node scripts/next-wasm-build.mjs
- These wrappers force Next.js to use WASM SWC and Webpack because this local Codex environment had a native SWC code-signing issue.
- Do not remove those scripts unless you verify normal Next build works.

Important constraints:
- Do not add payments.
- Do not add full AI image generation.
- Do not use copyrighted images.
- Do not add fake reviews or claim verified reviews.
- Keep it testable today.
- Keep implementation simple enough to debug.
- Preserve existing backend routes unless replacing them with clearly better equivalents.

Acceptance criteria:
- Site still runs at http://localhost:3000.
- Mobile and desktop layouts work.
- Quote form validates.
- Canvas mockup works.
- Uploaded image placement works.
- JPEG export works.
- AI suggestion/layout/placement still work with mock fallback.
- New AI chatbot works with mock fallback and real OpenAI when OPENAI_API_KEY is set.
- Submission route includes form data, artwork info, exported mockup, and consult preference.
- Resend remains ready.
- README and .env.example are updated.
- npm run typecheck passes.
- npm run build passes.

Start by inspecting the files listed above, then make the improvements directly.
```

