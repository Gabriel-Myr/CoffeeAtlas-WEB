# CoffeeStories WebDB

A standalone web data platform for roasters and coffee beans.

## Scope
- Database-first catalog (no map dependency)
- Public active catalog view
- Admin operations shell
- Import + ingestion + change-review data model

## Folder Structure
- `app/`: Next.js App Router pages and APIs
- `db/sql/`: SQL migration scripts for Supabase/Postgres
- `lib/`: Type definitions and local sample data
- `docs/`: execution roadmap

## Quick Start
1. Install dependencies
```bash
npm install
```
2. Copy env
```bash
cp .env.example .env.local
```
3. Run dev server
```bash
npm run dev
```
4. Open
- `/` homepage
- `/admin` admin shell
- `/api/health` health endpoint

## Database Setup Order
Run SQL files in sequence against Supabase SQL editor:
1. `db/sql/001_extensions.sql`
2. `db/sql/010_schema.sql`
3. `db/sql/020_indexes.sql`
4. `db/sql/030_rls.sql`
5. `db/sql/040_views_and_functions.sql`
6. `db/sql/050_seed_minimal.sql` (optional)

## Next Implementation Steps
- Bind `/app/admin/page.tsx` to real Supabase queries.
- Add auth guard and role-based API routes.
- Add staging tables and parser worker for CSV/XLSX ingestion.
