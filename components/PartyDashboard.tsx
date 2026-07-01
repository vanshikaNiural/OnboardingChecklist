'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import OnboardingPanel from './OnboardingPanel';

const STAKEHOLDER_INFO: Record<string, { label: string; short: string; accent: string }> = {
  client: {
    label: 'Client',
    short: 'C',
    accent: '#714DFF'
  },
  employee: {
    label: 'Employee',
    short: 'E',
    accent: '#C026D3'
  },
  icp: {
    label: 'ICP',
    short: 'I',
    accent: '#0D9488'
  },
  navro: {
    label: 'Navro',
    short: 'N',
    accent: '#2563EB'
  },
  internal: {
    label: 'Internal',
    short: '⌘',
    accent: '#475569'
  }
};

const STAGES = {
  1: 'Country config',
  2: 'Entity setup',
  3: 'Employee onboarding',
  4: 'Payroll setup',
  5: 'Payroll ops',
  6: 'Payments'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  progress: 'bg-blue-100 text-blue-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  blocked: 'bg-red-100 text-red-700',
  complete: 'bg-green-100 text-green-700'
};

const STATUS_ORDER = ['pending', 'progress', 'waiting', 'blocked', 'complete'];

export default function PartyDashboard({ party }: { party: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [states, setStates] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState('Synced');

  const supabase = createClient();
  const partyInfo = STAKEHOLDER_INFO[party as keyof typeof STAKEHOLDER_INFO];

  if (!partyInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600 max-w-md">
          <p className="text-lg font-semibold">Party not found</p>
          <p className="text-sm mt-2 mb-4">
            Requested: <code className="bg-red-50 px-2 py-1 rounded">{party}</code>
          </p>
          <p className="text-sm mb-4">Available parties:</p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {Object.keys(STAKEHOLDER_INFO).map(p => (
              <a
                key={p}
                href={`/${p}`}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
              >
                {p}
              </a>
            ))}
          </div>
          <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
    const subscription = supabase
      .channel('item_states_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_states' },
        () => loadData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [party]);

  async function loadData() {
    try {
      const [itemsRes, statesRes] = await Promise.all([
        supabase.from('onboarding_items').select('*').eq('stakeholder_id', party),
        supabase.from('item_states').select('*')
      ]);

      setItems(itemsRes.data || []);

      const statesMap = new Map();
      (statesRes.data || []).forEach(state => {
        statesMap.set(state.item_id, state);
      });
      setStates(statesMap);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  async function updateItemState(itemId: string, updates: any) {
    setSyncStatus('Saving...');
    try {
      const stateId = `state-${itemId}`;
      const existingState = states.get(itemId);

      if (existingState) {
        await supabase
          .from('item_states')
          .update(updates)
          .eq('id', existingState.id);
      } else {
        await supabase
          .from('item_states')
          .insert([{ id: stateId, item_id: itemId, ...updates }]);
      }

      setSyncStatus('Saved ✓');
      setTimeout(() => setSyncStatus('Synced'), 1200);
      loadData();
    } catch (err) {
      console.error('Save failed:', err);
      setSyncStatus('Save failed');
    }
  }

  async function editItemTitle(itemId: string, oldValue: string, newValue: string, editorName: string) {
    setSyncStatus('Saving...');
    try {
      await supabase
        .from('onboarding_items')
        .update({ title: newValue, last_edited_by: editorName, last_edited_at: new Date().toISOString() })
        .eq('id', itemId);

      await supabase
        .from('edit_history')
        .insert([{
          id: `${itemId}-title-${Date.now()}`,
          item_id: itemId,
          field: 'title',
          old_value: oldValue,
          new_value: newValue,
          edited_by: editorName
        }]);

      setSyncStatus('Saved ✓');
      setTimeout(() => setSyncStatus('Synced'), 1200);
      loadData();
    } catch (err) {
      console.error('Save failed:', err);
      setSyncStatus('Save failed');
    }
  }

  async function editItemDescription(itemId: string, oldValue: string, newValue: string, editorName: string) {
    setSyncStatus('Saving...');
    try {
      await supabase
        .from('onboarding_items')
        .update({ description: newValue, last_edited_by: editorName, last_edited_at: new Date().toISOString() })
        .eq('id', itemId);

      await supabase
        .from('edit_history')
        .insert([{
          id: `${itemId}-description-${Date.now()}`,
          item_id: itemId,
          field: 'description',
          old_value: oldValue,
          new_value: newValue,
          edited_by: editorName
        }]);

      setSyncStatus('Saved ✓');
      setTimeout(() => setSyncStatus('Synced'), 1200);
      loadData();
    } catch (err) {
      console.error('Save failed:', err);
      setSyncStatus('Save failed');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading {partyInfo.label} onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const totalItems = items.filter(item => !item.is_removed).length;
  const completeItems = items
    .filter(item => !item.is_removed)
    .filter(item => {
      const state = states.get(item.id);
      return state?.status === 'complete';
    }).length;

  const verifiedCount = items
    .filter(item => !item.is_removed)
    .filter(item => item.is_verified).length;

  const unverifiedCount = items.filter(item => !item.is_removed).length - verifiedCount;

  const statusCounts = {
    pending: 0,
    progress: 0,
    waiting: 0,
    blocked: 0,
    complete: 0
  };

  items
    .filter(item => !item.is_removed)
    .forEach(item => {
      const state = states.get(item.id);
      const status = state?.status || 'pending';
      statusCounts[status as keyof typeof statusCounts]++;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-100 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  {partyInfo.short}
                </div>
                <span className="font-bold text-sm">niural / {partyInfo.label}</span>
              </div>
              <h1 className="text-2xl font-semibold mb-1">{partyInfo.label} Onboarding</h1>
              <p className="text-sm text-gray-600">
                Track your onboarding prerequisites for global payroll.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {completeItems} / {totalItems}
              </div>
              <div className="text-xs text-gray-600">steps complete</div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="inline-block mr-2">
                  ✅ {verifiedCount} verified
                </span>
                <span className="inline-block">
                  📝 {unverifiedCount} draft
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{syncStatus}</div>
            </div>
          </div>

          <div className="text-xs">
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to all parties
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <OnboardingPanel
          stakeholder={party}
          items={items}
          states={states}
          onUpdateState={updateItemState}
          onEditTitle={editItemTitle}
          onEditDescription={editItemDescription}
          stageLabels={STAGES}
        />
      </main>
    </div>
  );
}
