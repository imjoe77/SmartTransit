import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { PanicAlertModel } from "@/models/PanicAlert";
import { NotificationModel } from "@/models/Notification";
import { ensureSocketServer } from "@/lib/socket/socket";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { driverId, busId, routeId, coordinates, triggeredBy, userEmail } = body;

    if (!driverId || !busId || !routeId || !coordinates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    // Create Panic Alert record
    const panicAlert = await PanicAlertModel.create({
      driverId,
      busId,
      routeId,
      coordinates: {
        lat: Number(coordinates.lat),
        lng: Number(coordinates.lng)
      },
      timestamp: new Date(),
    });

    // Create Notification for Admin
    const triggerMsg = triggeredBy === "student" ? `Student (${userEmail}) reported EMERGENCY` : `Driver reported EMERGENCY`;
    await NotificationModel.create({
      type: "alert",
      message: `🚨 PANIC ALERT: ${triggerMsg} on Bus ${busId}!`,
      busId,
      routeId,
      targetRole: "admin",
    });

    // Emit via Socket.IO
    const { io } = await ensureSocketServer();
    if (io) {
      io.emit("safety:panic", {
        driverId,
        busId,
        routeId,
        coordinates,
        timestamp: panicAlert.timestamp,
        googleMapsLink: `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`,
      });
    }

    return NextResponse.json({ success: true, alert: panicAlert });
  } catch (error: any) {
    console.error("Panic API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
