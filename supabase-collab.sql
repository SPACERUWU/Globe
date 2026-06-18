-- ── Trip collaboration: members + invite links ──────────────────────────────

CREATE TABLE IF NOT EXISTS trip_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role       text NOT NULL DEFAULT 'editor',
  user_email text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS trip_invites (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    uuid REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  token      text UNIQUE NOT NULL DEFAULT substring(replace(gen_random_uuid()::text,'-',''), 1, 12),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  expires_at timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invites  ENABLE ROW LEVEL SECURITY;

-- trip_members: owner or member can read
DROP POLICY IF EXISTS "members_read"   ON trip_members;
CREATE POLICY "members_read" ON trip_members FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
);
-- Any auth user can join (insert themselves)
DROP POLICY IF EXISTS "members_join"   ON trip_members;
CREATE POLICY "members_join" ON trip_members FOR INSERT WITH CHECK (user_id = auth.uid());
-- Only trip owner can remove members
DROP POLICY IF EXISTS "members_remove" ON trip_members;
CREATE POLICY "members_remove" ON trip_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
);

-- trip_invites: any logged-in user can read (to validate token), owner can create/delete
DROP POLICY IF EXISTS "invites_read"   ON trip_invites;
CREATE POLICY "invites_read"   ON trip_invites FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "invites_create" ON trip_invites;
CREATE POLICY "invites_create" ON trip_invites FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
);
DROP POLICY IF EXISTS "invites_delete" ON trip_invites;
CREATE POLICY "invites_delete" ON trip_invites FOR DELETE USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
);

-- Allow trip members to SELECT trips
DROP POLICY IF EXISTS "trips_select" ON trips;
CREATE POLICY "trips_select" ON trips FOR SELECT USING (
  auth.uid() = user_id OR
  is_public = true OR
  EXISTS (SELECT 1 FROM trip_members WHERE trip_id = trips.id AND user_id = auth.uid())
);

-- Allow trip members to SELECT memories
DROP POLICY IF EXISTS "memories_select" ON memories;
CREATE POLICY "memories_select" ON memories FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM trips t WHERE t.id = trip_id AND (
      t.is_public = true OR
      t.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM trip_members WHERE trip_id = t.id AND user_id = auth.uid())
    )
  )
);

-- Allow trip members to INSERT memories
DROP POLICY IF EXISTS "memories_insert" ON memories;
CREATE POLICY "memories_insert" ON memories FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM trip_members WHERE trip_id = memories.trip_id AND user_id = auth.uid())
  )
);
