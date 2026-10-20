import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Settings,
  LogOut,
  MessageCircle,
  Plus,
  Hash,
  Users,
  Sparkles,
  Send,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import ConversationRow from '../components/chat/ConversationRow';
import MessageComposer from '../components/chat/MessageComposer';
import NewChatModal from '../components/chat/NewChatModal';
import { ChatlistEmpty, ChatlistError, ChatlistSkeleton } from '../components/chat/ChatlistStates';
import { chatApi } from '../api/chat';
import { useChatHub } from '../hooks/useChatHub';
import type { ChatlistItemResponse, MessageBroadcast } from '../types/chat';
import { formatRelativeTime } from '../utils/time';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatlistItemResponse[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  // Thread map per conversation: history rows merged with live session messages (deduped by id).
  const [threadMap, setThreadMap] = useState<Record<string, MessageBroadcast[]>>({});
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  // One history fetch at a time per FETCH_RULES.md (in-flight guard + cleanup discipline).
  const historyInflight = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const threadBottomRef = useRef<HTMLDivElement | null>(null);
  // StrictMode mounts twice in dev; skip the second call while one is already flying.
  const chatlistInflight = useRef(false);

  const loadChatlist = useCallback(async () => {
    if (chatlistInflight.current) return;
    chatlistInflight.current = true;
    setListLoading(true);
    setListError(false);
    try {
      const result = await chatApi.getChatlist(undefined, 20);
      if (result.success && result.data) {
        setConversations(result.data);
      } else {
        setListError(true);
      }
    } catch {
      setListError(true);
    } finally {
      chatlistInflight.current = false;
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChatlist();
  }, [loadChatlist]);

  const visibleConversations = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter((item) => item.displayName.toLowerCase().includes(needle));
  }, [conversations, searchQuery]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.conversationId === selectedId) ?? null,
    [conversations, selectedId],
  );

  // Appends one broadcast (echo + peer alike), deduped by id; bumps preview/unread/ordering.
  const appendMessage = useCallback((message: MessageBroadcast) => {
    const viewingId = selectedIdRef.current;
    setThreadMap((prev) => {
      const existing = prev[message.conversationId] ?? [];
      const isDuplicate = existing.some((item) => item.id === message.id);
      if (isDuplicate) return prev;
      return { ...prev, [message.conversationId]: [...existing, message] };
    });
    setConversations((prev) =>
      prev
        .map((row) => {
          if (row.conversationId !== message.conversationId) return row;
          const isViewing = viewingId === message.conversationId;
          return {
            ...row,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              messageType: message.messageType,
              createdAt: message.createdAt,
            },
            updatedAt: message.createdAt,
            unreadCount: isViewing ? 0 : row.unreadCount + 1,
          };
        })
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    );
  }, []);

  const getToken = useCallback(() => localStorage.getItem('frenzo_token'), []);
  const { status: hubStatus, sendMessage } = useChatHub(isAuthenticated, getToken, appendMessage);

  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!selectedId) return false;
    try {
      const sent = await sendMessage({ conversationId: selectedId, content: text, messageType: 1 });
      appendMessage(sent);
      return true;
    } catch {
      // Box keeps the text (composer clears only on true); retry by pressing Send again.
      toast.error('Could not send. Please try again.');
      return false;
    }
  };

  // Keep the thread pinned to the newest message.
  const threadMessages = useMemo(() => {
    if (!selectedId) return [];
    const rows = threadMap[selectedId] ?? [];
    return [...rows].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  }, [threadMap, selectedId]);
  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [threadMessages.length, selectedId]);

  // Loads one history page (ascending from the API) and merges it with live rows by id.
  const loadHistory = useCallback(async (conversationId: string, olderCursor?: string) => {
    if (historyInflight.current) return;
    historyInflight.current = true;
    if (!olderCursor) setHistoryLoading(true);
    try {
      const result = await chatApi.getHistory(conversationId, olderCursor, 30);
      if (result.success && result.data) {
        const page = result.data;
        setThreadMap((prev) => {
          const existing = prev[conversationId] ?? [];
          const knownIds = new Set(existing.map((item) => item.id));
          const fresh: MessageBroadcast[] = page
            .filter((item) => !knownIds.has(item.id))
            .map((item) => ({ ...item, conversationId }));
          const merged = [...fresh, ...existing];
          const seen = new Set<string>();
          const deduped = merged.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          return { ...prev, [conversationId]: deduped };
        });
        setHistoryHasMore(page.length >= 30);
      }
    } catch {
      // History failure keeps the live thread usable; retry by reselecting the chat.
    } finally {
      historyInflight.current = false;
      if (!olderCursor) setHistoryLoading(false);
    }
  }, []);

  // On select: history first, then advance the read marker and zero the badge.
  useEffect(() => {
    if (!selectedId) return;
    setHistoryHasMore(true);
    void loadHistory(selectedId).then(() => {
      void chatApi.markRead(selectedId).then((marked) => {
        if (marked.success) {
          setConversations((prev) =>
            prev.map((row) =>
              row.conversationId === selectedId ? { ...row, unreadCount: 0 } : row,
            ),
          );
        }
      });
    });
  }, [selectedId, loadHistory]);

  const handleChatOpened = (conversationId: string) => {
    setSelectedId(conversationId);
  };

  const handleChatStarted = async (conversationId: string) => {
    setSelectedId(conversationId);
    await loadChatlist();
    setSelectedId(conversationId);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login', { replace: true });
  };

  // Generate avatar initials from username
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="h-screen flex bg-[#06060f] text-slate-100 overflow-hidden">
      {/* ═══ Sidebar ═══ */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-[340px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-white/[0.01]"
      >
        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <Logo size="sm" />
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
              title="New Conversation"
            >
              <Plus size={20} />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Conversations</p>
          </div>
          {listLoading ? (
            <ChatlistSkeleton />
          ) : listError ? (
            <ChatlistError onRetry={() => void loadChatlist()} />
          ) : visibleConversations.length === 0 ? (
            <ChatlistEmpty />
          ) : (
            <div className="px-3 pb-3 space-y-1">
              {visibleConversations.map((item) => (
                <ConversationRow
                  key={item.conversationId}
                  item={item}
                  selected={item.conversationId === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar footer — user info */}
        <div className="relative px-3 py-3 border-t border-white/[0.06]">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-600/20">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* User dropdown menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-white/[0.08] bg-[#161425] shadow-2xl shadow-black/50 overflow-hidden"
              >
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all">
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ═══ Main content area ═══ */}
      <main className="flex-1 flex flex-col relative">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] rounded-full bg-violet-600/[0.04] blur-[100px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/[0.03] blur-[80px]" />
        </div>

        {/* Selected conversation header preview (message thread lands in a later task) */}
        {selectedConversation && (
          <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            {selectedConversation.photoUrl ? (
              <img
                src={selectedConversation.photoUrl}
                alt={selectedConversation.displayName}
                className="w-10 h-10 rounded-full object-cover border border-white/[0.08]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-600/20">
                {selectedConversation.displayName.trim().slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{selectedConversation.displayName}</p>
              <p className="text-xs text-slate-500">
                {selectedConversation.isGroup ? 'Group' : 'Direct message'}
                {selectedConversation.unreadCount > 0 ? ` · ${selectedConversation.unreadCount} unread` : ''}
                {hubStatus !== 'connected' ? ` · ${hubStatus}…` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Thread view (history + live session messages, merged by id) */}
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {historyLoading && threadMessages.length === 0 ? (
                <div className="space-y-2.5 max-w-3xl mx-auto" aria-label="Loading messages">
                  {[0, 1, 2].map((key) => (
                    <div key={key} className="h-12 rounded-2xl bg-white/[0.04] animate-pulse" />
                  ))}
                </div>
              ) : threadMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-sm px-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 flex items-center justify-center mb-4">
                      <MessageCircle size={28} className="text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">No messages yet</p>
                    <p className="text-xs text-slate-500 mt-1.5">
                      Say hello to {selectedConversation.displayName} below
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-w-3xl mx-auto">
                  {historyHasMore && (
                    <button
                      type="button"
                      onClick={() => void loadHistory(selectedConversation.conversationId, threadMessages[0]?.createdAt)}
                      className="self-center text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors px-4 py-2"
                    >
                      Load older messages
                    </button>
                  )}
                  {threadMessages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                            isOwn
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20 rounded-br-md'
                              : 'bg-white/[0.05] border border-white/[0.07] text-slate-200 rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-[11px] mt-1 text-right ${isOwn ? 'text-white/70' : 'text-slate-500'}`}>
                            {formatRelativeTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={threadBottomRef} />
                </div>
              )}
            </div>
            <MessageComposer peerName={selectedConversation.displayName} onSend={handleSendMessage} />
          </>
        ) : (
        /* Welcome state (nothing selected) */
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-center max-w-md px-6"
          >
            {/* Decorative icon cluster */}
            <div className="relative w-28 h-28 mx-auto mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-white/[0.06]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border border-dashed border-violet-500/10"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles size={28} className="text-violet-400" />
                </div>
              </div>
              {/* Orbiting icons */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center">
                  <Hash size={14} className="text-cyan-400" />
                </div>
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-0 right-0 translate-x-1"
              >
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/20 flex items-center justify-center">
                  <Users size={14} className="text-fuchsia-400" />
                </div>
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to FrenZo, {user?.username}!
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Your conversations will appear here. Start a new chat to connect
              with friends, create groups, or join channels.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Send size={16} />
                Start a Conversation
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-medium hover:bg-white/[0.04] hover:text-white transition-all">
                <Users size={16} />
                Create a Group
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </main>
      <NewChatModal
        open={showNewChat}
        onClose={() => setShowNewChat(false)}
        onOpened={handleChatOpened}
        onStarted={(conversationId) => void handleChatStarted(conversationId)}
      />
    </div>
  );
}
