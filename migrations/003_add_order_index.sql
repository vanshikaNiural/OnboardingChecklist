-- Add order_index column to maintain item position regardless of edits
ALTER TABLE public.onboarding_items ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_order_index ON public.onboarding_items(stakeholder_id, order_index);
