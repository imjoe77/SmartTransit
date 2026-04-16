import { NextResponse } from "next/server";
import { BusModel } from "@/models/Bus";
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
    
    // If assigning a driver, check if they are already on another bus
    if (body.driverEmail) {
      const existing = await BusModel.findOne({ 
        driverEmail: body.driverEmail, 
        busId: { $ne: id } 
      }).lean();
      if (existing) {
        return NextResponse.json({ 
          error: `Driver is already assigned to ${existing.busId}` 
        }, { status: 400 });
      }
    }

    const bus = await BusModel.findOneAndUpdate({ busId: id }, body, { new: true }).lean();
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }
    return NextResponse.json({ bus });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update bus", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await connectToDatabase();
    const bus = await BusModel.findOneAndDelete({ busId: id }).lean();
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    await RouteModel.updateOne({ _id: bus.routeId }, { $pull: { assignedBuses: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete bus", details: error.message },
      { status: 500 }
    );
  }
}
