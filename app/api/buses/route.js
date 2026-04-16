import { NextResponse } from "next/server";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { withAuth, toPlain } from "@/lib/utils/api-utils";
import { connectToDatabase } from "@/lib/mongodb";
import { enrichBusDocument } from "@/lib/transit";

export async function GET() {
  try {
    await connectToDatabase();
    const buses = await BusModel.find({}).lean();
      const routeIds = buses.map((bus) => bus.routeId);
      const routes = await RouteModel.find({ _id: { $in: routeIds } })
        .select("_id routeId name")
        .lean();
      const routeMap = new Map(routes.map((route) => [String(route._id), route]));

      const hydrated = await Promise.all(
        buses.map(async (bus) => {
          const enriched = await enrichBusDocument(bus);
          const route = routeMap.get(String(bus.routeId));
          return {
            ...enriched,
            routeRef: route?.routeId || "",
            routeName: route?.name || enriched.routeName || "",
          };
        })
      );

      return NextResponse.json({
        buses: toPlain(hydrated),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
    return NextResponse.json(
      { error: "Failed to load buses", details: error.message },
      { status: 500 }
    );
  }
}
