-- RPC function to get all defined achievements along with:
-- 1. Player-specific progress (current_tier_index, progress_count)
-- 2. Global completion stats for each tier.
--
-- Call from client: supabase.rpc('get_achievements_with_player_and_global_stats', { p_player_id: 'YOUR_PLAYER_UUID' })

CREATE OR REPLACE FUNCTION get_achievements_with_player_and_global_stats(p_player_id UUID)
RETURNS TABLE (
    achievement_id TEXT,
    player_current_tier_index INT,
    player_progress_count INT,
    defined_tiers JSONB -- Array of {tier_index, tier_name, global_completion_count}
)
AS $$
BEGIN
    RETURN QUERY
    WITH PlayerProgress AS (
        -- CTE to get the specified player's progress for all their achievements
        SELECT
            pa.achievement_id,
            pa.current_tier_index,
            pa.progress_count
        FROM player_achievements pa
        WHERE pa.player_id = p_player_id
    ),
    AggregatedTiersWithGlobalStats AS (
        -- CTE to get all defined achievement tiers and their global completion counts
        SELECT
            atd.achievement_id,
            jsonb_agg(
                jsonb_build_object(
                    'tier_index', atd.tier_index,
                    'tier_name', atd.tier_name,
                    'global_completion_count', COALESCE(ats.completion_count, 0) -- Default to 0 if no stats entry
                ) ORDER BY atd.tier_index -- Ensure tiers are ordered correctly within the JSON array
            ) AS tiers_data
        FROM achievement_tier_definitions atd -- Base list of all tiers for all achievements
        LEFT JOIN achievement_tier_stats ats 
            ON atd.achievement_id = ats.achievement_id AND atd.tier_name = ats.tier_name
        GROUP BY atd.achievement_id
    )
    -- Final SELECT to combine all data
    SELECT
        atws.achievement_id,
        COALESCE(pp.current_tier_index, -1) AS player_current_tier_index, -- If player has no record for an achievement, tier_index is -1
        COALESCE(pp.progress_count, 0) AS player_progress_count,          -- If player has no record, progress_count is 0
        atws.tiers_data AS defined_tiers
    FROM AggregatedTiersWithGlobalStats atws
    LEFT JOIN PlayerProgress pp ON atws.achievement_id = pp.achievement_id
    ORDER BY atws.achievement_id; -- Optional: order by achievement_id for consistent results

END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_achievements_with_player_and_global_stats(UUID) 
IS 'Fetches all achievements, the specified player''s progress on them, and global completion stats for each tier. Returns one row per achievement_id.';

-- Example of how to call it (for testing in SQL Editor, replace with an actual player UUID):
-- SELECT * FROM get_achievements_with_player_and_global_stats('your-test-player-uuid-here');