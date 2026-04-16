import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { requireDriverSession } from "@/lib/auth-helpers";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { toPlain } from "@/lib/api-utils";

export async function GET() {
  const session = await requireDriverSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const email = `${session.user?.email || ""}`.toLowerCase().trim();
    const name = `${session.user?.name || "Driver"}`.trim();

    if (!email) {
      return NextResponse.json({ error: "Driver email missing in session" }, { status: 400 });
    }

    const assignedBus = await BusModel.findOne({ driverEmail: email }).lean();

    if (!assignedBus) {
      return NextResponse.json({ error: "No bus available for assignment" }, { status: 404 });
    }

    const route = await RouteModel.findById(assignedBus.routeId).lean();
    return NextResponse.json({
      bus: toPlain(assignedBus),
      route: toPlain(route),
      driver: {
        email,
        name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load driver assignment", details: error.message },
      { status: 500 }
    );
  }
}
