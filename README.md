# Talk Like Human

Rewrite AI-generated or robotic text so it sounds natural, fluid, and genuinely human.

![Talk Like Human Screenshot](docs/screenshot.jpg)

---

## Features

- Paste any AI-generated text and get a humanized version back
- Choose from 5 tone modes: Casual, Professional, Academic, Confident, Friendly
- Powered by OpenAI or Anthropic — switchable via environment config
- Skill rules fetched from an upstream source and cached server-side
- Clean, minimal interface with copy-to-clipboard support

## How It Works

The rewriting logic is based on Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) guide, maintained by WikiProject AI Cleanup — built from observations of thousands of AI-generated texts. The humanization skill is sourced from [blader/humanizer](https://github.com/blader/humanizer).

Two key areas it targets:

- **Vocabulary triggers** — removes unnatural overuse of words like "delve", "crucial", "seamless", and "tapestry"
- **Structural patterns** — breaks up predictable paragraph lengths, symmetric lists, and repetitive sentence structures

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API / Anthropic API
- Cloudflare Turnstile — invisible captcha for API protection

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values.

```env
LLM_PROVIDER=openai           # openai or anthropic
LLM_MODEL=gpt-4o-mini
LLM_TEMPERATURE=0.8

OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

SKILL_SOURCE=https://raw.githubusercontent.com/blader/humanizer/refs/heads/main/SKILL.md
SKILL_CACHE_TTL=600

# Demo mode — enforces a per-IP daily credit limit
DEMO=false
DEMO_CREDITS_PER_DAY=5

# Required when DEMO=true (Upstash Redis)
UPSTASH_REDIS_REST_URL=your_upstash_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here

# Used for SEO and Meta tags
NEXT_PUBLIC_APP_URL=https://humanize.afifzafri.com

# API protection — Cloudflare Turnstile
# Get keys at https://dash.cloudflare.com/?to=/:account/turnstile
# For local dev, use test keys: NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Session signing secret — generate with: openssl rand -base64 32
SESSION_SECRET=your_random_secret_here
```

Set `DEMO=false` locally to skip rate limiting. Set `DEMO=true` on your deployment with Upstash credentials to enforce the credit limit.

## Documentation

Full documentation is available in [`/docs`](docs/README.md).

- [Architecture](docs/01-architecture/README.md)
- [Getting Started](docs/02-development/01-getting-started.md)
- [API Reference](docs/03-api/01-humanize-endpoint.md)

## License

This project is licensed under the ```MIT license``` - see the ```LICENSE``` file for details.