const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "campusride";
  console.log("Connecting to:", uri?.substring(0, 30) + "...", "DB:", dbName);

  await mongoose.connect(uri, { dbName });

  // 1. Check routes
  const routes = await mongoose.connection.collection("routes").find({}).toArray();
  console.log(`\n=== ROUTES: ${routes.length} ===`);
  routes.forEach(r => {
    console.log(`  - ${r.name} | stops: ${r.stops?.length || 0} | routeId: ${r.routeId}`);
    if (r.stops?.length) {
      console.log(`    stops: ${r.stops.map(s => s.name).join(", ")}`);
    }
  });

  // 2. Check buses
  const buses = await mongoose.connection.collection("buses").find({}).toArray();
  console.log(`\n=== BUSES: ${buses.length} ===`);
  buses.forEach(b => console.log(`  - ${b.busId} | routeId: ${b.routeId}`));

  // 3. Check routeknowledge
  const rk = await mongoose.connection.collection("routeknowledge").find({}).toArray();
  console.log(`\n=== ROUTEKNOWLEDGE: ${rk.length} ===`);
  rk.forEach(doc => {
    console.log(`  - text: "${doc.text}"`);
    console.log(`    embedding length: ${doc.embedding?.length || 0}`);
  });

  if (rk.length === 0) {
    console.log("\n⚠️  routeknowledge is EMPTY! The RAG seeder has not run successfully.");
    console.log("   You need to hit /api/admin/setup-rag as an admin.");
  }

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
