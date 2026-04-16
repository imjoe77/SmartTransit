import { NextResponse } from "next/server";
import { RouteModel } from "@/models/Route";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    const routes = await RouteModel.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ routes });
  } catch (error) {
    console.error("[Routes API] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to load routes", details: error.message },
      { status: 500 }
    );
  }
}
