import { NextRequest, NextResponse } from "next/server";
import { getCreditsStatus } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "anonymous";

  const status = await getCreditsStatus(ip);
  return NextResponse.json(status);
}
