'use client';

import { useMemo, useState } from 'react';
import OnboardingItem from './OnboardingItem';

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  progress: 'bg-blue-100 text-blue-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  blocked: 'bg-red-100 text-red-700',
  complete: 'bg-green-100 text-green-700'
};

const STATUS_ORDER = ['pending', 'progress', 'waiting', 'blocked', 'complete'];

const TIER_LABELS: Record<string, string> = {
  'required-early': 'Required early',
  'no-fixed-order': 'No fixed order — complete as they come up',
  'recurring': 'Recurring',
  'transfer-only': 'Transfer-specific steps'
};

export default function OnboardingPanel({
  stakeholder,
  items,
  states,
  onUpdateState,
  onEditTitle,
  onEditDescription,
  onDelete,
  onChangeStage,
  stageLabels,
  onboardingType = 'new'
}: any) {
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  // Group items by stage, filtering transfer-only items, prioritize transfer first
  const groupedByStage = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    items
      .filter((item: any) => !item.is_removed)
      .filter((item: any) => {
        // Hide transfer-only items if not in transfer mode
        if (item.transfer_only && onboardingType !== 'transfer') {
          return false;
        }
        return true;
      })
      .sort((a: any, b: any) => {
        // In transfer mode, show transfer-only items first
        if (onboardingType === 'transfer') {
          if (a.transfer_only && !b.transfer_only) return -1;
          if (!a.transfer_only && b.transfer_only) return 1;
        }
        return 0;
      })
      .forEach((item: any) => {
        if (!groups[item.stage_num]) {
          groups[item.stage_num] = [];
        }
        groups[item.stage_num].push(item);
      });
    return groups;
  }, [items, onboardingType]);

  // Count statuses for this stakeholder
  const statusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      progress: 0,
      waiting: 0,
      blocked: 0,
      complete: 0
    };

    items
      .filter((item: any) => !item.is_removed)
      .forEach((item: any) => {
        const state = states.get(item.id);
        const status = state?.status || 'pending';
        counts[status as keyof typeof counts]++;
      });

    return counts;
  }, [items, states]);

  const handleDragOverItem = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer!.dropEffect = 'move';
    setDragOverItem(targetItemId);
  };

  const handleDragLeaveItem = () => {
    setDragOverItem(null);
  };

  const handleDropItem = (e: React.DragEvent, targetItemId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedItemId = e.dataTransfer!.getData('itemId');

    if (draggedItemId && draggedItemId !== targetItemId && onChangeStage) {
      onChangeStage(draggedItemId, targetItemId);
    }
    setDragOverItem(null);
  };

  return (
    <div>
      {/* Status summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_ORDER.map(status => (
          <div
            key={status}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} ${
              statusCounts[status as keyof typeof statusCounts] === 0 ? 'opacity-40' : ''
            }`}
          >
            <span className="capitalize font-medium">
              {status === 'progress' ? 'In progress' : status}
            </span>
            <span className="font-bold">{statusCounts[status as keyof typeof statusCounts]}</span>
          </div>
        ))}
      </div>

      {/* Stages */}
      <div className="space-y-6">
        {(() => {
          const stageEntries = Object.entries(groupedByStage)
            .sort(([a], [b]) => parseInt(a) - parseInt(b));

          return stageEntries.map(([stageNum, stageItems]) => {
            // Group items by tier within the stage
            const itemsByTier: { [key: string]: any[] } = {};
            (stageItems as any[]).forEach((item: any) => {
              const tier = item.tier || 'default';
              if (!itemsByTier[tier]) {
                itemsByTier[tier] = [];
              }
              itemsByTier[tier].push(item);
            });

            // Sort tiers: transfer-only first (if in transfer mode), then others
            const tierOrder = onboardingType === 'transfer'
              ? ['transfer-only', 'required-early', 'no-fixed-order', 'recurring', 'default']
              : ['required-early', 'no-fixed-order', 'recurring', 'transfer-only', 'default'];

            const sortedTiers = Object.keys(itemsByTier).sort((a, b) => {
              const aIndex = tierOrder.indexOf(a);
              const bIndex = tierOrder.indexOf(b);
              return aIndex - bIndex;
            });

            return (
              <div key={`stage-${stageNum}`}>
                {sortedTiers.map((tier) => {
                  const tierItems = itemsByTier[tier];
                  const hasGate = tierItems.some((item: any) => item.is_gate);
                  <div key={`tier-${stageNum}-${tier}`} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Tier header - for transfer-only items */}
                    {tier === 'transfer-only' && (
                      <div className="bg-purple-50 border-b border-purple-200 px-6 py-4">
                        <div className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                          {TIER_LABELS[tier] || tier}
                        </div>
                      </div>
                    )}

                    {/* Stage header - only for non-transfer tiers */}
                    {tier !== 'transfer-only' && tier === sortedTiers[0] && (
                      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded flex items-center justify-center text-sm font-semibold">
                            {stageNum}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                              Stage {stageNum}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {stageLabels[stageNum as keyof typeof stageLabels]}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasGate && (
                            <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded border border-gray-300">
                              🔒 gate
                            </span>
                          )}
                          <span className="text-sm font-mono text-gray-600">
                            {(stageItems as any[]).length}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div className="divide-y divide-gray-200">
                      {tierItems.map((item: any) => (
                    <OnboardingItem
                      key={item.id}
                      item={item}
                      state={states.get(item.id)}
                      onUpdateState={(updates: any) => onUpdateState(item.id, updates)}
                      onEditTitle={(itemId: string, old: string, new_val: string, name: string) => onEditTitle(itemId, old, new_val, name)}
                      onEditDescription={(itemId: string, old: string, new_val: string, name: string) => onEditDescription(itemId, old, new_val, name)}
                      onDelete={(itemId: string) => onDelete(itemId)}
                      onChangeStage={(itemId: string, newStage: number) => onChangeStage(itemId, newStage)}
                      isDraggingOver={dragOverItem === item.id}
                      onDragOver={(e: any) => handleDragOverItem(e, item.id)}
                      onDragLeave={handleDragLeaveItem}
                      onDrop={(e: any) => handleDropItem(e, item.id)}
                    />
                      ))}
                    </div>
                  </div>
                })}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}
