const http = require("node:http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const rawAllowedOrigins = process.env.CORS_ORIGIN || "*";
const allowedOrigins = rawAllowedOrigins
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const allowAllOrigins = allowedOrigins.includes("*");

const corsOptions = {
  origin(origin, callback) {
    if (allowAllOrigins || !origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed`));
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" }));

const io = new Server(server, {
  cors: {
    origin: allowAllOrigins ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/emit", (req, res) => {
  const expectedToken = process.env.SOCKET_SERVICE_TOKEN || "";
  const providedToken = req.header("x-socket-token") || "";
  if (expectedToken && providedToken !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized emit request" });
  }

  const { event, payload } = req.body || {};
  if (!event || typeof event !== "string") {
    return res.status(400).json({ error: "Missing or invalid event name" });
  }

  io.emit(event, payload ?? null);
  return res.json({ ok: true });
});

io.on("connection", (socket) => {
  socket.emit("socket:ready", { connectedAt: Date.now() });
});

const port = Number(process.env.PORT || 4001);
server.listen(port, () => {
  console.log(`Socket service listening on port ${port}`);
});
