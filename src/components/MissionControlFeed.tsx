import React from 'react';

export interface EventLog {
  event_id: string;
  timestamp: string;
  type: string;
  actor: { type: string; id: string };
  summary: string;
  severity: 'info' | 'warning' | 'critical';
}

export function MissionControlFeed({ logs }: { logs: EventLog[] }) {
  return (
    <div className="h-full flex flex-col bg-[#08080E] border border-[#222234] rounded-2xl p-4">
      <div className="pb-3 border-b border-[#222234] mb-3">
        <h3 className="text-amber-500 text-sm font-black uppercase tracking-wider">Mission Control Feed</h3>
      </div>
      <div className="flex-1 overflow-y-auto max-h-96 pr-2 space-y-3">
        {logs.map((log) => (
          <div key={log.event_id} className="border-l-2 border-[#222234] pl-3 py-1 hover:border-amber-500/50 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded font-mono uppercase">{log.type}</span>
              <span className="text-[9px] text-gray-500 font-mono">{log.timestamp}</span>
            </div>
            <p className="text-xs text-amber-100/90 font-medium">{log.summary}</p>
            <div className="text-[9px] text-gray-500 mt-1">Actor: {log.actor.type} ({log.actor.id})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
