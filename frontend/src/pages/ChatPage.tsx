import { useEffect, useRef, useState } from 'react';
import { Send, AlertTriangle, PhoneCall } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOrbStore } from '@/store/useOrbStore';
import { subscribeToChat, addChatMessage } from '@/lib/firestore';
import { sendChatMessage } from '@/lib/api';
import type { ChatMessage, Urgency } from '@/types';
import AiraOrb from '@/components/three/AiraOrb';
import UrgencyBadge from '@/components/ui/UrgencyBadge';

const SUGGESTIONS = [
  "I've had a headache since this morning",
  'My resting heart rate seems high lately',
  "I can't sleep well this week — any ideas why?",
  'Is it normal to feel dizzy after skipping breakfast?',
];

const EMERGENCY_PATTERN = /\b(chest pain|can't breathe|cannot breathe|suicidal|severe bleeding|stroke|unconscious|not breathing)\b/i;

export default function ChatPage() {
  const { user, profile } = useAuthStore();
  const { state: orbState, setState: setOrbState } = useOrbStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToChat(user.uid, setMessages);
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => setOrbState('idle');
  }, [setOrbState]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || !user || sending) return;

    if (EMERGENCY_PATTERN.test(content)) {
      setShowEmergencyBanner(true);
    }

    setInput('');
    setSending(true);
    setOrbState('thinking');

    const userMsg: Omit<ChatMessage, 'id'> = { role: 'user', content, createdAt: Date.now() };
    await addChatMessage(user.uid, userMsg);

    try {
      const history = [...messages, { ...userMsg, id: 'temp' }].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await sendChatMessage({ messages: history, profile });

      if (res.urgency === 'urgent') setShowEmergencyBanner(true);

      setOrbState(res.urgency === 'urgent' ? 'alert' : 'speaking');
      await addChatMessage(user.uid, {
        role: 'assistant',
        content: res.reply,
        createdAt: Date.now(),
        urgency: res.urgency,
        provider: res.provider,
      });
    } catch {
      await addChatMessage(user.uid, {
        role: 'assistant',
        content:
          "I'm having trouble reaching my reasoning service right now. If this feels urgent, please contact a medical professional directly rather than waiting on me.",
        createdAt: Date.now(),
        urgency: 'info',
      });
    } finally {
      setSending(false);
      setTimeout(() => setOrbState('idle'), 1200);
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 sm:px-10 py-5 border-b border-line flex-shrink-0">
        <AiraOrb state={orbState} size={48} />
        <div>
          <h1 className="font-display font-medium text-mist">Aira</h1>
          <p className="text-xs text-slate-dim font-mono">
            {sending ? 'thinking…' : 'ready — grounded in your health profile'}
          </p>
        </div>
      </div>

      {showEmergencyBanner && (
        <div className="mx-6 sm:mx-10 mt-4 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red/10 border border-red/30 text-sm text-mist flex-shrink-0">
          <PhoneCall size={17} className="text-red mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red">This may need urgent attention.</p>
            <p className="text-slate mt-0.5">
              If you're experiencing a medical emergency, call your local emergency number now — don't wait for a chat reply.
            </p>
          </div>
          <button
            onClick={() => setShowEmergencyBanner(false)}
            className="ml-auto text-slate-dim hover:text-mist text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 sm:px-10 py-8">
        {messages.length === 0 ? (
          <EmptyState onPick={handleSend} />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-slate-dim text-sm">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-vital animate-blink-dot" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-vital animate-blink-dot" style={{ animationDelay: '200ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-vital animate-blink-dot" style={{ animationDelay: '400ms' }} />
                </span>
                Aira is reasoning through your history…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line px-6 sm:px-10 py-5 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-2xl mx-auto flex items-end gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe what you're feeling…"
            rows={1}
            className="flex-1 resize-none auth-input max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-vital text-ink hover:bg-vital-dim transition-colors disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="max-w-2xl mx-auto text-xs text-slate-dim mt-3 flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Aira offers wellness guidance, not diagnoses. For emergencies, contact local emergency services.
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center pt-10">
      <AiraOrb state="idle" size={140} className="mx-auto mb-6" />
      <h2 className="font-display font-medium text-xl text-mist mb-2">What's going on today?</h2>
      <p className="text-sm text-slate mb-8">
        Tell me what you're experiencing, or pick a starting point below.
      </p>
      <div className="grid sm:grid-cols-2 gap-3 text-left">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="px-4 py-3.5 rounded-xl border border-line bg-ink-softer text-sm text-slate hover:text-mist hover:border-vital/25 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'w-full'}`}>
        <div
          className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-vital text-ink rounded-br-sm font-medium'
              : 'bg-ink-softer border border-line text-mist rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.urgency && (
          <div className="mt-2">
            <UrgencyBadge urgency={message.urgency as Urgency} />
          </div>
        )}
      </div>
    </div>
  );
}
