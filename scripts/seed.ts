import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

type RouteSeed = {
  routeId: string;
  name: string;
  schedule: { morningDeparture: string; eveningDeparture: string };
  stops: string[];
};

function loadLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 0) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (key) {
      process.env[key] = value;
    }
  }
}

async function seed() {
  loadLocalEnvFile();

  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || "campusride",
  });

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Mongo database handle is unavailable");
  }
  const now = new Date();

  await Promise.all([
    db.collection("routes").deleteMany({}),
    db.collection("buses").deleteMany({}),
    db.collection("users").deleteMany({}),
    db.collection("notifications").deleteMany({}),
  ]);

  const routeSeeds: RouteSeed[] = [
    {
      routeId: "R-01",
      name: "Towards Dharwad",
      schedule: { morningDeparture: "08:00", eveningDeparture: "17:30" },
      stops: ["SDM College", "Navanagar", "RTO Circle", "New Court Stop", "Isckon", "Dharwad New Bus Stand"],
    },
    {
      routeId: "R-02",
      name: "Towards Hubli",
      schedule: { morningDeparture: "07:45", eveningDeparture: "18:00" },
      stops: ["KMC", "Vidyanagar", "Old Bus Stand", "Hubli Railway Station", "CBT", "Keshwapur"],
    },
    {
      routeId: "R-03",
      name: "Rural Loop",
      schedule: { morningDeparture: "08:15", eveningDeparture: "17:45" },
      stops: ["Hebballi", "Kusugal", "Agadi", "Lakshmeshwar", "Sulla", "RamNagar"],
    },
  ];

  const routeDocs = routeSeeds.map((seed) => ({
    routeId: seed.routeId,
    name: seed.name,
    stops: seed.stops.map((name, index) => ({
      stopId: `${seed.routeId}-S${index + 1}`,
      name,
      lat: 0,
      lng: 0,
      order: index + 1,
    })),
    assignedBuses: [],
    schedule: seed.schedule,
    createdAt: now,
    updatedAt: now,
    __v: 0,
  }));

  const routeInsert = await db.collection("routes").insertMany(routeDocs);
  const routeIds = Object.values(routeInsert.insertedIds);

  const busDocs = [
    {
      busId: "BUS-01",
      routeId: routeIds[0],
      driverName: "Driver One",
      status: "idle",
      currentStop: "",
      nextStop: "",
      eta: 1,
      coordinates: { lat: 0, lng: 0 },
      seatCapacity: 40,
      seatsOccupied: 0,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      busId: "BUS-02",
      routeId: routeIds[1],
      driverName: "Driver Two",
      status: "idle",
      currentStop: "",
      nextStop: "",
      eta: 1,
      coordinates: { lat: 0, lng: 0 },
      seatCapacity: 40,
      seatsOccupied: 0,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      busId: "BUS-03",
      routeId: routeIds[2],
      driverName: "Driver Three",
      status: "idle",
      currentStop: "",
      nextStop: "",
      eta: 1,
      coordinates: { lat: 0, lng: 0 },
      seatCapacity: 40,
      seatsOccupied: 0,
      lastUpdated: now,
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
  ];

  await db.collection("buses").insertMany(busDocs);

  await db.collection("routes").updateOne({ _id: routeIds[0] }, { $set: { assignedBuses: ["BUS-01"] } });
  await db.collection("routes").updateOne({ _id: routeIds[1] }, { $set: { assignedBuses: ["BUS-02"] } });
  await db.collection("routes").updateOne({ _id: routeIds[2] }, { $set: { assignedBuses: ["BUS-03"] } });

  const users = [
    {
      name: "Admin One",
      email: "admin1@campusride.edu",
      image: "",
      role: "admin",
      studentProfile: {
        rollNumber: "",
        department: "",
        year: null,
        preferredRouteId: null,
        boardingStop: "",
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      name: "Admin Two",
      email: "admin2@campusride.edu",
      image: "",
      role: "admin",
      studentProfile: {
        rollNumber: "",
        department: "",
        year: null,
        preferredRouteId: null,
        boardingStop: "",
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      name: "Student One",
      email: "student1@campusride.edu",
      image: "",
      role: "student",
      studentProfile: {
        rollNumber: "CR001",
        department: "CSE",
        year: 1,
        preferredRouteId: null,
        boardingStop: "",
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      name: "Student Two",
      email: "student2@campusride.edu",
      image: "",
      role: "student",
      studentProfile: {
        rollNumber: "CR002",
        department: "ECE",
        year: 2,
        preferredRouteId: null,
        boardingStop: "",
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
    {
      name: "Student Three",
      email: "student3@campusride.edu",
      image: "",
      role: "student",
      studentProfile: {
        rollNumber: "CR003",
        department: "MBA",
        year: 3,
        preferredRouteId: null,
        boardingStop: "",
      },
      createdAt: now,
      updatedAt: now,
      __v: 0,
    },
  ];

  await db.collection("users").insertMany(users);

  console.log("Seed completed", {
    db: db.databaseName,
    routes: await db.collection("routes").countDocuments(),
    buses: await db.collection("buses").countDocuments(),
    users: await db.collection("users").countDocuments(),
  });
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
