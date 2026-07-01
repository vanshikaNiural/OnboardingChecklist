'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import OnboardingPanel from './OnboardingPanel';

const STAKEHOLDERS = [
  { id: 'client', label: 'Client', accent: '#714DFF' },
  { id: 'employee', label: 'Employee', accent: '#C026D3' },
  { id: 'icp', label: 'ICP', accent: '#0D9488' },
  { id: 'navro', label: 'Navro', accent: '#2563EB' },
  { id: 'internal', label: 'Internal', accent: '#475569' }
];

const STAGES = {
  1: 'Country config',
  2: 'Entity setup',
  3: 'Employee onboarding',
  4: 'Payroll setup',
  5: 'Payroll ops',
  6: 'Payments'
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('client');
  const [items, setItems] = useState<any[]>([]);
  const [states, setStates] = useState<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Synced');

  const supabase = createClient();

  useEffect(() => {
    loadData();
    // Subscribe to real-time updates
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
  }, []);

  async function loadData() {
    try {
      const [itemsRes, statesRes] = await Promise.all([
        supabase.from('onboarding_items').select('*'),
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

  const currentStakeholder = STAKEHOLDERS.find(s => s.id === activeTab);
  const activeItems = items.filter(item => item.stakeholder_id === activeTab);

  const totalItems = items.filter(
    item => !item.is_removed
  ).length;

  const completeItems = items
    .filter(item => !item.is_removed)
    .filter(item => {
      const state = states.get(item.id);
      return state?.status === 'complete';
    }).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-100 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  n
                </div>
                <span className="font-bold text-sm">niural / Global Payroll</span>
              </div>
              <h1 className="text-2xl font-semibold mb-1">Onboarding & payment readiness</h1>
              <p className="text-sm text-gray-600">
                Every item below is a prerequisite to paying a worker. Track ownership, status, and the gates that block downstream work.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {completeItems} / {totalItems}
              </div>
              <div className="text-xs text-gray-600">steps complete</div>
              <div className="text-xs text-gray-500 mt-2">{syncStatus}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {STAKEHOLDERS.map(stakeholder => {
              const count = activeItems.filter(
                item => item.stakeholder_id === stakeholder.id && !item.is_removed
              ).length;
              const complete = activeItems
                .filter(item => item.stakeholder_id === stakeholder.id && !item.is_removed)
                .filter(item => states.get(item.id)?.status === 'complete').length;

              return (
                <button
                  key={stakeholder.id}
                  onClick={() => setActiveTab(stakeholder.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === stakeholder.id
                      ? 'border-purple-600 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {stakeholder.label}
                  <span className="ml-2 text-xs text-gray-500">
                    {complete}/{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <OnboardingPanel
          stakeholder={activeTab}
          items={activeItems}
          states={states}
          onUpdateState={updateItemState}
          stageLabels={STAGES}
        />
      </main>
    </div>
  );
}
