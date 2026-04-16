import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdminSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { toPlain } from "@/lib/api-utils";

function parseEmailList(value) {
  return new Set((value || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean));
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    const driverEmails = parseEmailList(process.env.DRIVER_EMAILS);
    
    // Discovery: Find any collection that looks like users
    const collectionList = await db.listCollections().toArray();
    const userCollCandidates = collectionList
      .map(c => c.name)
      .filter(n => n.toLowerCase().includes('user') || n.toLowerCase().includes('account'));
    
    console.log(`[Drivers API] Candidate collections: ${userCollCandidates.join(', ')}`);

    let allUsers = [];
    for (const collName of userCollCandidates) {
      const users = await db.collection(collName).find({}).toArray();
      allUsers = [...allUsers, ...users];
    }

    // De-duplicate by email
    const uniqueUsers = Array.from(new Map(allUsers.map(u => [u.email, u])).values());

    // Filter for drivers: Either they have the role OR their email is in the DRIVER_EMAILS list
    const drivers = uniqueUsers.filter(u => {
      const email = (u.email || "").toLowerCase().trim();
      const role = (u.role || "").toLowerCase().trim();
      return role === "driver" || driverEmails.has(email);
    });

    console.log(`[Drivers API] Found ${drivers.length} drivers from ${uniqueUsers.length} unique users.`);

    // Discovery: Find bus collection
    const busCollName = collectionList.find(c => c.name.toLowerCase() === 'buses' || c.name === 'Bus')?.name || 'buses';
    const buses = await db.collection(busCollName).find({ 
      driverEmail: { $exists: true, $ne: "" } 
    }).project({ busId: 1, driverEmail: 1 }).toArray();
    
    const assignedEmails = new Set(buses.map(b => (b.driverEmail || "").toLowerCase().trim()));

    const driversWithStatus = drivers.map(driver => ({
      ...driver,
      _id: driver._id.toString(),
      isAssigned: assignedEmails.has((driver.email || "").toLowerCase().trim()),
      role: driver.role || "driver" // Ensure role is set for display
    }));

    return NextResponse.json({ drivers: toPlain(driversWithStatus) });
  } catch (error) {
    console.error("[Drivers API Error]", error);
    return NextResponse.json(
      { error: "Failed to load drivers", details: error.message },
      { status: 500 }
    );
  }
}
