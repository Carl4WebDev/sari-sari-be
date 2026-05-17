import AuthTokenService from "./AuthTokenService.js";

const tokenService = new AuthTokenService();

export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = header.split(" ")[1];
  const decoded = tokenService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = {
    id: decoded.userId ?? decoded.adminId,
    role: decoded.role,
    email: decoded.email,
  };

  next();
}
