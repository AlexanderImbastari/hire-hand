/* Drives shared/data.ts headlessly to check the domain rules hold. */
import * as data from '../shared/data';
import type { Session } from '../shared/types';

const u1: Session = { actorId: 'user1', role: 'user' };
const u2: Session = { actorId: 'user2', role: 'user' };
const c1: Session = { actorId: 'contractor1', role: 'contractor' };
const c2: Session = { actorId: 'contractor2', role: 'contractor' };

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}`); }
}
async function throws(name: string, fn: () => Promise<unknown>) {
  try { await fn(); check(name, false); }
  catch { check(name, true); }
}

async function main() {
  console.log('\n— Ownership —');
  const u1Jobs = await data.listJobsForUser(u1);
  check('user1 sees only own jobs', u1Jobs.every((j) => j.ownerId === 'user1'));
  check('user1 sees its 3 seeded jobs', u1Jobs.length === 3);
  await throws('user2 cannot open user1 job', () => data.getJobForOwner(u2, 'job-1'));

  console.log('\n— Matching engine —');
  const c1Open = await data.listOpenJobsForContractor(c1);
  const c2Open = await data.listOpenJobsForContractor(c2);
  check('contractor1 matched to job-1 (94110 plumbing)', c1Open.some((j) => j.id === 'job-1'));
  check('contractor1 matched to job-5 (94103 electrical)', c1Open.some((j) => j.id === 'job-5'));
  check('contractor1 not shown job-3 (94301, out of area)', !c1Open.some((j) => j.id === 'job-3'));
  check('contractor2 matched to job-3', c2Open.some((j) => j.id === 'job-3'));
  check('contractor2 not shown job-1', !c2Open.some((j) => j.id === 'job-1'));
  check('draft job-2 hidden from everyone', ![...c1Open, ...c2Open].some((j) => j.id === 'job-2'));

  console.log('\n— Location + contact redaction —');
  const pub = c1Open.find((j) => j.id === 'job-1')!;
  check('open job exposes city+zip', pub.city === 'San Francisco' && pub.zip === '94110');
  check('open job hides exact address', pub.exactLocation === undefined);
  check('no street field on contractor view', !('street' in pub));
  const won = (await data.listMatchedJobsForContractor(c2)).find((j) => j.id === 'job-4')!;
  check('winning contractor gets street', won.exactLocation?.street === '212 Kingsley Ave');
  check('winning contractor gets contact', Boolean(won.exactLocation?.contactPhone));
  await throws('contractor1 cannot read job-4 at all', () => data.getJobForContractor(c1, 'job-4'));

  console.log('\n— Quote privacy —');
  const ownerQuotes = await data.listQuotesForJob(u1, 'job-1');
  check('owner sees quotes on own job', ownerQuotes.length === 1);
  const c1Quotes = await data.listQuotesForJob(c1, 'job-1');
  check('contractor sees only own quote', c1Quotes.every((q) => q.contractorId === 'contractor1'));
  await throws('user2 cannot read quotes on user1 job', () => data.listQuotesForJob(u2, 'job-1'));

  console.log('\n— Free quote allowance (lifetime) —');
  let a = await data.getQuoteAllowance(c1);
  check('contractor1 has 2 of 3 free left', a.remaining === 2 && a.limit === 3);
  await data.submitQuote(c1, 'job-5', { priceCents: 19000, message: 'Can do Friday.' });
  a = await data.getQuoteAllowance(c1);
  check('counter increments after quoting', a.used === 2 && a.remaining === 1);
  await throws('cannot quote same job twice', () => data.submitQuote(c1, 'job-5', { priceCents: 1, message: 'x' }));

  // Burn the last free quote, then confirm the wall.
  const j = await data.createJob(u2, {
    type: 'plumbing', title: 'Burner', description: 'd', street: 's',
    city: 'San Francisco', zip: '94110', timeframe: 'asap', photos: [],
  }, { publish: true });
  await data.submitQuote(c1, j.id, { priceCents: 5000, message: 'ok' });
  a = await data.getQuoteAllowance(c1);
  check('third free quote exhausts allowance', a.remaining === 0 && !a.canQuote && a.reason === 'free_quotes_exhausted');

  const j2 = await data.createJob(u2, {
    type: 'plumbing', title: 'Blocked', description: 'd', street: 's',
    city: 'San Francisco', zip: '94110', timeframe: 'asap', photos: [],
  }, { publish: true });
  await throws('4th quote blocked on free tier', () => data.submitQuote(c1, j2.id, { priceCents: 100, message: 'x' }));

  console.log('\n— Subscription lifts the cap, never the browse gate —');
  const c2Allow = await data.getQuoteAllowance(c2);
  check('Pro is unlimited despite 3 free spent', c2Allow.canQuote && c2Allow.limit === null && c2Allow.used === 3);
  await data.devSetSubscription('contractor1', 'active');
  a = await data.getQuoteAllowance(c1);
  check('Pro unblocks exhausted contractor1', a.canQuote && a.limit === null);
  await data.submitQuote(c1, j2.id, { priceCents: 12000, message: 'now allowed' });
  const afterPro = await data.getQuoteAllowance(c1);
  check('Pro quotes do not move lifetime counter', afterPro.used === 3);

  await data.devSetSubscription('contractor1', 'past_due');
  a = await data.getQuoteAllowance(c1);
  check('past_due blocks new quotes', !a.canQuote && a.reason === 'past_due');
  const stillLive = await data.listQuotesForJob(c1, j2.id);
  check('past_due leaves existing quotes live', stillLive.length === 1 && stillLive[0].status === 'pending');
  check('past_due does not block browsing', (await data.listOpenJobsForContractor(c1)).length > 0);

  await data.devSetSubscription('contractor1', 'cancelled');
  a = await data.getQuoteAllowance(c1);
  check('cancelled keeps access to period end', a.canQuote && a.limit === null);
  await data.devSetSubscription('contractor1', 'none');
  a = await data.getQuoteAllowance(c1);
  check('free quotes never reset after cancellation', a.used === 3 && !a.canQuote);

  console.log('\n— Approval is a precondition —');
  await data.devSetApproved('contractor1', false);
  await throws('unapproved cannot browse', () => data.listOpenJobsForContractor(c1));
  await throws('unapproved cannot quote', () => data.submitQuote(c1, 'job-1', { priceCents: 1, message: 'x' }));
  await data.devSetApproved('contractor1', true);

  console.log('\n— Lifecycle + freeze on match —');
  const draft = await data.createJob(u1, {
    type: 'landscaping', title: 'Hedge', description: 'trim', street: '1 A St',
    city: 'San Francisco', zip: '94110', timeframe: 'flexible', photos: [],
  });
  check('new job defaults to draft', draft.status === 'draft');
  check('draft is editable', draft.editable);
  const opened = await data.publishJob(u1, draft.id);
  check('publish moves draft → open', opened.status === 'open');
  await data.submitQuote(c2, 'job-3', { priceCents: 45000, message: 'sod + heads' });
  const beforeAccept = await data.getJobForOwner(u2, 'job-3');
  const accepted = await data.acceptQuote(u2, 'job-3', beforeAccept.quotes[0].id);
  check('accept moves job → accepted', accepted.status === 'accepted');
  check('accepted job is frozen', !accepted.editable);
  check('winning quote marked accepted', accepted.quotes.find((q) => q.id === accepted.acceptedQuoteId)?.status === 'accepted');
  await throws('no edit after match', () => data.updateJob(u2, 'job-3', { title: 'nope' }));
  await throws('no delete after match', () => data.deleteJob(u2, 'job-3'));
  await throws('no second accept', () => data.acceptQuote(u2, 'job-3', beforeAccept.quotes[0].id));
  await throws('no quoting a matched job', () => data.submitQuote(c1, 'job-3', { priceCents: 1, message: 'x' }));
  const done = await data.completeJob(u2, 'job-3');
  check('accepted → completed', done.status === 'completed');

  console.log('\n— Billing privacy —');
  await throws('a homeowner has no subscription to read', () => data.getSubscription(u1));
  check('contractor reads own subscription only', (await data.getSubscription(c2))?.contractorId === 'contractor2');

  console.log('\n— Signup: role is chosen once, and is the whole identity —');
  const newOwner = await data.createAccount({
    role: 'user', name: 'Nia Okafor', email: 'Nia@Example.com', phone: '(415) 555-0155',
  });
  check('signup returns the chosen role', newOwner.role === 'user');
  check('email is normalised to lower case', newOwner.email === 'nia@example.com');
  await throws('a second account cannot reuse an email', () =>
    data.createAccount({ role: 'user', name: 'Imposter', email: 'NIA@example.com', phone: '1' }));
  await throws('role cannot be reused across sides either', () =>
    data.createAccount({
      role: 'contractor', name: 'Imposter', email: 'nia@example.com', phone: '1',
      company: 'C', serviceZips: ['94110'], jobTypes: ['plumbing'],
    }));
  await throws('an account needs an email', () =>
    data.createAccount({ role: 'user', name: 'Nameless', email: '   ', phone: '1' }));

  const newPro = await data.createAccount({
    role: 'contractor', name: 'Sam Reyes', email: 'sam@reyes.example.com', phone: '(415) 555-0166',
    company: 'Reyes Plumbing', serviceZips: ['94110'], jobTypes: ['plumbing'],
  });
  check('new contractor carries its trades and area',
    newPro.role === 'contractor' && newPro.serviceZips.includes('94110') && newPro.jobTypes.includes('plumbing'));
  // Phase 1 approves on signup: nothing grants approval yet, so leaving this
  // false would dead-end every contractor. The gate itself is still enforced —
  // see the approval section above.
  check('new contractor is usable immediately', newPro.role === 'contractor' && newPro.approved);
  check('new contractor starts with a full free allowance',
    newPro.role === 'contractor' && newPro.freeQuotesUsed === 0);

  // Serves 94110 and plumbing only, so the matching engine should hand back
  // job-1 and job-6 and nothing outside that trade or area.
  const proSession: Session = { actorId: newPro.id, role: 'contractor' };
  const proSees = await data.listOpenJobsForContractor(proSession);
  check('a brand-new contractor can browse straight away', proSees.length > 0);
  check('and sees only its own trade and area',
    proSees.every((j) => j.type === 'plumbing' && j.zip === '94110'));
  const proAllow = await data.getQuoteAllowance(proSession);
  check('and has 3 of 3 free quotes', proAllow.remaining === 3 && proAllow.canQuote);

  console.log('\n— Login: the account knows its own role —');
  check('lookup is case-insensitive', (await data.findAccountByEmail('DANA@EXAMPLE.COM'))?.id === 'user1');
  check('lookup tolerates surrounding space', (await data.findAccountByEmail('  dana@example.com '))?.id === 'user1');
  check('an unknown email resolves to nothing', (await data.findAccountByEmail('nobody@example.com')) === null);
  check('a homeowner email yields role user', (await data.findAccountByEmail('dana@example.com'))?.role === 'user');
  check('a contractor email yields role contractor',
    (await data.findAccountByEmail('ray@okonkwo-pe.example.com'))?.role === 'contractor');
  check('the account just created can log back in',
    (await data.findAccountByEmail('sam@reyes.example.com'))?.id === newPro.id);

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
}

main();
