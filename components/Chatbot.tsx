import { useState, useEffect, useRef } from "react";
import {
  fallbackAnswer,
  knowledgeBase,
  type ChatMessage,
} from "@/lib/support-knowledge";
import { MessageCircle, X } from "lucide-react";
type Message = {
  text: string;
  user: boolean;
  notice?: string;
  sources?: string[];
};
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hey, future binge-watcher! 👋 Ask me about BingeBox pricing, signing up, payments, or requesting a title.",
      user: false,
    },
  ]);
  const end = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy, error]);
  async function send(value: string) {
    const text = value.trim();
    if (!text || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setInput("");
    const next = [...messages, { text, user: true }];
    setMessages(next);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: location.hash.slice(1) || "home",
          messages: next
            .slice(1)
            .slice(-12)
            .map((m) => ({
              role: m.user ? "user" : "assistant",
              content: m.text,
            })),
        }),
        signal: AbortSignal.timeout(25000),
      });
      const data = (await response.json()) as {
        answer?: string;
        notice?: string;
        sources?: string[];
      };
      if (
        !response.ok ||
        typeof data.answer !== "string" ||
        !data.answer.trim()
      )
        throw new Error();
      const answer = data.answer;
      setMessages((m) => [
        ...m,
        {
          text: answer,
          user: false,
          notice: data.notice,
          sources: data.sources,
        },
      ]);
    } catch {
      const history: ChatMessage[] = next
        .slice(1)
        .slice(-12)
        .map((m) => ({ role: m.user ? "user" : "assistant", content: m.text }));
      const result = fallbackAnswer(
        history,
        knowledgeBase(import.meta.env),
        location.hash.slice(1) || "home"
      );
      setMessages((m) => [
        ...m,
        {
          text: result.answer,
          user: false,
          sources: result.sources,
          notice: "Answered from BingeBox’s saved help information.",
        },
      ]);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <aside className="chatbot">
      {open && (
        <section className="chat-panel" aria-label="BingeBox support">
          <div className="chat-header">
            <img
              className="chat-brand-mark"
              src="/brand/bingebox-mark.svg"
              alt=""
              width="34"
              height="34"
            />
            <div>
              <strong>BingeBot</strong>
              <small>Automated help · Grounded in BingeBox information</small>
            </div>
            <button
              className="icon-button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div
            className="chat-messages"
            role="log"
            aria-live="polite"
            aria-busy={busy}
          >
            {messages.map((m, i) => (
              <div key={i}>
                <p className={m.user ? "user-message" : ""}>{m.text}</p>
                {m.notice && <small className="chat-status">{m.notice}</small>}
                {!!m.sources?.length && (
                  <small className="chat-status">
                    Help topics: {m.sources.join(" · ")}
                  </small>
                )}
              </div>
            ))}
            {busy && (
              <p className="chat-thinking">Checking BingeBox information…</p>
            )}
            {error && <p role="alert">{error}</p>}
            <div ref={end} />
          </div>
          <div className="chat-options">
            {[
              "How much?",
              "How to sign up",
              "Payment help",
              "Request a title",
            ].map((t) => (
              <button disabled={busy} key={t} onClick={() => send(t)}>
                {t}
              </button>
            ))}
          </div>
          <a className="chat-email" href="mailto:b1ng3b0x@gmail.com">
            Email the team
          </a>
          <small className="chat-privacy">
            This automated chat is handled by a bot. Don’t share passwords or
            payment details. Chat doesn’t send emails.
          </small>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              autoFocus
              aria-label="Your message"
              placeholder="Ask us something…"
              value={input}
              disabled={busy}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="chat-send"
            >
              {busy ? "…" : "Send"}
            </button>
          </form>
        </section>
      )}
      <button
        className="chat-toggle"
        aria-expanded={open}
        aria-label={open ? "Close support chat" : "Open support chat"}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <MessageCircle size={21} />
            <span>Let’s talk</span>
            <i />
          </>
        )}
      </button>
    </aside>
  );
}
