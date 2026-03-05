import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ExplainerDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  simple: string;
  deep: string;
}

export function ExplainerDrawer({ open, onClose, title, simple, deep }: ExplainerDrawerProps) {
  const [mode, setMode] = useState<'simple' | 'deep'>('simple');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl p-5 max-h-[60vh] overflow-y-auto"
            style={{ background: '#0c0c1e', border: '1px solid #1e2048', borderBottom: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold tracking-wider" style={{ color: '#00e5ff' }}>
                {title}
              </h3>
              <button onClick={onClose} className="text-text-dim hover:text-text-secondary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Toggle */}
            <div className="flex gap-2 mb-4">
              {(['simple', 'deep'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-3 py-1 rounded-md text-xs font-display font-semibold tracking-wider uppercase transition-all"
                  style={{
                    background: mode === m ? 'rgba(0,229,255,0.12)' : 'transparent',
                    color: mode === m ? '#00e5ff' : '#8892bb',
                    border: `1px solid ${mode === m ? 'rgba(0,229,255,0.3)' : '#1e2048'}`,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-relaxed"
                style={{ color: '#8892bb' }}
              >
                {mode === 'simple' ? simple : deep}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
