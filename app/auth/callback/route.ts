import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next.startsWith("/app") ? next : "/app", request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=Could%20not%20confirm%20your%20session.", request.url));
}
