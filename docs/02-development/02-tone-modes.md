# Tone Modes

Tone modes let users control the writing style of the humanized output.
The selected tone is appended as an additional instruction to the user's text before being sent to the LLM.

## Available Tones

| Tone         | Instruction sent to LLM                  |
| ------------ | ---------------------------------------- |
| Casual       | Rewrite in a casual, relaxed tone.       |
| Professional | Rewrite in a professional tone.          |
| Academic     | Rewrite in an academic tone.             |
| Confident    | Rewrite in a confident, assertive tone.  |
| Friendly     | Rewrite in a friendly, warm tone.        |

## How It Works

The tone instruction is appended to the user's input text:

```text
[user's original text]

Additional instruction: Rewrite in a professional tone.
```

This follows a content-first, instruction-after ordering — the text to rewrite comes first, the tone guidance follows.

## Adding a New Tone

**1. Add to the API route** in `app/api/humanize/route.ts`:

```typescript
const TONE_INSTRUCTIONS: Record<string, string> = {
  casual: "Rewrite in a casual, relaxed tone.",
  professional: "Rewrite in a professional tone.",
  // Add your new tone here
  witty: "Rewrite in a witty, clever tone.",
};
```

**2. Add to the frontend** in `app/page.tsx`:

```typescript
const TONES = [
  { value: "casual", label: "Casual", description: "Relaxed and conversational" },
  // Add your new tone here
  { value: "witty", label: "Witty", description: "Clever and playful" },
];
```

## Related Documentation

- [API Reference](../03-api/01-humanize-endpoint.md)
- [Getting Started](01-getting-started.md)
