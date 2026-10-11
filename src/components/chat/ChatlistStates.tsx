import { motion } from 'framer-motion';
import { MessageCircle, Plus, RefreshCw, WifiOff } from 'lucide-react';

export function ChatlistSkeleton() {
  return (
    <div className="px-3 py-2 space-y-2" aria-label="Loading conversations">
      {[0, 1, 2, 3, 4].map((key) => (
        <div key={key} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
          <div className="w-11 h-11 rounded-full bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-white/[0.06]" />
            <div className="h-3 w-3/5 rounded bg-white/[0.04]" />
          </div>
          <div className="h-3 w-8 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

interface ChatlistErrorProps {
  onRetry: () => void;
}

export function ChatlistError({ onRetry }: ChatlistErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600/20 to-orange-600/20 border border-rose-500/20 flex items-center justify-center mb-4">
        <WifiOff size={24} className="text-rose-400" />
      </div>
      <p className="text-sm font-medium text-slate-300">Couldn't load conversations</p>
      <p className="text-xs text-slate-500 mt-1.5 max-w-[220px]">
        Check your connection and try again
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

export function ChatlistEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 flex items-center justify-center mb-4">
          <MessageCircle size={28} className="text-violet-400" />
        </div>
        <p className="text-sm font-medium text-slate-300">No conversations yet</p>
        <p className="text-xs text-slate-500 mt-1.5 max-w-[200px]">
          Start chatting by creating a new conversation
        </p>
        <button className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
          <Plus size={14} />
          New Chat
        </button>
      </motion.div>
    </div>
  );
}
