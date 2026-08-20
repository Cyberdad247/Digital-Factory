import React from 'react';

// Define specialized widget components for different agent outputs
const DiffViewer = ({ before, after, file_path }: { before: string; after: string; file_path: string }) => (
  <div className="bg-black p-4 rounded-lg border border-red-900/30 text-xs font-mono overflow-auto">
    <div className="text-gray-400 mb-2">{file_path}</div>
    <div className="text-red-400 line-through">{before}</div>
    <div className="text-green-400">{after}</div>
  </div>
);

const VerificationWidget = ({ verdict, evidence_hash }: { verdict: string; evidence_hash: string }) => (
  <div className={`p-4 rounded-lg border ${verdict === 'valid' ? 'border-amber-500/30 bg-amber-950/10' : 'border-red-500/30 bg-red-950/10'}`}>
    <div className="font-bold text-amber-500 uppercase text-xs">Gideon Verdict: {verdict}</div>
    <div className="text-[10px] text-gray-500 font-mono mt-1">Evidence Hash: {evidence_hash}</div>
  </div>
);

// Add more widget types here...

export const WidgetFactory = ({ widget }: { widget: { type: string; data: any } }) => {
  switch (widget.type) {
    case 'diff_view': return <DiffViewer {...widget.data} />;
    case 'verification_card': return <VerificationWidget {...widget.data} />;
    default: return <div className="text-xs text-gray-500">Unknown Widget Type: {widget.type}</div>;
  }
};
