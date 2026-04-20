-- NOTA CITY DATABASE SCHEMA
-- This file defines all tables in the Postgres database.
-- Run this once against your Railway Postgres instance to set everything up.

-- city_meta: one row, global city stats
-- this is the scoreboard - population, money, city name, current tick count
CREATE TABLE IF NOT EXISTS city_meta (
  id SERIAL PRIMARY KEY,
  city_name TEXT DEFAULT 'NOTA CITY',
  population INTEGER DEFAULT 0,
  funds INTEGER DEFAULT 50000,
  tick_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- grid_tiles: 32x32 = 1024 rows, one per tile
-- x and y are coordinates. terrain is the base land type (grass, water, dirt)
-- each layer stores what has been built on that tile for that system
CREATE TABLE IF NOT EXISTS grid_tiles (
  id SERIAL PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  terrain TEXT DEFAULT 'grass',
  zone_type TEXT DEFAULT 'empty',
  road_type TEXT DEFAULT 'none',
  power_type TEXT DEFAULT 'none',
  water_type TEXT DEFAULT 'none',
  UNIQUE(x, y)
);

-- tick_log: every tick that fires gets a row written here
-- this is your event log and city history combined
-- fast_tick fires every 5 min, mid_tick every 10 min, slow_tick every 30 min
CREATE TABLE IF NOT EXISTS tick_log (
  id SERIAL PRIMARY KEY,
  tick_type TEXT NOT NULL,
  tick_number INTEGER NOT NULL,
  population_snapshot INTEGER,
  funds_snapshot INTEGER,
  notes TEXT,
  fired_at TIMESTAMP DEFAULT NOW()
);

-- Insert the starting city state (one row only)
INSERT INTO city_meta (city_name, population, funds)
VALUES ('NOTA CITY', 0, 50000)
ON CONFLICT DO NOTHING;

