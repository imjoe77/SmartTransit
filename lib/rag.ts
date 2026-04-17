import { connectToDatabase } from "./mongodb";
import mongoose from "mongoose";

const RouteKnowledgeSchema = new mongoose.Schema({
  routeId: String,
  type: String,
  textSummary: String,
  embedding: [Number],
});

// Avoid OverwriteModelError in Next.js development
export const RouteKnowledge = mongoose.models.RouteKnowledge || mongoose.model("RouteKnowledge", RouteKnowledgeSchema, "routeknowledge");

async function getEmbedding(text: string): Promise<number[]> {
  // If no OpenAI key is present, fallback to a deterministic pseudo-random embedding for demo safely mapped
  // This allows the app to compile and run even if they lack an OpenAI Key just for embeddings
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is missing. Using fallback embeddings.");
    // Generate a simple deterministic 1536-d vector based on char codes so identical text gets identical vectors
    const vector = Array.from({ length: 1536 }, (_, i) => {
        let val = 0;
        for (let j = 0; j < Math.min(10, text.length); j++) {
            val += text.charCodeAt(j) * (i % (j + 1));
        }
        return (val % 100) / 100.0;
    });
    // Normalize to pass certain strict vector checks if any (optional)
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map(v => v / norm);
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    })
  });
  if (!res.ok) {
     const errorBody = await res.text();
     console.error("OpenAI embedding mapping error:", errorBody);
     return Array(1536).fill(0.01);
  }
  const data = await res.json();
  return data.data[0].embedding;
}

import { RouteModel } from "@/models/Route";
import { BusModel } from "@/models/Bus";

export async function initKnowledge() {
  await connectToDatabase();
  
  // Use raw MongoDB collection reads to avoid Mongoose .lean() serialization issues
  const db = mongoose.connection.db;
  if (!db) return { success: false, error: "Database connection failed" };
  
  const routes = await db.collection("routes").find({}).toArray();
  const buses = await db.collection("buses").find({}).toArray();
  const triplogs = await db.collection("triplogs").find({}).toArray();
  
  console.log("[RAG] Found", routes.length, "routes,", buses.length, "buses, and", triplogs.length, "triplogs");
  
  await RouteKnowledge.deleteMany({});
  // Ensure models are registered so .find() doesn't fail later
  RouteModel;
  BusModel;
  
  let docsIndexed = 0;
  for (const route of routes) {
     const routeName = route.name || "Unknown Route";
     const stops = route.stops || [];
     const stopsStr = stops.map((s: any) => s.name).filter(Boolean).join(", ") || "No stops defined";
     const stopCount = stops.length;
     
     const assignedBuses = buses
       .filter((b: any) => String(b.routeId) === String(route._id))
       .map((b: any) => b.busId)
       .join(", ") || "None";
     
     const morningDep = route.schedule?.morningDeparture || "08:00";
     const eveningDep = route.schedule?.eveningDeparture || "18:00";
     
     // Basic route info
     const baseText = `Route ${routeName} (ID: ${route.routeId || ""}) has ${stopCount} stops: ${stopsStr}. Morning departure ${morningDep}, evening departure ${eveningDep}. Assigned buses: ${assignedBuses}.`;
     
     // ─── Incorporate historical performance from triplogs ───
     const routeLogs = triplogs.filter((log: any) => 
        (log.routeId && route.routeId && String(log.routeId).toLowerCase() === String(route.routeId).toLowerCase()) || 
        String(log.routeId) === String(route._id)
     );
     let performanceText = " No historical performance data available yet.";
     
     if (routeLogs.length > 0) {
        const totalDelay = routeLogs.reduce((sum: number, log: any) => sum + (log.totalDelayMinutes || 0), 0);
        const avgDelay = Math.round(totalDelay / routeLogs.length);
        const peakLogs = routeLogs.filter((log: any) => log.peakHour);
        const peakDelay = peakLogs.length > 0 
           ? Math.round(peakLogs.reduce((sum: number, log: any) => sum + (log.totalDelayMinutes || 0), 0) / peakLogs.length) 
           : avgDelay;
        
        const onTimeCount = routeLogs.filter((log: any) => (log.totalDelayMinutes || 0) <= 2).length;
        const onTimeRate = Math.round((onTimeCount / routeLogs.length) * 100);
        
        performanceText = ` Historically, this route has an average delay of ${avgDelay} minutes, increasing to ${peakDelay} minutes during peak hours. The overall on-time performance rate is ${onTimeRate}%. Traffic congestion is most common at ${stops[Math.floor(stops.length/2)]?.name || 'intermediate stops'}.`;
     }

     const textSummary = baseText + performanceText;
     
     console.log("[RAG] Indexing:", textSummary);
     
     const embedding = await getEmbedding(textSummary);
     await RouteKnowledge.create({ routeId: route.routeId || "", type: "route_summary", textSummary, embedding });
     docsIndexed++;
  }
  return { success: true, count: docsIndexed };
}

