# CampusRide (Phase 1)

CampusRide is a Next.js App Router project for college bus tracking with persistent backend data, student onboarding, and live GPS updates.

## Stack

- Next.js + React
- NextAuth (GitHub + Google)
- MongoDB + Mongoose
- Redis (ioredis) for live bus location cache (`bus:live:{busId}` TTL 30s)
- Socket.IO for real-time GPS ingestion and broadcast
- Leaflet / React-Leaflet for maps

## Implemented in Phase 1

- Persistent models in `models/`: `User`, `Bus`, `Route`, `Notification`
- MongoDB singleton connection: `lib/mongodb.ts`
- Redis singleton client: `lib/redis.ts`
- ETA utility with Haversine: `lib/eta.ts`
- Socket server singleton + GPS events: `lib/socket.ts`
- Socket init API: `GET /api/socketio`
- Role-aware auth + Mongo upsert + onboarding flags in `auth.js`
- Role/onboarding routing middleware in `middleware.ts`
- Student onboarding page: `/onboarding`
- Student profile page: `/profile` (route + boarding stop edits)
- Driver page: `/driver` with Start Trip / End Trip GPS broadcast
- Student-centric tracking page `/tracking` with:
  - My Route cards
  - Other Routes accordion
  - Live map with student marker (device geolocation)
  - Live bus updates via `bus:moved`

## API Routes

- `GET /api/buses`
- `GET /api/buses/[id]`
- `GET /api/routes`
- `GET /api/routes/[id]`
- `GET /api/notifications`
- `POST /api/notifications/mark-read`
- `GET /api/user/profile`
- `PATCH /api/user/profile`
- `GET /api/admin/buses`
- `POST /api/admin/buses`
- `DELETE /api/admin/buses/[id]`
- `GET /api/admin/routes`
- `POST /api/admin/routes`
- `PATCH /api/admin/routes/[id]`
- `POST /api/chat`

## Prerequisites

Before running the application, ensure you have the following installed and running:

- **Node.js** (v18+)
- **MongoDB** (Local or Atlas)
- **Redis** (Required for live tracking cache)
- **Python 3.10+** (Required for Fatigue Detection Service)

## Setup

1. **Clone and Install Node Dependencies**
   ```bash
   git clone <repo-url>
   cd smarttransit
   npm install
   ```

2. **Configure Environment Variables**
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   *Note: Ensure `MONGODB_URI` and `REDIS_URL` are correct.*

3. **Setup Fatigue Detection Service (Python)**
   ```bash
   cd fatigue-service
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

4. **Seed Database**
   ```bash
   # From the smarttransit directory
   npm run seed
   ```

## Running the Project

You need to run both the Next.js app and the Fatigue Service:

1. **Start Next.js (Terminal 1)**
   ```bash
   npm run dev
   ```

2. **Start Fatigue Service (Terminal 2)**
   ```bash
   cd fatigue-service
   # Activate venv if not already active
   python main.py
   # Or using uvicorn:
   # uvicorn main:app --port 8000
   ```


## License

MIT
