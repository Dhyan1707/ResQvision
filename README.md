# AI Fire Evacuation Simulator

An enterprise-grade, desktop-based, AI-powered fire evacuation simulation and disaster management control room application.

---

## 1. Project Architecture

The repository is organized into clean, modular, and scalable components:

```
AI-Fire-Evacuation-Simulator/
│
├── README.md                          # Master project documentation
├── .gitignore                         # Git exclusion rules
├── package.json                       # Master workspace scripts
├── .env.example                       # Master environment variable template
│
├── desktop-app/                       # Electron Desktop Control Room Application
│   ├── package.json                   # Electron & desktop dependencies
│   ├── package-lock.json
│   ├── main.js                        # Electron main process & IPC handlers
│   ├── preload.js                     # Secure contextBridge API bridge
│   └── src/
│       ├── renderer/                  # UI, Three.js 3D viewport, VR, AR, CSS
│       ├── ai/                        # Pathfinding, agent models, ML bridge
│       ├── blueprint/                 # Blueprint loading & processing
│       ├── controllers/               # Desktop controllers
│       ├── models/                    # Building structural data model
│       └── services/                  # API client connected to Node.js backend
│
├── backend/                           # Node.js / Express.js REST API Server
│   ├── package.json
│   ├── server.js                      # Express HTTP server setup & middleware
│   ├── .env.example
│   ├── config/                        # Supabase, Gemini, and environment config
│   ├── routes/                        # Auth, blueprints, simulation, reports, admin
│   ├── controllers/                   # Request handling & HTTP response mapping
│   ├── services/                      # Business logic & AI orchestration
│   ├── repositories/                  # Supabase database access layer
│   ├── middleware/                    # Auth, admin, validation, errors
│   ├── database/                      # PostgreSQL DDL schema & migrations
│   └── tests/                         # Node.js automated test suite
│
├── ai_pipeline/                       # Machine Learning & Computer Vision
│   ├── server.py                      # Python REST microservice (port 8000)
│   ├── requirements.txt               # Scikit-learn, Pandas, Joblib, OpenCV
│   ├── blueprint/                     # Python blueprint parsing & room detection
│   └── ml/
│       ├── dataset/                   # hazard_data.csv training dataset
│       ├── models/                    # hazard_rf_model.pkl (Random Forest)
│       ├── features/                  # features.pkl feature names
│       ├── generate_data.py           # Synthetic dataset generator
│       ├── train_model.py             # Model training & evaluation script
│       └── predict.py                 # CLI prediction script
│
├── data/                              # Datasets, blueprints, sample data
│   ├── blueprints/
│   │   └── samples/                   # Converted sample blueprints & traineddata
│   ├── datasets/                      # Training & validation datasets
│   └── reports/                       # Simulation benchmark exports
│
├── docs/                              # Project documentation & specifications
│   ├── architecture/                  # System architecture diagrams & specs
│   ├── api/                           # REST API endpoint reference
│   └── database/                      # Supabase schema & ER design
│
├── scripts/                           # Windows automation & execution scripts
│   ├── start-all.bat                  # Starts backend, AI engine, and desktop app
│   ├── start-backend.bat              # Starts Express backend (port 5000)
│   ├── start-ai-engine.bat            # Starts Python AI pipeline (port 8000)
│   ├── start-desktop.bat              # Starts Electron desktop control room
│   ├── install-all.bat                # Installs dependencies across all modules
│   └── health-check.bat               # Runs diagnostic tests across services
│
├── tests/                             # Comprehensive test suites & audits
│   ├── diagnostics/                   # Floor, stair, and graph audit scripts
│   ├── integration/                   # Evacuation pipeline & pathfinding tests
│   ├── screenshots/                   # Verification screenshots
│   └── archive_fixes/                 # Patch and historical test records
│
└── logs/                              # Execution logs & debug records
```

---

## 2. Technology Stack

- **Desktop Application**: Electron, HTML5, CSS3, JavaScript (ES6+), Three.js, WebXR (AR/VR).
- **Backend API**: Node.js, Express.js, JWT, bcryptjs, Helmet, CORS, Morgan.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) & JSONB GIN indexing.
- **Artificial Intelligence**: Google Gemini AI (blueprint generation), Python Scikit-Learn (Random Forest hazard classification).
- **Pathfinding**: Dynamic multi-floor A\*, Dijkstra, and hazard-avoidance routing leading to verified outdoor exits.

---

## 3. How Frontend and Backend Connect

1. **Automatic Health Verification**:
   When the desktop application launches, `preload.js` queries `desktop-app/src/services/api.js`, which checks `http://localhost:5000/api/health`.
   - If the backend is running, the status bar displays `CONNECTED (PORT 5000)` in green.
   - If the backend is offline, the desktop app automatically operates in standalone mode using its local pathfinding and analytical hazard engine.

2. **Evacuation Simulation Reports**:
   When an evacuation route is executed in 3D or 2D, the desktop application automatically compiles the run metrics (`totalCost`, `distance`, `visited_nodes`, `algorithm_used`, `floorLevel`) and dispatches a report to `POST /api/reports` on the backend, storing the data in Supabase PostgreSQL.

3. **Live Hazard Alerts**:
   The desktop polling cycle queries `GET /api/simulation/alerts?floor=<currentFloor>`, synchronizing fire and smoke sensor telemetry from the backend.

4. **Blueprint Storage and AI Generation**:
   Users can fetch saved blueprints from `GET /api/blueprints`, save new designs to `POST /api/blueprints`, or prompt Google Gemini via `POST /api/blueprints/generate`.

---

## 4. Quick Start & Execution

### Prerequisites
- Node.js (v18.0.0 or higher, v22+ recommended)
- Python 3.10+ (optional, backend includes automated fallback)

### Installation
Run the master installer script:
```cmd
scripts\install-all.bat
```
Or manually in terminal:
```bash
npm install
cd backend && npm install && cd ..
cd desktop-app && npm install && cd ..
```

### Running the System
To start all services concurrently:
```cmd
scripts\start-all.bat
```

Or start individual components:
- **Backend**: `npm run start:backend` or `scripts\start-backend.bat`
- **Desktop Application**: `npm run start:desktop` or `scripts\start-desktop.bat`
- **Python AI Engine**: `scripts\start-ai-engine.bat`

### Diagnostics & Automated Tests
To run backend automated tests:
```bash
npm test
```
To run the system health check:
```cmd
scripts\health-check.bat
```

