import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Legacy local account setup has been disabled. Use Supabase Auth." },
    { status: 410 }
  );
}
