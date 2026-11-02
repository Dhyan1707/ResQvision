-- Migration 001: Complete Schema for Simulations and Activity Logs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'system',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_blueprint_id ON simulations(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_simulations_status ON simulations(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

