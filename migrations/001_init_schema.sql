-- Create items table for onboarding checklist
CREATE TABLE IF NOT EXISTS public.onboarding_items (
  id TEXT PRIMARY KEY,
  stage_num INT NOT NULL,
  stakeholder_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_gate BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  is_removed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create item_state table for tracking user progress
CREATE TABLE IF NOT EXISTS public.item_states (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.onboarding_items(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, progress, waiting, blocked, complete
  completed_date TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create review_notes table for change history
CREATE TABLE IF NOT EXISTS public.review_notes (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.onboarding_items(id) ON DELETE CASCADE,
  review_type TEXT, -- changed, removed, new, infer
  tag TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable realtime for item_states
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_states;

-- Create indexes for performance
CREATE INDEX idx_items_stage ON public.onboarding_items(stage_num);
CREATE INDEX idx_items_stakeholder ON public.onboarding_items(stakeholder_id);
CREATE INDEX idx_states_item ON public.item_states(item_id);
