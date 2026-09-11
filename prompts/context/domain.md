# Domain

## Entities

- **User** (homeowner) — posts jobs, receives quotes, picks a winning contractor.
- **Contractor** — must be `approved` before doing anything else. An approved contractor
  browses all open jobs (full detail, no gate) and gets 3 lifetime free quotes; a
  `Contractor Pro` subscription lifts the quote limit. See `context/offer_catalog.md`.
- **Job** — posted by a user. Has a type, a zipcode, a timeframe, photos, and a status.
- **Quote** — a contractor's bid on a job: price + message.
- **Subscription** — `Contractor Pro`, $20/month, Stripe-backed, one plan. Gates quote
  volume only, never browsing. Free for users. See `context/offer_catalog.md` for pricing,
  the free-quote mechanic, and billing-state behavior (`past_due`, cancellation).

Fixture identities for phase 1 (see `shared/fixtures.ts`): `user1`, `user2`, `contractor1`, `contractor2` (contractors sit in different zipcodes so area-based filtering has something to filter).

## Job type

```
JobType = 'plumbing' | 'electrical' | 'landscaping'
```

See `context/offer_catalog.md` for what each type means and how it's priced.

## Job lifecycle

```
draft → open → accepted → completed
              ↘ cancelled
              ↘ expired
```

- **draft** — user is still editing, not visible to contractors.
- **open** — visible to contractors whose service area/job-type matches. Accepting quotes.
- **accepted** — a contractor has been picked. No further CRUD on the job or its quotes.
- **completed / cancelled / expired** — terminal states.

A user can create/edit/delete a job freely while it's `draft` or `open`. Once `accepted`, the job is frozen for everyone except read access.

## Visibility rules (enforce with Postgres RLS, not just in route handlers)

- A user sees only their own jobs.
- A user sees all quotes on their own jobs, and nothing on others' jobs.
- A contractor sees all `open` jobs (filtered to their service area/job types), plus any job they've personally quoted on regardless of its current status.
- A contractor sees only their own quotes — never another contractor's price on the same job.
- Job location is `city + zip` while the job is `open`. The exact street address is readable only by the job's owner and, once the job is `accepted`, the winning contractor.
- Contact details (phone, email) follow the same visibility rule as the exact address.
- Subscription and billing state are readable only by the contractor who owns that subscription.
- An unapproved contractor can't browse jobs or quote at all — approval is a precondition for everything else, not a visibility tier. (Approval workflow itself: TBD, not designed yet.)
- A contractor's lifetime free-quote count is tracked per contractor and never resets — not on `past_due`, not on cancellation. Once a `Contractor Pro` subscription is active, the limit doesn't apply.

## Phased data strategy

- **Phase 1** (current): `shared/fixtures.ts` holds the four identities in-memory; `shared/data.ts` is the only thing the UI talks to.
- **Phase 2**: swap `shared/data.ts`'s internals for real Postgres queries with RLS policies enforcing the rules above. Keep its function signatures the same so the UI doesn't need to change.
