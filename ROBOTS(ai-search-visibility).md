# ROBOTS(ai-search-visibility)

## Request
Update `robots.txt` to allow search bots for GEO (Generative Engine Optimization) such as ChatGPT Search and Perplexity, while maintaining defensive blocking for generic training crawlers.

## Directory Map
```text
public/
  robots.txt                          (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `public/robots.txt` | modify | Extract specifically identified AI Search bots from the Disallow list and grant them explicit access to crawl the site. |

## Strategy Audit
- **Current State**: The site blocks all major AI-related agents, including those that power search results (e.g., Perplexity, OpenAI Search).
- **Corrected State**: Distinctly separate "Training" bots (which scrape for model improvement) from "Search" bots (which drive user traffic). Allowing Search bots is critical for the "Why AI Platforms Aren't Sending Traffic..." strategy to succeed.

## Execution Plan
### Step 1 — Categorize AI Agents
- **AI Search (ALLOW)**: `OAI-SearchBot`, `PerplexityBot`, `YouBot`.
- **AI Training (KEEP DISALLOW)**: `GPTBot`, `ChatGPT-User` (custom GPTs), `Google-Extended`, `ClaudeBot`, `anthropic-ai`, `CCBot`, `Grok`.

### Step 2 — Restructure robots.txt
Insert a new "Section 2" specifically for AI Search Engines to grant them access before the general catch-all rules.

## File-by-File Changes

### `public/robots.txt`
**Action:** Modify  
**Why:** Enable GEO visibility by allowing search-specific AI agents.

#### Before (Section 1)
```text
# SECTION 1: AI & LLM DEFENSE
# Block major AI training crawlers from scraping site data to protect content value.
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Google-Extended
User-agent: CCBot
User-agent: anthropic-ai
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: OAI-SearchBot
User-agent: PerplexityBot
User-agent: YouBot
User-agent: Amazonbot
User-agent: FacebookBot
User-agent: Imagesift
User-agent: Applebot-Extended
User-agent: Pinterestbot
User-agent: TurnitinBot
User-agent: YandexBot
User-agent: Grok
User-agent: CCBot
User-agent: Crawl-Worker
Disallow: /
```

#### After
```text
# ==============================================================================
# SECTION 1: AI SEARCH & GEO VISIBILITY (ALLOWED)
# ==============================================================================
# Allow AI agents that specifically drive real-time search traffic and citations.
User-agent: OAI-SearchBot
User-agent: PerplexityBot
User-agent: YouBot
Allow: /

# ==============================================================================
# SECTION 2: AI & LLM TRAINING DEFENSE (DISALLOWED)
# ==============================================================================
# Block bots that scrape for model training without providing direct search traffic.
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Google-Extended
User-agent: CCBot
User-agent: anthropic-ai
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: Amazonbot
User-agent: FacebookBot
User-agent: Imagesift
User-agent: Applebot-Extended
User-agent: Pinterestbot
User-agent: TurnitinBot
User-agent: YandexBot
User-agent: Grok
User-agent: Crawl-Worker
Disallow: /
```

#### Reasoning
- By explicitly allowing `OAI-SearchBot` and `PerplexityBot`, we empower these engines to verify the structured data (JSON-LD) and high-fidelity content we've implemented.
- Keeping `GPTBot` and `ClaudeBot` blocked protects the raw content from being used to train general models without citation/traffic.
- `YouBot` is included as it's a major player in generative search today.

## Validation Plan
1. **Manual Check**: Verify the `public/robots.txt` content matches the intended structure exactly.
2. **Path Verify**: Ensure the "Allow" block specifically targets `/` (root) to ensure the entire directory is visible to these bots.

## Approval
Status: Awaiting explicit user approval. Do not implement yet.
