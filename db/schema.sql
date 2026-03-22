CREATE TABLE IF NOT EXISTS tiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  text_configurable BOOLEAN NOT NULL DEFAULT FALSE,
  multi_slot BOOLEAN NOT NULL DEFAULT FALSE,
  required BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS allocations (
  id SERIAL PRIMARY KEY,
  tile_id INTEGER NOT NULL REFERENCES tiles(id) ON DELETE CASCADE,
  person TEXT NOT NULL CHECK (person IN ('person_1', 'person_2')),
  day TEXT NOT NULL CHECK (day IN ('saturday', 'sunday')),
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'noon', 'afternoon', 'evening')),
  custom_text TEXT,
  week_start DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  pin CHAR(4) NOT NULL DEFAULT '0000',
  name_person_1 TEXT NOT NULL DEFAULT '',
  name_person_2 TEXT NOT NULL DEFAULT '',
  CHECK (id = 1)
);

-- Seed the single-row settings on first deploy
INSERT INTO settings (id, pin, name_person_1, name_person_2)
VALUES (1, '0000', '', '')
ON CONFLICT (id) DO NOTHING;