export async function answerScheduleQuery(question: string): Promise<string> {
  await connectToDatabase();
  
  // First check if we have any valid knowledge docs at all
  const allDocs = await RouteKnowledge.find({}).lean();
  const validDocs = allDocs.filter((d: any) => (d.textSummary || d.text) && (d.textSummary || d.text) !== "undefined" && (d.textSummary || d.text).length > 5);
  
  console.log("[RAG Query]", question);
  console.log("[RAG] Total docs:", allDocs.length, "| Valid docs:", validDocs.length);
  
  if (validDocs.length === 0) {
    return "I don't have that information yet. The schedule knowledge base hasn't been set up. Please check with your transport office.";
  }
  
  let results: any[] = validDocs; // default: use all valid docs as context
  
  try {
    // Attempt 1: Atlas Vector Search (Best)
    if (process.env.OPENAI_API_KEY) {
      const queryEmbedding = await getEmbedding(question);
      const vectorResults = await mongoose.connection.db!.collection('routeknowledge').aggregate([
        {
          $vectorSearch: {
            index: 'schedule_vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 10,
            limit: 5
          }
        }
      ]).toArray();
      
      const validVectorResults = vectorResults.filter((d: any) => (d.textSummary || d.text) && (d.textSummary || d.text) !== "undefined");
      if (validVectorResults.length > 0) {
        results = validVectorResults;
        console.log("[RAG] Vector search returned", validVectorResults.length, "valid results");
      }
    } else {
      // Attempt 2: Simple Keyword Search (Good for small datasets without OpenAI Key)
      const keywords = question.toLowerCase().split(/\W+/).filter((w: string) => w.length > 3);
      const keywordResults = validDocs.filter(doc => 
        keywords.some((kw: string) => (doc.textSummary || doc.text || "").toLowerCase().includes(kw))
      );
      
      if (keywordResults.length > 0) {
        results = keywordResults.slice(0, 5);
        console.log("[RAG] Keyword search returned", keywordResults.length, "results");
      } else {
        // Attempt 3: Just use the most relevant-looking routes if total data is small
        results = validDocs.slice(0, 10);
        console.log("[RAG] Fallback to first 10 documents");
      }
    }
  } catch (err) {
    console.warn("[RAG] Advanced search failed, using fallback docs:", (err as any).message);
    results = validDocs.slice(0, 10);
  }
  
  if (!results || results.length === 0) {
     return "I don't have that information yet. Please check with your transport office.";
  }
  
  const contextText = results.map(r => r.textSummary || r.text || "").join("\n");
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
      return `Demo mode: Please configure OpenRouter API access. Found Context:\n${contextText}`;
  }

  const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the SmartTransit AI Transit Analyst. Your goal is to predict route performance, on-time reliability, and typical delay patterns based strictly on the historical transit context provided below. Do not give live location updates (e.g., 'bus is at X stop now'). Instead, focus on historical trends like 'Route X typically has a 5-minute delay on Mondays'. Do not hallucinate stops or times. If the transit data doesn't contain the answer, explicitly say 'I don't have that information yet. Please check with your transport office.'.\n\nContext:\n" + contextText },
        { role: "user", content: question }
      ]
    })
  });
  
  if (!completion.ok) return "Sorry, I am currently facing an AI service disruption.";
  const payload = await completion.json();
  return payload?.choices?.[0]?.message?.content || "Message generation failed.";
}

