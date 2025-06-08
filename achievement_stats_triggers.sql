-- Helper table to map achievement IDs and tier indices to tier names
-- This table should be populated with data reflecting your ChallengeManager.js achievement definitions.
CREATE TABLE IF NOT EXISTS achievement_tier_definitions (
    achievement_id TEXT NOT NULL,
    tier_index INT NOT NULL,
    tier_name TEXT NOT NULL,
    PRIMARY KEY (achievement_id, tier_index)
    -- Optional: FOREIGN KEY (achievement_id) REFERENCES your_main_achievements_table(id)
);

COMMENT ON TABLE achievement_tier_definitions IS 'Defines the mapping from achievement ID and tier index to tier name, mirroring ChallengeManager.js definitions.';
COMMENT ON COLUMN achievement_tier_definitions.tier_name IS 'The actual name of the tier, e.g., "Bronze", "Silver".';

-- Enable Row Level Security (RLS) - good practice
ALTER TABLE achievement_tier_definitions ENABLE ROW LEVEL SECURITY;

-- Allow public read access if needed by other parts of your system,
-- otherwise, it's mainly used by the trigger function.
CREATE POLICY "Allow public read access to achievement tier definitions"
ON achievement_tier_definitions
FOR SELECT
USING (true);

-- Example: Manually populate this table based on your ChallengeManager.js
-- You would run INSERT statements similar to this once:
-- INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
--   ('vivid_orange_artisan', 0, 'Bronze'),
--   ('vivid_orange_artisan', 1, 'Silver'),
--   ('vivid_orange_artisan', 2, 'Gold'),
--   ('color_collector_novice', 0, 'Bronze')
-- ON CONFLICT (achievement_id, tier_index) DO NOTHING;
-- ... and so on for all your achievements and their tiers.


-- Trigger function to update achievement_tier_stats
CREATE OR REPLACE FUNCTION update_global_achievement_tier_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_tier_name TEXT;
BEGIN
    -- This function is called when a row in player_achievements is inserted or updated.

    -- On INSERT: If a player achieves a tier (current_tier_index >= 0)
    IF (TG_OP = 'INSERT' AND NEW.current_tier_index >= 0) THEN
        -- Find the tier_name from the definitions table
        SELECT tier_name INTO target_tier_name
        FROM achievement_tier_definitions
        WHERE achievement_id = NEW.achievement_id AND tier_index = NEW.current_tier_index;

        IF FOUND THEN
            INSERT INTO achievement_tier_stats (achievement_id, tier_name, completion_count)
            VALUES (NEW.achievement_id, target_tier_name, 1)
            ON CONFLICT (achievement_id, tier_name)
            DO UPDATE SET
                completion_count = achievement_tier_stats.completion_count + 1,
                last_updated = NOW();
        ELSE
            RAISE WARNING '[trigger] No tier_name found in achievement_tier_definitions for achievement_id: %, tier_index: %', NEW.achievement_id, NEW.current_tier_index;
        END IF;

    -- On UPDATE: If current_tier_index has increased to a valid tier
    ELSIF (TG_OP = 'UPDATE' AND NEW.current_tier_index > OLD.current_tier_index AND NEW.current_tier_index >= 0) THEN
        -- Find the tier_name from the definitions table
        SELECT tier_name INTO target_tier_name
        FROM achievement_tier_definitions
        WHERE achievement_id = NEW.achievement_id AND tier_index = NEW.current_tier_index;

        IF FOUND THEN
            INSERT INTO achievement_tier_stats (achievement_id, tier_name, completion_count)
            VALUES (NEW.achievement_id, target_tier_name, 1)
            ON CONFLICT (achievement_id, tier_name)
            DO UPDATE SET
                completion_count = achievement_tier_stats.completion_count + 1,
                last_updated = NOW();
        ELSE
            RAISE WARNING '[trigger] No tier_name found in achievement_tier_definitions for achievement_id: %, tier_index: % during UPDATE', NEW.achievement_id, NEW.current_tier_index;
        END IF;
    END IF;

    RETURN NEW; -- For AFTER triggers, the return value is generally ignored.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_global_achievement_tier_stats() IS 'Trigger function that updates the global achievement_tier_stats table when a player progresses in player_achievements by looking up tier_name from achievement_tier_definitions.';


-- Drop the existing trigger if you're re-applying or had an old version.
-- Be cautious with DROP TRIGGER IF EXISTS in production if unsure.
-- DROP TRIGGER IF EXISTS on_player_achievement_tier_change_updates_global_stats ON player_achievements;

-- Create the trigger on player_achievements table
-- This assumes your player achievements tracking table is named 'player_achievements'
-- and has 'achievement_id' and 'current_tier_index' columns.
CREATE TRIGGER on_player_achievement_tier_change_updates_global_stats
AFTER INSERT OR UPDATE ON player_achievements
FOR EACH ROW
EXECUTE FUNCTION update_global_achievement_tier_stats();

COMMENT ON TRIGGER on_player_achievement_tier_change_updates_global_stats ON player_achievements IS 'When a player achieves a new tier in player_achievements, this trigger updates the aggregate completion_count in achievement_tier_stats.';