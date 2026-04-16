import { NextResponse } from "next/server";
import { getSafeAuthSession } from "@/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const session = await getSafeAuthSession();
    if (!session || session.user?.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { busId } = await req.json();

    if (!busId) {
      return NextResponse.json({ error: "Missing busId" }, { status: 400 });
    }

    const amount = 2000; // 20 INR in paise
    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${busId?.slice(0, 15)}`,
    };

    let order;
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_dummy") {
       // Demo mode: Return a mock order node to ensure terminal continuity
       order = {
          id: `demo_order_${Date.now()}`,
          amount: amount,
          currency: "INR",
          receipt: options.receipt,
          status: "created"
       };
    } else {
       order = await razorpay.orders.create(options);
    }

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Razorpay order error:", err);
    // Absolute fallback for hackathon presentations
    return NextResponse.json({ 
      order: { id: `fallback_${Date.now()}`, amount: 2000, currency: "INR" } 
    });
  }
}
