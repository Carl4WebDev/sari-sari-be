import test from 'node:test';
import assert from 'node:assert/strict';
import { addMonths, validatePayment } from './rules.js';

test('renewals preserve existing time and clamp month ends', () => {
  assert.equal(addMonths('2026-10-06', 1), '2026-11-06');
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2028-01-31', 1), '2028-02-29');
  assert.equal(addMonths('2028-02-29', 12), '2029-02-28');
});

const valid = { user_id: 1, plan: 'premium', duration: 1, amount: 299, payment_date: '2026-09-06', payment_method: 'GCash', reference_number: '123' };

test('validates payment totals, calendar dates and reference', () => {
  assert.equal(validatePayment(valid, '2026-09-07').amount, 299);
  for (const change of [{ amount: 99 }, { duration: 2 }, { plan: 'basic' }, { payment_date: '2026-02-30' }, { payment_date: '2026-09-08' }, { reference_number: ' ' }, { user_id: -1 }]) {
    assert.throws(() => validatePayment({ ...valid, ...change }, '2026-09-07'));
  }
});

test('12 months uses 10% annual discount', () => {
  // ₱299 × 12 = ₱3,588 × 0.90 = ₱3,229.20
  assert.equal(validatePayment({ ...valid, duration: 12, amount: 3229.20 }, '2026-09-07').amount, 3229.20);
  assert.throws(() => validatePayment({ ...valid, duration: 12, amount: 299 * 12 }, '2026-09-07'));
});

test('3 and 6 months use standard monthly rate', () => {
  assert.equal(validatePayment({ ...valid, duration: 3, amount: 897 }, '2026-09-07').amount, 897);
  assert.equal(validatePayment({ ...valid, duration: 6, amount: 1794 }, '2026-09-07').amount, 1794);
});

test('accepts multiple payment methods', () => {
  for (const method of ['GCash', 'Maya', 'Bank Transfer', 'Cash', 'Other']) {
    assert.equal(validatePayment({ ...valid, payment_method: method }, '2026-09-07').plan, 'premium');
  }
});
