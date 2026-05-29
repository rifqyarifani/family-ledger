import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  const next = requestUrl.searchParams.get("next") ?? "/reset-password";

  console.log("Callback received:", { code: !!code, type, error, errorDescription });

  if (error) {
    console.error("Supabase returned error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange result:", { error: exchangeError?.message });

    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/login?error=No+verification+code+received.", request.url)
  );
}
