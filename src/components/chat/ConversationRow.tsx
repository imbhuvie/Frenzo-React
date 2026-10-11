import { motion } from 'framer-motion';
import { VolumeX, Users } from 'lucide-react';
import type { ChatlistItemResponse } from '../../types/chat';

function formatRelativeTime(isoUtc: string): string {
  const then = new Date(isoUtc).getTime();
  const diffMs = Date.now() - then;
  if (Number.isNaN(then) || diffMs < 0) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString();
}

function formatUnread(count: number): string {
  return count > 99 ? '99+' : `${count}`;
}

function initialsOf(name: string): string {
  const clean = name.trim();
  return clean ? clean.slice(0, 2).toUpperCase() : '??';
}

interface ConversationRowProps {
  item: ChatlistItemResponse;
  selected: boolean;
  onSelect: (conversationId: string) => void;
}

export default function ConversationRow({ item, selected, onSelect }: ConversationRowProps) {
  const preview = item.lastMessage?.content ?? 'No messages yet';
  const timeLabel = item.lastMessage ? formatRelativeTime(item.lastMessage.createdAt) : '';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(item.conversationId)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group ${
        selected
          ? 'bg-violet-600/[0.12] border border-violet-500/30'
          : 'border border-transparent hover:bg-white/[0.04]'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.displayName}
            className="w-11 h-11 rounded-full object-cover border border-white/[0.08]"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-600/20">
            {initialsOf(item.displayName)}
          </div>
        )}
        {item.isGroup && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#161425] border border-white/[0.08] flex items-center justify-center">
            <Users size={11} className="text-violet-400" />
          </div>
        )}
      </div>

      {/* Name + preview */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-slate-200 truncate">{item.displayName}</p>
          {item.isMuted && <VolumeX size={13} className="flex-shrink-0 text-slate-500" />}
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{preview}</p>
      </div>

      {/* Time + unread */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        {timeLabel && <span className="text-[11px] text-slate-500">{timeLabel}</span>}
        {item.unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-violet-600/25">
            {formatUnread(item.unreadCount)}
          </span>
        )}
      </div>
    </motion.button>
  );
}
