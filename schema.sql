-- Drop table if it exists (optional, for a clean start during development)
-- DROP TABLE IF EXISTS public.battle_records;

-- Create the battle_records table
CREATE TABLE IF NOT EXISTS public.battle_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    player_one_id uuid NOT NULL,
    player_two_id uuid NULL, -- Nullable if player two is AI or not a registered user
    player_one_best_mix_hex text NULL,
    player_one_best_mix_name text NULL,
    player_one_difference real NULL,
    player_two_best_mix_hex text NULL,
    player_two_best_mix_name text NULL,
    player_two_difference real NULL,
    target_color_hex text NULL,
    target_color_name text NULL,
    winner text NULL, -- e.g., 'player_one', 'player_two', 'draw', 'none'
    battle_timestamp timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT battle_records_pkey PRIMARY KEY (id),
    CONSTRAINT battle_records_player_one_id_fkey FOREIGN KEY (player_one_id) REFERENCES public.players(id) ON DELETE CASCADE,
    CONSTRAINT battle_records_player_two_id_fkey FOREIGN KEY (player_two_id) REFERENCES public.players(id) ON DELETE SET NULL -- Or ON DELETE CASCADE if P2 must exist
);

-- Add comments to columns for clarity
COMMENT ON COLUMN public.battle_records.player_one_id IS 'ID of the first player (usually the logged-in user initiating/playing).';
COMMENT ON COLUMN public.battle_records.player_two_id IS 'ID of the second player, if applicable and a registered user.';
COMMENT ON COLUMN public.battle_records.player_one_best_mix_hex IS 'HEX code of Player One''s closest color mix.';
COMMENT ON COLUMN public.battle_records.player_one_best_mix_name IS 'Name of Player One''s closest color mix.';
COMMENT ON COLUMN public.battle_records.player_one_difference IS 'Calculated difference/closeness score for Player One''s best mix.';
COMMENT ON COLUMN public.battle_records.player_two_best_mix_hex IS 'HEX code of Player Two''s closest color mix.';
COMMENT ON COLUMN public.battle_records.player_two_best_mix_name IS 'Name of Player Two''s closest color mix.';
COMMENT ON COLUMN public.battle_records.player_two_difference IS 'Calculated difference/closeness score for Player Two''s best mix.';
COMMENT ON COLUMN public.battle_records.target_color_hex IS 'HEX code of the target color for the battle round.';
COMMENT ON COLUMN public.battle_records.target_color_name IS 'Name of the target color for the battle round.';
COMMENT ON COLUMN public.battle_records.winner IS 'Indicates the winner: ''player_one'', ''player_two'', ''draw'', or ''none'' if no valid mixes.';
COMMENT ON COLUMN public.battle_records.battle_timestamp IS 'Timestamp of when the battle concluded.';

-- Enable Row Level Security for the table
ALTER TABLE public.battle_records ENABLE ROW LEVEL SECURITY;

-- Policies for battle_records
-- Policy: Allow authenticated users to insert their own battle records
DROP POLICY IF EXISTS "Allow insert for own records" ON public.battle_records;
CREATE POLICY "Allow insert for own records"
ON public.battle_records
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = player_one_id);

-- Policy: Allow authenticated users to read all battle records (for leaderboards, history etc.)
-- If you want players to only read their own, change USING to (auth.uid() = player_one_id OR auth.uid() = player_two_id)
DROP POLICY IF EXISTS "Allow authenticated read access to all battle records" ON public.battle_records;
CREATE POLICY "Allow authenticated read access to all battle records"
ON public.battle_records
FOR SELECT
TO authenticated
USING (true);

-- Optional: Policy to allow players to update their own records (e.g., if a detail was missed)
-- Not typically needed for append-only battle logs.
-- DROP POLICY IF EXISTS "Allow update for own records" ON public.battle_records;
-- CREATE POLICY "Allow update for own records"
-- ON public.battle_records
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = player_one_id)
-- WITH CHECK (auth.uid() = player_one_id);

-- Optional: Policy to allow players to delete their own records
-- Usually, battle records are kept for history.
-- DROP POLICY IF EXISTS "Allow delete for own records" ON public.battle_records;
-- CREATE POLICY "Allow delete for own records"
-- ON public.battle_records
-- FOR DELETE
-- TO authenticated
-- USING (auth.uid() = player_one_id);

-- Grant usage on schema public to supabase_functions role if not already granted generally
-- GRANT USAGE ON SCHEMA public TO supabase_functions; -- Often already set up
-- Grant select on players table to supabase_functions if foreign key checks are done by functions
-- GRANT SELECT ON TABLE public.players TO supabase_functions; -- Often already set up

