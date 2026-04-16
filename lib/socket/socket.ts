import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { connectToDatabase } from "@/lib/mongodb";
import { calculateETA } from "@/lib/eta";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { findNearestStopIndex, getNextStop, writeLiveBusPosition } from "@/lib/transit";
import { getRedisClient } from "@/lib/redis";
import { NotificationModel } from "@/models/Notification";
import { haversineDistanceKm } from "@/lib/eta";

type SocketCache = {
  io: SocketIOServer | null;
  server: HttpServer | null;
  port: number;
};

const globalSocket = globalThis as typeof globalThis & {
  socketCache?: SocketCache;
};

if (!globalSocket.socketCache) {
  globalSocket.socketCache = {
    io: null,
    server: null,
    port: Number(process.env.SOCKET_IO_PORT || 4001),
  };
}

function attachHandlers(io: SocketIOServer) {
  io.on("connection", (socket) => {
    socket.on(
      "gps:update",
      async (payload: {
        busId?: string;
        driverEmail?: string;
        lat?: number;
        lng?: number;
        speed?: number;
        timestamp?: number;
      }) => {
        if (!payload?.busId || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
          return;
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
          if (!bus) return;
          const driverEmail = `${payload.driverEmail || ""}`.toLowerCase().trim();
          if (bus.driverEmail && driverEmail && bus.driverEmail !== driverEmail) {
            return;
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
              ? calculateETA({ lat: payload.lat!, lng: payload.lng! }, { lat: upcoming.lat, lng: upcoming.lng })
              : 1;
          }

          bus.coordinates = { lat: payload.lat!, lng: payload.lng! };
          bus.lastUpdated = new Date();
          bus.status = "active";
          bus.currentStop = currentStop;
          bus.nextStop = nextStop;
          bus.eta = eta;
          await bus.save();

          // --- SAFETY LAYER START ---
          try {
            const redis = getRedisClient();
            if (redis) {
              // 1. Overspeed Detection
              if (payload.speed && payload.speed > 40) {
                const overspeedKey = `overspeed:cooldown:${payload.busId}`;
                const inCooldown = await redis.get(overspeedKey);
                if (!inCooldown) {
                  await NotificationModel.create({
                    type: "alert",
                    message: `⚠️ OVER SPEED: Bus ${payload.busId} is driving at ${payload.speed} km/h!`,
                    busId: payload.busId,
                    targetRole: "admin",
                  });
                  io.emit("safety:overspeed", {
                    busId: payload.busId,
                    speed: payload.speed,
                    coordinates: { lat: payload.lat, lng: payload.lng },
                    googleMapsLink: `https://www.google.com/maps?q=${payload.lat},${payload.lng}`,
                  });
                  await redis.set(overspeedKey, "1", "EX", 120);
                }
              }

              // 2. Idle Detection
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
                        message: `🛑 IDLE ALERT: Bus ${payload.busId} has been idle for ${Math.round(timeDiffMins)} mins.`,
                        busId: payload.busId,
                        targetRole: "admin",
                      });
                      io.emit("safety:idle", {
                        busId: payload.busId,
                        duration: Math.round(timeDiffMins),
                        coordinates: { lat: payload.lat, lng: payload.lng },
                        googleMapsLink: `https://www.google.com/maps?q=${payload.lat},${payload.lng}`,
                      });
                      await redis.set(cooldownKey, "1", "EX", 900);
                    }
                  }
                } else {
                  // Bus moved > 50m, reset the timer
                  await redis.set(lastPosKey, JSON.stringify({ lat: payload.lat, lng: payload.lng, timestamp: now }));
                }
              } else {
                // Initial last position
                await redis.set(lastPosKey, JSON.stringify({ lat: payload.lat, lng: payload.lng, timestamp: now }));
              }
            }
          } catch (err) {
            console.error("Safety Layer Error:", err);
          }
          // --- SAFETY LAYER END ---

          io.emit("bus:moved", {
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
        } catch {
          // Fail silently to keep socket transport stable.
        }
      }
    );

    socket.on("gps:end", async (payload: { busId?: string }) => {
      if (!payload?.busId) return;
      try {
        await connectToDatabase();
        await BusModel.findOneAndUpdate(
          { busId: payload.busId },
          { status: "idle", lastUpdated: new Date() }
        );
      } catch {
        // Ignore storage errors.
      }
    });
  });
}

export async function ensureSocketServer() {
  const cache = globalSocket.socketCache!;
  if (cache.io) {
    return { io: cache.io, url: process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:${cache.port}` };
  }

  const server = createServer();
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  attachHandlers(io);

  await new Promise<void>((resolve) => {
    server.listen(cache.port, resolve);
  });

  cache.io = io;
  cache.server = server;

  return { io, url: process.env.NEXT_PUBLIC_SOCKET_URL || `http://localhost:${cache.port}` };
}
