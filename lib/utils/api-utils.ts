import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";

export async function withAuth(handler: (session: any) => Promise<NextResponse>) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    return NextResponse.json(
      { error: "Database unavailable", details: (error as Error).message },
      { status: 503 }
    );
  }

  return handler(session);
}

export function toPlain(value: any) {
  return JSON.parse(JSON.stringify(value));
}
