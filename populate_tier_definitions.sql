-- Populate achievement_tier_definitions from ChallengeManager.js
-- Ensure this is run AFTER achievement_tier_definitions table is created.

-- IMPORTANT: Run these INSERT statements in your Supabase SQL Editor.
-- This script is for reference and to ensure all definitions are covered.

-- Achievement: 'vivid_orange_artisan' (Orange Artisan)
INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
  ('vivid_orange_artisan', 0, 'Bronze'),
  ('vivid_orange_artisan', 1, 'Silver'),
  ('vivid_orange_artisan', 2, 'Gold')
ON CONFLICT (achievement_id, tier_index) DO NOTHING;

-- Achievement: 'vivid_magenta_artisan' (Magenta Maestro)
INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
  ('vivid_magenta_artisan', 0, 'Bronze'),
  ('vivid_magenta_artisan', 1, 'Silver'),
  ('vivid_magenta_artisan', 2, 'Gold')
ON CONFLICT (achievement_id, tier_index) DO NOTHING;

-- Achievement: 'vivid_teal_artisan' (Teal Virtuoso)
INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
  ('vivid_teal_artisan', 0, 'Bronze'),
  ('vivid_teal_artisan', 1, 'Silver'),
  ('vivid_teal_artisan', 2, 'Gold')
ON CONFLICT (achievement_id, tier_index) DO NOTHING;

-- Achievement: 'color_collector_novice' (Chromatic Novice)
INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
  ('color_collector_novice', 0, 'Bronze')
ON CONFLICT (achievement_id, tier_index) DO NOTHING;

-- Achievement: 'color_collector_adept' (Chromatic Adept)
INSERT INTO achievement_tier_definitions (achievement_id, tier_index, tier_name) VALUES
  ('color_collector_adept', 0, 'Bronze'),
  ('color_collector_adept', 1, 'Silver')
ON CONFLICT (achievement_id, tier_index) DO NOTHING;

-- Note: If you add more achievements or tiers to ChallengeManager.js in the future,
-- you will need to add corresponding INSERT statements here and run them.
-- Consider automating this if your achievement list becomes very dynamic,
-- though for a fixed set, manual population is acceptable.

SELECT 'achievement_tier_definitions population complete. Review any ON CONFLICT messages if present.' AS status;