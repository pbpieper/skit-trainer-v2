-- =============================================================================
-- Migration: Shuji Backend — Stars, Goals, Tasks, Streaks, Tags
-- Created: 2026-04-06
-- Description: Adds new tables and columns for the learning features update.
--   - tags column on skits
--   - stars table (per-user starred skits)
--   - goals table (learning goals with difficulty plans)
--   - tasks table (daily tasks generated from goals)
--   - streaks table (per-skit streak tracking)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add tags column to existing skits table
-- ---------------------------------------------------------------------------
ALTER TABLE public.skits
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 2. Stars — per-user starred skits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stars (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skit_id    TEXT        NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skit_id)
);

ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stars"
  ON public.stars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can star skits"
  ON public.stars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar skits"
  ON public.stars FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stars_user_skit
  ON public.stars (user_id, skit_id);

-- ---------------------------------------------------------------------------
-- 3. Goals — learning goals with difficulty plans
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skit_id     TEXT        NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  target_date DATE        NOT NULL,
  plan        JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_skit
  ON public.goals (user_id, skit_id);

-- Reuse existing set_updated_at() trigger function
CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Tasks — daily tasks generated from goals
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id      UUID        NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skit_id      TEXT        NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  date         DATE        NOT NULL,
  category     TEXT        NOT NULL CHECK (category IN ('foundation', 'retrieval', 'integration', 'transfer')),
  tool_id      TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  difficulty   SMALLINT    NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  depends_on   TEXT[]      NOT NULL DEFAULT '{}',
  unlocks      TEXT[]      NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_date
  ON public.tasks (user_id, date);

CREATE INDEX IF NOT EXISTS idx_tasks_goal
  ON public.tasks (goal_id);

-- ---------------------------------------------------------------------------
-- 5. Streaks — per-skit streak tracking
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skit_id             TEXT    NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  current_streak      INTEGER NOT NULL DEFAULT 0,
  longest_streak      INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  UNIQUE(user_id, skit_id)
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_streaks_user_skit
  ON public.streaks (user_id, skit_id);
