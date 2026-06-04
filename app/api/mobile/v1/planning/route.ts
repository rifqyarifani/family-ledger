import type { NextRequest } from "next/server";
import { getMobileContext, getPlanning, handleMobileError, ok } from "@/src/lib/mobile/api";

export async function GET(request: NextRequest) {
  try {
    const month = request.nextUrl.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
    return ok(await getPlanning(await getMobileContext(request), month));
  } catch (error) {
    return handleMobileError(error);
  }
}
