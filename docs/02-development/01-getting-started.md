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
```

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
