"use client";

import { useState } from "react";

const MAX_LENGTH = 3000;

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const text = input.trim();
    if (!text) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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

  const charCount = input.length;
  const isOverLimit = charCount > MAX_LENGTH;

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Talk Like Human
      </h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Because your text deserves a pulse.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your AI-generated or robotic text here..."
            rows={8}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: 15,
              border: `1px solid ${isOverLimit ? "#e53e3e" : "#ddd"}`,
              borderRadius: 8,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.6,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: isOverLimit ? "#e53e3e" : "#888",
            }}
          >
            {charCount} / {MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={loading || isOverLimit || !input.trim()}
            style={{
              padding: "10px 24px",
              backgroundColor:
                loading || isOverLimit || !input.trim() ? "#ccc" : "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor:
                loading || isOverLimit || !input.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Humanizing..." : "Humanize"}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fff5f5",
            border: "1px solid #fed7d7",
            borderRadius: 8,
            color: "#c53030",
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#555",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Result
          </h2>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            style={{
              marginTop: 8,
              padding: "6px 14px",
              backgroundColor: "transparent",
              border: "1px solid #ddd",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
              color: "#555",
            }}
          >
            Copy
          </button>
        </div>
      )}
    </main>
  );
}
