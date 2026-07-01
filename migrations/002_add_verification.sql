-- Phase 1: Verification tracking and edit attribution
-- Simplify the original plan: just track verified vs unverified, who edited, and when

-- Drop review_notes (unused)
DROP TABLE IF EXISTS public.review_notes;

-- Add verification and edit-tracking columns to onboarding_items
ALTER TABLE public.onboarding_items ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.onboarding_items ADD COLUMN IF NOT EXISTS last_edited_by TEXT;
ALTER TABLE public.onboarding_items ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP;

-- Create a simple edit_history table for audit trail (optional, useful later)
CREATE TABLE IF NOT EXISTS public.edit_history (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.onboarding_items(id) ON DELETE CASCADE,
  field TEXT NOT NULL,  -- 'title' | 'description'
  old_value TEXT,
  new_value TEXT,
  edited_by TEXT NOT NULL,
  edited_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_edit_history_item ON public.edit_history(item_id);

-- Add edit_history to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.edit_history;
