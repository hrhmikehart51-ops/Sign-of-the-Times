import { businessInfo } from "@/lib/business";
import { jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  return jsonOk({
    ok: true,
    service: "sign-of-the-times-api",
    business: businessInfo.name,
    configured: {
      resend: Boolean(
        process.env.RESEND_API_KEY &&
          process.env.QUOTE_TO_EMAIL &&
          !process.env.QUOTE_TO_EMAIL.includes("[INSERT EMAIL]")
      ),
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY)
    }
  });
}
