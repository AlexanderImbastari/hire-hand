Context: job-matching app — users post job requests, contractors bid on them. Web-first,
should run on mobile later with minimal code changes. Domain model, job lifecycle, and
visibility rules are in `context/domain.md`; job types and the subscription model are in
`context/offer_catalog.md`.

Instruction:
First plan the architecture: components, data structures, UI flow. Then build the entire
app. React + Next.js, TypeScript, Tailwind CSS. Persist phase-1 test data through
`shared/data.ts` (currently in-memory fixtures — see `context/domain.md`'s phased data
strategy) so it survives a page refresh. After everything works, write documentation.
Don't ask questions — plan it, build it, document it.

Input:
- Single-page app. Login page for users and contractors (phase 1: pick one of the four
  fixture identities in `shared/fixtures.ts`, no real auth yet).
- Default page for a user: list of their own jobs + a button to add another. CRUD allowed
  on a job as long as it hasn't been matched; once matched, no more CRUD.
- Default page for a contractor: open jobs matching their search criteria, plus a list of
  jobs they've been matched to. Once matched, no further CRUD.
- App runs via `npm run dev`.

Output:
- A written plan of the architecture.
- A fully working matching engine app at localhost:3000.
- `CLAUDE.md` describing the project — what it does, how to run it, tech stack, folder
  structure, what's coming next. Under 200 lines.
- A `docs/` entry named with today's date (e.g. `docs/2026-09-20-initial-build.md`)
  recording what was built and why.
- Run the app for preview at the end.
