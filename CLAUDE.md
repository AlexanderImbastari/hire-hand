# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

HireHand — a job-matching marketplace. Homeowners post jobs; approved contractors
browse the ones in their area and trade, and bid on them; the homeowner accepts a
winning quote, which matches the job and unlocks the exact address for the winner.

**Phase 1 (current)**: no auth, no database. You sign in by picking one of four
fixture identities, and the whole domain runs against `localStorage`.

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (also typechecks)
npm run lint     # eslint, incl. React compiler rules
npm run verify   # drives the domain rules headlessly — 46 assertions
npx tsc --noEmit # typecheck alone
```

`npm run verify` (`scripts/verify-rules.ts`) is the fastest way to know the domain
still behaves: it exercises visibility, matching, the free-quote allowance, billing
states, and the lifecycle against `shared/data.ts` with no browser involved. Run it
after touching anything in `shared/`.

## Architecture

The organising idea: **`shared/data.ts` is the only module the UI may import for
data, and every rule lives below it.** Phase 2 replaces that module's internals
with Postgres queries and RLS policies without changing a single signature, so
nothing above it needs to change.

```
app/          Next.js App Router. Real routes; SessionProvider sits in the root layout.
  page.tsx       Landing (public, server component)
  pricing/       Plans (contractor-facing; homeowners get redirected)
  login/         Phase-1 identity picker
  jobs/          Contractor browse
  jobs/[id]/     Contractor job detail + quote panel
  jobs/new/      Homeowner post-a-job (also ?edit=<id>)
  dashboard/     Homeowner jobs + quotes received
  quotes/        Contractor's own quotes
  styleguide/    Internal design-system reference (not product surface)
components/   All UI. Imports data only through shared/data.ts.
  ui/            Design-system primitives (Logo, Field, Illustration)
shared/       Platform-agnostic domain core — no React, no Next. A mobile app reuses it verbatim.
  types.ts       Domain rows + the viewer-scoped view types
  fixtures.ts    The four phase-1 identities and seed jobs/quotes
  storage.ts     StorageAdapter (localStorage today) + seeding/reset
  policy.ts      Every access and billing rule, as pure functions
  data.ts        The API: takes a Session, applies policy, returns redacted views
  session.ts     Phase-1 sign-in as an external store (useSyncExternalStore)
  format.ts      Display helpers
