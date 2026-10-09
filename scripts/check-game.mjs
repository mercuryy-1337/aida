import assert from 'node:assert/strict';
import { isCorrect, roundOrder } from '../lib/game.ts';

process.loadEnvFile('.env.local');
// This suite writes test records only to the local emulator, never production.
const origin = process.env.TEST_ORIGIN ?? 'http://127.0.0.1:5173';
assert.equal(new URL(origin).hostname,'127.0.0.1','Tests must use the local emulator');
async function post(path, body, cookie = '') {
  return fetch(origin + path, {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { origin, 'Content-Type': 'application/json', cookie },
    body: JSON.stringify(body),
  });
}
console.log('Checking authentication…');
let cookie;
for (const password of ['AIDA', 'MiSs S.S']) {
  const res = await post('/api/unlock', { password });
  assert.equal(res.status, 200, password);
  assert.match(res.headers.get('set-cookie'), /HttpOnly/);
  cookie = res.headers.get('set-cookie').split(';')[0];
}
for (const password of ['incorrect', 'ida']) {
  assert.equal((await post('/api/unlock', { password })).status, 401);
}
assert.equal((await fetch(origin + '/api/responses')).status, 401);
assert.equal((await fetch(origin + '/api/responses', { headers: { Authorization: 'Bearer aida' } })).status, 401);
assert.equal((await post('/api/responses', {})).status, 403);
for (const [q, a] of [[0, ' SUPERMAN '], [1, 'Both'], [2, 'Sakura'], [2, 'cherry blossoms'], [2, 'cherry blossom'], [3, 'spider'], [3, 'spiders'], [4, '24'], [5, 'YES']]) {
  assert.ok(isCorrect(q, a));
}
assert.equal(isCorrect(5, 'no'), false);
console.log('Checking response persistence…');
const at = new Date().toISOString();
const attempts = ['Superman', 'I collect unusual postcards.', 'Both', 'Iron Brew', 'Porsche', 'Sakura', 'Spider', '24', 'Yes'].map((answer, round) => ({ question: roundOrder[round], answer, correct: false, at }));
attempts.unshift({ question: 0, answer: 'Batman', correct: true, at });
const record = { id: crypto.randomUUID(), startedAt: at, attempts, accepted: false, chases: 0 };
assert.equal((await post('/api/responses', record, cookie)).status, 200);
async function readRecord() {
  const res = await fetch(origin + '/api/responses', { headers: { Authorization: `Bearer ${process.env.ADMIN_KEY}` } });
  assert.equal(res.status, 200);
  return (await res.json()).find(row => row.id === record.id);
}
let saved = await readRecord();
assert.ok(saved, 'Completed game was persisted');
assert.equal(saved.accepted, false);
assert.equal(JSON.parse(saved.attempts).length, 10);
assert.equal(JSON.parse(saved.attempts)[0].correct, false, 'Server recalculates correctness');
assert.equal(JSON.parse(saved.attempts)[1].correct, true);
assert.equal(JSON.parse(saved.attempts)[2].correct, null);
assert.equal(JSON.parse(saved.attempts)[2].answer, 'I collect unusual postcards.');
for(const paymentDate of [undefined,'','tomorrow','2026-02-30','2026-13-01','0000-01-01']){
 assert.equal((await post('/api/responses',{...record,accepted:true,paymentDate},cookie)).status,400);
}
assert.equal((await readRecord()).accepted,false,'Invalid dates cannot accept an invoice');
console.log('Checking acceptance and required dates…');
const requests = await Promise.all([
  post('/api/responses', { ...record, accepted: true, chases: 10, paymentDate: '2026-11-15' }, cookie),
  post('/api/responses', record, cookie),
]);
for (const res of requests) assert.equal(res.status, 200);
assert.equal((await post('/api/responses', record, cookie)).status, 200);
saved = await readRecord();
assert.equal(saved.accepted, true, 'Late completion must not undo acceptance');
assert.equal(saved.chases, 10);
assert.equal(saved.paymentDate, '2026-11-15');
assert.equal((await post('/api/responses', { ...record, attempts: [] }, cookie)).status, 400);
console.log('PASS: passwords, retired ida password, protected dashboard, answer aliases, persistent attempts, server-side correctness, concurrent acceptance, late retries, and invalid-record rejection.');

async function remove(id,key=process.env.ADMIN_KEY,requestOrigin=origin){
 return fetch(origin+'/api/responses',{method:'DELETE',headers:{origin:requestOrigin,'Content-Type':'application/json',...(key?{Authorization:'Bearer '+key}:{})},body:JSON.stringify({id})});
}
assert.equal((await remove(record.id,'')).status,401);
assert.equal((await remove(record.id,'aida')).status,401);
assert.equal((await remove(record.id,process.env.ADMIN_KEY,'https://example.com')).status,403);
assert.equal((await remove('../bad')).status,400);
assert.ok(await readRecord(),'Unauthorized deletion leaves the response intact');
assert.equal((await remove(record.id)).status,200);
assert.equal(await readRecord(),undefined,'Deleted response disappears');
assert.equal((await post('/api/responses',{...record,accepted:true,paymentDate:'2026-11-15'},cookie)).status,410);
assert.equal((await post('/api/responses',record,cookie)).status,410);
assert.equal(await readRecord(),undefined,'Late retries cannot restore deleted answers');
assert.equal((await remove(record.id)).status,200,'Deletion is safe to retry');
console.log('PASS: required valid payment dates, persisted dates, admin-only deletion, origin checks, and no resurrection after deletion.');
