# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ERP system for a French high-end residential property management company (gestion locative haut de gamme). The system manages the full lifecycle of property management: owners (propriétaires), tenants (locataires), leases (baux), rent collection, mandant accounting, fee billing, work orders, and contractor management.

The full functional and technical specification is in `cahier_des_charges.md` (French, ~550 lines). Read it before making architectural decisions.

## Current Status

The project is in its **specification/bootstrapping phase** — no application source code exists yet. Only present:
- `cahier_des_charges.md` — complete requirements specification
- `package.json` + `package-lock.json` — shadcn MCP tooling
- `.mcp.json` — MCP server configuration (`npx shadcn@latest mcp`)

## Intended Architecture (from specification)

**Stack to implement:**
- **Frontend back-office:** React or Next.js
- **Owner portal:** Next.js (SSR, mobile-first, branded premium design)
- **Backend:** REST API with OpenAPI 3.0 documentation (Node.js, Python/Django, or Laravel)
- **Database:** PostgreSQL with per-owner mandant account isolation
- **Auth:** OAuth 2.0 / OpenID Connect, MFA mandatory for internal users
- **UI components:** shadcn (already configured via MCP)

**Key architectural constraints:**
- Strict separation between mandant accounting (per-owner) and company accounting — required by French Hoguet law
- Multi-tenant data isolation per property owner
- All data must be hosted in France (GDPR/RGPD + Hoguet compliance)

## Domain Model (core entities)

| Entity | Description |
|---|---|
| Propriétaire | Property owner (individual, SCI, indivision) — primary client |
| Bien | Property/unit managed under a mandate |
| Mandat | Management mandate linking owner to property |
| Locataire | Tenant (secondary client, may subscribe to additional services) |
| Bail | Lease contract |
| Quittance | Rent receipt |
| Compte mandant | Per-owner accounting ledger (legally separate from company accounts) |
| Ordre de service | Work order for contractors |
| Prestataire | Contractor/service provider |
| Honoraires | Management fees billed to owners |

## Regulatory Compliance Requirements

- **Loi Hoguet** — strict mandant accounting separation per owner
- **Loi ALUR** — rental regulation compliance
- **RGPD/GDPR** — French CNIL compliance, data in France
- **FEC** — French accounting standard export
- **eIDAS** — electronic signature (Yousign/DocuSign/Universign)

## Access Control (RBAC)

**Internal profiles:** Administrateur SI, Direction, Gestionnaire locatif, Comptable, Chargé de services, Responsable travaux

**Owner portal profiles:** Propriétaire standard, Propriétaire multi-biens, Représentant SCI

## External Integrations (planned)

- Bank connections: EBICS/API for daily reconciliation
- E-signature: Yousign / DocuSign / Universign
- Email: Brevo / Mailjet / Postmark
- SMS: Twilio / OVH
- Storage: S3-compatible (e.g., OVH Object Storage)
- Property portals: SeLoger, PAP

## Performance SLAs

- API response: < 1.5s (p95)
- Owner portal page load: < 1s
- PDF generation: < 3s
- Availability: ≥ 99.5%

## Priority Phases

- **P1 (launch):** Owner CRM, property inventory, mandates, leases, rent collection & receipts, mandant accounting, fee billing, owner portal
- **P2 (~6 months):** Work/contractor management, additional tenant services, reporting/dashboards
- **P3 (optional):** Advanced CRM features, mobile app, property portal integrations

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
