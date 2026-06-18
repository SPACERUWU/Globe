-- ── Memory pins: add lat/lng to memories ──────────────────────────────────
ALTER TABLE memories
  ADD COLUMN IF NOT EXISTS latitude  float8,
  ADD COLUMN IF NOT EXISTS longitude float8;

-- ── Packing list table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_items (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    uuid        REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label      text        NOT NULL,
  checked    boolean     DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "packing_own" ON packing_items;
CREATE POLICY "packing_own" ON packing_items
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
