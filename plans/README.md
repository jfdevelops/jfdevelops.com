# JF Develops Product Roadmap

Created on 2026-08-06 against commit `b0ddada` on branch
`roadmap/project-roadmap`. Revised after defining the client portal, admin
workspace, messaging, and invoicing product scope.

## Product direction

JF Develops is evolving from a consulting marketing site into three connected
products:

1. **Public site** — explains the offer, proves the work, and converts prospects.
2. **Client portal** — gives each client a private view of projects, tasks,
   progress, conversations, and invoices.
3. **Admin workspace** — lets the JF Develops administrator manage clients,
   projects, work status, conversations, and invoices.

The documentation site is a fourth surface sharing the same design system. It
should remain public unless a future requirement explicitly calls for private
client documentation.

## Precedence rules

- Use **one authentication system**, not separate client and admin login
  implementations. Client and admin are roles with different authorization
  policies and destinations after login.
- Establish tenant boundaries before exposing client data. Every project, task,
  conversation, message, and invoice must be authorized through a client
  membership rather than trusted from a URL parameter.
- Create the admin client/project workflow before the client dashboard. The admin
  needs a way to create the records that clients will see.
- Build project progress before chat and invoicing. It provides the shared client
  and project context those features need.
- Start the visual overhaul with information architecture and reusable components,
  then apply it incrementally to each shipped surface. A one-time redesign before
  product structure exists would be reworked repeatedly.
- Treat invoicing and payment collection as separate capabilities. Creating,
  sending, and tracking invoices is in scope; accepting online payment requires a
  later provider and accounting decision.

## Roadmap at a glance

| Phase | Group | Primary outcome | Coarse effort | Depends on |
|---|---|---|---:|---|
| 0 | Product and UI foundation | Agreed workflows, data model, and design system | 1–2 weeks | — |
| 1 | Identity and authorization | Secure client/admin login and invitations | 2–4 weeks | Phase 0 |
| 2 | Client and project administration | Admin can create clients, projects, milestones, and tasks | 3–5 weeks | Phase 1 |
| 3 | Portal dashboards | Clients and admin see trustworthy project progress | 3–5 weeks | Phase 2 |
| 4 | Project conversations | Clients can start threads and admin can respond | 3–5 weeks | Phase 3 |
| 5 | Invoicing | Admin can create, issue, and track invoices | 3–5 weeks | Phases 2–3 |
| 6 | Public site and docs overhaul | Cohesive marketing and real package documentation | 3–6 weeks | Phase 0; can run beside Phases 2–5 |
| 7 | Launch hardening | Audited, observable, supportable production release | 2–4 weeks | All release features |

Effort is directional for one developer and should be re-estimated when each
phase receives a detailed implementation plan.

## Phase 0 — Product and UI foundation

**Goal:** remove expensive ambiguity before building authenticated product
surfaces.

### Product decisions

- Define the lifecycle from inquiry → client → project → milestone/task →
  conversation → invoice.
- Decide whether a client represents a person or organization. Recommended:
  model a client account separately from user identities so multiple people can
  later belong to one client.
- Define roles. Recommended initial set:
  - `admin` — full JF Develops operational access.
  - `client` — access only to explicitly assigned client accounts and projects.
- Define who can edit task status. Recommended first release: admin owns task and
  milestone status; clients can view progress and discuss work.
- Define whether one client can have multiple active projects. Recommended: yes,
  because tasks, chat, and invoices should all have stable project context.
- Define invoice expectations: invoice creation, PDF/email delivery, due dates,
  statuses, taxes/discounts, numbering, and whether online payment is part of the
  first release.

### Technical and design foundation

- Write the authorization policy before route work: role checks, client
  membership checks, project ownership checks, and admin-only operations.
- Specify a data model around `users`, `clients`, `clientMemberships`,
  `projects`, `milestones`, `tasks`, `conversations`, `messages`,
  `invoices`, `invoiceItems`, `notifications`, and `auditEvents`.
- Create low-fidelity flows for:
  - login, invitation acceptance, and password/account recovery;
  - client project overview and task detail;
  - admin client/project editing;
  - starting and replying to a conversation;
  - creating, previewing, and issuing an invoice.
