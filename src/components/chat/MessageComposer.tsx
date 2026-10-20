import { useState, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface MessageComposerProps {
  peerName: string;
  // Resolves true when the message was accepted; the box clears only then (failed text stays).
  onSend: (text: string) => Promise<boolean>;
}

export default function MessageComposer({ peerName, onSend }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const sendable = text.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!sendable) return;
    const outgoing = text.trim();
    setSending(true);
    void onSend(outgoing).then((accepted) => {
      setSending(false);
      if (accepted) setText('');
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative z-10 px-6 py-4 border-t border-white/[0.06] bg-white/[0.01]">
      <div className="flex items-end gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 pl-4 focus-within:ring-1 focus-within:ring-violet-500/40 focus-within:border-violet-500/40 transition-all">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${peerName}...`}
          className="flex-1 max-h-32 resize-none bg-transparent py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!sendable}
          aria-label="Send message"
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