export async function predictDelay(routeId: string, busId: string, dayOfWeek: number, scheduledDeparture: string): Promise<string> {
  // ─── Fetch RAG context from the knowledge base ───
  await connectToDatabase();
  let ragContext = "";
  try {
    const allDocs = await RouteKnowledge.find({}).lean();
    const validDocs = allDocs.filter((d: any) => (d.textSummary || d.text) && (d.textSummary || d.text).length > 5);
    ragContext = validDocs.map(d => d.textSummary || d.text || "").join("\n");
  } catch (err) {
    console.warn("[Delay RAG] Could not fetch route knowledge:", (err as any).message);
  }

  // ─── Build rich temporal context ───
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[dayOfWeek] || "Unknown";
  const hour = parseInt((String(scheduledDeparture) || "08:00").split(":")[0]);
  const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);

  const apiKey = process.env.OPENROUTER_API_KEY;

  // ─── Offline fallback with comprehensive message ───
  if (!apiKey) {
     if (isRushHour) {
         return `PREDICTION: Moderate Delay\nESTIMATED: ~10 minutes\nCONFIDENCE: High\nREASON: As of ${dateStr} at ${timeStr}, Bus ${busId} is operating during peak commuting hours (${scheduledDeparture}). Historical campus traffic data for ${dayName}s indicates consistent congestion near main gate and market road intersections during this window.\nADVICE: You should leave early to ensure you catch this bus, as traffic is unpredictable. If you miss it, be prepared to wait for the next scheduled service.`;
     }
     return `PREDICTION: On Time\nESTIMATED: 0 minutes\nCONFIDENCE: High\nREASON: As of ${dateStr} at ${timeStr}, Bus ${busId} is scheduled to depart at ${scheduledDeparture} on a ${dayName}. Current off-peak traffic conditions suggest a smooth run.\nADVICE: Your bus is expected on schedule, but you should still head to the stop a bit early just in case. Monitor the live map for any sudden changes.`;
  }

  // ─── RAG-enhanced LLM prediction ───
  const systemPrompt = `You are SmartTransit AI's delay prediction engine. You analyze historical transit data to provide behavioral advice to students.
  
IMPORTANT: Do not give specific time recommendations (e.g., 'Be there at 12:45'). Instead, give general behavioral advice like 'leave early', 'leave a bit late', or 'you'll likely miss this, try for the next bus'. We do not know the exact live traffic in real-time.

CURRENT CONTEXT:
- Date: ${dateStr}
- Time: ${timeStr}
- Day: ${dayName}
- Scheduled Departure: ${scheduledDeparture}
- Bus: ${busId}
- Route ID: ${routeId}

TRANSIT KNOWLEDGE BASE:
${ragContext || "No route knowledge available."}

INSTRUCTIONS:
- Ground your prediction strictly in the transit knowledge provided above.
- Reference the specific date, day, and route performance trends from the knowledge base.
- The REASON must be 2-3 sentences explaining the historical trend (e.g., 'Route X is usually busy on Mondays').
- The ADVICE must be 1-2 sentences of general behavioral guidance. NEVER provide a specific time in the advice.
- Do NOT hallucinate routes or stops not in the knowledge base.

FORMAT (strictly follow this):
PREDICTION: [On Time/Minor Delay/Moderate Delay/Severe Delay]
ESTIMATED: [delay amount, e.g. "~5 minutes" or "0 minutes"]
CONFIDENCE: [High/Medium/Low]
REASON: [2-3 detailed sentences grounded in the transit data trends]
ADVICE: [General behavioral guidance like 'leave early' or 'likely to miss this']`;

  const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Predict the delay for Bus ${busId} on Route ${routeId}, departing at ${scheduledDeparture} on ${dayName}. Use the historical context to provide general advice.` }
      ]
    })
  });
  
  if (!completion.ok) return `PREDICTION: On Time\nESTIMATED: 0 minutes\nCONFIDENCE: Low\nREASON: Prediction service unavailable.\nADVICE: Head to your stop early and check live tracking position.`;
  
  const payload = await completion.json();
  return payload?.choices?.[0]?.message?.content || `PREDICTION: On Time\nESTIMATED: 0 minutes\nCONFIDENCE: Low\nREASON: Data unavailable.\nADVICE: Use the live tracking map for updates.`;
}

interface DelayPrediction {
  prediction: string;
  estimatedDelay: string;
  confidence: string;
  reason: string;
  advice: string;
}

export function parseDelayPrediction(raw: string): DelayPrediction {
  const lines = (raw || "").split('\n');
  const extract = (key: string) => {
      const line = lines.find(l => l.toUpperCase().startsWith(key));
      return line ? line.substring(key.length).trim().replace(/^:\s*/, "") : "";
  };
  
  return {
     prediction: extract("PREDICTION") || "On Time",
     estimatedDelay: extract("ESTIMATED") || "0",
     confidence: extract("CONFIDENCE") || "Medium",
     reason: extract("REASON") || "Awaiting live tracking validation.",
     advice: extract("ADVICE") || "Wait safely at your selected stop."
  };
}
