import React, { useState } from 'react';
import { TriageOrchestrator } from '../lib/triage-orchestrator';

export function OrchestratorChat({ onWorkflowStart }: { onWorkflowStart: (intent: any, budget: any) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intent = TriageOrchestrator.determineIntent(input);
    const budget = TriageOrchestrator.getBudget(intent);
    onWorkflowStart(intent, budget);
    setInput('');
  };

  return (
    <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5">
      <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Anya Orchestrator</h4>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          className="flex-1 bg-[#08080E] border border-[#222234] rounded-lg p-2 text-sm text-amber-100 placeholder-gray-600"
          placeholder="Describe your engineering intent..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-amber-900/30 border border-amber-500 text-amber-500 rounded-lg text-xs font-bold hover:bg-amber-900/50">
          Execute
        </button>
      </form>
    </div>
  );
}
