import { NextResponse } from "next/server";
import { initKnowledge } from "@/lib/rag";

async function handleSetup() {
  try {
    const result = await initKnowledge();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Support both GET (browser URL bar) and POST
export async function GET() {
  return handleSetup();
}

export async function POST() {
  return handleSetup();
}
