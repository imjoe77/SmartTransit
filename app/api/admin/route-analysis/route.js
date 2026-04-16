import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { stops } = await req.json();
    if (!stops || !stops.length) {
      return NextResponse.json({ error: "No stops provided" }, { status: 400 });
    }

    const top10 = stops.slice(0, 10).map(s => `${s.name} (${s.boardings} boardings)`).join(", ");
    const bottom5 = stops.slice(-5).map(s => `${s.name} (${s.boardings} boardings)`).join(", ");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestions: [
        "Deploy articulated buses to BVB College and SDM Medical College during morning peak hours.",
        "Consider discontinuing or merging Rayapur Bypass due to critically low boarding volume.",
        "Introduce a direct express shuttle running exclusively between Jubilee Circle and Unkal Lake."
      ]});
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
          { role: "system", content: "You act as an expert Transit Analyst. Return 3-5 concise, actionable bullet point suggestions for optimizing bus routes based on transit passenger demand data. Do NOT use markdown. Start directly with the suggestions." },
          { role: "user", content: `High Demand Stops: ${top10}. Low Demand Stops: ${bottom5}. Give actionable suggestions like merging underused stops, shifting frequency, etc.` }
        ]
      })
    });

    if (!completion.ok) {
      return NextResponse.json({ error: "Failed to reach AI provider" }, { status: 500 });
    }

    const payload = await completion.json();
    const reply = payload?.choices?.[0]?.message?.content || "";
    
    // Process markdown lists into array strings
    const suggestions = reply.split("\n").map(l => l.replace(/^[-\*\d\.]+\s*/, "").trim()).filter(Boolean);

    return NextResponse.json({ suggestions });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
