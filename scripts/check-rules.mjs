import assert from 'node:assert/strict';
import { isCorrect, isInstantWin, roundOrder, validateAttempts } from '../lib/game.ts';

const at = '2026-10-09T12:00:00.000Z';
const answers = ['Superman', 'I collect unusual postcards.', 'Both', 'Iron Brew', 'Porsche', 'Sakura', 'Spider', '24', 'Yes'];
const attempt = (question, answer) => ({ question, answer, at, correct: false });
const normal = answers.map((answer, round) => attempt(roundOrder[round], answer));
assert.equal(validateAttempts(normal).length, 9);
assert.equal(isCorrect(6, ' PORSCHE! '), true);
assert.equal(isInstantWin(6, 'Porsche'), false);
for (const model of ['911 gt3 rs', 'Porsche 911 GT3 RS', ' 911   GT3 RS! ', '911 GT3RS']) {
  assert.equal(isInstantWin(6, model), true);
  const bonus = [...normal.slice(0, 4), attempt(6, model)];
  const saved = validateAttempts(bonus);
  assert.equal(saved.length, 5);
  assert.equal(saved[4].correct, true);
  assert.throws(() => validateAttempts([...bonus, normal[5]]), /invalid/);
}
for (const model of ['911', 'GT3 RS', '911 GT3', 'not 911 gt3 rs', 'Ferrari']) {
  assert.equal(isCorrect(6, model), false);
}
assert.equal(isInstantWin(0, '911 GT3 RS'), false);
assert.throws(() => validateAttempts(normal.slice(0, 4)), /invalid/);
assert.throws(() => validateAttempts([attempt(6, '911 GT3 RS')]), /invalid/);
assert.throws(() => validateAttempts([...normal.slice(0, 4), attempt(6, 'Porsche'), attempt(6, '911 GT3 RS')]), /invalid/);
const retryWin = [...normal.slice(0, 4), attempt(6, 'Ferrari'), attempt(6, 'BMW'), attempt(6, '911 GT3 RS')];
assert.equal(validateAttempts(retryWin).length, 7);
const exhausted = [...normal.slice(0, 4), ...['Ferrari', 'BMW', 'Audi'].map(a => attempt(6, a)), ...normal.slice(5)];
assert.equal(validateAttempts(exhausted).length, 11);
assert.throws(() => validateAttempts([...normal.slice(0, 4), ...['Ferrari', 'BMW', 'Audi', 'Porsche'].map(a => attempt(6, a)), ...normal.slice(5)]), /invalid/);
console.log('PASS: eight-round completion with sharing break, brand matching, model instant win, third-attempt win, failed-round progression, and invalid shortcuts.');

const shared=validateAttempts(normal)[1];
assert.equal(shared.answer,'I collect unusual postcards.');
assert.equal(shared.correct,null,'Sharing is ungraded');
const withSharing=answer=>normal.map(a=>a.question===7?{...a,answer}:a);
assert.equal(validateAttempts(withSharing('x'.repeat(2000)))[1].answer.length,2000);
assert.throws(()=>validateAttempts(withSharing('x'.repeat(2001))),/invalid/);
assert.throws(()=>validateAttempts(withSharing('   ')),/invalid/);
assert.equal(validateAttempts(withSharing('911 GT3 RS')).length,9,'Sharing cannot trigger instant win');
assert.throws(()=>validateAttempts(normal.filter(a=>a.question!==7)),/invalid/);
console.log('PASS: ungraded sharing, answer preservation, length limits, and no sharing shortcut.');

assert.equal(isCorrect(8,' IRON BREW! '),true);
assert.equal(isCorrect(8,'cola'),false);
