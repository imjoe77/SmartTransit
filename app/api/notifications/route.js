import { NextResponse } from "next/server";
import { NotificationModel } from "@/models/Notification";
import { UserModel } from "@/models/User";
import { BusModel } from "@/models/Bus";
import { withAuth, toPlain } from "@/lib/api-utils";

function hashText(value) {
  const text = `${value || ""}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export async function GET() {
  return withAuth(async (session) => {
    try {
      const role = session.user.role;
      let notifications = [];

      if (role === "student") {
        const email = `${session.user?.email || ""}`.toLowerCase().trim();
        const user = email ? await UserModel.findOne({ email }).lean() : null;
        const preferredRouteId = user?.studentProfile?.preferredRouteId;

        if (preferredRouteId) {
          const routeBuses = await BusModel.find({ routeId: preferredRouteId }).sort({ busId: 1 }).lean();
          const assignedBus = routeBuses.length
            ? routeBuses[hashText(user?._id || email) % routeBuses.length]
            : null;

          if (assignedBus) {
            const dbNotifications = await NotificationModel.find({
              targetRole: { $in: ["all", "student"] },
              busId: assignedBus.busId,
            })
              .sort({ timestamp: -1 })
              .limit(20)
              .lean();

            const liveGenerated = [];
            if (assignedBus.status === "active") {
              liveGenerated.push({
                _id: `live-start-${assignedBus.busId}`,
                type: "info",
                message: `${assignedBus.busId} has started the trip.`,
                busId: assignedBus.busId,
                targetRole: "student",
                timestamp: new Date().toISOString(),
                read: false,
              });
            }

            if (assignedBus.eta <= 5) {
              liveGenerated.push({
                _id: `live-arrive-${assignedBus.busId}-${assignedBus.nextStop || "stop"}`,
                type: "arrival",
                message: `${assignedBus.busId} is arriving at ${assignedBus.nextStop || "your stop"} in ~${Math.max(1, assignedBus.eta || 1)} min.`,
                busId: assignedBus.busId,
                targetRole: "student",
                timestamp: new Date().toISOString(),
                read: false,
              });
            }

            notifications = [...liveGenerated, ...dbNotifications];
          }
        }
      } else {
        notifications = await NotificationModel.find({
          targetRole: { $in: ["all", role] },
        })
          .sort({ timestamp: -1 })
          .limit(20)
          .lean();
      }

      return NextResponse.json({
        notifications: toPlain(notifications),
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to load notifications", details: error.message },
        { status: 500 }
      );
    }
  });
}
