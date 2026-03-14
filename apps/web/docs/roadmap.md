# Data Platform Roadmap (v1)

## Phase 1 (Week 1-2): Foundation
- Create Postgres schema, indexes, RLS, and search functions.
- Build admin shell pages and API health endpoint.
- Define import job format (CSV/XLSX -> staging -> upsert).

## Phase 2 (Week 3-4): Operations Console
- Add roaster/bean/roaster-bean CRUD APIs.
- Add import job dashboard and ingestion event timeline.
- Add change request workflow (editor proposes, admin approves).

## Phase 3 (Week 5-6): Ingestion Automation
- Build source connectors (official site, e-commerce listing pages).
- Add parser normalization rules and alias matching.
- Capture price snapshots and in-stock status history.

## Phase 4 (Week 7-8): Search and Quality
- Replace sample admin table with live query from `search_catalog()`.
- Add quality scoring (missing critical fields, duplicate confidence).
- Add monitoring for failed jobs and stale source data.
