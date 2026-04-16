import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import mongoose from "mongoose";

// ─── GET: Read active trip directly from MongoDB (bypasses Mongoose schema cache) ───
export async function GET() {
  try {
    const session = await getSafeAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const db = mongoose.connection.db;
    const user = await db.collection("users").findOne({ email: session.user.email });
    const activeTrip = user?.studentProfile?.activeTrip || null;
    return NextResponse.json({ activeTrip });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST: Start a trip ─────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await getSafeAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { direction, boardingPoint } = await request.json();
    await connectToDatabase();
    const db = mongoose.connection.db;

    // 1. Find the user
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const routeId = user.studentProfile?.preferredRouteId;
    if (!routeId) {
      return NextResponse.json({ error: "Please configure a preferred route in your profile first" }, { status: 400 });
    }

    // 2. Find active buses on this route (try both ObjectId and string match)
    const routeOid = new mongoose.Types.ObjectId(String(routeId));
    const buses = await db.collection("buses").find({
      $or: [
        { routeId: routeOid, status: "active" },
        { routeId: String(routeId), status: "active" },
      ]
    }).toArray();

    if (buses.length === 0) {
      return NextResponse.json({
        error: "No active buses are on this route at the moment."
      }, { status: 404 });
    }

    // 3. Filter buses with available seats
    const busesWithSeats = buses.filter(bus => (bus.seatsOccupied || 0) < (bus.seatCapacity || 40));
    if (busesWithSeats.length === 0) {
      return NextResponse.json({
        error: "All active buses on this route are currently at full capacity."
      }, { status: 404 });
    }

    // 4. Pick the bus with the closest departure time to now
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return Infinity;
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const assignedBus = busesWithSeats.reduce((prev, curr) => {
      const prevDiff = Math.abs(currentMinutes - timeToMinutes(prev.departureTime));
      const currDiff = Math.abs(currentMinutes - timeToMinutes(curr.departureTime));
      return currDiff < prevDiff ? curr : prev;
    });

    const destination = direction === "toCollege"
      ? "KLE Tech College"
      : (user.studentProfile?.boardingStop || "Home Stop");

    const activeTrip = {
      direction,
      boardingPoint,
      destination,
      busId: assignedBus.busId,
      startTime: new Date().toISOString(),
    };

    // 5. Write directly to MongoDB — bypasses Mongoose schema caching entirely
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { "studentProfile.activeTrip": activeTrip } }
    );

    return NextResponse.json({ success: true, activeTrip });
  } catch (err) {
    console.error("[Trip API Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE: End trip ────────────────────────────────────────────────────────────
export async function DELETE() {
  try {
    const session = await getSafeAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { "studentProfile.activeTrip": null } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
