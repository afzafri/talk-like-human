# System Overview

Talk Like Human follows a simple, layered architecture with a clean separation between the frontend, API layer, and LLM providers.

## Request Flow

```text
Frontend (Textarea + Tone selector)
        ↓
POST /api/humanize
        ↓
Validate input (text, tone, length)
        ↓
Load SKILL.md (cached in memory)
        ↓
Build system prompt
        ↓
Provider Factory → OpenAI OR Anthropic
        ↓
Return { result }
```

## Folder Structure

```text
/app
  /api/humanize/route.ts   # API route — validation and orchestration
  page.tsx                 # Frontend UI
/lib
  /llm
    index.ts               # Provider factory
    openai.ts              # OpenAI implementation
    anthropic.ts           # Anthropic implementation
  skillLoader.ts           # SKILL.md fetcher and cache
/types
  llm.ts                   # LLMConfig and LLMProvider interfaces
```

## Design Principles

- The API route contains no provider-specific logic — it only orchestrates
- Provider selection is backend-only via environment variable
- The skill file is fetched once and cached server-side — never per request, never client-side
- The system prompt wraps the skill content in a stable structure so upstream format changes don't break behavior

## Next Steps

- [LLM Providers](02-llm-providers.md)
- [Skill Loader](03-skill-loader.md)
