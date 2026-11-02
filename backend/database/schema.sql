-- =============================================================================
-- AI Fire Evacuation Simulator - Production PostgreSQL Schema DDL (Supabase)
-- =============================================================================

-- Enable standard UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing triggers and functions if re-running DDL
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_blueprints_updated_at ON blueprints;
DROP TRIGGER IF EXISTS update_simulations_updated_at ON simulations;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Function for automatic updated_at column refresh
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 2. BLUEPRINTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blueprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    building_type VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    blueprint_json JSONB NOT NULL,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_blueprints_updated_at
BEFORE UPDATE ON blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 3. SIMULATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID REFERENCES blueprints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Simulation Run',
    status VARCHAR(50) NOT NULL DEFAULT 'configured' CHECK (status IN ('configured', 'running', 'completed', 'cancelled')),
    current_floor INTEGER NOT NULL DEFAULT 0,
    active_fires JSONB NOT NULL DEFAULT '[]'::jsonb,
    victim_count INTEGER NOT NULL DEFAULT 1,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'A*',
    evacuation_successful BOOLEAN NOT NULL DEFAULT false,
    duration_seconds NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_simulations_updated_at
BEFORE UPDATE ON simulations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 4. SIMULATION_REPORTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
    algorithm_used VARCHAR(100) NOT NULL,
    evacuation_time NUMERIC(10, 2) NOT NULL CHECK (evacuation_time >= 0),
    total_distance NUMERIC(10, 2) NOT NULL CHECK (total_distance >= 0),
    visited_nodes INTEGER NOT NULL CHECK (visited_nodes >= 0),
    benchmark_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. ACTIVITY_LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'system',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_by ON blueprints(created_by);
CREATE INDEX IF NOT EXISTS idx_blueprints_approval_status ON blueprints(approval_status);
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_blueprint_id ON simulations(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON simulation_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_blueprint_id ON simulation_reports(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- JSONB GIN Indexes for fast search inside JSON objects
CREATE INDEX IF NOT EXISTS idx_blueprints_json_gin ON blueprints USING gin (blueprint_json);
CREATE INDEX IF NOT EXISTS idx_simulations_fires_gin ON simulations USING gin (active_fires);
CREATE INDEX IF NOT EXISTS idx_reports_benchmark_gin ON simulation_reports USING gin (benchmark_json);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY service_role_all_users ON users FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_blueprints ON blueprints FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_simulations ON simulations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_reports ON simulation_reports FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_activity ON activity_logs FOR ALL TO service_role USING (true);

-- Allow public / standard backend access policies
CREATE POLICY public_select_blueprints ON blueprints FOR SELECT USING (approval_status = 'approved');
CREATE POLICY users_access_own_reports ON simulation_reports FOR ALL USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- SEED INITIAL ADMIN USER
-- Password: "Admin@12345" (bcrypt hashed)
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'System Administrator',
    'admin@evacuation.com',
    '$2a$10$e.w2p97L4g0aGk6n/J1PfeW9.5qV8Vw4.G9aK5fVp6G9aK5fVp6G9',
    'admin',
    true
)
ON CONFLICT (email) DO NOTHING;