-- Grant appropriate permissions to roles.
-- Authenticated role will be used by default for users accessing via Supabase client.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.battle_records TO authenticated;
GRANT ALL ON TABLE public.battle_records TO service_role; -- service_role bypasses RLS

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_battle_records_player_one_id ON public.battle_records(player_one_id);
CREATE INDEX IF NOT EXISTS idx_battle_records_player_two_id ON public.battle_records(player_two_id);
CREATE INDEX IF NOT EXISTS idx_battle_records_battle_timestamp ON public.battle_records(battle_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_battle_records_winner ON public.battle_records(winner);

-- Note: Ensure the `players` table referenced by foreign keys exists and has an `id` column (uuid).
-- Example `players` table structure (if not already defined):
-- CREATE TABLE IF NOT EXISTS public.players (
--     id uuid NOT NULL DEFAULT gen_random_uuid(),
--     username character varying COLLATE pg_catalog."default",
--     password character varying COLLATE pg_catalog."default", -- Consider hashing passwords
--     created_at timestamp with time zone DEFAULT now(),
--     CONSTRAINT players_pkey PRIMARY KEY (id),
--     CONSTRAINT players_username_key UNIQUE (username)
-- );
-- ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
-- -- Add RLS policies for players table as needed.
-- Game Sessions Table for Multiplayer Lobby
CREATE TYPE public.game_session_status AS ENUM (
    'waiting_for_opponent',
    'in_progress',
    'completed',
    'cancelled'
);
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    player_one_id uuid NOT NULL,
    player_two_id uuid NULL,
    status public.game_session_status NOT NULL DEFAULT 'waiting_for_opponent',
    target_color_hex text NULL, -- For battle mode, if pre-determined at session creation
    target_color_name text NULL,
    winner_id uuid NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT game_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT game_sessions_player_one_id_fkey FOREIGN KEY (player_one_id) REFERENCES public.players(id) ON DELETE CASCADE,
    CONSTRAINT game_sessions_player_two_id_fkey FOREIGN KEY (player_two_id) REFERENCES public.players(id) ON DELETE SET NULL,
    CONSTRAINT game_sessions_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.players(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.game_sessions IS 'Stores active and past multiplayer game sessions.';
COMMENT ON COLUMN public.game_sessions.status IS 'The current status of the game session.';
COMMENT ON COLUMN public.game_sessions.target_color_hex IS 'Target color for the battle, if applicable to the session type.';
-- Enable Row Level Security
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER set_game_sessions_updated_at
BEFORE UPDATE ON public.game_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
-- RLS Policies for game_sessions
-- Allow authenticated users to create a new game session for themselves
DROP POLICY IF EXISTS "Allow authenticated users to create sessions" ON public.game_sessions;
CREATE POLICY "Allow authenticated users to create sessions"
ON public.game_sessions
FOR INSERT
TO authenticated
WITH CHECK (player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1));
-- Allow authenticated users to see sessions waiting for an opponent
DROP POLICY IF EXISTS "Allow authenticated users to see waiting sessions" ON public.game_sessions;
CREATE POLICY "Allow authenticated users to see waiting sessions"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (status = 'waiting_for_opponent');
-- Allow participants to see their own session (even if not 'waiting_for_opponent')
DROP POLICY IF EXISTS "Allow participants to see their own session" ON public.game_sessions;
CREATE POLICY "Allow participants to see their own session"
ON public.game_sessions
FOR SELECT
TO authenticated
USING (
  (player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1)) OR
  (player_two_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1))
);
-- Allow player one to cancel their own 'waiting_for_opponent' session
DROP POLICY IF EXISTS "Allow player one to cancel waiting session" ON public.game_sessions;
CREATE POLICY "Allow player one to cancel waiting session"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (
    status = 'waiting_for_opponent' AND
    player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1)
)
WITH CHECK (
    status = 'cancelled' AND -- Can only update to 'cancelled'
    player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1)
);
-- Allow authenticated users to join a 'waiting_for_opponent' session if player_two_id is NULL
DROP POLICY IF EXISTS "Allow authenticated users to join a waiting session" ON public.game_sessions;
CREATE POLICY "Allow authenticated users to join a waiting session"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (
    status = 'waiting_for_opponent' AND
    player_two_id IS NULL AND
    player_one_id != (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1) -- Cannot join own session
)
WITH CHECK (
    player_two_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1) AND
    status = 'in_progress' -- Transition to 'in_progress' upon joining
);
-- Allow participants to update their 'in_progress' session (e.g., to 'completed')
DROP POLICY IF EXISTS "Allow participants to update in_progress session" ON public.game_sessions;
CREATE POLICY "Allow participants to update in_progress session"
ON public.game_sessions
FOR UPDATE
TO authenticated
USING (
  status = 'in_progress' AND (
    (player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1)) OR
    (player_two_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1))
  )
)
WITH CHECK (
  (status = 'completed' OR status = 'cancelled') AND ( -- Can update to completed or cancelled by participant
    (player_one_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1)) OR
    (player_two_id = (SELECT id FROM public.players WHERE user_id = auth.uid() LIMIT 1))
  )
);
-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON TABLE public.game_sessions TO authenticated;
GRANT ALL ON TABLE public.game_sessions TO service_role;
-- Grant usage on enum type
GRANT USAGE ON TYPE public.game_session_status TO authenticated;
GRANT ALL ON TYPE public.game_session_status TO service_role;
-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_one_id ON public.game_sessions(player_one_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_two_id ON public.game_sessions(player_two_id);
-- Assumption: The `players` table has a `user_id` column that links to `auth.users.id`
-- and an `id` column (uuid) that is the primary key for `players`.
-- If `players.user_id` doesn't exist, the RLS policies need adjustment to link `auth.uid()` to `players.id`
-- through whatever existing mechanism links Supabase Auth users to your custom `players` table.
-- For example, if `players.id` is directly `auth.uid()`, then change the subselects.
-- The provided policies assume `players` has `id (uuid, pk)` and `user_id (uuid, fk to auth.users.id, unique)`.
--     password character varying COLLATE pg_catalog."default", -- Consider hashing passwords
--     created_at timestamp with time zone DEFAULT now(),
--     CONSTRAINT players_pkey PRIMARY KEY (id),
--     CONSTRAINT players_username_key UNIQUE (username)
-- );
-- ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
-- -- Add RLS policies for players table as needed.