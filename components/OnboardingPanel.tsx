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

  const groupedByStage = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    items
      .filter((item: any) => !item.is_removed)
      .filter((item: any) => {
        if (item.transfer_only && onboardingType !== 'transfer') {
          return false;
        }
        return true;
      })
      .forEach((item: any) => {
        if (!groups[item.stage_num]) {
          groups[item.stage_num] = [];
        }
        groups[item.stage_num].push(item);
      });
    return groups;
  }, [items, onboardingType]);

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

      <div className="space-y-6">
        {/* Transfer section FIRST (only in transfer mode) */}
        {onboardingType === 'transfer' && Object.values(groupedByStage).flat().some((item: any) => item.transfer_only) && (
          <div className="border border-purple-200 rounded-lg overflow-hidden bg-purple-50">
            <div className="bg-purple-100 border-b border-purple-200 px-6 py-4">
              <div className="text-sm font-semibold text-purple-700 uppercase tracking-wider">
                Transfer-specific steps
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {Object.values(groupedByStage)
                .flat()
                .filter((item: any) => item.transfer_only)
                .map((item: any) => (
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
        )}

        {/* Regular stages second */}
        {Object.entries(groupedByStage)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([stageNum, stageItems]) => {
            const nonTransferItems = (stageItems as any[]).filter(i => !i.transfer_only);
            if (nonTransferItems.length === 0) return null;

            const hasGate = nonTransferItems.some((item: any) => item.is_gate);

            return (
              <div key={`stage-${stageNum}`} className="border border-gray-200 rounded-lg overflow-hidden">
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
                      {nonTransferItems.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {nonTransferItems.map((item: any) => (
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
            );
          })}
      </div>
    </div>
  );
}
