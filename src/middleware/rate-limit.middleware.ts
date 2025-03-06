import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minute in dev, 15 minutes in prod
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit in dev
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// More strict limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 60 * 60 * 1000, // 1 minute in dev, 1 hour in prod
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // 100 attempts in dev, 5 in prod
  message: {
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? 'Too many login attempts, please try again after 1 minute'
      : 'Too many login attempts from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Separate limiter for refresh token endpoint with more lenient limits
export const refreshTokenLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 5 * 60 * 1000, // 1 minute in dev, 5 minutes in prod
  max: process.env.NODE_ENV === 'development' ? 300 : 30, // 300 attempts in dev, 30 in prod
  message: {
    status: 'error',
    message: 'Too many token refresh attempts, please log in again'
  },
  standardHeaders: true,
  legacyHeaders: false,
});