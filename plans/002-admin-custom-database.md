# Plan 002: Add configurable relational databases to the admin dashboard

> **Executor instructions**: Complete Plan 001 first. Follow every verification
> gate and stop rather than inventing a spreadsheet engine beyond this scope.
>
> **Drift check**: `git diff --stat 58bafef..HEAD -- package.json convex src`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH
- **Depends on**: `plans/001-admin-dashboard.md`
- **Category**: direction
- **Planned at**: commit `58bafef`, 2026-10-22

## Outcome

Inside the admin dashboard, an administrator can create tables, define typed
columns, add and inline-edit rows, create relationships between records, and save
views without changing source code or deploying. The primary grid uses
`@tanstack/react-table` and presents an intuitive Airtable-like interaction model.

## Architecture

Use a hybrid model. Identity, clients, memberships, invoices, reminders, and audit
events from Plan 001 stay strongly typed. Flexible business information uses:

- `workspaceCollections`: immutable key, name, description, icon/color, title
  field, archive state.
- `workspaceFields`: stable key, collection, label, type, required/multiple flags,
  configuration, order, archive state.
- `workspaceRecords`: collection, title/search projection, lifecycle, actor and
  timestamps.
- `workspaceRecordValues`: typed discriminator and normalized value; do not use an
  unindexed JSON blob as the only query representation.
- `workspaceRelations`: source record/field, target record, optional order; query
  indexes in both directions with validated target collections.
- `workspaceViews`: columns, widths/order/visibility, validated filters/sorts,
  pagination/group intent, owner/scope.
- `workspaceClientLinks`: record/client association, relationship label, sharing
  flags and optional field allowlist. Plan 002 may create internal associations,
  but Plan 003 implements client-visible projection.

Supported initial column types: short text, long text, integer/decimal, currency,
boolean, date, date-time, single select, multi-select, URL, email, phone, user,
client, and record relation. Formula/rollup types are deferred.

## Scope

**In scope**: TanStack Table dependency, table/column/row/relation creation,
type-specific rendering/editing/validation, table and record-detail views, saved
views, basic server-side filters/sorts/pagination, column order/visibility/size,
archive behavior, keyboard navigation, and internal client links.

**Out of scope**: client-facing workspace (Plan 003), formulas/rollups, arbitrary
scripts/queries, automations, kanban/calendar/document views, collaborative cursors,
offline sync, hard deletion, and arbitrary user-defined field types.

## Commands

| Purpose | Command | Expected |
|---|---|---|
| Add engine | `pnpm add @tanstack/react-table` | manifest/lockfile updated |
| Routes | `pnpm exec tsr generate` | exit 0 |
| Typecheck | `pnpm typecheck` | exit 0 |
| Tests | `pnpm test -- workspace` | all workspace tests pass |
| Quality | `pnpm check` | exit 0 |
| Build | `pnpm build` | exit 0 |

## Required interaction design

- A persistent admin sidebar lists tables and has a prominent **New table** action.
  The short creation flow supports blank/template, name, icon, and color, then
  lands directly in the grid.
- A trailing `+` column control opens a searchable type picker, focuses the new
  column name, and exposes only configuration relevant to that data type.
- A pinned **New row** affordance and empty-state action create records in place.
- Every editable desktop cell enters inline edit mode on **double-click**. A
  selected cell also enters with `Enter`; touch has a discoverable edit action.
- Editor choice comes from the persisted column type, never the existing value.
  Column metadata owns required/null behavior, options, precision/currency,
  cardinality, relation target, parsing, formatting, filtering, and validation.
- `Enter`, `Tab`, and documented blur behavior commit valid edits; `Escape`
  cancels. Invalid input stays in edit mode with an accessible message. Failed
  optimistic saves restore the previous value and retain nearby error feedback.
- Relation setup chooses target table and single/multiple cardinality. Relation
  cells provide search, chips, open-related-record, and authorized inline target
  creation. Inverse display is derived from the same edge, not duplicated state.
- Clicking a row opens a detail drawer using the same mutation/validation APIs.
- Column menus support rename, description, duplicate, hide, move, and archive.
  Saved views expose unsaved state plus save, save-as, duplicate, and reset.

## Steps

### 1. Add workspace schema and validated services

Add the entities/indexes above. All record writes validate values against active
field definitions. Stable IDs survive renames. Unsafe type changes require a
validated migration or are blocked. Archive preserves data and relation history.

**Verify**: schema tests cover keys, indexes, archive, relationship integrity,
rename stability, type validation, and unsafe type changes.

### 2. Create the TanStack Table adapter

Build one adapter mapping `workspaceFields` to TanStack column definitions and a
central renderer/editor/parser/validator registry. Use controlled state for sort,
filter, visibility, order, sizing, selection, and pagination. Persist serializable
view data only—never React components or callbacks. Compile supported filters and
sorts into bounded server queries.

**Verify**: adapter tests cover every field type, empty/invalid values, controlled
state serialization, and server request compilation.

### 3. Implement table, column, row, and view UX

Implement the required interactions under `/admin/workspace/**`. Preserve focus
through edits, announce errors/saves accessibly, and make keyboard behavior
consistent. Read-only/system/unauthorized cells must never activate an editor.

**Verify**: component tests cover creation flows, double-click editing, keyboard
commit/cancel/navigation, optimistic rollback, column menus, and saved views.

### 4. Implement relationships and internal client links

Add relation configuration/editors, forward and inverse traversal, record drawer
navigation, and internal record-to-client associations. A client link must not
imply portal visibility; sharing is deliberately implemented in Plan 003.

**Verify**: relation tests cover single/multiple values, target validation,
dangling/archive behavior, inverse lookup, cycles, and internal-only client links.

### 5. Validate usability and scale boundaries

Run a first-time-user exercise: create two tables, add typed columns, add rows,
relate records, edit cells, and save a view without documentation. Test with the
agreed pilot dataset and confirm server pagination/filtering avoids full-table
fetches. Document unsupported operators and size limits.

**Verify**: full typecheck, workspace tests, Biome check, and build pass.

## Done criteria

- [ ] Admin can create tables, columns, rows, relationships, and views on demand.
- [ ] Grid uses `@tanstack/react-table` through one field-to-column adapter.
- [ ] Double-click inline editing and keyboard commit/cancel are tested.
- [ ] Every supported column type renders, edits, parses, validates, stores,
      filters, and sorts according to its definition on client and server.
- [ ] Relationship traversal and inverse display do not duplicate edges.
- [ ] Internal client association does not expose data to a client.
- [ ] Pilot data remains responsive without fetching the entire collection.

## STOP conditions

- Plan 001 auth/client foundation is incomplete or materially different.
- Requirements expand to formulas, arbitrary automation/query execution, offline
  sync, or collaborative documents.
- The requested behavior requires forking TanStack Table internals or abandoning
  accessible focus semantics.
- The data model cannot support required indexed filters without redesign.
- A verification gate fails twice after a scoped fix.

## Maintenance notes

Treat field definitions as data contracts. Labels may change, but stable IDs and
typed values must remain coherent. Add future field types through the centralized
registry with renderer, editor, parser, validator, filter, and test coverage.
