# 2026-09-10 — Initial build (phase 1)

First build of HireHand: homeowners post jobs, approved contractors quote, the
homeowner accepts one. Everything runs in the browser against `localStorage` —
no auth, no database, no Stripe.

## What was built

- **Next.js 16 / React 19 / TypeScript / Tailwind 4** app, one client-rendered
  route at `localhost:3000`.
- **Identity picker** standing in for auth: four fixture identities (`user1`,
  `user2`, `contractor1`, `contractor2`).
- **Homeowner surface** — list own jobs, post a job (publish or save as draft),
  edit, delete, cancel, publish, review quotes, accept one, mark complete.
- **Contractor surface** — two tabs: open jobs matched to the contractor's service
  zips and trades, and jobs they have quoted on (win or lose). Quote form gated by
  the allowance; winning a job reveals the address and contact panel.
- **Domain core** in `shared/` — types, fixtures, storage adapter, policy, data API.
- **`npm run verify`** — 46 headless assertions over the domain rules.
- **Demo controls** — a contractor-only panel to flip approval and billing state.

## Why it is shaped this way

### The data layer is the whole design

The domain doc says phase 2 enforces visibility with Postgres RLS, and that
`shared/data.ts` must keep its signatures when its internals are swapped. That
turned the phase-1 build into a rehearsal for that boundary rather than just a
working demo:

- **`shared/policy.ts` holds every rule as a pure function** of plain data. Each
  one maps to an RLS predicate later. Nothing about React, storage, or the network
  reaches into them.
- **`shared/data.ts` takes a `Session` on every call** and applies those rules
  before returning anything. It throws `PolicyError` exactly where RLS would
  return no row — including for "not found" versus "not yours", which are
  deliberately indistinguishable to the caller.
- **Every function is `async`** even though `localStorage` answers synchronously,
  so swapping in real queries doesn't ripple into a single component.
- **`shared/storage.ts` hides the store behind a `StorageAdapter`.** Postgres in
  phase 2, AsyncStorage for a mobile build — one file either way.

Nothing in `shared/` imports React or Next, which is what "runs on mobile later
with minimal code changes" actually requires.

### Redaction is typed, not remembered

The riskiest rule here is the one protecting homeowners: exact street address and
contact details are visible only to the owner, and to the winning contractor after
acceptance. Enforcing that with an `if` in a component would work until someone
forgets.

Instead `data.ts` returns different *types* per viewer. `JobPublicView` — what any
permitted contractor gets — has no `street` field to leak; the address arrives as
an optional `exactLocation` object the data layer attaches only when entitled.
Rendering an address you weren't granted doesn't compile.

### Fixtures were chosen to make rules visible

The two contractors serve different zip codes and different trades, so the matching
engine has something real to filter. `contractor1` sits mid-way through the free
allowance (1 of 3 spent) and `contractor2` has Contractor Pro with its free quotes
already exhausted — which demonstrates the subscription making the lifetime counter
moot rather than resetting it. A seeded accepted job puts the frozen state and the
unlocked address on screen without any clicking.

## Decisions and trade-offs

| Decision | Why | Cost |
|---|---|---|
| `localStorage`, not a server JSON file | Survives refresh with zero infra; the adapter seam is what matters for phase 2 | Data is per-browser, so two identities only share state in the same browser |
| Photos as URL strings | An upload pipeline is phase-2 work | Seeded photos are inline SVG data URLs so the demo works offline |
| Demo controls panel | Approval and billing are driven by systems that don't exist yet (no Stripe, no approval workflow); their gates would otherwise be untestable | One component to delete later; kept contractor-only and clearly marked |
| `useSyncExternalStore` for the session | The session genuinely lives in `localStorage`, outside React; also the only way to read it without a hydration mismatch or a signed-out flash | Slightly more machinery than `useState` + an effect |
| A verification script, not a test framework | The rules are pure functions and deserve checking, but tests weren't in scope | No component tests; `npm run verify` covers the domain only |

## Notes for whoever picks this up

- `next.config.ts` sets `agentRules: false`. Next 16 otherwise regenerates its own
  `AGENTS.md` and `CLAUDE.md` on each build, overwriting this project's.
- Tailwind 4 refuses to `@apply` a custom class, so the button base in
  `globals.css` is a grouped selector rather than a `.btn` the variants extend.
- ESLint's React compiler rules treat `setState` in an effect body as an error.
  Two components were restructured around that rather than suppressing it.
- The spec documents refer to themselves as `context/*.md`; they actually live at
  `prompts/context/*.md`. Left where they are.
- `.env` holds an unused `GEMINI_API_KEY` placeholder from before this build.

## Verified

`npm run build`, `npm run lint`, and `npx tsc --noEmit` are clean. `npm run verify`
passes 46/46. The flows below were then walked in a browser against the dev server:

- Homeowner: draft and open jobs listed, draft marked not visible to contractors,
  full address shown to the owner, accept freezes the job and rejects the rest.
- Contractor: only in-area, in-trade open jobs appear; the job detail shows city +
  zip with the address explicitly withheld; quoting moves the free counter 2 → 1;
  the winning contractor's detail page shows the unlocked address and contact.
- Refresh: session and all mutations survive a full page load.
- `past_due`: quoting paused, browsing unaffected, existing quote still live.
- Console clean — no errors, no hydration warnings.

## Not built

Real auth, Postgres/RLS, Stripe calls, photo upload, the contractor approval
workflow (undesigned per the domain doc), notifications, and everything under the
offer catalog's "Not building yet" — featured placement, lead credits, annual
billing, homeowner-side paid tiers, commission.
