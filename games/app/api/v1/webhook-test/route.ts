import { NextResponse } from "next/server";
import { postDiscord } from "@/lib/discord/webhook";

/** Dev-only Discord webhook ping */
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const result = await postDiscord("announcements", {
    title: "Direct Action Games — webhook test",
    description: "If you see this, announcements are wired.",
    color: 0xd4ff1a,
  });

  return NextResponse.json(result);
}
