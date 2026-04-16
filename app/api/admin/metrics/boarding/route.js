import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BoardingModel } from "@/models/Boarding";
import { UserModel } from "@/models/User";
import { BusModel } from "@/models/Bus";

export async function GET(req) {
  try {
    const session = await getSafeAuthSession();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Get all records for today
    const records = await BoardingModel.find({
      timestamp: { $gte: startOfDay }
    })
    .sort({ timestamp: -1 })
    .populate({
      path: 'studentId',
      model: UserModel,
      select: 'name email studentProfile'
    });

    // Group by busId
    const grouped = records.reduce((acc, r) => {
      const bId = r.busId;
      if (!acc[bId]) acc[bId] = [];
      acc[bId].push({
        id: r._id,
        studentName: r.studentId?.name || "Unknown",
        direction: r.direction,
        timestamp: r.timestamp,
        passType: r.passType
      });
      return acc;
    }, {});

    return NextResponse.json({ boardingByBus: grouped, totalToday: records.length });
  } catch (err) {
    console.error("Admin boarding fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
