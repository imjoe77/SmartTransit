import { NextResponse } from "next/server";
import { RouteModel } from "@/models/Route";
import { requireAdminSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { toPlain } from "@/lib/api-utils";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const routes = await RouteModel.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ routes: toPlain(routes) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load routes", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.name || !Array.isArray(body.stops)) {
    return NextResponse.json(
      { error: "name and stops are required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const sequence = await RouteModel.countDocuments({});
    const route = await RouteModel.create({
      routeId: body.routeId || `R-${sequence + 1}`,
      name: body.name,
      stops: (body.stops || []).map((stop, index) => ({
        stopId: stop.stopId || `STOP-${index + 1}`,
        name: stop.name,
        lat: Number(stop.lat || 0),
        lng: Number(stop.lng || 0),
        order: Number(stop.order ?? index + 1),
      })),
      assignedBuses: body.assignedBuses || [],
      schedule: {
        morningDeparture: body.schedule?.morningDeparture || "08:00",
        eveningDeparture: body.schedule?.eveningDeparture || "17:30",
      },
    });
    return NextResponse.json({ route }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create route", details: error.message },
      { status: 500 }
    );
  }
}
