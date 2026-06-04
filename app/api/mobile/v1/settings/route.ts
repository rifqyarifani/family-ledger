import type { NextRequest } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getMobileContext, handleMobileError, MobileApiError, ok, readJson, requireOwner } from "@/src/lib/mobile/api";

type Payload = { firstName?: string; lastName?: string; householdName?: string };

export async function PATCH(request: NextRequest) {
  try {
    const context = await getMobileContext(request);
    const body = await readJson<Payload>(request);
    if (body.firstName !== undefined) {
      const firstName = body.firstName.trim();
      if (!firstName) throw new MobileApiError("First name is required.");
      const { error } = await createAdminClient().auth.admin.updateUserById(context.user.id, {
        user_metadata: { first_name: firstName, last_name: body.lastName?.trim() ?? "" }
      });
      if (error) throw new MobileApiError(error.message);
    }
    if (body.householdName !== undefined) {
      const household = requireOwner(context);
      const name = body.householdName.trim();
      if (!name || name.length > 80) throw new MobileApiError("Household name must be 1-80 characters.");
      const { error } = await context.client.from("households").update({ name }).eq("id", household.id);
      if (error) throw new MobileApiError(error.message);
    }
    return ok({ saved: true });
  } catch (error) {
    return handleMobileError(error);
  }
}
