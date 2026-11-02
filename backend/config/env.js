import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory first, then root as fallback
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Ensure required variables exist or log warnings for development defaults
const requiredEnvVars = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARNING] Environment variable ${envVar} is missing. Using fallback configuration.`);
  }
}

export const envConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_min32chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  PYTHON_AI_URL: process.env.PYTHON_AI_URL || 'http://localhost:8000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173'
};
