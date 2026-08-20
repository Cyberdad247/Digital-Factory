import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export type PipelineStatus = 'pending' | 'active' | 'completed';

export interface PipelineStage {
  id: string;
  label: string;
  status: PipelineStatus;
}

interface PipelineProgressProps {
  stages: PipelineStage[];
  className?: string;
}

export function PipelineProgress({ stages, className = '' }: PipelineProgressProps) {
  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          <div className="flex flex-col items-center flex-1">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300
              ${stage.status === 'completed' ? 'bg-amber-900/30 border-amber-500 text-amber-500' :
                stage.status === 'active' ? 'bg-amber-500/20 border-amber-400 text-amber-400' :
                'bg-[#181826] border-[#2A2A3E] text-gray-600'}
            `}>
              {stage.status === 'completed' && <CheckCircle2 size={14} />}
              {stage.status === 'active' && <Loader2 size={14} className="animate-spin" />}
              {stage.status === 'pending' && <Circle size={10} />}
            </div>
            <span className={`text-[9px] font-bold font-mono mt-2 text-center ${stage.status === 'pending' ? 'text-gray-500' : 'text-amber-100'}`}>
              {stage.label}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${stage.status === 'completed' ? 'bg-amber-500' : 'bg-[#2A2A3E]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
