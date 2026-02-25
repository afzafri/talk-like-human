# API

## Overview

Talk Like Human exposes two API routes. All protected routes require a valid session cookie obtained from `/api/session`.

## Table of Contents

### [1. Humanize Endpoint](01-humanize-endpoint.md)

`POST /api/humanize` — accepts text and tone, returns humanized output. Requires session cookie + CSRF header.

### 2. Session Endpoint

`POST /api/session` — verifies a Cloudflare Turnstile captcha token and sets a short-lived HttpOnly session cookie (`tlh_session`, 10 min TTL). Called automatically by the frontend on page load.

## Related Documentation

- [Architecture](../01-architecture/README.md)
- [Development](../02-development/README.md)
