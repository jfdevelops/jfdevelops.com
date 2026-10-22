# Plan 003: Deliver the client-scoped workspace and automatic reminders

> **Executor instructions**: Complete Plans 001 and 002 first. Client visibility
> is an explicit server authorization decision, never a browser filter.
>
> **Drift check**: `git diff --stat 58bafef..HEAD -- package.json convex src`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/001-admin-dashboard.md`, `plans/002-admin-custom-database.md`
- **Category**: direction
- **Planned at**: commit `58bafef`, 2026-10-22

## Outcome

An invited client can access a private workspace containing only records and
fields explicitly shared with their client account, plus their invoices and
reminder history. Administrators can distinguish internal association from portal
sharing, preview the exact client projection, and configure automatic invoice
reminders safely.

## Authorization contract

- Membership determines which client accounts a user may access.
- `workspaceClientLinks` distinguishes an internal link from `portalVisible`.
- An optional field allowlist controls the record projection. No allowlist means
  the documented collection sharing default, not every internal field.
- Related records resolve only when independently shared with the same client.
- Invoice ownership is always its strongly typed `clientId`; generic record links
  never grant invoice access.
- Every direct record, relation, invoice, and reminder query enforces the same
  rule server-side, including IDs typed directly into URLs or requests.

## Scope

**In scope**: `/portal/**` shell, account switch for multi-client members, shared
record list/detail views, safe typed renderers, relationship traversal, invoices
and print view, reminder history, admin share controls/preview, automatic reminder
rules and delivery jobs, responsive/accessibility states, and isolation tests.

**Out of scope**: client editing, client schema changes, public signup, custom
roles, attachments, payments, messaging/chat, arbitrary dashboards, formulas,
and exposing hidden relation targets.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Routes | `pnpm exec tsr generate` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test -- portal` | portal/isolation tests pass |
| Reminders | `pnpm test -- reminder` | scheduling tests pass |
| Quality | `pnpm check` | exit 0 |
| Build | `pnpm build` | exit 0 |

## Steps

### 1. Implement explicit sharing and preview

Extend admin record/client linking with an explicit portal-visible toggle, field
allowlist/default policy, ordering, and optional relationship label. Add a preview
that uses the same server projection as the client—not a privileged admin query
with CSS hiding. Record sharing changes in audit events.

**Verify**: tests distinguish internal association, shared record, field allowlist,
unshared record, archived record, and revoked membership.

### 2. Build the authenticated client shell

Add `/portal` protected routes and role-aware navigation. Derive available client
accounts from active memberships. If multiple exist, provide an explicit account
switch populated only from those memberships. Cover empty/loading/error/expired/
revoked states and responsive, keyboard, and screen-reader behavior.

**Verify**: route/integration tests prove anonymous redirect, active access,
multi-account switching, revoked denial, and direct-ID denial.

### 3. Render client-scoped workspace records

Show admin-selected portal views or grouped shared records. Reuse the safe field
renderer registry from Plan 002 in read-only mode. Render only projected fields.
Relationship links appear only when the target is independently shared with the
same client; otherwise omit the link or show a neutral restricted reference per
the recorded product decision.

**Verify**: `pnpm test -- portal` covers each supported type, field hiding,
relation traversal, nested/direct ID attacks, pagination, and archive behavior.

### 4. Expose invoices and reminder history

Add client invoice list/detail/print routes based on invoice `clientId` and active
membership. Show status, issue/due date, totals, line items, immutable recipient/
issuer snapshot, and safe reminder history. Never expose provider errors, internal
notes, audit metadata, or other recipients.

**Verify**: invoice portal tests cover own/cross-client/direct-ID cases and exact
client-safe projection.

### 5. Add automatic reminder schedules

Support admin-configured before/on/after-due rules. On issue or rule edit, create
or update scheduled occurrences. A Convex scheduled function claims due delivery
records, rechecks invoice/client state immediately before sending, calls the email
adapter, and records success or bounded retry with backoff. Stable deduplication
keys prevent duplicate email. Paid/void invoices cancel future reminders.

Reminder email includes invoice number, amount/currency, due date, and a safe
portal link. It does not make email the source of truth.

**Verify**: reminder tests cover time-zone boundaries, before/on/after due,
duplicate job execution, retries, recipient snapshots, paid/void races, portal
links, and tenant isolation.

### 6. Pilot the complete cross-surface journey

Exercise: admin creates two clients → creates/links workspace records → internally
associates some and shares others with field allowlists → issues invoice → client A
logs in and sees only A's projection → reminder sends once → admin marks paid →
future reminders cancel. Attempt access using client B record/relation/invoice IDs.

**Verify**: full typecheck, tests, Biome check, and build pass; pilot isolation
journey passes.

## Done criteria

- [ ] Client sees only records explicitly shared with an active membership.
- [ ] Hidden fields and unshared relation targets cannot be discovered.
- [ ] Admin preview exactly matches the client-safe server projection.
- [ ] Multi-client users can switch only among active memberships.
- [ ] Client can view only their own invoices and safe reminder history.
- [ ] Automatic reminders are deduplicated, retryable, auditable, timezone-aware,
      and cancelled for paid/void invoices.
- [ ] Cross-client list, direct-ID, relation, invoice, and reminder tests pass.

## STOP conditions

- Plans 001/002 lack centralized authorization or explicit client-link semantics.
- Product owner has not decided field-sharing default or hidden relation behavior.
- Requirement expands to client editing, public sharing, payments, or attachments.
- Reminder jobs cannot atomically claim/deduplicate delivery attempts.
- A verification gate fails twice after a scoped fix.

## Maintenance notes

Every future generic field or relation type needs a client-safe read-only renderer
and projection test before it can be shared. Client navigation is never an
authorization boundary. Payment collection remains a separate high-risk plan.
