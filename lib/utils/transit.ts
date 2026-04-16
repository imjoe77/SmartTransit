import { Types } from "mongoose";
import { calculateETA } from "@/lib/eta";
import { getRedisClient } from "@/lib/redis";
import { BusModel } from "@/models/Bus";
import { RouteModel, type RouteStop } from "@/models/Route";

type LivePayload = { lat: number; lng: number; speed?: number; timestamp?: number };

function isValidCoordinate(value: number) {
  return Number.isFinite(value) && value !== 0;
}

export function getNextStop(stops: RouteStop[], currentIndex: number) {
  if (!stops.length) return null;
  const sortedStops = [...stops].sort((a, b) => a.order - b.order);
  return sortedStops[(currentIndex + 1) % sortedStops.length];
}

export function findNearestStopIndex(stops: RouteStop[], point: { lat: number; lng: number }) {
  const sortedStops = [...stops].sort((a, b) => a.order - b.order);
  if (!sortedStops.length) return -1;
  let minDistance = Number.POSITIVE_INFINITY;
  let nearestIndex = 0;

  sortedStops.forEach((stop, index) => {
    const distance = Math.hypot(stop.lat - point.lat, stop.lng - point.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  return nearestIndex;
}

export async function readLiveBusPosition(busId: string): Promise<LivePayload | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  try {
    const raw = await redis.get(`bus:live:${busId}`);
    if (!raw) return null;
    return JSON.parse(raw) as LivePayload;
  } catch {
    return null;
  }
}

export async function writeLiveBusPosition(busId: string, payload: LivePayload) {
  const redis = getRedisClient();
  if (!redis) return;
  try {
    await redis.set(`bus:live:${busId}`, JSON.stringify(payload), "EX", 30);
  } catch {
    // Redis is optional at runtime; DB updates continue to work.
  }
}

export async function getRouteByObjectId(routeId: string | Types.ObjectId) {
  try {
    return (await RouteModel.findById(routeId).lean()) as any;
  } catch {
    return null;
  }
}

export function withLiveCoordinates<T extends { coordinates: { lat: number; lng: number } }>(
  entity: T,
  live: LivePayload | null
) {
  if (!live || !isValidCoordinate(live.lat) || !isValidCoordinate(live.lng)) {
    return entity;
  }
  return { ...entity, coordinates: { lat: live.lat, lng: live.lng } };
}

export async function enrichBusDocument(bus: any) {
  const live = await readLiveBusPosition(bus.busId);
  const hydratedBus = withLiveCoordinates(bus, live);
  const route = await getRouteByObjectId(hydratedBus.routeId);
  const routeStops = (route?.stops ?? []) as RouteStop[];

  if (!routeStops.length) {
    return {
      ...hydratedBus,
      routeName: route?.name ?? "",
    };
  }

  const nearestStopIndex = findNearestStopIndex(routeStops, hydratedBus.coordinates);
  const sortedStops = [...routeStops].sort((a, b) => a.order - b.order);
  const currentStop = sortedStops[Math.max(0, nearestStopIndex)];
  const nextStop = getNextStop(sortedStops, Math.max(0, nearestStopIndex));
  const eta = nextStop
    ? calculateETA(hydratedBus.coordinates, { lat: nextStop.lat, lng: nextStop.lng })
    : 1;

  return {
    ...hydratedBus,
    routeName: route?.name ?? "",
    currentStop: currentStop?.name ?? hydratedBus.currentStop ?? "",
    nextStop: nextStop?.name ?? hydratedBus.nextStop ?? "",
    eta,
  };
}

export async function getBusByBusId(busId: string) {
  try {
    return await BusModel.findOne({ busId }).lean();
  } catch {
    return null;
  }
}