- Establish the visual system before individual screens: typography, spacing,
  color, navigation, tables, forms, status badges, empty/error/loading states,
  responsive behavior, and accessibility rules.
- Establish automated test and CI gates. The current test command permits an
  empty suite (`package.json:15`) and CI only runs tests and build
  (`.github/workflows/deploy.yml:42-46`); authenticated client data requires a
  stronger baseline.
- Replace the starter README with accurate pnpm, Convex, Cloudflare, environment,
  testing, and deployment guidance.

### Exit criteria

- The core workflows and role-permission matrix are approved.
- The data model has documented ownership and deletion rules.
- Each major screen has a wireframe and defined empty/loading/error states.
- CI checks formatting/lint, tests, and production build.
- Authentication-provider and invoice/payment decisions are recorded before
  implementation.

## Phase 1 — Identity and authorization

**Goal:** provide one secure identity system with role-aware client and admin
access.

### Scope

- Implement one login experience with role-specific post-login destinations.
- Add admin-created client invitations rather than public client registration.
- Bootstrap the first administrator through a controlled deployment process; do
  not allow users to self-assign admin privileges.
- Add protected route groups for the client portal and admin workspace.
- Enforce authorization again in every Convex query and mutation. UI route guards
  are convenience, not security.
- Add logout, session expiration, account recovery, revoked-membership handling,
  and safe error messages.
- Record security-sensitive admin events without logging credentials or private
  message/invoice bodies.

The repository currently has only an `auth:generate` script referencing a Better
Auth path (`package.json:25`); no current auth, role, client, or session
implementation exists. Treat provider choice and generated schema as an explicit
design decision, not as completed groundwork.

### Exit criteria

- Admin and invited client users can log in and land in the correct workspace.
- A client cannot read or mutate another client's data, including by changing IDs
  in requests or URLs.
- A normal user cannot elevate their role or call admin-only mutations.
- Invitation, recovery, logout, expiry, and revocation paths have automated
  integration tests.
- Authorization helpers are centralized and used by every protected backend
  operation.

## Phase 2 — Client and project administration

**Goal:** let the admin create the source-of-truth records that power the portal.

### Scope

- Build admin client management: create, view, edit, archive, invite members, and
  revoke access.
- Build project management: client association, name, description, status,
  start/target dates, and archived state.
- Build milestone and task management with explicit ordering, status, due date,
  priority, and optional client-visible notes.
- Define progress consistently. Recommended first version: derive project progress
  from milestone/task completion rather than storing an independently editable
  percentage.
- Add server-side validation, safe archive behavior, and audit events for material
  admin changes.
- Convert a qualified contact inquiry into a client/project through an explicit
  admin action rather than duplicating information by hand.

### Exit criteria

- Admin can create a client, invite a user, create a project, and assign ordered
  milestones/tasks end to end.
- Archived clients/projects are hidden by default without deleting financial or
  conversation history.
- Progress is deterministic and covered for empty, partial, completed, and
  reopened work.
- All list views handle pagination or bounded result sets from the start.

## Phase 3 — Client and admin dashboards

**Goal:** deliver the first useful authenticated product slice.

### Client dashboard

- Show active and recent projects with status, target date, and progress.
- Provide project detail with milestones, tasks, completed work, upcoming work,
  and a simple activity timeline.
- Include obvious entry points to project conversations and invoices, even if
  those modules initially show a planned/empty state.
- Make it clear which information is read-only and how clients request a change.

### Admin dashboard

- Show clients and projects needing attention, overdue tasks, upcoming milestones,
  unread conversations, draft/due invoices, and recent inquiries.
- Provide fast navigation into client, project, task, conversation, and invoice
  management rather than reproducing every editor on the overview page.
- Use the same underlying project and progress queries as the client view, with
  authorization-aware projections, to avoid conflicting status calculations.

### UI overhaul delivery

- Apply the Phase 0 visual system to the authenticated shell, navigation,
  dashboards, tables, cards, forms, dialogs, responsive layouts, and state
  feedback.
