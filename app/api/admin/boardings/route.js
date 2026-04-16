import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BoardingModel } from "@/models/Boarding";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSafeAuthSession();
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const boardings = await BoardingModel.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    const analytics = boardings.reduce((acc, boarding) => {
      if (!acc[boarding.busId]) {
        acc[boarding.busId] = { morning: 0, evening: 0, monthlyPass: 0, dayPass: 0, total: 0 };
      }
      
      acc[boarding.busId].total += 1;
      
      if (boarding.direction === "toCollege") acc[boarding.busId].morning += 1;
      else acc[boarding.busId].evening += 1;
      
      if (boarding.passType === "monthly") acc[boarding.busId].monthlyPass += 1;
      else acc[boarding.busId].dayPass += 1;
      
      return acc;
    }, {});

    return NextResponse.json({ analytics });
  } catch (err) {
    console.error("Failed to load analytics", err);
    return NextResponse.json({ error: "Failed to load boardings" }, { status: 500 });
  }
}
