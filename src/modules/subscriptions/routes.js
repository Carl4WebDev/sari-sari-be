import express from 'express';
import db from '../../core/database/db.js';
import auth from '../../core/middleware/Auth.js';
import adminAuth from '../admin/auth.js';
import { plans, today, addMonths, validatePayment } from './rules.js';

const router = express.Router();
router.use((req,res,next) => req.path.startsWith('/admin') ? adminAuth(req,res,next) : auth(req,res,next));
const customerQuery = `SELECT u.user_id, u.store_name, u.email, u.created_at,
  s.subscription_id, s.plan, to_char(s.start_date,'YYYY-MM-DD') start_date,
  to_char(s.end_date,'YYYY-MM-DD') end_date,
  s.end_date - $1::date days_remaining,
  CASE WHEN s.subscription_id IS NULL THEN 'No subscription'
    WHEN s.status = 'cancelled' THEN 'Cancelled'
    WHEN s.end_date <= $1::date THEN 'Expired'
    WHEN s.end_date <= $1::date + 7 THEN 'Expiring soon' ELSE 'Active' END status
  FROM users u LEFT JOIN user_subscription s ON s.user_id = u.user_id`;
const paymentQuery = `SELECT p.*, to_char(p.payment_date,'YYYY-MM-DD') payment_date,
  u.store_name, v.email verifier FROM subscription_payments p
  JOIN users u ON u.user_id=p.user_id JOIN users v ON v.user_id=p.verified_by`;

router.get('/mine', async (req, res) => {
  const customer = await db.query(customerQuery + ' WHERE u.user_id=$2', [today(), req.user.id]);
  const payments = await db.query(paymentQuery + ' WHERE p.user_id=$1 ORDER BY p.payment_date DESC,p.payment_id DESC', [req.user.id]);
  res.json({ data: { customer: customer.rows[0], payments: payments.rows } });
});
router.get('/current', async (req, res) => {
  const result = await db.query(customerQuery + ' WHERE u.user_id=$2', [today(),req.user.id]);
  const customer = result.rows[0];
  const active = customer && ['Active','Expiring soon'].includes(customer.status);
  const plan = plans.find(p => p.id === customer?.plan);
  const id = active ? plan.id : 'free';
  const last = await db.query('SELECT duration FROM subscription_payments WHERE user_id=$1 ORDER BY payment_id DESC LIMIT 1',[req.user.id]);
  res.json({data:{
    plan: id.toUpperCase(), status: customer?.status?.toLowerCase() || 'no subscription',
    billing_cycle: last.rows[0]?.duration === 12 ? 'annual' : 'monthly',
    is_free: !active, start_date: customer?.start_date, end_date: customer?.end_date,
    limits: {id,name:id.toUpperCase(),monthlyPrice:active ? plan.monthly : 0,
      annualPriceMonthly:active ? plan.annualMonthly : 0,
      maxBorrowers: id === 'premium' ? 999999 : id === 'standard' ? 250 : id === 'basic' ? 50 : 15,
      allowSms: ['standard','premium'].includes(id),allowCustomPdf:['standard','premium'].includes(id),
      allowCsvExport:['standard','premium'].includes(id),allowCloudSync:id !== 'basic',prioritySupport:id === 'premium'}
  }});
});
router.use(async (req, res, next) => {
  const result = await db.query('SELECT is_admin FROM users WHERE user_id=$1', [req.user.id]);
  if (!result.rows[0]?.is_admin) return res.status(403).json({ message: 'Administrator access required.' });
  next();
});
router.get('/admin', async (req, res) => {
  const date = today();
  const [customers, payments] = await Promise.all([
    db.query(customerQuery + ' WHERE NOT u.is_admin AND u.deleted_at IS NULL ORDER BY u.created_at DESC', [date]),
    db.query(paymentQuery + ' ORDER BY p.payment_date DESC,p.payment_id DESC'),
  ]);
  res.json({ data: { customers: customers.rows, payments: payments.rows, plans, today: date } });
});
router.post('/admin/payments', async (req, res) => {
  let input;
  try { input = validatePayment(req.body); }
  catch (err) { return res.status(400).json({ message: err.message }); }
  try {
    const result = await db.transaction(async client => {
      const user = await client.query('SELECT user_id FROM users WHERE user_id=$1 AND NOT is_admin AND deleted_at IS NULL FOR UPDATE', [req.body.user_id]);
      if (!user.rows.length) throw new Error('Customer not found.');
      const previous = await client.query("SELECT *, to_char(end_date,'YYYY-MM-DD') expiry FROM user_subscription WHERE user_id=$1", [req.body.user_id]);
      const existing = previous.rows[0];
      const active = existing?.status === 'active' && existing.expiry > today();
      if (active && existing.plan !== input.plan) throw new Error('An active subscription can only renew its current plan. Record a different plan after expiration.');
      const base = active ? existing.expiry : input.date;
      const expiry = addMonths(base, input.duration);
      const subscription = await client.query(`INSERT INTO user_subscription (user_id,plan,start_date,end_date)
        VALUES ($1,$2,$3,$4) ON CONFLICT(user_id) DO UPDATE SET plan=EXCLUDED.plan,
        status='active', start_date=CASE WHEN $5 THEN user_subscription.start_date ELSE EXCLUDED.start_date END,
        end_date=EXCLUDED.end_date RETURNING subscription_id`, [req.body.user_id,input.plan,base,expiry,active]);
      await client.query(`INSERT INTO subscription_payments
        (subscription_id,user_id,plan,amount,payment_method,reference_number,payment_date,duration,verified_by,notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [subscription.rows[0].subscription_id,req.body.user_id,input.plan,input.amount,req.body.payment_method,input.reference,input.date,input.duration,req.user.id,req.body.notes ?? '']);
      return { end_date: expiry };
    });
    res.status(201).json({ data: result });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'This payment reference has already been recorded.' });
    if (['Customer not found.','An active subscription can only renew its current plan. Record a different plan after expiration.'].includes(err.message)) return res.status(400).json({ message: err.message });
    throw err;
  }
});
export default router;
