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

```json
{
  "result": "The way we built this actually borrows from some pretty modern approaches..."
}
```

### Error

```json
{
  "error": "Text is required"
}
```

## Status Codes

| Code  | Meaning                                                     |
| ----- | ----------------------------------------------------------- |
| `200` | Success                                                     |
| `400` | Invalid input (empty text, text too long, bad request body) |
| `500` | LLM provider error or skill loading failure                 |

## Validation Rules

- `text` must be present and non-empty after trimming
- `text` must not exceed 3000 characters
- Invalid `tone` values are silently ignored (no tone instruction is applied)

## Related Documentation

- [Skill Loader](../01-architecture/03-skill-loader.md)
- [LLM Providers](../01-architecture/02-llm-providers.md)
