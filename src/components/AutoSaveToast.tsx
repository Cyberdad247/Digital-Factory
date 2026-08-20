import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Check, Loader2, AlertCircle, Database } from 'lucide-react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveToastProps {
  status: AutoSaveStatus;
  isCloudSync?: boolean;
  lastSavedAt?: Date | null;
  saveCount?: number;
  errorMessage?: string;
  onDismiss?: () => void;
}

export function AutoSaveToast({ status, isCloudSync = true, lastSavedAt, saveCount, errorMessage, onDismiss }: AutoSaveToastProps) {
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          id="auto-save-toast"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.92 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          {status === 'saving' && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0E0E16]/95 border border-amber-500/50 text-amber-300 shadow-2xl shadow-amber-500/10 backdrop-blur-md text-xs font-mono">
              <Loader2 size={15} className="animate-spin text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold">
                  <Database size={12} className="text-amber-400" />
                  <span>Auto-saving...</span>
                </div>
                <span className="text-[10px] text-amber-200/70">
                  {isCloudSync ? 'Syncing Forge state to Firestore' : 'Saving state to local sovereign buffer'}
                </span>
              </div>
            </div>
          )}

          {status === 'saved' && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0E0E16]/95 border border-emerald-500/50 text-emerald-300 shadow-2xl shadow-emerald-500/10 backdrop-blur-md text-xs font-mono">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check size={13} className="text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold">
                  <Cloud size={12} className="text-emerald-400" />
                  <span>Forge State Auto-saved</span>
                </div>
                <span className="text-[10px] text-emerald-200/70">
                  {isCloudSync 
                    ? (lastSavedAt ? `Firestore synced at ${lastSavedAt.toLocaleTimeString()}` : 'Cloud snapshot persisted')
                    : 'Saved to local VFS buffer (Sign in for Cloud sync)'}
                  {saveCount ? ` • #${saveCount}` : ''}
                </span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div 
              onClick={onDismiss}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#160E0E]/95 border border-red-500/50 text-red-300 shadow-2xl shadow-red-500/10 backdrop-blur-md text-xs font-mono cursor-pointer"
            >
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-bold">Auto-save deferred</span>
                <span className="text-[10px] text-red-200/70">{errorMessage || 'Saved locally, Firestore will retry'}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
