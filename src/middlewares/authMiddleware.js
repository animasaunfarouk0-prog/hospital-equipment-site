// Checks for the sign-up and login routes.
import { rateLimit } from 'express-rate-limit';

// Only FAILED logins count, so normal users are never blocked
// but password guessing is slowed down.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many failed logins. Please try again later.' },
});

export const validateRegister = (req, res, next) => {
  const body = req.body ?? {};
  const { email, password, hospitalName, address, state, lat, lng } = body;

  const invalid =
    typeof email !== 'string' || !email.includes('@') ||
    typeof password !== 'string' || password.length < 8 ||
    !hospitalName || !address || !state ||
    typeof lat !== 'number' || typeof lng !== 'number';

  if (invalid) {
    return res.status(400).json({
      error: 'Please fill in all required fields (password needs 8+ characters)',
    });
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || !email || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  next();
};
