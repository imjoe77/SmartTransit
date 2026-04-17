import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-helpers";
import { connectToDatabase } from "@/lib/mongodb";
import { BusModel } from "@/models/Bus";
import { RouteModel } from "@/models/Route";
import { readLiveBusPosition } from "@/lib/transit";
import { answerScheduleQuery } from "@/lib/rag";

async function getSnapshotForAI() {
  await connectToDatabase();
  const buses = await BusModel.find({}).lean();
  const routeIds = buses.map((bus) => bus.routeId);
  const routes = await RouteModel.find({ _id: { $in: routeIds } })
    .select("_id name")
    .lean();
  const routeMap = new Map(routes.map((route) => [String(route._id), route.name]));

  const busSnapshot = await Promise.all(
    buses.map(async (bus) => {
      const live = await readLiveBusPosition(bus.busId);
      return {
        number: bus.busId,
        routeName: routeMap.get(String(bus.routeId)) || "",
        status: bus.status,
        nextStop: bus.nextStop,
        etaMinutes: bus.eta || 1,
        delayMinutes: 0,
        coordinates: live ? { lat: live.lat, lng: live.lng } : bus.coordinates,
      };
    })
  );

  return {
    lastUpdated: new Date().toISOString(),
    buses: busSnapshot,
  };
}

export async function POST(request) {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const message = body?.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  const lowerMsg = message.toLowerCase();
  const isScheduleQuery = ["time", "when", "depart", "arrive", "schedule", "delay", "late", "early", "morning", "evening", "loop", "hubli", "dharwad", "campus", "trip", "eta"].some(key => lowerMsg.includes(key));

  // Try RAG for specific schedule/historical performance queries
  if (isScheduleQuery) {
    try {
      const reply = await answerScheduleQuery(message);
      // Only return early if RAG actually found something useful and didn't give a refusal
      if (reply && !reply.includes("haven't been set up") && !reply.includes("don't have that information")) {
        return NextResponse.json({ reply, source: "rag" });
      }
    } catch (error) {
      console.error("RAG Error:", error);
    }
  }

  let snapshot;
  try {
    snapshot = await getSnapshotForAI();
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load bus snapshot", details: error.message },
      { status: 500 }
    );
  }
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    const quickReply = `Demo mode: I do not have OpenRouter credentials. Current buses: ${snapshot.buses
      .map(
        (bus) =>
          `${bus.number} (${bus.routeName}) ${bus.status}, next stop ${bus.nextStop} in ~${bus.etaMinutes} min`
      )
      .join("; ")}`;
    return NextResponse.json({ reply: quickReply, source: "fallback" });
  }

  // Also fetch RAG context for the general LLM so it always has route knowledge
  let ragContext = "";
  try {
    await connectToDatabase();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;
    const knowledgeDocs = await db.collection("routeknowledge").find({}).toArray();
    ragContext = knowledgeDocs
      .map(d => d.textSummary || d.text || "")
      .filter(t => t.length > 5)
      .join("\n");
  } catch (e) {
    console.warn("[Chat] Could not fetch RAG context for general LLM:", e.message);
  }

  const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "SmartTransit AI",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are SmartTransit assistant for students. Answer based on the transit knowledge base and live snapshot provided. Keep answers short and practical. If you don't have enough data to answer, say so clearly.",
        },
        {
          role: "system",
          content: `Transit Knowledge Base:\n${ragContext || "No route knowledge available."}\n\nLive Transit Snapshot:\n${JSON.stringify(snapshot)}`,
        },
        { role: "user", content: message },
      ],
    }),
  });

  if (!completion.ok) {
    const text = await completion.text();
    return NextResponse.json(
      { error: "OpenRouter request failed", details: text },
      { status: 502 }
    );
  }

  const payload = await completion.json();
  const reply =
    payload?.choices?.[0]?.message?.content ??
    "I could not generate a response right now.";

  return NextResponse.json({ reply, source: "openrouter" });
}
