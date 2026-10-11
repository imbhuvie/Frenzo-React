import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MessageCircle, Plus, Loader2 } from 'lucide-react';
import { chatApi } from '../../api/chat';
import type { UserListItemResponse } from '../../types/chat';

function initialsOf(name: string): string {
  const clean = name.trim();
  return clean ? clean.slice(0, 2).toUpperCase() : '??';
}

interface NewChatModalProps {
  open: boolean;
  onClose: () => void;
  onOpened: (conversationId: string) => void;
  onStarted: (conversationId: string) => void;
}

export default function NewChatModal({ open, onClose, onOpened, onStarted }: NewChatModalProps) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  // Twin fetch effects caused a double GET per open; exactly one effect below owns fetching,
  // and this guard covers the StrictMode double-invoke. See docs/FETCH_RULES.md.
  const usersInflight = useRef(false);
  const firstLoad = useRef(true);

  const loadUsers = useCallback(async (needle: string) => {
    if (usersInflight.current) return;
    usersInflight.current = true;
    setLoading(true);
    setFailed(false);
    try {
      const result = await chatApi.getUsers(needle.trim() ? needle.trim() : undefined, 20);
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      usersInflight.current = false;
      setLoading(false);
    }
  }, []);

  // Reset on open; arms the single fetch effect below for an immediate first load.
  useEffect(() => {
    if (!open) return;
    setSearch('');
    setStartingId(null);
    firstLoad.current = true;
  }, [open]);

  // The ONLY fetch effect: immediate on open, 300ms debounced while typing.
  useEffect(() => {
    if (!open) return;
    const delay = firstLoad.current ? 0 : 300;
    firstLoad.current = false;
    const timer = setTimeout(() => {
      void loadUsers(search);
    }, delay);
    return () => clearTimeout(timer);
  }, [open, search, loadUsers]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handlePick = async (user: UserListItemResponse) => {
    if (startingId) return;
    // Existing 1-1 opens instantly with no API write.
    if (user.hasDirectChat && user.directConversationId) {
      onOpened(user.directConversationId);
      onClose();
      return;
    }
    setStartingId(user.userId);
    try {
      const result = await chatApi.startDirect({ otherUserId: user.userId });
      if (result.success && result.data) {
        onStarted(result.data.conversationId);
        onClose();
      }
    } catch {
      setStartingId(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0b16] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-bold text-white">New chat</h2>
                <p className="text-xs text-slate-500 mt-0.5">Pick someone to message</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search people..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading && users.length === 0 ? (
                <div className="space-y-2 px-2 py-1" aria-label="Loading people">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="flex items-center gap-3 px-3 py-3 rounded-xl animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
                      <div className="flex-1 h-3.5 rounded bg-white/[0.06]" />
                    </div>
                  ))}
                </div>
              ) : failed && users.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <p className="text-sm font-medium text-slate-300">Couldn't load people</p>
                  <button
                    type="button"
                    onClick={() => void loadUsers(search)}
                    className="mt-3 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : users.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 flex items-center justify-center mb-3">
                    <MessageCircle size={24} className="text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">No people found</p>
                  <p className="text-xs text-slate-500 mt-1">Try a different search</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => {
                    const busy = startingId === user.userId;
                    return (
                      <button
                        key={user.userId}
                        type="button"
                        disabled={busy}
                        onClick={() => void handlePick(user)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border border-transparent hover:bg-white/[0.04] disabled:opacity-60"
                      >
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover border border-white/[0.08] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-600/20 flex-shrink-0">
                            {initialsOf(user.displayName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">{user.displayName}</p>
                          <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                        </div>
                        {busy ? (
                          <Loader2 size={16} className="text-violet-400 animate-spin flex-shrink-0" />
                        ) : user.hasDirectChat ? (
                          <span className="text-xs font-medium text-slate-400 border border-white/[0.08] rounded-lg px-2.5 py-1.5">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-600/25">
                            <Plus size={13} />
                            Chat
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
