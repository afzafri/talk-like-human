# Architecture

## Overview

This section covers how Talk Like Human is designed — the request flow, LLM provider abstraction, and skill loading system.

## Table of Contents

### [1. Overview](01-overview.md)

High-level system design and request flow from frontend to LLM provider.

### [2. LLM Providers](02-llm-providers.md)

How the provider abstraction works, the factory pattern, and how to switch between OpenAI and Anthropic.

### [3. Skill Loader](03-skill-loader.md)

How SKILL.md is fetched, cached, and injected into the system prompt.

## Related Documentation

- [Development](../02-development/README.md)
- [API](../03-api/README.md)
