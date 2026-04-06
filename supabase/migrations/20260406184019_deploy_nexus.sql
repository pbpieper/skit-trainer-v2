-- Deploy Nexus: app registry, patch notes, deploy log
-- Shared across all D2D ecosystem apps via Shuji project

-- Helper: auto-update updated_at column
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------------------------------------------------------
-- APP REGISTRY
-- One row per app. Source of truth for versions and status.
-----------------------------------------------------------
CREATE TABLE public.app_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '0.0.0',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'offline')),
  vercel_url TEXT,
  github_repo TEXT,
  local_path TEXT,
  stack TEXT,
  last_deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_app_registry_updated_at
  BEFORE UPDATE ON public.app_registry
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-----------------------------------------------------------
-- PATCH NOTES
-- Versioned changelogs. Realtime-enabled for live user push.
-----------------------------------------------------------
CREATE TABLE public.patch_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_slug TEXT NOT NULL REFERENCES public.app_registry(slug) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patch_notes_app
  ON public.patch_notes(app_slug, published_at DESC);

-----------------------------------------------------------
-- DEPLOY LOG
-- Audit trail of every deployment.
-----------------------------------------------------------
CREATE TABLE public.deploy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_slug TEXT NOT NULL REFERENCES public.app_registry(slug) ON DELETE CASCADE,
  version TEXT NOT NULL,
  commit_hash TEXT,
  commit_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'building', 'deployed', 'failed')),
  vercel_deploy_url TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_deploy_log_app
  ON public.deploy_log(app_slug, started_at DESC);

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public read on all tables. Writes via service role only.
-----------------------------------------------------------
ALTER TABLE public.app_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patch_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deploy_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read: app_registry"
  ON public.app_registry FOR SELECT USING (true);

CREATE POLICY "Public read: patch_notes"
  ON public.patch_notes FOR SELECT USING (true);

CREATE POLICY "Public read: deploy_log"
  ON public.deploy_log FOR SELECT USING (true);

-----------------------------------------------------------
-- REALTIME
-- Enable Realtime on patch_notes so apps get live updates.
-----------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.patch_notes;
