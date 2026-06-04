import type { NextRequest } from "next/server";
import { getMobileContext, getReferenceData, handleMobileError, ok, profileFor } from "@/src/lib/mobile/api";

export async function GET(request: NextRequest) {
  try {
    const context = await getMobileContext(request);
    return ok({
      profile: profileFor(context.user),
      household: context.household,
      reference: context.household ? await getReferenceData(context) : null
    });
  } catch (error) {
    return handleMobileError(error);
  }
}
