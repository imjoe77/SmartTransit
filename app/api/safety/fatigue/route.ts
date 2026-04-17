import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { NotificationModel } from "@/models/Notification";
import { emitSocketEvent } from "@/lib/socket/socket";

// Use 127.0.0.1 instead of localhost — on Windows, localhost often
// resolves to IPv6 ::1 while Python/FastAPI binds to IPv4 only.
const FATIGUE_SERVICE_URL =
  process.env.FATIGUE_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * POST /api/safety/fatigue
 *
 * Two modes:
 *  1. { image: string }           → proxy to Python /analyze-frame, return result
 *  2. { alert: true, busId, ... } → persist notification + emit socket event
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ── Mode 1: Proxy frame analysis to Python service ────────────────
    if (body.image && !body.alert) {
      let pyRes: Response;

      try {
        pyRes = await fetch(`${FATIGUE_SERVICE_URL}/analyze-frame`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: body.image }),
          signal: AbortSignal.timeout(15_000), // 15s timeout (face detection can be slow)
        });
      } catch (fetchErr: any) {
        // Connection refused, timeout, DNS failure, etc.
        console.error("[fatigue] Cannot reach Python service:", fetchErr.message);
        return NextResponse.json(
          {
            error: "Fatigue detection service unreachable. Make sure the Python service is running on port 8000.",
            detail: fetchErr.message,
            fatigued: false,
            ear: null,
            face_detected: false,
          },
          { status: 503 }
        );
      }

      // Try to parse the response
      let result: any = null;
      try {
        result = await pyRes.json();
      } catch {
        console.warn("[fatigue] Could not parse Python response");
        return NextResponse.json(
          {
            error: "Invalid response from fatigue service",
            fatigued: false,
            ear: null,
            face_detected: false,
          },
          { status: 502 }
        );
      }

      if (!pyRes.ok) {
        const detail = result?.error || result?.detail || `HTTP ${pyRes.status}`;
        console.warn("[fatigue] Python service error:", detail);
        return NextResponse.json(
          {
            error: `Fatigue service error: ${detail}`,
            fatigued: false,
            ear: null,
            face_detected: false,
          },
          { status: 502 }
        );
      }

      // If Python returned a 200 but with an error field, treat as a soft failure
      // but STILL return the data (it may contain face_detected and ear info)
      if (result.error) {
        console.warn("[fatigue] Python soft error:", result.error);
        return NextResponse.json(
          {
            fatigued: result.fatigued ?? false,
            ear: result.ear ?? null,
            confidence: result.confidence ?? "none",
            face_detected: result.face_detected ?? false,
            error: result.error,
            reason: result.reason || result.error,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(result);
    }

    // ── Mode 2: Persist fatigue alert + broadcast ─────────────────────
    if (body.alert) {
      const { busId, driverId, ear, coordinates } = body;

      if (!busId) {
        return NextResponse.json(
          { error: "busId is required" },
          { status: 400 }
        );
      }

      await connectToDatabase();

      await NotificationModel.create({
        type: "alert",
        message: `😴 FATIGUE ALERT: Driver of Bus ${busId} appears drowsy (EAR: ${ear?.toFixed(2) ?? "N/A"})`,
        busId,
        targetRole: "admin",
      });

      await emitSocketEvent("safety:fatigue", {
        busId,
        driverId: driverId || null,
        ear: ear ?? null,
        coordinates: coordinates || null,
        timestamp: new Date().toISOString(),
        googleMapsLink: coordinates
          ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
          : null,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Fatigue API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
