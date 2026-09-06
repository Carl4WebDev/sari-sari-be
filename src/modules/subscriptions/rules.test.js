import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, validatePayment } from './rules.js';
test('renewals preserve existing time and clamp month ends', () => {
  assert.equal(addMonths('2026-10-06',1),'2026-11-06');
  assert.equal(addMonths('2026-01-31',1),'2026-02-28');
  assert.equal(addMonths('2028-01-31',1),'2028-02-29');
  assert.equal(addMonths('2028-02-29',12),'2029-02-28');
});
const valid = {user_id:1,plan:'standard',duration:1,amount:299,payment_date:'2026-09-06',payment_method:'GCash',reference_number:'123'};
test('validates payment totals, calendar dates and reference', () => {
  assert.equal(validatePayment(valid,'2026-09-07').amount,299);
  for (const change of [{amount:99},{duration:2},{plan:'pro'},{payment_date:'2026-02-30'},{payment_date:'2026-09-08'},{reference_number:' '},{user_id:-1}]) {
    assert.throws(() => validatePayment({...valid,...change},'2026-09-07'));
  }
});
test('12 months uses the existing annual discount', () => {
  assert.equal(validatePayment({...valid,duration:12,amount:239*12},'2026-09-07').amount,2868);
  assert.throws(() => validatePayment({...valid,duration:12,amount:299*12},'2026-09-07'));
});
