# AI Fire Evacuation Simulator - System Architecture

## 1. High-Level Architecture Overview

The **AI Fire Evacuation Simulator** is a multi-tier, modular disaster management and simulation platform consisting of:

1. **Electron Desktop Application (`desktop-app/`)**:
   - Secure Electron shell with `contextIsolation: true` and restricted IPC bridges (`preload.js`).
   - Interactive 2D Blueprint floor layout visualizer.
   - Real-time Three.js 3D building visualization with floor slicing and multi-floor camera controls.
   - WebXR-compatible VR Walkthrough and AR Tactical Overlays.
   - Dynamic fire and smoke spread simulator.
   - Dynamic M4 Pathfinding algorithm computing safe egress routes to verified outdoor exits.

2. **Node.js Express Backend (`backend/`)**:
   - Layered architecture: `Routes -> Controllers -> Services -> Repositories -> Supabase PostgreSQL`.
   - Google Gemini AI integration for natural language blueprint generation.
   - Python AI service orchestration and analytical ML hazard classification fallback.
   - JWT authentication, role-based access control (`user` vs `admin`), rate limiting, and compression.
   - Simulation reporting and analytics persistence.

3. **Python AI Pipeline (`ai_pipeline/`)**:
   - Machine Learning Random Forest classifier (`hazard_rf_model.pkl`) for real-time hazard severity assessment.
   - Python microservice (`server.py`) exposing REST endpoints on port 8000.
   - Computer vision and blueprint parsing routines (`ai_pipeline/blueprint/`).

4. **Database Layer (Supabase PostgreSQL)**:
   - Relational tables: `users`, `blueprints`, `simulation_reports`.
   - JSONB support with GIN indexing for flexible spatial building layouts and benchmark telemetry.
   - Row Level Security (RLS) policies protecting user data.

```
+-------------------------------------------------------------+
|               Electron Desktop Control Room                 |
|  [2D Blueprint View] [Three.js 3D View] [VR] [AR Tactical]  |
+-------------------------------------------------------------+
                              |
                     HTTP REST / IPC
                              v
+-------------------------------------------------------------+
|             Node.js / Express.js REST API Server            |
|       (Port 5000: /api/auth, /api/blueprints,               |
|        /api/simulation, /api/reports, /api/admin)           |
+-------------------------------------------------------------+
         |                      |                     |
         v                      v                     v
+-------------------+ +-------------------+ +-------------------+
| Supabase Postgres | |  Google Gemini AI | | Python AI Engine  |
|  (Tables & RLS)   | | (Prompt Generator)| | (ML RandomForest) |
+-------------------+ +-------------------+ +-------------------+
```

