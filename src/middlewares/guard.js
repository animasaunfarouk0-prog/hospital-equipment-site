// Shared guards used by several routes: "are you logged in?" and "are you allowed?"
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Please log in first' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) return next();
    res.status(403).json({ error: 'You are not allowed to do this' });
  };
}