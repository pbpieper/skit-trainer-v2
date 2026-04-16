-- Add soft-delete column for skits (required by SupabaseSkitService)
ALTER TABLE public.skits ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
