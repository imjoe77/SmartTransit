import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { RouteModel } from "@/models/Route";
import { BusModel } from "@/models/Bus";
import { calculateETA } from "@/lib/eta";
import { withAuth, toPlain } from "@/lib/api-utils";
import { readLiveBusPosition } from "@/lib/transit";

export async function GET(_request, { params }) {
  return withAuth(async () => {
    try {
      const { id } = await params;
      const query = Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { routeId: id }] } : { routeId: id };
      const route = await RouteModel.findOne(query).lean();
      if (!route) {
        return NextResponse.json({ error: "Route not found" }, { status: 404 });
      }

      const buses = await BusModel.find({ routeId: route._id }).lean();
      const sortedStops = [...(route.stops || [])].sort((a, b) => a.order - b.order);

      const routeBuses = await Promise.all(
        buses.map(async (bus) => {
          const live = await readLiveBusPosition(bus.busId);
          const coordinates = live ? { lat: live.lat, lng: live.lng } : bus.coordinates;
          const nearestEta = sortedStops.length
            ? calculateETA(coordinates, { lat: sortedStops[0].lat, lng: sortedStops[0].lng })
            : bus.eta || 1;

          return {
            ...bus,
            coordinates,
            eta: nearestEta,
          };
        })
      );

      const stopsWithEta = sortedStops.map((stop) => {
        const etaCandidates = routeBuses.map((bus) =>
          calculateETA(bus.coordinates, { lat: stop.lat, lng: stop.lng })
        );

        return {
          ...stop,
          etaMinutes: etaCandidates.length ? Math.min(...etaCandidates) : null,
        };
      });

      return NextResponse.json({
        route: toPlain({
          ...route,
          stops: stopsWithEta,
          buses: routeBuses,
        }),
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to load route", details: error.message },
        { status: 500 }
      );
    }
  });
}
