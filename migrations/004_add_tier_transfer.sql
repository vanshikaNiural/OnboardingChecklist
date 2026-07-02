-- Add tier and transfer_only columns to track item organization
ALTER TABLE public.onboarding_items
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS transfer_only BOOLEAN DEFAULT FALSE;

-- Create index for filtering by tier and transfer
CREATE INDEX IF NOT EXISTS idx_tier_transfer ON public.onboarding_items(stakeholder_id, tier, transfer_only);
