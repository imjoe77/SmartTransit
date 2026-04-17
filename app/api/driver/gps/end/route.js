import { NextResponse } from "next/server";
import { requireDriverSession } from "@/lib/auth-helpers";
import { processGpsEnd } from "@/lib/socket/socket";

export async function POST(req) {
  const session = await requireDriverSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await processGpsEnd(body || {});
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "GPS end failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid GPS end payload", details: error.message },
      { status: 400 }
    );
  }
}
