'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import OnboardingPanel from './OnboardingPanel';
import AddItemModal from './AddItemModal';

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
  const [showAddModal, setShowAddModal] = useState(false);

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
        supabase.from('onboarding_items').select('*').order('order_index', { ascending: true }),
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

  async function editItemTitle(itemId: string, oldValue: string, newValue: string, editorName: string) {
    setSyncStatus('Saving...');
    try {
      // Update the item title
      await supabase
        .from('onboarding_items')
        .update({ title: newValue, last_edited_by: editorName, last_edited_at: new Date().toISOString() })
        .eq('id', itemId);

      // Record in edit history
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
      // Update the item description
      await supabase
        .from('onboarding_items')
        .update({ description: newValue, last_edited_by: editorName, last_edited_at: new Date().toISOString() })
        .eq('id', itemId);

      // Record in edit history
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

  async function deleteItem(itemId: string) {
    setSyncStatus('Deleting...');
    try {
      await supabase
        .from('onboarding_items')
        .update({ is_removed: true })
        .eq('id', itemId);

      setSyncStatus('Deleted ✓');
      setTimeout(() => setSyncStatus('Synced'), 1200);
      loadData();
    } catch (err) {
      console.error('Delete failed:', err);
      setSyncStatus('Delete failed');
    }
  }

  async function addItem(data: any) {
    setSyncStatus('Creating...');
    try {
      const itemsCount = items.filter(i => i.stakeholder_id === activeTab && !i.is_removed).length;
      const newId = `${activeTab}-${data.stage_num}-new-${Date.now()}`;
      const newOrderIndex = Math.max(...items.filter(i => i.stakeholder_id === activeTab).map(i => i.order_index || 0), -1) + 1;

      await supabase.from('onboarding_items').insert([{
        id: newId,
        stage_num: data.stage_num,
        stakeholder_id: data.stakeholder_id,
        title: data.title,
        description: data.description,
        is_gate: false,
        is_recurring: false,
        is_removed: false,
        is_verified: false,
        order_index: newOrderIndex
      }]);

      const stateId = `state-${newId}`;
      await supabase.from('item_states').insert([{
        id: stateId,
        item_id: newId,
        status: 'pending'
      }]);

      setSyncStatus('Created ✓');
      setTimeout(() => setSyncStatus('Synced'), 1200);
      loadData();
    } catch (err) {
      console.error('Create failed:', err);
      setSyncStatus('Create failed');
    }
  }

  async function changeItemStage(draggedId: string, targetId: string) {
    setSyncStatus('Reordering...');
    try {
      const draggedItem = items.find(i => i.id === draggedId);
      const targetItem = items.find(i => i.id === targetId);

      if (draggedItem && targetItem) {
        // Swap order_index values
        await Promise.all([
          supabase.from('onboarding_items').update({ order_index: targetItem.order_index }).eq('id', draggedId),
          supabase.from('onboarding_items').update({ order_index: draggedItem.order_index }).eq('id', targetId)
        ]);

        setSyncStatus('Reordered ✓');
        setTimeout(() => setSyncStatus('Synced'), 1200);
        loadData();
      }
    } catch (err) {
      console.error('Reorder failed:', err);
      setSyncStatus('Reorder failed');
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

  const verifiedCount = items
    .filter(item => !item.is_removed && item.stakeholder_id === activeTab)
    .filter(item => item.is_verified).length;

  const activeTabItems = activeItems.filter(item => !item.is_removed);
  const unverifiedCount = activeTabItems.length - verifiedCount;

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

          {/* Tabs and Add Button */}
          <div className="flex gap-1 border-b border-gray-200 items-center justify-between">
            <div className="flex gap-1">
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
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 mr-4"
            >
              + Add item
            </button>
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
          onEditTitle={editItemTitle}
          onEditDescription={editItemDescription}
          onDelete={deleteItem}
          onChangeStage={changeItemStage}
          stageLabels={STAGES}
        />
      </main>

      <AddItemModal
        isOpen={showAddModal}
        stakeholder={activeTab}
        onClose={() => setShowAddModal(false)}
        onAdd={addItem}
      />
    </div>
  );
}
