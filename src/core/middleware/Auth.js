import AuthTokenService from "./AuthTokenService.js";
import db from '../database/db.js';

const tokenService = new AuthTokenService();

export default async function authMiddleware(req, res, next) {
  // Read token from httpOnly cookie first, then fall back to Authorization header
  const cookieToken = req.cookies?.token;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const decoded = tokenService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const account = await db.query('SELECT user_id FROM users WHERE user_id=$1 AND deleted_at IS NULL',[decoded.userId ?? decoded.adminId]);
  if (!account.rows.length) return res.status(401).json({error:'Account is unavailable.'});
  req.user = {
    id: decoded.userId ?? decoded.adminId,
    role: decoded.role,
    email: decoded.email,
  };

  next();
}
