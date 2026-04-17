import { connectToDatabase } from "@/lib/mongodb";
import { calculateETA, haversineDistanceKm } from "@/lib/eta";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { findNearestStopIndex, getNextStop, writeLiveBusPosition } from "@/lib/transit";
import { getRedisClient } from "@/lib/redis";
import { NotificationModel } from "@/models/Notification";

type GpsUpdatePayload = {
  busId?: string;
  driverEmail?: string;
  lat?: number;
  lng?: number;
  speed?: number;
  timestamp?: number;
};

type GpsEndPayload = {
  busId?: string;
};

const DEFAULT_SOCKET_URL = "http://localhost:4001";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function isLikelyLocalUrl(url: string) {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url);
}

export function getSocketPublicUrl() {
  return (
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.SOCKET_SERVICE_URL ||
    DEFAULT_SOCKET_URL
  );
}

function getSocketServiceUrl() {
  return process.env.SOCKET_SERVICE_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "";
}

export async function emitSocketEvent(event: string, payload: unknown) {
  const serviceUrl = trimTrailingSlash(getSocketServiceUrl());
  if (!serviceUrl || isLikelyLocalUrl(serviceUrl)) {
    // Local development can run without external socket relay.
    return false;
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.SOCKET_SERVICE_TOKEN) {
      headers["x-socket-token"] = process.env.SOCKET_SERVICE_TOKEN;
    }

    const response = await fetch(`${serviceUrl}/emit`, {
      method: "POST",
      headers,
      body: JSON.stringify({ event, payload }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.warn(`[socket] emit failed for ${event}:`, response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(`[socket] relay unreachable for ${event}:`, (error as Error).message);
    return false;
  }
}

export async function processGpsUpdate(payload: GpsUpdatePayload) {
  if (!payload?.busId || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
    return { ok: false, error: "Invalid GPS payload" };
  }

  try {
    await connectToDatabase();
    await writeLiveBusPosition(payload.busId, {
      lat: payload.lat!,
      lng: payload.lng!,
      speed: payload.speed,
      timestamp: payload.timestamp || Date.now(),
    });

    const bus = await BusModel.findOne({ busId: payload.busId });
    if (!bus) return { ok: false, error: "Bus not found" };

    const driverEmail = `${payload.driverEmail || ""}`.toLowerCase().trim();
    if (bus.driverEmail && driverEmail && bus.driverEmail !== driverEmail) {
      return { ok: false, error: "Driver mismatch" };
    }

    const route = (await RouteModel.findById(bus.routeId).lean()) as any;
    const sortedStops = [...(route?.stops ?? [])]
      .filter(
        (stop: any) =>
          Number.isFinite(stop?.lat) &&
          Number.isFinite(stop?.lng) &&
          !(Number(stop?.lat) === 0 && Number(stop?.lng) === 0)
      )
      .sort((a: any, b: any) => a.order - b.order);

    let currentStop = bus.currentStop;
    let nextStop = bus.nextStop;
    let eta = bus.eta;

    if (sortedStops.length) {
      const nearestStopIndex = findNearestStopIndex(sortedStops, {
        lat: payload.lat!,
        lng: payload.lng!,
      });
      const nowStop = sortedStops[Math.max(0, nearestStopIndex)];
      const upcoming = getNextStop(sortedStops, Math.max(0, nearestStopIndex));
      currentStop = nowStop?.name || bus.currentStop;
      nextStop = upcoming?.name || bus.nextStop;
      eta = upcoming
        ? calculateETA(
            { lat: payload.lat!, lng: payload.lng! },
            { lat: upcoming.lat, lng: upcoming.lng }
          )
        : 1;
    }

    bus.coordinates = { lat: payload.lat!, lng: payload.lng! };
    bus.lastUpdated = new Date();
    bus.status = "active";
    bus.currentStop = currentStop;
    bus.nextStop = nextStop;
    bus.eta = eta;
    await bus.save();

    try {
      const redis = getRedisClient();
      if (redis) {
        if (payload.speed && payload.speed > 40) {
          const overspeedKey = `overspeed:cooldown:${payload.busId}`;
          const inCooldown = await redis.get(overspeedKey);
          if (!inCooldown) {
            await NotificationModel.create({
              type: "alert",
              message: `OVER SPEED: Bus ${payload.busId} at ${payload.speed} km/h.`,
              busId: payload.busId,
              targetRole: "admin",
            });
            await emitSocketEvent("safety:overspeed", {
              busId: payload.busId,
              speed: payload.speed,
              coordinates: { lat: payload.lat, lng: payload.lng },
              googleMapsLink: `https://www.google.com/maps?q=${payload.lat},${payload.lng}`,
            });
            await redis.set(overspeedKey, "1", "EX", 120);
          }
        }

        const lastPosKey = `idle:lastpos:${payload.busId}`;
        const cooldownKey = `idle:cooldown:${payload.busId}`;
        const lastPosData = await redis.get(lastPosKey);
        const now = Date.now();

        if (lastPosData) {
          const { lat: lastLat, lng: lastLng, timestamp: lastTs } = JSON.parse(lastPosData);
          const distanceKm = haversineDistanceKm(
            { lat: lastLat, lng: lastLng },
            { lat: payload.lat!, lng: payload.lng! }
          );
          const distanceMeters = distanceKm * 1000;

          if (distanceMeters < 50) {
            const timeDiffMins = (now - lastTs) / (1000 * 60);
            if (timeDiffMins > 10 && bus.status === "active") {
              const inCooldown = await redis.get(cooldownKey);
              if (!inCooldown) {
                await NotificationModel.create({
                  type: "alert",
                  message: `IDLE ALERT: Bus ${payload.busId} idle for ${Math.round(timeDiffMins)} mins.`,
                  busId: payload.busId,
                  targetRole: "admin",
                });
                await emitSocketEvent("safety:idle", {
                  busId: payload.busId,
                  duration: Math.round(timeDiffMins),
                  coordinates: { lat: payload.lat, lng: payload.lng },
                  googleMapsLink: `https://www.google.com/maps?q=${payload.lat},${payload.lng}`,
                });
                await redis.set(cooldownKey, "1", "EX", 900);
              }
            }
          } else {
            await redis.set(
              lastPosKey,
              JSON.stringify({ lat: payload.lat, lng: payload.lng, timestamp: now })
            );
          }
        } else {
          await redis.set(
            lastPosKey,
            JSON.stringify({ lat: payload.lat, lng: payload.lng, timestamp: now })
          );
        }
      }
    } catch (err) {
      console.error("Safety layer error:", err);
    }

    await emitSocketEvent("bus:moved", {
      busId: bus.busId,
      lat: payload.lat,
      lng: payload.lng,
      eta: bus.eta,
      currentStop: bus.currentStop,
      nextStop: bus.nextStop,
      seatsOccupied: bus.seatsOccupied,
      seatCapacity: bus.seatCapacity,
      driverEmail: bus.driverEmail || "",
      speed: payload.speed ?? null,
      timestamp: payload.timestamp || Date.now(),
    });

    return { ok: true };
  } catch (error) {
    console.error("GPS update failed:", error);
    return { ok: false, error: "Failed to process GPS update" };
  }
}

export async function processGpsEnd(payload: GpsEndPayload) {
  if (!payload?.busId) {
    return { ok: false, error: "busId is required" };
  }

  try {
    await connectToDatabase();
    await BusModel.findOneAndUpdate(
      { busId: payload.busId },
      { status: "idle", lastUpdated: new Date() }
    );
    return { ok: true };
  } catch (error) {
    console.error("GPS end failed:", error);
    return { ok: false, error: "Failed to end trip" };
  }
}

export async function ensureSocketServer() {
  return { io: null, url: getSocketPublicUrl() };
}
