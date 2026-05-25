import { NextResponse } from "next/server";
import { initialLedgerData } from "@/data/mock-data";
import { createClient } from "@/src/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const firstName = typeof user.user_metadata.first_name === "string" ? user.user_metadata.first_name : "";
  const lastName = typeof user.user_metadata.last_name === "string" ? user.user_metadata.last_name : "";

  return NextResponse.json({
    hasUser: true,
    user: {
      firstName,
      lastName,
      email: user.email ?? ""
    },
    ledger: {
      ...initialLedgerData,
      settings: {
        ...initialLedgerData.settings,
        profileFirstName: firstName,
        profileLastName: lastName,
        profileEmail: user.email ?? initialLedgerData.settings.profileEmail
      }
    }
  });
}
