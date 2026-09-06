import { createHash, randomBytes } from 'node:crypto';
import db from '../../core/database/db.js';
export const hashToken = token => createHash('sha256').update(token).digest('hex');
export const newToken = () => randomBytes(32).toString('hex');
export default async function adminAuth(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  if (!token) return res.status(401).json({message:'Sign in with your administrator account.'});
  const result = await db.query(`SELECT u.user_id, u.email, u.store_name, u.created_at
    FROM admin_sessions s JOIN users u ON u.user_id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at>now() AND u.is_admin AND u.deleted_at IS NULL`,[hashToken(token)]);
  if (!result.rows.length) return res.status(401).json({message:'Your admin session has expired. Please sign in again.'});
  req.admin = result.rows[0];
  req.adminTokenHash = hashToken(token);
  req.user = {id:req.admin.user_id,role:'ADMIN',email:req.admin.email};
  next();
}
