import { NextResponse } from "next/server";
import { NotificationModel } from "@/models/Notification";
import { withAuth } from "@/lib/api-utils";

export async function POST(request) {
  return withAuth(async () => {
    try {
      const body = await request.json();
      const ids = Array.isArray(body?.ids) ? body.ids : [];
      if (!ids.length) {
        return NextResponse.json({ error: "ids array is required" }, { status: 400 });
      }

      await NotificationModel.updateMany({ _id: { $in: ids } }, { $set: { read: true } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to mark notifications as read", details: error.message },
        { status: 500 }
      );
    }
  });
}
