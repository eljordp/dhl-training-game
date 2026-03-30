-- DHL Training Game - Database Schema
-- Run against Supabase: psql $DATABASE_URL -f schema.sql

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(200),
  role VARCHAR(50) DEFAULT 'employee',
  consent_given BOOLEAN DEFAULT false,
  consent_date TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER NOT NULL,
  question_results JSONB,
  difficulty VARCHAR(20) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenario_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  scenario_id VARCHAR(50),
  npc_name VARCHAR(100),
  score INTEGER,
  total_fields INTEGER,
  correct_fields INTEGER,
  time_spent INTEGER,
  xp_earned INTEGER DEFAULT 0,
  bonus_xp INTEGER DEFAULT 0,
  difficulty VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES scenario_attempts(id),
  field VARCHAR(100),
  label VARCHAR(100),
  user_value VARCHAR(500),
  correct_value VARCHAR(500),
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page VARCHAR(100) NOT NULL,
  active_seconds INTEGER NOT NULL DEFAULT 0,
  idle_seconds INTEGER NOT NULL DEFAULT 0,
  away_seconds INTEGER NOT NULL DEFAULT 0,
  focused BOOLEAN NOT NULL DEFAULT true,
  interactions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_user ON scenario_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_field_attempt ON field_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_heartbeats(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_heartbeats(created_at);
