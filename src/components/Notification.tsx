import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationProps {
  message: string;
  type: 'success' | 'warning';
  onClose: () => void;
}

export function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 p-4 rounded-lg border flex items-center gap-3 z-50 ${
          type === 'success' 
            ? 'bg-[#0B0B0E] border-green-500 text-green-500' 
            : 'bg-[#0B0B0E] border-yellow-500 text-yellow-500'
        }`}
      >
        {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        <span className="text-sm font-mono">{message}</span>
        <button onClick={onClose} className="hover:text-white"><X size={16} /></button>
      </motion.div>
    </AnimatePresence>
  );
}
