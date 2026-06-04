import type { NextRequest } from "next/server";
import { getMobileContext, handleMobileError, ok, parseResource, readJson, saveResource } from "@/src/lib/mobile/api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const context = await getMobileContext(request);
    return ok(await saveResource(context, parseResource((await params).resource), await readJson(request)), 201);
  } catch (error) {
    return handleMobileError(error);
  }
}
