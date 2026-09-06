export const plans = [
  { id: 'basic', name: 'Basic', monthly: 149, annualMonthly: 119 },
  { id: 'standard', name: 'Standard', monthly: 299, annualMonthly: 239 },
  { id: 'premium', name: 'Premium', monthly: 499, annualMonthly: 399 },
];
export function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
export function addMonths(date, months) {
  const d = new Date(`${date}T00:00:00Z`);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}
export function validatePayment(body, currentDay = today()) {
  const plan = plans.find(p => p.id === body.plan);
  const duration = Number(body.duration);
  const date = body.payment_date;
  if (!plan || ![1,3,6,12].includes(duration)) throw new Error('Select a valid plan and duration.');
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date > currentDay) throw new Error('Enter a valid payment date, no later than today.');
  const amount = (duration === 12 ? plan.annualMonthly : plan.monthly) * duration;
  if (Number(body.amount) !== amount) throw new Error(`The expected payment is ₱${amount}.`);
  if (!['GCash','Other'].includes(body.payment_method) || typeof body.reference_number !== 'string' || !body.reference_number.trim() || body.reference_number.trim().length > 120) throw new Error('Payment method and reference number are required.');
  if (typeof (body.notes ?? '') !== 'string' || (body.notes ?? '').length > 1000) throw new Error('Notes must be at most 1,000 characters.');
  if (!Number.isSafeInteger(Number(body.user_id)) || Number(body.user_id) < 1) throw new Error('Select a customer.');
  return { plan: plan.id, duration, amount, date, reference: body.reference_number.trim() };
}
