# AI Fire Evacuation Simulator - Backend API

Production-ready Express.js & Node.js 22+ RESTful Backend for **AI Fire Evacuation Simulator**. Designed specifically to power both **React Web Frontend** and **Unity 6 3D Simulation Application**.

---

## Tech Stack

- **Runtime**: Node.js 22+ (ES Modules)
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **AI Engine**: Google Gemini AI (`@google/generative-ai`)
- **Authentication**: JWT & bcrypt (10 salt rounds)
- **Security**: Helmet, CORS, Compression, Morgan, Express Rate Limit (100 req / 15 min), express-validator
- **Architecture**: Decoupled Layered Architecture (Controllers, Services, Repositories)

---

## Project Structure

```
backend/
├── config/
│   ├── env.js             # Validated environment configuration
│   ├── supabase.js        # Supabase PostgreSQL client setup
│   └── gemini.js          # Google Gemini AI SDK client
├── controllers/
│   ├── authController.js      # Register, login, profile endpoints
│   ├── blueprintController.js # AI generation & CRUD endpoints
│   ├── reportController.js    # Simulation results logging
│   └── adminController.js     # User & system management
├── middleware/
│   ├── auth.js            # JWT verification middleware
│   ├── admin.js           # Admin RBAC middleware
│   ├── validate.js        # Express-validator error handler
│   ├── errorHandler.js    # Central exception catcher
│   └── notFound.js        # 404 endpoint fallback
├── repositories/
│   ├── userRepository.js      # Users table queries
│   ├── blueprintRepository.js # Blueprints table queries
│   └── reportRepository.js    # Simulation reports table queries
├── services/
│   ├── authService.js      # Password hashing & JWT generation
│   ├── geminiService.js    # AI prompt engineering & JSON contract validation
│   ├── blueprintService.js   # Blueprint CRUD business logic
│   ├── reportService.js      # Simulation analytics business logic
│   └── adminService.js       # Admin dashboard & analytics logic
├── routes/
│   ├── authRoutes.js      # /api/auth
│   ├── blueprintRoutes.js # /api/blueprints
│   ├── reportRoutes.js    # /api/reports
│   └── adminRoutes.js     # /api/admin
├── utils/
│   ├── jwt.js             # JWT helper utilities
│   ├── response.js        # Standardized API response formatters
│   ├── validator.js       # AI Blueprint JSON contract validator
│   └── logger.js          # Structured logger wrapper
├── database/
│   └── schema.sql         # Production SQL DDL script (Tables, RLS, Indexes, Triggers)
├── tests/
│   └── api.test.js        # Unit and contract test suite
├── .env.example           # Configuration template
├── .gitignore             # Repository ignore file
├── package.json           # Dependencies and scripts
└── server.js              # Application entry point
```

---

## Getting Started

### 1. Environment Setup

Copy `.env.example` to `.env` and populate your credentials:

```bash
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<your-min-32-character-secret>
GEMINI_API_KEY=<your-google-gemini-api-key>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Database Initialization

Execute `database/schema.sql` in your **Supabase SQL Editor** to create the tables, foreign keys, GIN/B-Tree indexes, `updated_at` triggers, RLS policies, and seed admin user (`admin@evacuation.com`).

### 3. Installation & Local Execution

```bash
npm install
npm run dev
```

Server starts at: `http://localhost:5000`

---

## API Documentation Summary

### Health Check
- `GET /api/health`

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/profile` - Fetch profile details (Bearer Token)
- `PUT /api/auth/profile` - Update name/password (Bearer Token)

### AI Blueprints (`/api/blueprints`)
- `POST /api/blueprints/generate` - Generate blueprint using Google Gemini AI
- `POST /api/blueprints` - Save manually constructed blueprint
- `GET /api/blueprints` - List blueprints (Filters: status, createdBy)
- `GET /api/blueprints/:id` - Fetch single blueprint JSON
- `PUT /api/blueprints/:id` - Update blueprint JSON / details
- `DELETE /api/blueprints/:id` - Delete blueprint
- `POST /api/blueprints/:id/publish` - Submit for approval
- `POST /api/blueprints/:id/approve` - Approve/Reject blueprint (Admin)

### Simulation Reports (`/api/reports`)
- `POST /api/reports` - Store Unity 6 / React simulation run data
- `GET /api/reports` - Retrieve simulation reports
- `GET /api/reports/:id` - Fetch detailed report by ID
- `DELETE /api/reports/:id` - Delete report

### Admin Dashboard (`/api/admin`)
- `GET /api/admin/dashboard` - Platform metrics overview
- `GET /api/admin/users` - Paginated user management
- `PUT /api/admin/users/:id` - Modify user roles / status
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/blueprints` - System-wide blueprint management
- `GET /api/admin/reports` - System-wide report analytics

---

## Running Automated Tests

Run test suite using Node's test runner:

```bash
npm test
```
