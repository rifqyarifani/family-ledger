import type { NextRequest } from "next/server";
import { getDashboard, getMobileContext, handleMobileError, ok } from "@/src/lib/mobile/api";

export async function GET(request: NextRequest) {
  try {
    return ok(await getDashboard(await getMobileContext(request)));
  } catch (error) {
    return handleMobileError(error);
  }
}
