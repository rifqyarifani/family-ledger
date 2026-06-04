import type { NextRequest } from "next/server";
import { createHousehold, getMobileContext, handleMobileError, joinHousehold, ok, readJson } from "@/src/lib/mobile/api";

type Payload = { action: "create" | "join"; name?: string; code?: string };

export async function POST(request: NextRequest) {
  try {
    const context = await getMobileContext(request);
    const body = await readJson<Payload>(request);
    return ok(body.action === "join"
      ? await joinHousehold(context, body.code ?? "")
      : await createHousehold(context, body.name ?? ""), 201);
  } catch (error) {
    return handleMobileError(error);
  }
}
