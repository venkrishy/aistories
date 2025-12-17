# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIStories is a web application for browsing and reading AI-generated stories. Stories are served via a Cloudflare CDN, with metadata and content stored in R2 object storage.

**Key Tech Stack:**
- React 18 + Vite with TypeScript (ES modules only)
- Radix UI components + shadcn-style component library
- TanStack Router for routing
- Playwright for e2e testing
- Deployment: Cloudflare Pages via GitHub Actions
- CDN: cdn.aistories.online (Cloudflare R2 + Zone)

## Development Commands

- `pnpm install` - Install dependencies (always use pnpm, never npm)
- `pnpm run dev` - Start dev server (http://localhost:3000)
- `pnpm run build` - Build for production (outputs to ./build)
- `pnpm test` - Run all Playwright tests
- `pnpm test:listen` - Run listen feature test in headless mode
- `pnpm test:listen:headed` - Run test with visible browser
- `pnpm test:listen:ui` - Run test in Playwright UI mode
- `pnpm run extract-story` - Extract story data via CLI script

## Architecture

### Core Services (src/services/)

**storyLoader.ts** - Central service for fetching and processing stories
- `loadStories()` - Fetch all story metadata from stories.json
- `loadStory()` - Load full story data by slug
- `loadStoryMeta()` - Load story metadata
- `loadStoryLanguageData()` - Load localized story content (en.json, es.json, etc.)
- `constructImageUrl()` / `constructAudioUrl()` - Build CDN URLs for assets
- `verifyStoryAvailability()` - Check if story assets exist on CDN
- Types: StoryData, StoryMeta, StoryMetadata, StoryLanguageData

**cdnConfig.ts** - CDN configuration and URL utilities

### Pages & Components

- **src/pages/LandingPage.tsx** - Home page with story grid
- **src/pages/StoryReaderPage.tsx** - Story reading interface with audio/text
- **src/components/StoryGrid.tsx** - Story card grid with filtering
- **src/components/StoryBook.tsx** - Story content renderer
- **src/components/Hero.tsx** - Hero section component
- **src/components/figma/ImageWithFallback.tsx** - Image with CDN fallback handling
- **src/components/ui/** - Radix UI component library (45+ components)

### Story Data Structure

Stories live in `/stories/` directory with JSON metadata:
```
stories/
├── <slug>/
│   ├── meta.json (StoryMeta)
│   └── [audio assets on CDN]
├── stories.json (all metadata)
└── [language files: en.json, es.json]
```

### Routing

Uses TanStack Router (src/router.tsx) with file-based routes:
- `/` - Landing page
- `/story/:slug` - Story reader page

## Development Guidelines

**Code Style & Architecture:**
- All TypeScript (no JavaScript), ES modules only
- Modular design with OOP principles
- No emojis in logging/console output
- Custom UI components follow shadcn style conventions
- Relative imports use `@` alias (src/ root)

**Testing:**
- Playwright for e2e tests (tests/ directory)
- Chrome channel for audio/video codec support
- CI: retries=2, single worker; local: parallel workers
- Run `pnpm test` before commits

**Deployment & Secrets:**
- GitHub Actions handles CI/CD to Cloudflare Pages
- Required secrets in GitHub (Settings → Secrets and Variables → Actions):
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_PAGES_API_TOKEN`
  - `CLOUDFLARE_ZONE_ID` (for cache purging)
- Vite build outputs to ./build directory

**PR Standards:**
- Title format: `[aistories] <description>`
- Run lint and tests before committing
- No breaking changes without discussion

## Development Environment

Dev container available (.devcontainer/devcontainer.json):
- Node 20, pnpm 10, Claude Code, VS Code extensions (ESLint, Prettier, GitLens)
- Playwright MCP: `claude mcp add playwright npx '@playwright/mcp@latest'`
- Forwards ports: 3000, 3001
- Firewall: cdn.aistories.online whitelisted for container access

## Cloudflare Integration

**R2 Buckets:** Story assets (images, audio)
**Zone:** cdn.aistories.online subdomain
**Pages:** Frontend deployment (aistories.pages.dev → custom domain)
**Cache Purging:** Automatic on deploy (controlled by ENABLE_CACHE_PURGE env var)

## Performance Notes

- Vite config includes extensive Radix UI aliases for resolution
- CORS proxy configured for CDN requests in dev (proxy: /api/cdn)
- Image fallback handling for unreliable CDN asset loading
- Audio narration support with browser autoplay config
