-- DHL Training Game - Database Schema
-- Import: psql -U dhltraining -d dhltraining -f schema.sql

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES employees(id),
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
  user_id UUID REFERENCES employees(id),
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
