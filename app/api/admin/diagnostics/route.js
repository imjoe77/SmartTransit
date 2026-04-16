import { NextResponse } from "next/server";
import { UserModel } from "@/models/User";
import { requireAdminSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    
    // Count users by role to see what we have
    const counts = await UserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Sample a few users to see their structure
    const samples = await UserModel.find({}).limit(5).select("name email role").lean();

    return NextResponse.json({ 
      counts, 
      samples,
      database: "SmartTransit", // Checking if we are where we think we are
      collection: UserModel.collection.name
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
