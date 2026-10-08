import assert from 'node:assert/strict';
import {isCorrect} from '../lib/game.ts';
const origin='http://127.0.0.1:5173';
async function post(path,body,cookie=''){return fetch(origin+path,{method:'POST',headers:{origin,'Content-Type':'application/json',cookie},body:JSON.stringify(body)});}
for(const password of ['IDA','MiSs S.S']){const r=await post('/api/unlock',{password});assert.equal(r.status,200,password);assert.match(r.headers.get('set-cookie'),/HttpOnly/);}
assert.equal((await post('/api/unlock',{password:'incorrect'})).status,401);
assert.equal((await fetch(origin+'/api/responses')).status,401);
assert.equal((await post('/api/responses',{})).status,403);
for(const [q,a] of [[0,' SUPERMAN '],[1,'Both'],[2,'Sakura'],[2,'cherry blossoms'],[2,'cherry blossom'],[3,'spider'],[3,'spiders'],[4,'24'],[5,'YES']])assert.ok(isCorrect(q,a));
assert.equal(isCorrect(5,'no'),false);
console.log('PASS: both case-insensitive passwords; wrong-password rejection; protected response access; answer aliases.');
