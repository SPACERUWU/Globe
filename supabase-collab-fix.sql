-- FIX: circular RLS dependency
-- trips_select → trip_members → trips → trip_members → ... (infinite loop → empty results)
-- Solution: SECURITY DEFINER function bypasses RLS on trip_members, breaking the cycle

CREATE OR REPLACE FUNCTION is_member_of_trip(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
  );
$$;

-- trips: use function instead of direct subquery (breaks the circular dep)
DROP POLICY IF EXISTS "trips_select" ON trips;
CREATE POLICY "trips_select" ON trips FOR SELECT USING (
  auth.uid() = user_id
  OR is_public = true
  OR is_member_of_trip(id)
);

-- trip_members: safe now — trips_select no longer directly queries trip_members
DROP POLICY IF EXISTS "members_read" ON trip_members;
CREATE POLICY "members_read" ON trip_members FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM trips
    WHERE id = trip_id AND trips.user_id = auth.uid()
  )
);

-- memories: use function for clean chain
DROP POLICY IF EXISTS "memories_select" ON memories;
CREATE POLICY "memories_select" ON memories FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_id AND (
      t.is_public = true
      OR t.user_id = auth.uid()
      OR is_member_of_trip(t.id)
    )
  )
);

-- memories insert: use function
DROP POLICY IF EXISTS "memories_insert" ON memories;
CREATE POLICY "memories_insert" ON memories FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND user_id = auth.uid())
    OR is_member_of_trip(trip_id)
  )
);
