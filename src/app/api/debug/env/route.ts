import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Debug endpoint to verify environment variables in production
 * DELETE THIS FILE after debugging is complete!
 *
 * Access: GET /api/debug/env
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "NOT SET";

  return NextResponse.json(
    {
      environment: process.env.NODE_ENV,
      nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "NOT SET",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT SET",
      headers: {
        host: request.headers.get("host") || "NOT SET",
        "x-forwarded-host": request.headers.get("x-forwarded-host") || "NOT SET",
        "x-forwarded-proto":
          request.headers.get("x-forwarded-proto") || "NOT SET",
      },
      computedBaseUrl: baseUrl,
      requestUrl: request.url,
      warning: "DELETE THIS ENDPOINT AFTER DEBUGGING!",
    },
    { status: 200 }
  );
}
