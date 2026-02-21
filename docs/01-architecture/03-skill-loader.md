# Skill Loader

The skill loader fetches the humanization rules from an upstream source and caches them in memory.
It runs server-side only and is never called per request after the first fetch.

## How It Works

1. On first request, fetches SKILL.md from `SKILL_SOURCE`
2. Stores content in a module-level cache with a timestamp
3. On subsequent requests, returns cached content if within TTL
4. If fetch fails, falls back to the last valid cached version
5. If fetch fails and no cache exists, throws an error

## Caching

The cache is an in-memory object in `lib/skillLoader.ts`:

```typescript
interface SkillCache {
  content: string;
  fetchedAt: number;
}
```

TTL is controlled by `SKILL_CACHE_TTL` in seconds (default: 600 = 10 minutes).

## System Prompt

The skill content is never injected raw. It is wrapped in a stable structure via `buildSystemPrompt()`:

```text
ROLE:
You are Talk Like Human, an advanced AI humanizer.

GOAL:
Rewrite text to sound natural, fluid, and genuinely human.

APPLY THE FOLLOWING SKILL RULES STRICTLY:

[SKILL.MD CONTENT]

FINAL RULES:
- Preserve original meaning.
- Do not summarize.
- Do not explain changes.
- Return only rewritten text.
```

This wrapper ensures the behavior remains stable even if the upstream SKILL.md format changes.

## Skill Source

The skill is sourced from [blader/humanizer](https://github.com/blader/humanizer), which is based on
Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) guide.

## Related Documentation

- [System Overview](01-overview.md)
- [API Reference](../03-api/01-humanize-endpoint.md)
