import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdminSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { toPlain } from "@/lib/api-utils";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const buses = await BusModel.find({}).lean();
    const routeIds = buses.map((bus) => bus.routeId);
    const routes = await RouteModel.find({ _id: { $in: routeIds } }).select("_id name").lean();
    const routeMap = new Map(routes.map((route) => [String(route._id), route.name]));

    const hydrated = buses.map((bus) => ({
      ...bus,
      routeName: routeMap.get(String(bus.routeId)) || "",
    }));

    return NextResponse.json({ buses: toPlain(hydrated) });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load buses", details: error.message },
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
  if (!body.number || !body.routeId) {
    return NextResponse.json(
      { error: "number and routeId are required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();
    const routeQuery = Types.ObjectId.isValid(body.routeId)
      ? { _id: body.routeId }
      : { routeId: body.routeId };
    const route = await RouteModel.findOne(routeQuery).lean();
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }

    const bus = await BusModel.create({
      busId: body.number,
      routeId: route._id,
      driverName: body.driverName || "Unassigned Driver",
      driverEmail: (body.driverEmail || "").toLowerCase(),
      status: "active", // Default to active so students can see it
      currentStop: "",
      nextStop: "",
      eta: 1,
      coordinates: { lat: 0, lng: 0 },
      seatCapacity: body.seatCapacity || 40,
      seatsOccupied: 0,
      departureTime: body.departureTime || "",
      direction: body.direction || "Towards College",
      lastUpdated: new Date(),
    });

    await RouteModel.updateOne({ _id: route._id }, { $addToSet: { assignedBuses: bus.busId } });
    return NextResponse.json({ bus }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
