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
  stageLabels
}: any) {
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  // Group items by stage
  const groupedByStage = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    items
      .filter((item: any) => !item.is_removed)
      .forEach((item: any) => {
        if (!groups[item.stage_num]) {
          groups[item.stage_num] = [];
        }
        groups[item.stage_num].push(item);
      });
    return groups;
  }, [items]);

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

  const handleDragOver = (e: React.DragEvent, stageNum: number) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    setDragOverStage(stageNum);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageNum: number) => {
    e.preventDefault();
    const itemId = e.dataTransfer!.getData('itemId');
    const sourceStage = parseInt(e.dataTransfer!.getData('sourceStage'));

    if (sourceStage !== stageNum && onChangeStage) {
      onChangeStage(itemId, stageNum);
    }
    setDragOverStage(null);
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
        {Object.entries(groupedByStage)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([stageNum, stageItems]) => {
            const hasGate = (stageItems as any[]).some((item: any) => item.is_gate);

            return (
              <div
                key={stageNum}
                onDragOver={(e) => handleDragOver(e, parseInt(stageNum))}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, parseInt(stageNum))}
                className={`border rounded-lg overflow-hidden transition ${dragOverStage === parseInt(stageNum) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
              >
                {/* Stage header */}
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

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {(stageItems as any[]).map((item: any) => (
                    <OnboardingItem
                      key={item.id}
                      item={item}
                      state={states.get(item.id)}
                      onUpdateState={(updates: any) => onUpdateState(item.id, updates)}
                      onEditTitle={(itemId: string, old: string, new_val: string, name: string) => onEditTitle(itemId, old, new_val, name)}
                      onEditDescription={(itemId: string, old: string, new_val: string, name: string) => onEditDescription(itemId, old, new_val, name)}
                      onDelete={(itemId: string) => onDelete(itemId)}
                      onChangeStage={(itemId: string, newStage: number) => onChangeStage(itemId, newStage)}
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