- Validate keyboard navigation, focus management, contrast, screen-reader labels,
  mobile navigation, and reduced-motion behavior before calling the overhaul done.

### Exit criteria

- A client can answer “what is happening, what is next, and how far along are we?”
  without contacting the admin.
- Admin can identify the next operational action from the dashboard.
- Client and admin views agree on shared project status and progress.
- Dashboard routes have authorized integration tests and responsive/accessibility
  acceptance checks.

## Phase 4 — Project conversations

**Goal:** give each client a private, project-aware way to start a conversation and
receive admin replies.

### Scope

- Let clients create a titled conversation within a client account and, when
  applicable, attach it to a project.
- Let client members and admin exchange messages in chronological threads.
- Add unread state, last-read markers, thread status (open/resolved), timestamps,
  and clear participant identity.
- Add admin and client conversation lists with filters for unread/open/project.
- Add email or in-app notifications without making email the source of truth.
- Define retention, moderation, and audit behavior.
- Defer attachments until message authorization, storage scanning, file limits,
  and deletion semantics have a separate plan.

### Exit criteria

- A client can start a thread, admin can reply, and both see near-real-time updates.
- Users receive only messages for client accounts they belong to.
- Unread counts remain correct across refreshes and multiple devices.
- Notification retries do not duplicate messages.
- Empty, slow, offline, send-failure, and permission-revoked states are tested.

## Phase 5 — Invoicing

**Goal:** let the admin create professional invoices tied to the correct client and
optionally project, then track their lifecycle.

### Initial invoice scope

- Create invoices with immutable issuer/client snapshots, line items, quantities,
  rates, subtotal, adjustments, tax, total, currency, issue date, due date, notes,
  and a unique invoice number.
- Support `draft`, `issued`, `paid`, `overdue`, `void`, and optionally
  `partially_paid` states with explicit transition rules.
- Preview before issue, generate a stable printable/PDF representation, email an
  issued invoice, and expose it in the correct client portal.
- Keep edit behavior strict after issue: use controlled corrections/voiding rather
  than silently rewriting a historical financial document.
- Record who created, issued, changed status, or voided an invoice.

### Separate payment decision

If online payment is wanted, add a follow-up plan for provider checkout,
webhook verification, idempotency, refunds, partial payments, reconciliation, and
secrets. Do not mark an invoice paid from a browser redirect alone.

### Exit criteria

- Admin can draft, preview, issue, resend, mark paid, and void an invoice.
- A client can view/download only invoices belonging to their client account.
- Totals and state transitions have deterministic automated tests.
- Issued invoices remain historically reproducible.
- Email failures are retryable without generating a second invoice number.

## Phase 6 — Public site and docs overhaul

**Goal:** make the public experience visually consistent with the portal and turn
the existing docs scaffold into a real package resource.

### Public site

- Apply the shared visual system to the marketing site with simpler hierarchy,
  clearer service positioning, stronger proof, and fewer competing actions.
- Turn selected-work summaries into truthful detail pages with client-approved
  screenshots and measurable outcomes. The current three studies are static data
  in `src/routes/(home)/-sections/case-studies.tsx:13-40`.
- Preserve the contact funnel, harden it against abuse, and measure Calendly,
  quote, form-start, success, and failure events.
- Fix content/navigation drift during the overhaul: the footer points case studies
  to `/#work` (`src/components/Footer.tsx:10`) while the section uses
  `case-studies`, and the FAQ describes Vercel hosting
  (`src/routes/(home)/-sections/faq.tsx:26`) while the project deploys to
  Cloudflare.

### Docs site

- Keep docs public and visually integrated while giving them a distinct
  documentation information architecture.
- Replace `packages/example-package` with documentation for the real
  `@jfdevelops/react-layout`, `@jfdevelops/react-layout-composables`, and
  `@jfdevelops/react-layout-validator` packages currently used at
  `package.json:39-41`.
- Standardize each package landing page: purpose, compatibility, installation,
  minimal example, API reference links, repository/npm links, and support status.
