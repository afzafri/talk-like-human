# Getting Started

This guide covers how to set up and run Talk Like Human locally.

## Prerequisites

- Node.js 18+
- An OpenAI or Anthropic API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your values:

```env
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.8

OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here

SKILL_SOURCE=https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md
SKILL_CACHE_TTL=600

NEXT_PUBLIC_APP_URL=http://localhost:3000

# API protection — use test keys for local dev (always pass, no Cloudflare account needed)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Session signing — generate with: openssl rand -base64 32
SESSION_SECRET=your_random_secret_here
```

> **Turnstile test keys** — the values above are Cloudflare's official local test keys. They always pass silently and require no real Cloudflare account. Replace with real keys from the [Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) before deploying.

### 3. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000` by default.

To use a different port:

```bash
npm run dev -- -p 3100
```

## Switching LLM Providers

To use Anthropic instead of OpenAI, update `.env.local`:

```env
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5-20251001
ANTHROPIC_API_KEY=your_key_here
```

No code changes needed.

## Next Steps

- [Tone Modes](02-tone-modes.md)
- [API Reference](../03-api/01-humanize-endpoint.md)