public/       Self-hosted assets: brand marks, 3D illustrations, job photography.
scripts/      verify-rules.ts — headless domain assertions
prompts/      The original spec. Domain, offer catalog and design system live in prompts/context/.
docs/         Build notes, dated.
```

Routes are guarded by `RequireUser` / `RequireContractor` in `components/App.tsx`.
An unapproved contractor is stopped there, at the route — not by hiding UI.

### Three invariants worth preserving

**1. Redaction is enforced by types, not discipline.** `data.ts` never returns a raw
`Job`. A contractor gets a `JobPublicView`, which has no `street` field at all — the
exact address and the homeowner's contact arrive only as an optional `exactLocation`
that the data layer attaches when the viewer is the owner or the winning contractor.
A leak is therefore a compile error, not something to catch in review. Keep it that
way: don't widen the public view or hand components raw rows.

**2. Rules live in `policy.ts` as pure functions.** They take plain data and return
booleans, which is what makes them portable into RLS predicates later. Don't put an
access check in a component or inline it in `data.ts` — add it to `policy.ts` and
call it.

**3. The data API is async and Session-first.** Every function takes
`Session {actorId, role}` and returns a Promise, even though phase 1 answers
synchronously. That is what lets phase 2 swap in real queries without touching
callers. Don't "simplify" these to sync functions.

### Domain rules that are easy to get wrong

- **Approval is a precondition, not a tier.** An unapproved contractor can't browse
  *or* quote. Not a paywall — a gate before everything.
- **The subscription gates quote volume only, never browsing.** Browsing all open
  jobs in full detail is free, deliberately: it solves the cold-start problem.
- **Free quotes are 3 for the lifetime of the account.** They never reset — not on
  `past_due`, not on cancellation, not on withdrawing a quote. An active subscription
  makes the count moot rather than clearing it (and quotes sent under Pro don't
  increment it).
- **`past_due` blocks new quotes but nothing else.** Existing quotes stay live, the
  profile stays visible, browsing continues.
- **Cancellation keeps access to `currentPeriodEnd`.**
- **Exact address + contact unlock on acceptance, free and paid alike.** This is a
  workflow step, not a monetization lever — showing only city + zip beforehand is a
  homeowner safety rule. Don't move it behind the subscription.
- **A contractor never sees a rival's price** on the same job.
- **`accepted` freezes the job** for everyone: no CRUD on it or its quotes.

Lifecycle: `draft → open → accepted → completed`, with `cancelled` / `expired` as
other terminal states. CRUD is allowed only in `draft` and `open`.

The full specs are `prompts/context/domain.md`, `prompts/context/offer_catalog.md`
and `prompts/context/design.md`
(note: those documents refer to themselves as `context/*.md`; they actually live under
`prompts/`). The offer catalog carries the reasoning behind the pricing model — read it
before changing anything about what is gated, and note its instruction not to add
billing surface area without asking.

## Phase-1 scaffolding to delete later

- `shared/fixtures.ts` — replaced by real rows
- `devSetApproved` / `devSetSubscription` / `devResetData` in `data.ts`, and
  `components/DevPanel.tsx` — a test harness for approval and billing states, since
  neither Stripe nor the approval workflow exists yet. Not product surface.
- `shared/session.ts` — replaced by real auth
- `/styleguide` — internal reference; it is not a product route
- The landing page's per-trade open-job counts are marketing figures. There is no
  un-authenticated aggregate in the data layer; wire them to one in phase 2.
- Job photos posted through the form are downscaled to data URLs so they fit
  `localStorage`. Real uploads land in phase 2 (`JobPhoto` already branches on `data:`).

## Conventions

- **The design system is `prompts/context/design.md`** — read it before changing
  anything visual. Tokens are the whole palette: one orange accent, ink greys, four
  radii, two shadows. Nothing outside that list.
- Tailwind 4, so tokens are declared in `@theme` in `app/globals.css` rather than a
  `tailwind.config.ts`. Use them (`bg-surface`, `text-ink-500`, `border-line`) instead
  of raw Tailwind palette colours or hex.
- Shared classes (`.card`, `.btn-*`, `.field`, `.label`, `.meta`, `.illus`) live in
  `app/globals.css`. Tailwind 4 will not `@apply` a custom class, so the button base
  is a grouped selector rather than a `.btn` the variants extend.
- Light-only. "Dark" is a compositional device — `ink-900` panels mark
  contractor-facing or commercial moments, max two per page — not a colour scheme, so
  there is no `prefers-color-scheme` block.
- Orange marks exactly one primary action per view. Never two orange buttons in a block.
- Every 3D illustration carries `.illus` (`brightness(1.14) contrast(1.05)` +
  `mix-blend-mode: multiply`). Dropping it leaves a hard grey box — it is not optional.
  Check new assets on a white *and* a `surface` card.
- Fonts are Manrope + JetBrains Mono via `next/font`; use `font-mono` for IDs, counts
  and step numbers only.
- ESLint runs React's compiler rules; `setState` directly in an effect body is an
  error. Derive state during render, or drive it from an external store.

## What's next (phase 2)

1. Postgres behind `shared/data.ts`, with the `policy.ts` predicates reimplemented as
   RLS policies — the rules get enforced by the database rather than by convention.
2. Real auth replacing the identity picker.
3. Stripe for Contractor Pro; the billing states already exist in the model.
4. A contractor approval workflow (undesigned — see the domain doc).
5. Photo upload (today photos are URLs).
6. React Native client reusing `shared/` with an AsyncStorage or API adapter.
