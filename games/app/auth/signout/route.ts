import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/`, { status: 303 });
  const supabase = createRouteHandlerClient(request, response);
  await supabase.auth.signOut();
  return response;
}
