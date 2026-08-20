import React from 'react';
import { Workflow, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Stage {
  name: string;
  progress: number; // 0-100
  status: 'COMPLETED' | 'RUNNING' | 'PENDING' | 'BLOCKED';
}

export function MerlinFoundryPipelineSection() {
  const stages: Stage[] = [
    { name: 'Mapping', progress: 100, status: 'COMPLETED' },
    { name: 'Planned', progress: 100, status: 'COMPLETED' },
    { name: 'LeaseRequested', progress: 100, status: 'COMPLETED' },
    { name: 'WorkcellReady', progress: 100, status: 'COMPLETED' },
    { name: 'Running', progress: 65, status: 'RUNNING' },
    { name: 'Checkpointed', progress: 0, status: 'PENDING' },
    { name: 'EvidenceCollected', progress: 0, status: 'PENDING' },
    { name: 'Testing', progress: 0, status: 'PENDING' },
    { name: 'ConstraintCheck', progress: 0, status: 'PENDING' },
    { name: 'Verifying', progress: 0, status: 'PENDING' },
    { name: 'Accepted', progress: 0, status: 'PENDING' },
    { name: 'Released', progress: 0, status: 'PENDING' },
  ];

  return (
    <div className="bg-[#0E0E18] border-2 border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl transition-all space-y-4">
      <div className="flex items-center gap-2.5 border-b border-[#1E1E30] pb-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Workflow size={18} />
        </div>
        <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
          Merlin Foundry Pipeline Progress
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        {stages.map((stage, index) => (
          <div key={index} className="bg-[#11111C] border border-[#222234] p-3 rounded-lg flex items-center justify-between gap-4">
            <span className="text-gray-300 font-bold text-xs font-mono w-32">{stage.name}</span>
            <div className="w-full bg-[#08080E] h-2 rounded-full overflow-hidden flex-1">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  stage.status === 'COMPLETED'
                    ? 'bg-emerald-500'
                    : stage.status === 'RUNNING'
                    ? 'bg-sky-500 animate-pulse'
                    : 'bg-gray-700'
                }`}
                style={{ width: `${stage.progress}%` }}
              ></div>
            </div>
            <span className={`text-[10px] font-bold font-mono w-24 text-right ${
              stage.status === 'COMPLETED' ? 'text-emerald-400' : 
              stage.status === 'RUNNING' ? 'text-sky-400' : 'text-gray-500'
            }`}>
              {stage.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
