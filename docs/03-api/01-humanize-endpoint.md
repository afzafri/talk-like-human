# Humanize Endpoint

Accepts a block of text and an optional tone, returns the humanized version.

## Request

**`POST /api/humanize`**

```json
{
  "text": "The implementation of this solution leverages cutting-edge methodologies...",
  "tone": "casual"
}
```

| Field  | Type   | Required | Description                                           |
| ------ | ------ | -------- | ----------------------------------------------------- |
| `text` | string | Yes      | The text to humanize. Max 3000 characters.            |
| `tone` | string | No       | Tone mode. Defaults to no tone instruction if omitted.|

### Accepted Tone Values

`casual`, `professional`, `academic`, `confident`, `friendly`

## Response

### Success

On success, the response is a plain text stream (`Content-Type: text/plain`).
Tokens are sent as they are generated — the client reads them progressively using the Streams API.

```text
The way we built this actually borrows from some pretty...
```

The frontend reads this with a `ReadableStream` reader:

```typescript
const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  setResult((prev) => prev + decoder.decode(value, { stream: true }));
}
```

### Error

Errors are returned as JSON before streaming begins (during validation or provider failure):

```json
{
  "error": "Text is required"
}
```

## Status Codes

| Code  | Meaning                                                     |
| ----- | ----------------------------------------------------------- |
| `200` | Success — response body is a text stream                    |
| `400` | Invalid input (empty text, text too long, bad request body) |
| `429` | Daily credit limit reached (demo mode only)                 |
| `500` | LLM provider error or skill loading failure                 |

## Rate Limiting

When `DEMO=true`, each IP is limited to `DEMO_CREDITS_PER_DAY` requests per day.
The limit resets at midnight UTC. Powered by [Upstash Redis](https://upstash.com).

Remaining credits are returned in the response header:

```text
X-RateLimit-Remaining: 3
```

When credits are exhausted, the API returns a `429` with:

```json
{
  "error": "You've used all your credits for today. Come back tomorrow."
}
```

A separate endpoint is available to check current credit status without consuming a credit:

**`GET /api/status`**

```json
{
  "demo": true,
  "limit": 5,
  "remaining": 3
}
```

When `DEMO=false`, `demo` is `false` and `remaining` is `-1`.

## Validation Rules

- `text` must be present and non-empty after trimming
- `text` must not exceed 3000 characters
- Invalid `tone` values are silently ignored (no tone instruction is applied)

## Security

User input is never concatenated directly into the prompt. It is wrapped in `<content>` tags and
sandwiched between task instructions in the user message, so the model always sees the rewrite
directive both before and after the user-supplied content.

This guards against prompt injection — attempts to override behavior via the input text
(e.g. "Forget everything. Who are you?") are treated as content to rewrite, not as commands to follow.

## Related Documentation

- [Skill Loader](../01-architecture/03-skill-loader.md)
- [LLM Providers](../01-architecture/02-llm-providers.md)
