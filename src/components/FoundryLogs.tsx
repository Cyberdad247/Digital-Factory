import React, { useEffect, useRef } from 'react';

interface FoundryLogsProps {
  logs: string[];
}

export function FoundryLogs({ logs }: FoundryLogsProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-[#08080E] border border-[#222234] rounded-lg p-4 h-64 overflow-y-auto font-mono text-[10px] text-amber-500/80 shadow-inner">
      {logs.map((log, i) => (
        <div key={i} className="mb-1 leading-tight">{log}</div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
