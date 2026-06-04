import type { NextRequest } from "next/server";
import { deleteResource, getMobileContext, handleMobileError, ok, parseResource, readJson, saveResource } from "@/src/lib/mobile/api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const values = await params;
    return ok(await saveResource(await getMobileContext(request), parseResource(values.resource), await readJson(request), values.id));
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const values = await params;
    return ok(await deleteResource(await getMobileContext(request), parseResource(values.resource), values.id));
  } catch (error) {
    return handleMobileError(error);
  }
}
