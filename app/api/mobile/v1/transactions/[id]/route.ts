import type { NextRequest } from "next/server";
import { deleteTransaction, getMobileContext, handleMobileError, ok, readJson, saveTransaction } from "@/src/lib/mobile/api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getMobileContext(request);
    return ok(await saveTransaction(context, await readJson(request), (await params).id));
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await deleteTransaction(await getMobileContext(request), (await params).id);
    return ok({ deleted: true });
  } catch (error) {
    return handleMobileError(error);
  }
}
