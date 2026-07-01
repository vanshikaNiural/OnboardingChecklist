'use client';

import { useState } from 'react';

const STATUS_ORDER = ['pending', 'progress', 'waiting', 'blocked', 'complete'];
const STATUS_COLORS = {
  pending: 'border-gray-300',
  progress: 'border-blue-400 bg-blue-50',
  waiting: 'border-yellow-400 bg-yellow-50',
  blocked: 'border-red-400 bg-red-50',
  complete: 'border-green-400 bg-green-50'
};

const STATUS_DOT = {
  pending: 'border-gray-300',
  progress: 'border-blue-500 bg-blue-500',
  waiting: 'border-yellow-600 border-dashed',
  blocked: 'border-red-600 bg-red-600',
  complete: 'border-green-600 bg-green-600'
};

export default function OnboardingItem({
  item,
  state,
  onUpdateState
}: any) {
  const currentStatus = state?.status || 'pending';
  const [showNotes, setShowNotes] = useState(!!state?.notes);
  const [notes, setNotes] = useState(state?.notes || '');
  const [date, setDate] = useState(state?.completed_date || '');

  const handleStatusClick = () => {
    const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length];
    onUpdateState({ status: nextStatus });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onUpdateState({ notes: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    onUpdateState({ completed_date: e.target.value });
  };

  return (
    <div className={`px-6 py-4 border-l-4 ${STATUS_COLORS[currentStatus as keyof typeof STATUS_COLORS]}`}>
      <div className="flex gap-4">
        {/* Status circle */}
        <button
          onClick={handleStatusClick}
          className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded"
          title="Click to cycle status"
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer hover:scale-110 transition ${STATUS_DOT[currentStatus as keyof typeof STATUS_DOT]}`}
          >
            {currentStatus === 'progress' && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {currentStatus === 'complete' && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {currentStatus === 'blocked' && (
              <div className="w-2 h-0.5 bg-white rounded"></div>
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {item.is_gate && (
                <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded">
                  🔒 gate
                </span>
              )}
              {item.is_recurring && (
                <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded">
                  recurring
                </span>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-4 flex-wrap text-xs text-gray-600">
              <div className="inline-flex items-center gap-2">
                <span className="font-medium capitalize">
                  {currentStatus === 'progress' ? 'In progress' : currentStatus}
                </span>
              </div>
              <div className="inline-flex items-center gap-1">
                <span>Done:</span>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-gray-500 hover:text-purple-600 font-medium"
              >
                {showNotes ? '– notes' : '+ notes'}
              </button>
            </div>

            {/* Notes */}
            {showNotes && (
              <div className="mt-3">
                <textarea
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Notes / validation comments..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
