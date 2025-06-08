CREATE OR REPLACE FUNCTION get_total_player_count()
RETURNS INTEGER -- The function will return a single integer value
LANGUAGE sql
STABLE -- Indicates the function cannot modify the database and always returns the same results for the same arguments within a single transaction.
AS $$
  SELECT count(*)::INTEGER FROM players;
$$;

-- Grant execution permission to the authenticated role (and anon if needed, though likely not for this one)
GRANT EXECUTE ON FUNCTION get_total_player_count() TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_total_player_count() TO anon; -- If public access were needed

COMMENT ON FUNCTION get_total_player_count() IS 'Returns the total number of registered players.';