"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Copy, CheckCircle2, AlertCircle, Info, RefreshCcw, ShieldCheck, Feather, SpellCheck } from "lucide-react";

// ── Turnstile types ────────────────────────────────────────────────────────────
interface TurnstileInstance {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
  }
}

const MAX_LENGTH = 3000;

const TONES = [
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  { value: "professional", label: "Professional", description: "Clear, formal, and business-ready" },
  { value: "academic", label: "Academic", description: "Scholarly, objective, and precise" },
  { value: "confident", label: "Confident", description: "Direct, assertive, and persuasive" },
  { value: "friendly", label: "Friendly", description: "Warm, approachable, and kind" },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("casual");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [credits, setCredits] = useState<{ demo: boolean; limit: number; remaining: number } | null>(null);

  // ── Session / Turnstile state ──────────────────────────────────────────────
  const widgetIdRef = useRef<string | null>(null);
  const sessionOkRef = useRef(false);
  // Queue of resolvers waiting for a fresh session token
  const sessionResolversRef = useRef<Array<(ok: boolean) => void>>([]);

  function resolveSessionWaiters(ok: boolean) {
    sessionOkRef.current = ok;
    const resolvers = sessionResolversRef.current;
    sessionResolversRef.current = [];
    resolvers.forEach((r) => r(ok));
  }

  async function onTurnstileToken(token: string) {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captcha_token: token }),
      });
      resolveSessionWaiters(res.ok);
    } catch {
      resolveSessionWaiters(false);
    }
  }

  function onTurnstileExpired() {
    sessionOkRef.current = false;
    // Widget auto-resets and will fire callback again with a new token
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
  }

  function onTurnstileError() {
    resolveSessionWaiters(false);
  }

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data) => setCredits(data))
      .catch(() => {});
  }, []);

  // Initialise Turnstile invisible widget on mount
  useEffect(() => {
    async function init() {
      // Wait for the Turnstile script to load (loaded async in layout.tsx)
      let attempts = 0;
      while (!window.turnstile && attempts++ < 60) {
        await new Promise((r) => setTimeout(r, 100));
      }
      const container = document.getElementById("cf-turnstile");
      if (!container || !window.turnstile) return;

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: onTurnstileToken,
        "expired-callback": onTurnstileExpired,
        "error-callback": onTurnstileError,
      });
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Returns a Promise that resolves true once a valid session cookie is set.
   * If the session is already valid, resolves immediately.
   * If not, queues a resolver and resets the Turnstile widget to get a fresh token.
   */
  function ensureSession(): Promise<boolean> {
    if (sessionOkRef.current) return Promise.resolve(true);
    return new Promise((resolve) => {
      sessionResolversRef.current.push(resolve);
      // Trigger Turnstile to re-run challenge and get a new token
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    // Ensure we have a valid session cookie before calling the API
    const ready = await ensureSession();
    if (!ready) {
      setError("Security verification failed. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ text, tone }),
      });

      if (res.status === 401) {
        // Session expired mid-session — mark invalid so next submit renews it
        sessionOkRef.current = false;
        if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
        setError("Session expired. Please try again.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        if (res.status === 429) {
          setCredits((prev) => prev ? { ...prev, remaining: 0 } : prev);
        }
        return;
      }

      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining !== null) {
        setCredits((prev) => prev ? { ...prev, remaining: Number(remaining) } : prev);
      }

      if (!res.body) {
        setError("No response received.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
    setError("");
  };

  const handleSample = () => {
    setInput("It is crucial to delve into the intricate tapestry of modern technology. Moreover, seamless integration is paramount for optimal performance. In conclusion, leveraging these paradigms will foster robust growth.");
  };

  const charCount = input.length;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Top Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 tracking-tight text-lg">Talk Like Human</span>
        </div>
        <a
          href="https://github.com/afzafri/talk-like-human"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-900 transition-colors"
          title="View on GitHub"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10 text-center space-y-5">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Humanize your AI text.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Instantly transform robotic AI text into natural, engaging content.
            Bypass AI detectors, improve readability, and connect genuinely with your audience.
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-12 relative z-0">
          {/* Controls Bar */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center rounded-t-2xl">
            <div className="flex items-center gap-3">
              <label htmlFor="tone" className="text-sm font-medium text-gray-700">
                Voice Tone
              </label>
              <div className="relative">
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-3 pr-10 py-2 cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end">
              {credits?.demo && (
                <div className="relative group">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm font-medium cursor-help transition-colors
                    ${credits.remaining === 0
                      ? "bg-red-50 border-red-200 text-red-700"
                      : credits.remaining <= 2
                        ? "bg-orange-50 border-orange-200 text-orange-700"
                        : "bg-green-50 border-green-200 text-green-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{credits.remaining} credits</span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center shadow-lg pointer-events-none">
                    You have {credits.limit} free humanizations per day. Limits reset daily.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 font-medium"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Input Section */}
            <div className="p-4 sm:p-6 flex flex-col h-full min-h-[400px] relative group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Input</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">Original</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your ChatGPT, Claude, or Jasper text here. We'll strip away the 'delve', 'moreover', and robotic sentence structures..."
                className="flex-grow w-full resize-none outline-none text-gray-700 leading-relaxed placeholder:text-gray-400 bg-transparent pb-8"
                style={{ minHeight: "300px" }}
              />
              {/* Floating Char Count inside Textarea */}
              <div className="absolute bottom-4 right-6 flex items-center gap-2">
                 <span className={`text-xs font-medium bg-white/80 backdrop-blur px-2 py-1 rounded shadow-sm border border-gray-100 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()} chars
                </span>
              </div>
            </div>

            {/* Output Section */}
            <div className="p-4 sm:p-6 flex flex-col h-full min-h-[400px] bg-gray-50/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Output</h3>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-md transition-all shadow-sm active:scale-95"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-grow relative">
                <AnimatePresence mode="wait">
                  {loading && !result ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
                    >
                      <div className="relative w-12 h-12 mb-4">
                        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="font-medium text-gray-600">Rewriting text...</p>
                      <p className="text-sm mt-1 text-gray-400">Applying human nuances and varying sentence structures</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-gray-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-100"
                    >
                      {result}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                    >
                      <div className="w-16 h-16 bg-gray-100/80 rounded-full flex items-center justify-center mb-5 relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                        <Sparkles className="w-8 h-8 text-gray-400 relative z-10" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">Ready to humanize</p>
                      <p className="text-sm text-gray-400 mb-6">Your natural-sounding text will appear here</p>
                      <button
                        onClick={handleSample}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
                      >
                        Try a sample text
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-gray-100 bg-white p-4 sm:px-6 rounded-b-2xl">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Failed to process text</h4>
                      <p className="text-sm mt-1 text-red-600/90">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSubmit}
              disabled={loading || isOverLimit || !input.trim()}
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:shadow-none shadow-md hover:shadow-lg active:scale-95 group"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  Humanize Text
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3-Column Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <h3 className="text-base font-semibold text-gray-900 mb-2">Bypass Detectors</h3>
             <p className="text-sm text-gray-600 leading-relaxed">
               Evade AI detection tools by stripping away predictable algorithmic patterns and robotic sentence structures.
             </p>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
               <Feather className="w-5 h-5" />
             </div>
             <h3 className="text-base font-semibold text-gray-900 mb-2">Preserve Meaning</h3>
             <p className="text-sm text-gray-600 leading-relaxed">
               Maintains your core message and facts while completely rewriting the vocabulary and tone to sound human.
             </p>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
               <SpellCheck className="w-5 h-5" />
             </div>
             <h3 className="text-base font-semibold text-gray-900 mb-2">Grammar & Flow</h3>
             <p className="text-sm text-gray-600 leading-relaxed">
               Eliminates overused transition words like "moreover", "delve", and "in conclusion" for better readability.
             </p>
           </div>
        </div>

        {/* Info Section - Wikipedia Source */}
        <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 sm:p-8">
          <div className="flex gap-4">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Info className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">How it works</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Our rewriting logic is directly based on Wikipedia's rigorous <a href="https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">"Signs of AI writing"</a> guide, maintained by WikiProject AI Cleanup. This comprehensive guide comes from observations of thousands of instances of AI-generated text.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600 mt-6">
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                  <span className="block font-medium text-gray-900 mb-1">Vocabulary Triggers</span>
                  <p>Removes unnatural overuse of words like "delve", "crucial", "seamless", and "tapestry".</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                  <span className="block font-medium text-gray-900 mb-1">Structural Patterns</span>
                  <p>Breaks up predictable paragraph lengths, symmetric lists, and repetitive sentence structures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20 py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>Talk Like Human &copy; {new Date().getFullYear()}. Clean up your AI text.</p>
        </div>
      </footer>

      {/* Invisible Turnstile widget container — renders no visible UI */}
      <div id="cf-turnstile" style={{ display: "none" }} />
    </div>
  );
}
