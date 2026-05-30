import { NextResponse } from "next/server";

export type ApiError = {
  error: string;
  details?: Record<string, string>;
};

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(error: string, status = 400, details?: Record<string, string>) {
  return NextResponse.json<ApiError>({ error, details }, { status });
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
