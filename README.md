# CoffeeAtlas

A pnpm monorepo for the CoffeeAtlas web app, miniprogram, and shared contracts.

## Workspace Layout
- `apps/web`: Next.js 16 web app and API routes
- `apps/miniprogram`: Taro-based WeChat miniprogram
- `packages/shared-types`: shared API contracts
- `packages/api-client`: shared client layer in progress
- `packages/domain`: domain layer in progress
- `.trellis`: project workflow and spec documents

## Quick Start
1. Install dependencies
```bash
pnpm install
```
2. Copy env
```bash
cp .env.example .env.local
```
3. Start all dev tasks
```bash
pnpm dev
```

Useful workspace commands:

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/web test
pnpm --filter @coffeeatlas/miniprogram test
```

## Main Routes
- `/`: homepage
- `/all-beans`: bean catalog page
- `/api/health`: legacy health check
- `/api/v1/health`: v1 health check

## Notes
- Root package manager is `pnpm`. Do not use `npm install` in this repo.
- Public catalog reads can fall back to sample data when Supabase server env is missing.
- `packages/api-client` and `packages/domain` exist, but are not yet the main runtime entry points.
