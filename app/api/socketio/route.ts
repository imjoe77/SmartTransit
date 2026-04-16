import { NextResponse } from "next/server";
import { ensureSocketServer } from "@/lib/socket";

export async function GET() {
  try {
    const { url } = await ensureSocketServer();
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message || "Unable to initialize socket server" },
      { status: 500 }
    );
  }
}
