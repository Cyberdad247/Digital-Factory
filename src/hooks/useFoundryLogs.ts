import { useState, useEffect } from 'react';

/**
 * Hook to manage the Merlin Engineering Foundry real-time logs.
 */
export function useFoundryLogs() {
  const [logs, setLogs] = useState<string[]>([
    '[System] Engineering workcell initialized...',
    '[System] Sentinel lease validated.',
    '[Foundry] Knight Pill sir-borris loaded.',
  ]);

  useEffect(() => {
    const stream = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const actions = [
        'Parsing AST symbols...',
        'Validating patch hash...',
        'Running static analysis...',
        'Checking memory pressure...',
        'Checkpointing state...',
        'Evidence collected.'
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const newLog = `[${timestamp}] [Foundry] ${action}`;
      
      setLogs(prev => [...prev.slice(-49), newLog]);
    }, 2500);
    return () => clearInterval(stream);
  }, []);

  return logs;
}
