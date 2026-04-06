-- Supabase Schema Reference (from skit-trainer-app)
-- Preserved for backend build-out. Extend with goals, tasks, streaks, stars, tags tables.

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Performer',
  preferences JSONB NOT NULL DEFAULT '{"theme": "system"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Performer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Skits
CREATE TABLE public.skits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  speakers TEXT[] NOT NULL DEFAULT '{}',
  chunks JSONB NOT NULL DEFAULT '[]',
  tags TEXT[] NOT NULL DEFAULT '{}',
  palace_images TEXT[] NOT NULL DEFAULT '{}',
  macro_sections JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_seed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Progress
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  chunk_mastered TEXT[] NOT NULL DEFAULT '{}',
  recall_scores JSONB NOT NULL DEFAULT '{}',
  chain_completed INTEGER[] NOT NULL DEFAULT '{}',
  flashcard_correct INTEGER NOT NULL DEFAULT 0,
  flashcard_wrong INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skit_id)
);

-- Stars (user favorites)
CREATE TABLE public.stars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skit_id)
);

-- Learning Goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  plan JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skit_id)
);

-- Daily Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL, -- foundation, retrieval, integration, transfer
  tool_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  difficulty INTEGER NOT NULL DEFAULT 1,
  depends_on UUID[] NOT NULL DEFAULT '{}',
  unlocks UUID[] NOT NULL DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Streaks
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  UNIQUE(user_id, skit_id)
);

-- Sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skit_id UUID NOT NULL REFERENCES public.skits(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  score_data JSONB
);

-- Indexes
CREATE INDEX idx_progress_user_skit ON public.progress(user_id, skit_id);
CREATE INDEX idx_stars_user ON public.stars(user_id);
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_tasks_user_date ON public.tasks(user_id, date);
CREATE INDEX idx_tasks_goal ON public.tasks(goal_id);
CREATE INDEX idx_streaks_user_skit ON public.streaks(user_id, skit_id);
CREATE INDEX idx_sessions_user ON public.sessions(user_id, started_at DESC);
CREATE INDEX idx_skits_created_by ON public.skits(created_by);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- All user-owned tables: users manage their own data
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can view skits" ON public.skits FOR SELECT USING (true);
CREATE POLICY "Users insert own skits" ON public.skits FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users update own skits" ON public.skits FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users delete own skits" ON public.skits FOR DELETE USING (auth.uid() = created_by);
CREATE POLICY "Users manage own progress" ON public.progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own stars" ON public.stars FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sessions" ON public.sessions FOR ALL USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_skits_updated_at BEFORE UPDATE ON public.skits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_progress_updated_at BEFORE UPDATE ON public.progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
