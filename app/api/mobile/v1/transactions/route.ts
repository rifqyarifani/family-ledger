import type { NextRequest } from "next/server";
import { getMobileContext, getTransactions, handleMobileError, ok, readJson, saveTransaction } from "@/src/lib/mobile/api";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
    return ok(await getTransactions(await getMobileContext(request), limit));
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getMobileContext(request);
    return ok(await saveTransaction(context, await readJson(request)), 201);
  } catch (error) {
    return handleMobileError(error);
  }
}
