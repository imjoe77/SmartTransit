# 🚌 SmartTransit: Intelligent Campus Mobility Grid

**"More than a tracker. A neural safety and logistics ecosystem."**

---

## 1. Introduction: Why SmartTransit?
In modern campus environments, the gap between "bus tracking" and "actual arrival" is filled with uncertainty. Traditional systems provide raw GPS data but fail to account for **human safety (driver fatigue)** and **historical patterns (traffic intelligence)**. 

We built **SmartTransit** to bridge this gap. By combining **Computer Vision** for safety and **RAG (Retrieval-Augmented Generation)** for predictive analytics, we’ve transformed the transit experience from a simple "dot on a map" into a proactive, intelligent ecosystem that prioritizes passenger safety and provides scarily accurate arrival predictions.

---

## 2. Core Features
| Feature | Technical Powerhouse |
| :--- | :--- |
| **🛰️ Live Matrix Sync** | Sub-300ms GPS updates using **Socket.IO** rooms and **Redis** hot-storage for zero-lag tracking. |
| **🛡️ Neural Safety Hub** | Real-time **MediaPipe/OpenCV** fatigue detection monitoring for driver drowsiness alerts. |
| **🤖 AI Transit Analyst** | A **RAG-based chatbot** that analyzes years of historical trip logs to answer complex schedule queries. |
| **📊 Smart ETA Logic** | Predictive arrival estimation using the **Haversine Formula** mixed with historical delay data. |
| **⚙️ Admin Core** | A high-end **GSAP-animated** dashboard for fleet logistics, route CRUD, and notification management. |

---

## 3. Important API Endpoints
*   `GET /api/socketio` — The gateway for initializing real-time WebSocket handshakes.
*   `POST /api/chat` — The AI analyst endpoint that processes natural language schedule queries.
*   `POST /analyze` — (Python Service) Evaluates camera frames for Eye Aspect Ratio (EAR) drowsiness detection.
*   `GET /api/routes` — Fetches the primary database of all campus paths and assigned fleet units.
*   `PATCH /api/user/profile` — Manages the essential user lifecycle and role-specific preferences.

---

## 4. The Tech Stack

### 🎨 Frontend & Design
*   **Next.js 14 & React**: The backbone for high-speed, server-rendered performance.
*   **GSAP & Framer Motion**: Industry-leading animation libraries for a premium, buttery-smooth UX.
*   **Tailwind CSS**: A utility-first CSS framework for custom, elite-tier aesthetics.
*   **Leaflet**: The high-performance map engine for real-time geolocation visualization.

### 🧠 Backend & AI
*   **Service Polyglot**: Node.js (V8) for rapid web APIs and Python for heavy Machine Learning computations.
*   **AI Models**: GPT-4o-mini (via OpenRouter) and OpenAI `text-embedding-3-small` for the RAG brain.

### 💾 Why MongoDB (NoSQL) over SQL?
We chose **MongoDB Atlas** as our unified data platform for three strategic reasons:
1.  **Vector Search**: It natively stores our AI embeddings and transit data together, eliminating the need for a separate vector database.
2.  **Geospatial Mastery**: Built-in `2dsphere` indexing allows us to perform high-speed proximity queries for bus stops.
3.  **Schema Flexibility**: Transit routes are dynamic; NoSQL allows us to add stops, metadata, and safety logs without rigid schema migrations.

---

## 5. Hosting Architecture
SmartTransit utilizes a specialized hybrid-cloud deployment strategy:
*   **Web Console**: Hosted on **Vercel** for optimal Next.js edge performance.
*   **Python ML Service**: Deployed on **Render** (persistent instance) to handle real-time video stream analysis.
*   **Database**: **MongoDB Atlas** for globally accessible, low-latency transit records.
*   **Cache**: **Redis (Upstash)** for ultra-fast session and live location persistence.
*   **Communication**: **Socket.IO** server hosted on Render to maintain persistent client connections.

---

## 6. How We Are Different (Market Research & Problem Solving)
Most transit solutions fall into two categories: **Static (Schedule-only)** or **Reactive (GPS-only)**.

*   **The Problem**: 70% of students complain that "Live trackers" miss the bus because they don't account for driver delays or fatigue.
*   **Our Solution**: SmartTransit is **Proactive**. 
    *   **Safety Gap**: We are the only platform in the student-tech market that integrates **Computer Vision** to prevent accidents before they happen.
    *   **Intelligence Gap**: Instead of just showing a dot, we show a **Prediction**. Our RAG analyst understands that "Route 1 is always 10 minutes late on Mondays," and updates the student accordingly.

---

## 7. Future Additions (The Roadmap)
*   **🎟️ NFC/QR Boarding**: Zero-contact passenger manifest logging for drivers.
*   **📈 Fleet Carbon Analytics**: Tracking the environmental impact and fuel efficiency of each bus.
*   **📱 Native Integration**: PWA (Progressive Web App) capabilities for offline-first transit checklists.
*   **🚦 Traffic Density Heatmaps**: Visualizing campus congestion zones to suggest optimal route re-routing for admins.
