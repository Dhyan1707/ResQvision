# AI Fire Evacuation Simulator - Database Architecture

The system utilizes Supabase PostgreSQL with Row Level Security (RLS) enabled.

## Tables

### 1. `users`
Stores user identities, credentials, and roles (`user` or `admin`).
- `id` (UUID, Primary Key)
- `name` (VARCHAR 255)
- `email` (VARCHAR 255, Unique)
- `password_hash` (TEXT, bcrypt hashed)
- `role` (VARCHAR 50, CHECK in ('user', 'admin'))
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `blueprints`
Stores building floor plan models, structural components, and room topologies.
- `id` (UUID, Primary Key)
- `title` (VARCHAR 255)
- `building_type` (VARCHAR 100)
- `prompt` (TEXT)
- `blueprint_json` (JSONB, indexed via GIN)
- `approval_status` (VARCHAR 50, CHECK in ('draft', 'pending', 'approved', 'rejected'))
- `created_by` (UUID, Foreign Key -> users.id)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 3. `simulation_reports`
Stores analytics, benchmark scores, algorithm performance, and evacuation timings.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> users.id)
- `blueprint_id` (UUID, Foreign Key -> blueprints.id)
- `algorithm_used` (VARCHAR 100)
- `evacuation_time` (NUMERIC 10,2)
- `total_distance` (NUMERIC 10,2)
- `visited_nodes` (INTEGER)
- `benchmark_json` (JSONB, indexed via GIN)
- `created_at` (TIMESTAMPTZ)

