import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BoardingModel } from "@/models/Boarding";
import { UserModel } from "@/models/User";
import { BusModel } from "@/models/Bus";

export async function GET(req) {
  try {
    const session = await getSafeAuthSession();
    if (!session || session.user?.role !== "driver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Find the bus assigned to this driver
    const bus = await BusModel.findOne({ driverId: session.user.id });
    if (!bus) {
      return NextResponse.json({ students: [] }); // No bus, no students
    }

    // Get today's boarding records for this bus
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await BoardingModel.find({
      busId: bus.busId,
      timestamp: { $gte: startOfDay }
    })
    .sort({ timestamp: -1 })
    .populate({
      path: 'studentId',
      model: UserModel,
      select: 'name email image studentProfile'
    });

    return NextResponse.json({ 
      students: records.map(r => ({
        id: r._id,
        name: r.studentId?.name || "Unknown",
        email: r.studentId?.email,
        image: r.studentId?.image,
        direction: r.direction,
        passType: r.passType,
        timestamp: r.timestamp
      }))
    });
  } catch (err) {
    console.error("Boarded students fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
