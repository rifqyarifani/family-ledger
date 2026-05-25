import { NextResponse } from "next/server";
import { readDatabase, updateLedger } from "@/lib/server-database";
import { createClient } from "@/src/lib/supabase/server";
import type { LedgerData } from "@/types/finance";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  try {
    const unauthorized = await requireUser();
    if (unauthorized) return unauthorized;

    const database = await readDatabase();
    return NextResponse.json({ ledger: database.ledger });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Supabase is not configured." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const unauthorized = await requireUser();
    if (unauthorized) return unauthorized;

    const ledger = (await request.json()) as LedgerData;
    const database = await updateLedger(ledger);
    return NextResponse.json({ ledger: database.ledger });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Supabase is not configured." },
      { status: 500 }
    );
  }
}
