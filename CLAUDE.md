# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — run ESLint

No test framework is configured yet.

## Architecture

This is a Next.js 16 (App Router) + React 19 + TypeScript project, currently at initial `create-next-app` scaffold state (no custom routes, components, or data layer yet beyond `src/app/layout.tsx` and `src/app/page.tsx`).

- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Styling uses Tailwind CSS v4 via `@tailwindcss/postcss` (see `postcss.config.mjs`, `src/app/globals.css`).
- ESLint config extends `eslint-config-next` (core-web-vitals + typescript) via the flat config format in `eslint.config.mjs`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
