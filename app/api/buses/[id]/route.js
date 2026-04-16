import { NextResponse } from "next/server";
import { BusModel } from "@/models/Bus";
import { withAuth, toPlain } from "@/lib/api-utils";
import { enrichBusDocument } from "@/lib/transit";

export async function GET(_request, { params }) {
  return withAuth(async () => {
    try {
      const { id } = await params;
      const bus = await BusModel.findOne({ busId: id }).lean();
      if (!bus) {
        return NextResponse.json({ error: "Bus not found" }, { status: 404 });
      }

      const enriched = await enrichBusDocument(bus);
      return NextResponse.json({ bus: toPlain(enriched) });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to load bus", details: error.message },
        { status: 500 }
      );
    }
  });
}