- Add package navigation, useful not-found states, and verified code examples.
- Add search only after real documentation volume proves navigation insufficient.

### Exit criteria

- Marketing, portal, admin, and docs feel like one product family.
- Primary public flows are straightforward on mobile and desktop and pass an
  accessibility review.
- Three publishable case studies have stable URLs and next-step calls to action.
- No placeholder package ships in production; real package examples are verified
  in CI.

## Phase 7 — Launch hardening

**Goal:** ship the authenticated platform with evidence that it is secure,
observable, recoverable, and supportable.

### Scope

- Threat-model authentication, tenant isolation, admin operations, chat, invoices,
  email, abuse controls, and any file/payment integrations.
- Add end-to-end tests for the admin-created-client journey: invitation → login →
  project progress → conversation → invoice access.
- Add structured operational logging and error monitoring with redaction rules for
  personal, conversation, and invoice data.
- Define backup/export, retention, deletion, and incident-response procedures.
- Audit accessibility, responsive behavior, Core Web Vitals, bundle size, and
  authenticated data-loading behavior.
- Add product analytics for activation and operational outcomes without collecting
  message content or unnecessary financial/personal data.
- Roll out to one pilot client before general availability.

### Exit criteria

- No known cross-client data access path remains.
- Critical end-to-end journeys pass in CI.
- Restore/export and incident procedures have been exercised.
- A pilot client completes the core workflow and resulting issues are resolved or
  explicitly accepted.
- Production alerts identify auth, message, invoice, email, and deployment failures.

## Parallel workstreams

The dependency order does not require every task to be serial:

- The shared design system begins in Phase 0 and can progress beside auth/data work.
- Public marketing and public docs can progress after Phase 0 without waiting for
  dashboards, provided they do not distract from the first authenticated vertical
  slice.
- Invoicing design can begin beside chat after the client/project model stabilizes.
- Content gathering and client permission for case studies should start early
  because approval can take longer than implementation.

## Recommended release cuts

### Release A — Internal alpha

Phases 0–2: admin login, client invitations, client/project/milestone/task
management, and reliable authorization.

### Release B — Client portal beta

Phase 3: invited pilot clients can view accurate project progress in the overhauled
dashboard UI.

### Release C — Communication

Phase 4: project conversations, unread state, and notifications.

### Release D — Commercial operations

Phase 5: invoice creation, delivery, portal access, and lifecycle tracking.

### Release E — Unified public launch

Phases 6–7: public/docs overhaul, real case studies/package docs, hardening, and
pilot validation.

## Decisions still required

- Authentication provider and account-recovery method.
- Whether client accounts may contain multiple users (recommended: yes).
- Whether clients can edit tasks or only view them (recommended first release:
  view-only with conversation-based requests).
- Whether conversations are always project-scoped or may also be client-wide
  (recommended: allow both, but require an explicit scope).
- Whether attachments are needed in the first chat release (recommended: defer).
- Whether invoice creation includes online payment collection (recommended:
  separate follow-up unless immediately required).
- Tax, currency, invoice-number, retention, and accounting/export requirements.
- Whether an external CRM/accounting product should own parts of client and invoice
  management rather than duplicating them.

## Deferred until evidence justifies them

- Public self-service signup, multi-admin teams, granular custom roles, client task
  editing, chat attachments, time tracking, recurring invoices, subscriptions,
  online payments, a full CMS, and private docs.
- A blog/newsletter and advanced docs search are deferred until content volume and
  acquisition data establish a real need.

## Audit scope and limitations

This is a direction-focused roadmap, not a complete security or architecture
design. Recon covered repository structure, scripts, CI/deployment, home and docs
routes, current Convex schema/actions, recent Git history, and searches for auth,
client, admin, project, task, chat, and invoice implementations. The repository
currently contains only a contact-message data path; the requested authenticated
platform is net-new work.

Before implementation, each phase should become a self-contained numbered plan in
this directory with exact schema, route, API, authorization, migration, testing,
rollback, and verification instructions. Track plans as `TODO`, `IN PROGRESS`,
`DONE`, `BLOCKED`, or `REJECTED`.
