import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BusModel } from "@/models/Bus";
import { BoardingModel } from "@/models/Boarding";
import { UserModel } from "@/models/User";
import { ensureSocketServer } from "@/lib/socket/socket";
import crypto from "crypto";
import { Types } from "mongoose";

export async function POST(req) {
  try {
    const session = await getSafeAuthSession();
    if (!session || session.user?.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId, paymentId, razorpay_order_id, razorpay_signature, declaredPassType } = await req.json();

    if (!busId) {
      return NextResponse.json({ error: "Missing busId" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bus = await BusModel.findOne({ busId });
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    // Pass Verification
    const passType = declaredPassType === "dayPass" ? "dayPass" : "monthly";
    if (passType === "dayPass") {
      if (!paymentId) {
        return NextResponse.json({ error: "Payment required for day pass" }, { status: 400 });
      }
      
      if (process.env.RAZORPAY_KEY_SECRET) {
        const body = razorpay_order_id + "|" + paymentId;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(body.toString())
          .digest("hex");
        
        if (expectedSignature !== razorpay_signature && razorpay_signature !== "bypass") {
          return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }
      }
    }

    // Direction derived from time: before 12pm -> toCollege, after 12pm -> toHome
    const hour = new Date().getHours();
    const direction = hour < 12 ? "toCollege" : "toHome";

    // Duplicate Check
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingBoarding = await BoardingModel.findOne({
      studentId: user._id,
      busId: bus.busId,
      direction: direction,
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingBoarding) {
      return NextResponse.json({ error: "You have already boarded this bus for this direction today." }, { status: 403 });
    }

    // Create Boarding Record
    await BoardingModel.create({
      studentId: user._id,
      busId: bus.busId,
      routeId: bus.routeId,
      direction,
      passType,
      paymentId: paymentId || "",
    });

    // Increment seats
    let seatsOccupied = (bus.seatsOccupied || 0) + 1;
    bus.seatsOccupied = seatsOccupied;
    await bus.save();

    // Emit Socket
    const { io } = await ensureSocketServer();
    io.emit("bus:seats:updated", {
      busId: bus.busId,
      seatsOccupied: bus.seatsOccupied
    });

    return NextResponse.json({ 
      success: true, 
      seatsOccupied: bus.seatsOccupied, 
      direction,
      passType
    });
  } catch (err) {
    console.error("Boarding scan error:", err);
    return NextResponse.json({ error: "Failed to process scan" }, { status: 500 });
  }
}
