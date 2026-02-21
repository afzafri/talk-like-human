"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Copy, CheckCircle2, AlertCircle, Info, RefreshCcw } from "lucide-react";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data.result);
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

  const charCount = input.length;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation / Header */}
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 tracking-tight text-lg">Talk Like Human</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section - Feature First approach */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            Humanize your AI text.
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform robotic, predictable AI generation into natural, engaging human writing. 
            Bypass AI detectors and connect with your audience.
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          {/* Controls Bar */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-4 sm:px-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3">
              <label htmlFor="tone" className="text-sm font-medium text-gray-700">
                Voice Tone
              </label>
              <div className="relative">
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent block w-full pl-3 pr-10 py-2 cursor-pointer hover:border-gray-300 transition-colors"
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
              <span className={`font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
              </span>
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
            <div className="p-4 sm:p-6 flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Input</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">Original</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your AI-generated text here. We'll strip away the 'delve', 'moreover', and 'in conclusion'..."
                className="flex-grow w-full resize-none outline-none text-gray-700 leading-relaxed placeholder:text-gray-400 bg-transparent"
                style={{ minHeight: "300px" }}
              />
            </div>

            {/* Output Section */}
            <div className="p-4 sm:p-6 flex flex-col h-full min-h-[400px] bg-gray-50/30 relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Output</h3>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-md transition-all shadow-sm"
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
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
                    >
                      <div className="relative w-12 h-12 mb-4">
                        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-gray-900 rounded-full border-t-transparent animate-spin"></div>
                      </div>
                      <p className="font-medium text-gray-600">Rewriting text...</p>
                      <p className="text-sm mt-1">Applying human nuances and varying sentence structures</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-gray-800 leading-relaxed whitespace-pre-wrap"
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
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium mb-1">Waiting for input</p>
                      <p className="text-sm text-gray-400">Your humanized text will appear here</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t border-gray-100 bg-white p-4 sm:px-6">
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
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 shadow-sm active:scale-[0.98]"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Humanize Text
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
      <footer className="border-t border-gray-200 mt-20 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>Talk Like Human &copy; {new Date().getFullYear()}. Clean up your AI text.</p>
        </div>
      </footer>
    </div>
  );
}
