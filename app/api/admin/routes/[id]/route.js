import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { RouteModel } from "@/models/Route";
import { requireAdminSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH(request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  try {
    await connectToDatabase();
    const query = Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { routeId: id }] } : { routeId: id };
    const route = await RouteModel.findOneAndUpdate(query, body, { new: true }).lean();
    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
    return NextResponse.json({ route });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update route", details: error.message },
      { status: 500 }
    );
  }
}
