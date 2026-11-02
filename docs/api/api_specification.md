# AI Fire Evacuation Simulator - API Specification

The Node.js backend listens by default on port `5000` with the prefix `/api`.

## 1. System Endpoints

### `GET /api/health`
Returns service operational health.
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2026-10-31T07:15:00.000Z",
  "service": "AI Fire Evacuation Simulator API"
}
```

---

## 2. Authentication (`/api/auth`)

- `POST /api/auth/register`: Register new user (`name`, `email`, `password`, `role`).
- `POST /api/auth/login`: Authenticate and receive JWT Bearer token.
- `GET /api/auth/profile`: Get current authenticated user profile (Requires `Authorization: Bearer <token>`).
- `PUT /api/auth/profile`: Update profile info.

---

## 3. Blueprints (`/api/blueprints`)

- `GET /api/blueprints`: List saved blueprints with optional status/user filtering.
- `GET /api/blueprints/:id`: Get blueprint by UUID.
- `POST /api/blueprints`: Create new blueprint JSON contract (Requires Bearer token).
- `POST /api/blueprints/generate`: Generate blueprint structure using Google Gemini AI.
- `PUT /api/blueprints/:id`: Update blueprint.
- `DELETE /api/blueprints/:id`: Remove blueprint.
- `POST /api/blueprints/:id/publish`: Mark blueprint as pending review.
- `POST /api/blueprints/:id/approve`: Approve/reject blueprint (Admin only).

---

## 4. Simulation & AI (`/api/simulation`)

- `GET /api/simulation/alerts?floor=<floorLevel>`: Retrieve active fire and hazard sensor alerts.
- `GET /api/simulation/status`: Get simulation engine status.
- `POST /api/simulation/evacuate`: Compute multi-floor evacuation route with hazard exposure metrics.
- `POST /api/simulation/predict-hazard`: ML hazard prediction endpoint (proxies to Python AI engine or analytical fallback).

---

## 5. Reports (`/api/reports`)

- `POST /api/reports`: Save simulation evacuation run metrics (`blueprint_id`, `algorithm_used`, `evacuation_time`, `total_distance`, `visited_nodes`, `benchmark_json`).
- `GET /api/reports`: List past simulation reports.
- `GET /api/reports/:id`: Get single simulation report by UUID.
- `DELETE /api/reports/:id`: Delete simulation report.

---

## 6. Admin (`/api/admin`)

- `GET /api/admin/users`: List all platform users.
- `PUT /api/admin/users/:id/role`: Change user role (`user` vs `admin`).
- `PUT /api/admin/users/:id/status`: Toggle user account active status.
- `GET /api/admin/system-stats`: Overall database and simulation telemetry stats.

