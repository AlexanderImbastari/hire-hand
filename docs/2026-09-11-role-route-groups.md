# 2026-09-11 — Role route groups, and a role chosen at signup

Second change of the day; the first is `2026-09-11-web-ui.md`. This one is about the
shape of the app rather than how it looks.

## The decision that drove everything

**One account, one role, fixed at signup.** Someone who is both a homeowner and a
contractor makes two accounts.

Everything below follows from that. The previous login was a page of four identity
cards split into "Homeowners" and "Contractors" — you picked a person, and your role
was a side effect of which card you happened to click. That implies the opposite: that
one login could be either. Carrying that assumption forward makes every downstream
question ("can this person quote?", "whose address is this?", "which rows does RLS
return?") stop being answerable from the account alone.

So login now takes an email, looks the account up, reads its role, and routes. There
is no role selector anywhere in the app except signup.

## What changed

**Route groups with layout guards.**

```
(auth)/        login  signup
(homeowner)/   jobs  jobs/new  jobs/[id]  account
(contractor)/  browse  browse/[id]  quotes  subscription
```

Guarding moved out of the pages and into each group's `layout.tsx`, delegating to a
shared `RoleLayout`. Previously every page wrapped itself in `RequireUser` or
`RequireContractor`, which meant a new page was unprotected until someone remembered
to wrap it. Now anything dropped into a group is guarded because of where it lives.
`components/App.tsx` and `components/IdentityPicker.tsx` are gone.

**Two URLs moved**, fixing something flagged as incoherent in the previous build note:
`/jobs` used to be the *contractor* browse screen while `/jobs/new` was the *homeowner*
post form — one prefix straddling both roles. Now `/jobs/*` is homeowner throughout and
contractors live under `/browse`.

**Four screens are new**: signup (which did not exist — there was no way to create an
account at all), a homeowner job detail page, a homeowner account page, and a
contractor subscription page.

**The data layer gained two functions**, `createAccount` and `findAccountByEmail`, and
a `SignupInput` type. 82 lines across two files. Nothing about jobs, quotes, visibility
or billing moved.

## Decisions worth recording

**No admin role.** An earlier sketch had `(admin)/approvals`. Dropping it left a real
hole: `Contractor.approved` gates browsing *and* quoting, so with nothing able to grant
approval, every contractor signup would dead-end at "awaiting approval" forever. Signup
therefore approves contractors on the spot in phase 1. The gate is still enforced and
still testable — `DevPanel` flips the flag — and real approval stays phase-2 work,
which is where it already sat.

**Login has no password field.** There is no credential store. `findAccountByEmail` is
shaped so phase 2 replaces its body with a real credential check without callers
changing. A clearly-labelled demo-account list sits under the field, because phase 1
has four fixture accounts and nobody can memorise their emails.

**A navbar audience toggle was built and then deleted.** An intermediate branch split
marketing into `/` and `/for-contractors` with a Homeowner/Contractor switch in the
nav. Signup supersedes it: it answers the same question properly and permanently, and
a toggle alongside it would be a second, weaker way to pick a side. The branch was
deleted after confirming its two genuine bug fixes had been re-applied here — the
homepage's duplicate orange primary action, and links that sent signed-out visitors
into gated routes instead of to signup.

## Coverage

The two new data-layer functions initially shipped with **zero** assertions, which
was a real gap: the verify suite is the evidence that the phase-2 swap has not broken
anything, and "46/46 passing" was being cited as proof the restructure was safe when
it did not cover the code the restructure added.

The suite is now 63 assertions, covering: role is set from signup, email normalisation,
duplicate-email rejection across both roles, a missing email, new contractors carrying
their trades and service area, a new contractor being immediately usable with a full
free allowance, the matching engine respecting a brand-new contractor's area, and
case- and whitespace-insensitive login returning the right role.

They were mutation-tested rather than assumed: making signup leave contractors
unapproved, making the email lookup case-sensitive, and removing the duplicate-email
check each produced the expected failures.

## Verification

- `npm run verify` — 63/63
- `npx tsc --noEmit`, `npm run lint`, `npm run build` — clean, 14 routes
- The full flow walked in a headless browser: signup as each role lands on the right
  home; login by email routes on role alone with no role selector present; cross-role
  access is refused in both directions; and no link on the signed-out landing page
  reaches a gate.

## Not done

Passwords, Stripe, the approval workflow, real photo upload, real per-trade job counts,
contractor ratings. All want a backend; building fakes now means discarding them.

Two smaller items deliberately left: quote acceptance exists in two places (the
homeowner list renders it inline *and* the new detail page does), which should be
consolidated to one path for an irreversible action; and photos are data URLs in
`localStorage` capped at 8 per job with no total-size guard, so a few large uploads
can hit the quota and fail on save rather than warning.
