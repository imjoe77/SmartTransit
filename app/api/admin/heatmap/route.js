import { NextResponse } from "next/server";

const dummyStops = [
  { id: "1", name: "Hubballi Old Bus Stand", route: "Route 1", lat: 15.3647, lng: 75.1240 },
  { id: "2", name: "BVB College Entrance", route: "Route 2", lat: 15.3688, lng: 75.1226 },
  { id: "3", name: "Navanagar Cancer Hospital", route: "Route 1", lat: 15.3970, lng: 75.0810 },
  { id: "4", name: "Toll Naka", route: "Route 3", lat: 15.3850, lng: 75.1150 },
  { id: "5", name: "SDM Medical College", route: "Route 2", lat: 15.4215, lng: 75.0211 },
  { id: "6", name: "Dharwad Jubilee Circle", route: "Route 1", lat: 15.4578, lng: 75.0080 },
  { id: "7", name: "KCD Main Gate", route: "Route 3", lat: 15.4485, lng: 75.0065 },
  { id: "8", name: "Unkal Lake", route: "Route 1", lat: 15.3785, lng: 75.1189 },
  { id: "9", name: "Rayapur Bypass", route: "Route 2", lat: 15.4124, lng: 75.0519 },
  { id: "10", name: "BRTS Hubli", route: "Route 3", lat: 15.3562, lng: 75.1471 }
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "today";
  
  // Dummy data multiplier for period
  const mult = period === "all_time" ? 45 : period === "week" ? 7 : 1;
  const baseSeed = period === "all_time" ? 2 : period === "week" ? 1 : 0;

  const data = dummyStops.map((stop, idx) => {
    // Generate some randomized but consistent-looking demand
    let demand = (Math.abs(Math.sin((idx + baseSeed) * 10)) * 60 + 5) * mult;
    if (stop.name === "BVB College Entrance" || stop.name === "SDM Medical College") demand *= 3; // high demand
    if (stop.name === "Rayapur Bypass") demand *= 0.2; // low demand
    
    return { ...stop, boardings: Math.floor(demand) };
  });

  return NextResponse.json({ stops: data.sort((a,b) => b.boardings - a.boardings) });
}
