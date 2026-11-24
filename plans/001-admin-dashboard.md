# Plan 001: Build the secure admin dashboard and operational foundation

> **Executor instructions**: Follow every step and verification gate. Stop on any
> condition listed below rather than expanding scope. Update this plan's status in
> `plans/README.md` when complete.
>
> **Drift check**: `git diff --stat 58bafef..HEAD -- package.json convex src .github/workflows/deploy.yml`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `58bafef`, 2026-10-22

## Outcome

An authenticated administrator can manage client accounts and memberships from a
purpose-built dashboard, create and issue invoices, and configure/manual-send
invoice reminders. This plan establishes identity, authorization, client tenancy,
money rules, email delivery, audit history, and the authenticated admin shell used
by Plans 002 and 003.

## Current state

- TanStack Start/Router/Query, Convex, React Email, Brevo, Vitest, and Biome are
  installed in `package.json`.
- `src/router.tsx` connects TanStack Query and Convex.
- `convex/schema.ts` contains only `contactMessages`.
- `convex/actions/contact.ts` and `convex/lib/email/**` demonstrate the current
  validation, React Email, and Brevo adapter patterns.
- No auth implementation or authenticated routes exist. `auth:generate` points to
  a Better Auth config that is not currently present.
- CI in `.github/workflows/deploy.yml` runs tests and build, but not typecheck or
  Biome checks. The test command currently permits an empty suite.

## Required model and permissions

- `users`: auth subject, email, name, role (`admin` or `client`), status.
- `clients`: display/legal name, billing contact/address, default currency,
  internal notes, active/archive state.
- `clientMemberships`: user/client relationship and invitation lifecycle.
- `invoices` and `invoiceItems`: client-owned, integer minor-unit money, unique
  number, immutable issue snapshots, lifecycle (`draft`, `issued`, `paid`,
  `overdue`, `void`).
- `reminderRules` and `reminderDeliveries`: manual or due-date-relative schedules,
  stable deduplication key, claim/send/retry state, provider ID.
- `auditEvents`: actor/system, safe event name, target/client IDs, timestamp; never
  store secrets, complete invoice/email bodies, or raw provider errors.

All protected Convex functions must use shared server helpers such as
`requireUser`, `requireAdmin`, and `requireClientAccess`. Browser route guards are
not security. Clients cannot call admin mutations or read another client's data.

## Scope

**In scope**: authentication, admin bootstrap, invitations, centralized
authorization, admin shell/navigation, client and membership management, invoice
draft/preview/issue/paid/void flows, deterministic print view, manual reminder
sending, audit events, CI gates, and integration tests.

**Out of scope**: configurable database tables (Plan 002), client portal/workspace
(Plan 003), automatic scheduled reminders, online payments, recurring billing,
accounting integrations, custom roles, and deleting issued financial history.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Install | `pnpm install --frozen-lockfile` | exit 0 |
| Routes | `pnpm exec tsr generate` | generated tree updated |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test` | exit 0 with tests discovered |
| Quality | `pnpm check` | exit 0 |
| Build | `pnpm build` | exit 0 |

## Steps

### 1. Record policies and establish verification

Record the selected auth provider, controlled first-admin bootstrap, invoice
number format, legal issuer identity, currency/rounding, timezone, email sender,
retention, and PDF requirement. Add CI typecheck and Biome checks plus a discovered
Vitest baseline.

**Verify**: `pnpm typecheck; pnpm test; pnpm check; pnpm build` all exit 0.

### 2. Implement identity and authorization

Integrate one auth system with TanStack Start and Convex. Add `/admin` protected
layout, login/logout, role-aware redirects, invitations, expiry/revocation, and a
non-public first-admin bootstrap. Centralize server authorization and test
anonymous, wrong-role, revoked-member, cross-client, and authorized cases.

**Verify**: `pnpm test -- auth` passes; typecheck and build exit 0.

### 3. Build client and membership administration

Add indexed client/membership schema and admin list/detail/create/edit/archive,
invite, resend, and revoke flows. Use accessible forms, server validation,
pagination, confirmation for destructive state changes, and audit events. Archive
rather than delete records referenced by financial history.

**Verify**: `pnpm test -- admin` covers CRUD, invitation, revocation, archive, and
authorization; route generation, typecheck, and Biome checks pass.

### 4. Implement invoices

Calculate money on the server in integer minor units. Drafts are editable; issue
is transactional and idempotent, assigns one unique number, snapshots issuer and
client details, and sends at most one issue email. Enforce explicit state
transitions and immutable issued history. Create list/editor/preview/detail/print
views in admin.

**Verify**: `pnpm test -- invoice` covers rounding, totals, numbering concurrency,
retry idempotency, immutable snapshots, transitions, and cross-client denial.

### 5. Add manual reminders and dashboard attention states

Allow an admin to manually send a reminder from invoice detail through the shared
email adapter. Persist a delivery record before/around the external call using a
deduplication key and expose success/failure/retry state. Dashboard cards show
active clients, invitations, invoice drafts, overdue invoices, and failed email.
Automatic due-date scheduling is deferred until Plan 003 exposes reminder history
to clients and delivery behavior is proven.

**Verify**: `pnpm test -- reminder` covers duplicate action retries, failures,
paid/void denial, recipient snapshots, and audit records.

### 6. Exercise the administrator journey

Test: bootstrap/login → create client → invite/revoke member → create draft →
preview/issue → resend/manual reminder → mark paid. Document environment variable
names, local setup, bootstrap, email sandboxing, invoice policy, and rollback.

**Verify**: full typecheck, tests, Biome check, and build pass.

## Done criteria

- [ ] Admin authentication and server-side role checks work.
- [ ] Client A data cannot be accessed through client B identifiers.
- [ ] Admin can manage clients and memberships without deleting history.
- [ ] Admin can draft, preview, issue, print, mark paid, and void invoices.
- [ ] Issuance and manual reminders are idempotent and auditable.
- [ ] CI runs typecheck, non-empty tests, code-quality checks, and build.
- [ ] No Plan 002/003 UI or generic database schema was implemented early.

## STOP conditions

- Auth provider or admin bootstrap is undecided/incompatible.
- Legal invoice identity, numbering, tax, currency, or retention rules are needed
  but unavailable.
- Payment collection, recurring billing, or accounting sync becomes required.
- Authorization would exist only in UI/routes.
- Idempotent unique invoice issue cannot be guaranteed.
- A verification gate fails twice after a scoped fix.

## Maintenance notes

Plans 002 and 003 must reuse this identity, membership, admin shell, audit, and
authorization foundation. Payment processing requires a separate plan with
verified webhooks and reconciliation; a browser redirect must never mark paid.
